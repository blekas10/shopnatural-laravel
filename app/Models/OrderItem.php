<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'product_variant_id',
        'product_name',
        'product_sku',
        'variant_size',
        'original_unit_price',
        'unit_price',
        'quantity',
        'subtotal',
        'tax',
        'total',
    ];

    /**
     * Calculate item totals
     */
    public function calculateTotals(): void
    {
        $this->subtotal = $this->unit_price * $this->quantity;
        $this->total = $this->subtotal + $this->tax;
    }

    protected function casts(): array
    {
        return [
            'original_unit_price' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'quantity' => 'integer',
            'subtotal' => 'decimal:2',
            'tax' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    /**
     * Get the order that owns the item
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
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
}
