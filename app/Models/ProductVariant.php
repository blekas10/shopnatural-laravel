<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id',
        'sku',
        'size',
        'price',
        'compare_at_price',
        'stock',
        'low_stock_threshold',
        'is_default',
        'is_active',
        'image_id',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'compare_at_price' => 'decimal:2',
            'stock' => 'integer',
            'low_stock_threshold' => 'integer',
            'size' => 'string',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function image(): BelongsTo
    {
        return $this->belongsTo(ProductImage::class, 'image_id');
    }

    public function inStock(): bool
    {
        // Check if variant is active first
        if (!$this->is_active) {
            return false;
        }

        // Stock of 0 means unlimited
        if ($this->stock === 0) {
            return true;
        }

        // Otherwise check if stock is positive
        return $this->stock > 0;
    }

    public function isLowStock(): bool
    {
        return $this->stock <= $this->low_stock_threshold && $this->stock > 0;
    }

    public function isOnSale(): bool
    {
        return $this->compare_at_price !== null && $this->compare_at_price > $this->price;
    }

    public function getSalePercentage(): ?int
    {
        if (!$this->isOnSale()) {
            return null;
        }

        return (int) round((($this->compare_at_price - $this->price) / $this->compare_at_price) * 100);
    }
}
