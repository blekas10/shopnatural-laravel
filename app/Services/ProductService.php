<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class ProductService
{
    /**
     * Get featured products for homepage
     */
    public function getFeaturedProducts(int $limit = 8): Collection
    {
        return Product::with(['categories', 'primaryImage', 'defaultVariant', 'variants'])
            ->active()
            ->featured()
            ->take($limit)
            ->get();
    }

    /**
     * Get related products based on categories
     */
    public function getRelatedProducts(Product $product, int $limit = 4): Collection
    {
        return Product::with(['primaryImage', 'defaultVariant', 'variants'])
            ->active()
            ->whereHas('categories', function ($query) use ($product) {
                $query->whereIn('categories.id', $product->categories->pluck('id'));
            })
            ->where('id', '!=', $product->id)
            ->inRandomOrder()
            ->take($limit)
            ->get();
    }

    /**
     * Get all active products with necessary relationships
     */
    public function getAllActiveProducts(): Collection
    {
        return Product::with(['categories', 'primaryImage', 'defaultVariant', 'variants', 'brand'])
            ->active()
            ->orderByDesc('is_featured')
            ->latest()
            ->get();
    }
}
