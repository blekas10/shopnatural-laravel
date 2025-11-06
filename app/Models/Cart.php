<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the cart
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get cart items
     */
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Check if cart is empty
     */
    public function isEmpty(): bool
    {
        return $this->items()->count() === 0;
    }

    /**
     * Get total items count
     */
    public function getTotalItemsCount(): int
    {
        return $this->items()->sum('quantity');
    }

    /**
     * Calculate cart subtotal
     */
    public function getSubtotal(): float
    {
        return $this->items()
            ->get()
            ->sum(fn (CartItem $item) => $item->price * $item->quantity);
    }

    /**
     * Calculate cart total (subtotal + tax + shipping - discount)
     */
    public function getTotal(): float
    {
        return $this->getSubtotal();
    }

    /**
     * Check if cart has expired (for guest carts)
     */
    public function hasExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Scope: Only active carts (not expired)
     */
    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
                ->orWhere('expires_at', '>', now());
        });
    }

    /**
     * Scope: Only guest carts
     */
    public function scopeGuest($query)
    {
        return $query->whereNull('user_id')->whereNotNull('session_id');
    }

    /**
     * Scope: Only user carts
     */
    public function scopeUser($query)
    {
        return $query->whereNotNull('user_id');
    }
}
