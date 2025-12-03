<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PromoCode extends Model
{
    protected $fillable = [
        'code',
        'description',
        'type',
        'value',
        'min_order_amount',
        'max_discount_amount',
        'usage_limit',
        'per_user_limit',
        'times_used',
        'starts_at',
        'ends_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'min_order_amount' => 'decimal:2',
            'max_discount_amount' => 'decimal:2',
            'usage_limit' => 'integer',
            'per_user_limit' => 'integer',
            'times_used' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get usage records
     */
    public function usages(): HasMany
    {
        return $this->hasMany(PromoCodeUsage::class);
    }

    /**
     * Get orders that used this promo code
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Scope: Only active codes
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Only currently valid codes (within date range)
     */
    public function scopeValid(Builder $query): Builder
    {
        $now = now();

        return $query
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', $now);
            });
    }

    /**
     * Scope: Codes that haven't reached usage limit
     */
    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where(function ($q) {
            $q->whereNull('usage_limit')
                ->orWhereColumn('times_used', '<', 'usage_limit');
        });
    }

    /**
     * Scope: Active, valid, and available codes
     */
    public function scopeUsable(Builder $query): Builder
    {
        return $query->active()->valid()->available();
    }

    /**
     * Find a usable code by code string
     */
    public static function findUsableByCode(string $code): ?self
    {
        return static::usable()
            ->where('code', strtoupper($code))
            ->first();
    }

    /**
     * Check if code is currently valid
     */
    public function isCurrentlyValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();

        if ($this->starts_at && $this->starts_at > $now) {
            return false;
        }

        if ($this->ends_at && $this->ends_at < $now) {
            return false;
        }

        return true;
    }

    /**
     * Alias for isCurrentlyValid()
     */
    public function isValid(): bool
    {
        return $this->isCurrentlyValid();
    }

    /**
     * Check if code is available (not reached usage limit)
     */
    public function isAvailable(): bool
    {
        return !$this->isUsageLimitReached();
    }

    /**
     * Check if usage limit is reached
     */
    public function isUsageLimitReached(): bool
    {
        if ($this->usage_limit === null) {
            return false;
        }

        return $this->times_used >= $this->usage_limit;
    }

    /**
     * Check if per-user limit is reached
     */
    public function isPerUserLimitReached(?int $userId, string $email): bool
    {
        if ($this->per_user_limit === null) {
            return false;
        }

        $usageCount = $this->usages()
            ->where(function ($q) use ($userId, $email) {
                if ($userId) {
                    $q->where('user_id', $userId);
                } else {
                    $q->where('email', $email);
                }
            })
            ->count();

        return $usageCount >= $this->per_user_limit;
    }

    /**
     * Check if minimum order amount is met
     */
    public function meetsMinimumOrder(float $cartTotal): bool
    {
        if ($this->min_order_amount === null) {
            return true;
        }

        return $cartTotal >= $this->min_order_amount;
    }

    /**
     * Calculate discount amount for a cart total
     */
    public function calculateDiscount(float $cartTotal): float
    {
        if ($this->type === 'percentage') {
            $discount = $cartTotal * ($this->value / 100);

            // Apply max discount cap if set
            if ($this->max_discount_amount !== null) {
                $discount = min($discount, $this->max_discount_amount);
            }

            return round($discount, 2);
        }

        // Fixed discount - can't exceed cart total
        return round(min($this->value, $cartTotal), 2);
    }

    /**
     * Increment usage count
     */
    public function incrementUsage(): void
    {
        $this->increment('times_used');
    }

    /**
     * Get formatted value for display
     */
    public function getFormattedValue(): string
    {
        if ($this->type === 'percentage') {
            return $this->value . '%';
        }

        return '€' . number_format($this->value, 2);
    }

    /**
     * Check if code is expired
     */
    public function isExpired(): bool
    {
        return $this->ends_at && $this->ends_at < now();
    }

    /**
     * Check if code is not yet active
     */
    public function isNotYetActive(): bool
    {
        return $this->starts_at && $this->starts_at > now();
    }
}
