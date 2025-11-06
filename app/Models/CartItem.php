<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $fillable = [
        'cart_id',
        'product_id',
        'product_variant_id',
        'quantity',
        'price',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'price' => 'decimal:2',
        ];
    }

    /**
     * Get the cart that owns the item
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Get the product
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the product variant
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * Calculate item subtotal
     */
    public function getSubtotal(): float
    {
        return (float) $this->price * $this->quantity;
    }

    /**
     * Check if item has enough stock
     */
    public function hasEnoughStock(): bool
    {
        return $this->variant->stock >= $this->quantity;
    }

    /**
     * Sync price with current variant price
     */
    public function syncPrice(): void
    {
        $this->update(['price' => $this->variant->price]);
    }
}
