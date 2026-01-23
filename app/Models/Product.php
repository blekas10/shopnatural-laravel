<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Translatable\HasTranslations;

class Product extends Model
{
    use HasTranslations, SoftDeletes;

    protected $fillable = [
        'brand_id',
        'slug',
        'name',
        'title',
        'short_description',
        'description',
        'additional_information',
        'ingredients',
        'is_active',
        'is_featured',
        'meta_title',
        'meta_description',
        'focus_keyphrase',
    ];

    public $translatable = [
        'name',
        'slug',
        'title',
        'short_description',
        'description',
        'additional_information',
        'ingredients',
        'meta_title',
        'meta_description',
        'focus_keyphrase',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    /**
     * Get categories for this product
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class)->withTimestamps();
    }

    /**
     * Get product images
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('order');
    }

    /**
     * Get the primary image
     */
    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    /**
     * Get the brand
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * Get product variants
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('size');
    }

    /**
     * Get the default variant
     */
    public function defaultVariant(): HasOne
    {
        return $this->hasOne(ProductVariant::class)->where('is_default', true);
    }

    /**
     * Check if product is on sale (checks default variant)
     */
    public function isOnSale(): bool
    {
        $variant = $this->defaultVariant ?? $this->variants->first();
        return $variant ? $variant->isOnSale() : false;
    }

    /**
     * Get sale percentage
     */
    public function getSalePercentage(): ?int
    {
        $variant = $this->defaultVariant ?? $this->variants->first();
        return $variant ? $variant->getSalePercentage() : null;
    }

    /**
     * Check if product is in stock
     */
    public function inStock(): bool
    {
        // Check if product has any active variants that are in stock
        return $this->variants()
            ->where('is_active', true)
            ->where(function ($query) {
                // Stock of 0 means unlimited, or stock > 0
                $query->where('stock', 0)
                      ->orWhere('stock', '>', 0);
            })
            ->exists();
    }

    /**
     * Check if stock is low
     */
    public function isLowStock(): bool
    {
        $variant = $this->defaultVariant ?? $this->variants->first();
        return $variant ? $variant->isLowStock() : false;
    }

    /**
     * Scope: Only active products
     * Note: Uses table prefix to avoid ambiguity when joined with product_variants
     */
    public function scopeActive($query)
    {
        return $query->where('products.is_active', true);
    }

    /**
     * Scope: Only featured products
     * Note: Uses table prefix to avoid ambiguity when joined with product_variants
     */
    public function scopeFeatured($query)
    {
        return $query->where('products.is_featured', true);
    }

    /**
     * Scope: Only in-stock products
     */
    public function scopeInStock($query)
    {
        return $query->whereHas('variants', function ($q) {
            $q->where('stock', '>', 0);
        });
    }

    /**
     * Scope: Products in a specific category
     */
    public function scopeInCategory($query, $categoryId)
    {
        return $query->whereHas('categories', function ($q) use ($categoryId) {
            $q->where('categories.id', $categoryId);
        });
    }
}
