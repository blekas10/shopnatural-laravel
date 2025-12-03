<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class ProductDiscount extends Model
{
    protected $fillable = [
        'name',
        'type',
        'value',
        'scope',
        'category_ids',
        'brand_ids',
        'product_ids',
        'starts_at',
        'ends_at',
        'is_active',
        'priority',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'category_ids' => 'array',
            'brand_ids' => 'array',
            'product_ids' => 'array',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
            'priority' => 'integer',
        ];
    }

    /**
     * Scope: Only active discounts
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Only currently valid discounts (within date range)
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
     * Scope: Active and valid discounts
     */
    public function scopeActiveAndValid(Builder $query): Builder
    {
        return $query->active()->valid();
    }

    /**
     * Scope: Discounts applicable to a specific product
     */
    public function scopeForProduct(Builder $query, Product $product): Builder
    {
        return $query->where(function ($q) use ($product) {
            // Scope: all products
            $q->where('scope', 'all')
                // Scope: specific product
                ->orWhere(function ($q2) use ($product) {
                    $q2->where('scope', 'products')
                        ->whereJsonContains('product_ids', $product->id);
                })
                // Scope: category
                ->orWhere(function ($q2) use ($product) {
                    $q2->where('scope', 'categories')
                        ->whereJsonContains('category_ids', $product->category_id);
                })
                // Scope: brand
                ->orWhere(function ($q2) use ($product) {
                    $q2->where('scope', 'brands')
                        ->where(function ($q3) use ($product) {
                            $q3->whereJsonContains('brand_ids', $product->brand_id);
                            // Also check parent brand if product has sub-brand
                            if ($product->brand && $product->brand->parent_id) {
                                $q3->orWhereJsonContains('brand_ids', $product->brand->parent_id);
                            }
                        });
                });
        });
    }

    /**
     * Check if discount is currently active and valid
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
     * Check if discount applies to a product
     */
    public function appliesToProduct(Product $product): bool
    {
        if (!$this->isCurrentlyValid()) {
            return false;
        }

        return match ($this->scope) {
            'all' => true,
            'products' => in_array($product->id, $this->product_ids ?? []),
            'categories' => in_array($product->category_id, $this->category_ids ?? []),
            'brands' => $this->appliesToBrand($product),
            default => false,
        };
    }

    /**
     * Check if discount applies to product's brand (including parent brands)
     */
    protected function appliesToBrand(Product $product): bool
    {
        $brandIds = $this->brand_ids ?? [];

        // Direct brand match
        if (in_array($product->brand_id, $brandIds)) {
            return true;
        }

        // Parent brand match (for sub-brands)
        if ($product->brand && $product->brand->parent_id) {
            return in_array($product->brand->parent_id, $brandIds);
        }

        return false;
    }

    /**
     * Calculate discounted price
     */
    public function calculateDiscountedPrice(float $originalPrice): float
    {
        if ($this->type === 'percentage') {
            return round($originalPrice * (1 - $this->value / 100), 2);
        }

        // Fixed discount
        return round(max(0, $originalPrice - $this->value), 2);
    }

    /**
     * Get formatted discount value for display
     */
    public function getFormattedValue(): string
    {
        if ($this->type === 'percentage') {
            return $this->value . '%';
        }

        return '€' . number_format($this->value, 2);
    }
}
