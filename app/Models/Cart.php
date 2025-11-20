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
        'status',
        'order_id',
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
     * Get the order this cart created (if completed)
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
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
     * Check if cart has expired
     * Note: Always returns false - carts never expire (kept for analytics)
     */
    public function hasExpired(): bool
    {
        return false;
    }

    /**
     * Scope: Only active carts (status = active)
     * Note: Carts never expire - all are permanent for analytics
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
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

    /**
     * Mark cart as completed and link to order
     */
    public function complete(Order $order): void
    {
        $this->update([
            'status' => 'completed',
            'order_id' => $order->id,
        ]);
    }

    /**
     * Mark cart as abandoned
     */
    public function abandon(): void
    {
        $this->update(['status' => 'abandoned']);
    }

    /**
     * Check if cart is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if cart is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}
