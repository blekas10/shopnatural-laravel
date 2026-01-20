<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

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

    /**
     * Get filtered and paginated products with server-side filtering
     *
     * @param array $filters Associative array of filter parameters
     * @param int $perPage Number of products per page
     * @return LengthAwarePaginator
     */
    public function getFilteredPaginatedProducts(array $filters, int $perPage = 24): LengthAwarePaginator
    {
        $query = Product::with(['categories', 'brand', 'primaryImage', 'defaultVariant', 'variants'])
            ->active();

        // Search filter (name, title, slug)
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name->en', 'like', "%{$search}%")
                  ->orWhere('name->lt', 'like', "%{$search}%")
                  ->orWhere('title->en', 'like', "%{$search}%")
                  ->orWhere('title->lt', 'like', "%{$search}%")
                  ->orWhere('slug->en', 'like', "%{$search}%")
                  ->orWhere('slug->lt', 'like', "%{$search}%");
            });
        }

        // Hierarchical category filter (AND logic with descendants)
        if (!empty($filters['categories']) && is_array($filters['categories'])) {
            $categoryIds = [];
            
            // Get all descendant IDs for each selected category
            foreach ($filters['categories'] as $categoryId) {
                $category = Category::find($categoryId);
                if ($category) {
                    $categoryIds = array_merge($categoryIds, $category->getAllDescendantIds());
                }
            }
            
            // Remove duplicates
            $categoryIds = array_unique($categoryIds);
            
            // Apply AND logic: product must be in ALL selected category hierarchies
            foreach ($filters['categories'] as $categoryId) {
                $category = Category::find($categoryId);
                if ($category) {
                    $descendantIds = $category->getAllDescendantIds();
                    $query->whereHas('categories', function ($q) use ($descendantIds) {
                        $q->whereIn('categories.id', $descendantIds);
                    });
                }
            }
        }

        // Hierarchical brand filter (AND logic with descendants)
        if (!empty($filters['brands']) && is_array($filters['brands'])) {
            $brandIds = [];
            
            // Get all descendant IDs for each selected brand
            foreach ($filters['brands'] as $brandId) {
                $brand = Brand::find($brandId);
                if ($brand) {
                    $brandIds = array_merge($brandIds, $brand->getAllDescendantIds());
                }
            }
            
            // Remove duplicates
            $brandIds = array_unique($brandIds);
            
            // Apply filter: product must belong to any of the brand hierarchies
            $query->whereIn('brand_id', $brandIds);
        }

        // Price range filter (based on default variant price)
        if (isset($filters['minPrice']) || isset($filters['maxPrice'])) {
            $query->whereHas('defaultVariant', function ($q) use ($filters) {
                if (isset($filters['minPrice'])) {
                    $q->where('price', '>=', $filters['minPrice']);
                }
                if (isset($filters['maxPrice'])) {
                    $q->where('price', '<=', $filters['maxPrice']);
                }
            });
        }

        // On sale filter
        if (!empty($filters['onSale'])) {
            $query->whereHas('defaultVariant', function ($q) {
                $q->whereNotNull('compare_at_price')
                  ->whereColumn('compare_at_price', '>', 'price');
            });
        }

        // In stock filter
        if (!empty($filters['inStock'])) {
            $query->whereHas('variants', function ($q) {
                $q->where('is_active', true)
                  ->where(function ($q2) {
                      $q2->where('stock', 0) // 0 means unlimited
                         ->orWhere('stock', '>', 0);
                  });
            });
        }

        // Sorting
        $sort = $filters['sort'] ?? 'featured';
        match ($sort) {
            'featured' => $query->orderByDesc('is_featured')->latest(),
            'newest' => $query->latest(),
            'price_asc' => $query->join('product_variants as pv_asc', function ($join) {
                    $join->on('products.id', '=', 'pv_asc.product_id')
                         ->where('pv_asc.is_default', true);
                })->orderBy('pv_asc.price', 'asc')->select('products.*'),
            'price_desc' => $query->join('product_variants as pv_desc', function ($join) {
                    $join->on('products.id', '=', 'pv_desc.product_id')
                         ->where('pv_desc.is_default', true);
                })->orderBy('pv_desc.price', 'desc')->select('products.*'),
            'name' => $query->orderBy('name->en'),
            default => $query->orderByDesc('is_featured')->latest(),
        };

        return $query->paginate($perPage);
    }

    /**
     * Get price range from all active products
     *
     * @return array ['min' => float, 'max' => float]
     */
    public function getPriceRange(): array
    {
        $prices = Product::where('products.is_active', true)
            ->join('product_variants', function ($join) {
                $join->on('products.id', '=', 'product_variants.product_id')
                     ->where('product_variants.is_default', true);
            })
            ->selectRaw('MIN(product_variants.price) as min_price, MAX(product_variants.price) as max_price')
            ->first();

        return [
            'min' => (float) ($prices->min_price ?? 0),
            'max' => (float) ($prices->max_price ?? 0),
        ];
    }
}
