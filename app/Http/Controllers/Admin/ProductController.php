<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['categories', 'brand', 'images', 'defaultVariant', 'variants']);

        // Filter by search term (name, slug, and SKU)
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name->en', 'like', "%{$search}%")
                  ->orWhere('name->lt', 'like', "%{$search}%")
                  ->orWhere('slug->en', 'like', "%{$search}%")
                  ->orWhere('slug->lt', 'like', "%{$search}%")
                  ->orWhereHas('variants', function ($variantQuery) use ($search) {
                      $variantQuery->where('sku', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by category (includes all descendant categories)
        if ($request->filled('category_id')) {
            $category = Category::with('children.children')->find($request->input('category_id'));
            if ($category) {
                $categoryIds = $category->getAllDescendantIds();
                $query->whereHas('categories', function ($q) use ($categoryIds) {
                    $q->whereIn('categories.id', $categoryIds);
                });
            }
        }

        // Filter by brand (includes all descendant brands)
        if ($request->filled('brand_id')) {
            $brand = Brand::with('children.children')->find($request->input('brand_id'));
            if ($brand) {
                $brandIds = $brand->getAllDescendantIds();
                $query->whereIn('brand_id', $brandIds);
            }
        }

        // Filter by status (now based on variant active status)
        if ($request->filled('status')) {
            $status = $request->input('status');
            if ($status === 'active') {
                // Show products where all variants are active
                $query->whereHas('variants', function ($q) {
                    $q->where('is_active', true);
                })->whereDoesntHave('variants', function ($q) {
                    $q->where('is_active', false);
                });
            } elseif ($status === 'inactive') {
                // Show products where at least one variant is inactive (includes partial and fully inactive)
                $query->whereHas('variants', function ($q) {
                    $q->where('is_active', false);
                });
            }
        }

        // Paginate
        $perPage = $request->input('per_page', 20);
        $paginated = $query->latest()->paginate($perPage)->withQueryString();

        // Transform products
        $products = $paginated->through(function ($product) {
            $variant = $product->defaultVariant ?? $product->variants->first();

            // Calculate variant status for the product
            $activeVariantsCount = $product->variants->where('is_active', true)->count();
            $totalVariantsCount = $product->variants->count();

            $variantStatus = 'inactive';
            if ($activeVariantsCount === $totalVariantsCount) {
                $variantStatus = 'active';
            } elseif ($activeVariantsCount > 0) {
                $variantStatus = 'mixed';
            }

            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => $variant?->price ?? 0,
                'stock' => $variant?->stock ?? 0,
                'is_featured' => $product->is_featured,
                'is_active' => $product->is_active,
                'variant_status' => $variantStatus,
                'active_variants_count' => $activeVariantsCount,
                'total_variants_count' => $totalVariantsCount,
                'category' => $product->categories->first() ? [
                    'id' => $product->categories->first()->id,
                    'name' => $product->categories->first()->name,
                ] : null,
                'brand' => $product->brand ? [
                    'id' => $product->brand->id,
                    'name' => $product->brand->name,
                ] : null,
                'image' => $product->images->first()?->url,
                'variants' => $product->variants->map(fn($v) => [
                    'id' => $v->id,
                    'sku' => $v->sku,
                    'size' => $v->size,
                    'price' => (float) $v->price,
                    'compare_at_price' => $v->compare_at_price ? (float) $v->compare_at_price : null,
                    'stock' => $v->stock,
                    'is_default' => $v->is_default,
                    'is_active' => $v->is_active,
                ])->toArray(),
            ];
        });

        // Get categories with hierarchy
        $categories = Category::with('parent')->orderBy('order')->get()->map(fn($cat) => [
            'id' => $cat->id,
            'name' => $cat->name,
            'parent_id' => $cat->parent_id,
        ]);

        // Build hierarchical structure
        $hierarchicalCategories = $this->buildCategoryHierarchy($categories->toArray());

        // Get all brands with hierarchy
        $brands = Brand::where('is_active', true)
            ->with('parent')
            ->orderBy('name->en')
            ->get()
            ->map(fn($brand) => [
                'id' => $brand->id,
                'name' => $brand->name,
                'parent_id' => $brand->parent_id,
            ]);

        // Build hierarchical structure
        $hierarchicalBrands = $this->buildBrandHierarchy($brands->toArray());

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'categories' => $hierarchicalCategories,
            'brands' => $hierarchicalBrands,
            'filters' => [
                'search' => $request->input('search', ''),
                'category_id' => $request->input('category_id', ''),
                'brand_id' => $request->input('brand_id', ''),
                'status' => $request->input('status', ''),
            ],
        ]);
    }

    private function buildCategoryHierarchy(array $categories, $parentId = null, $level = 0): array
    {
        $branch = [];

        foreach ($categories as $category) {
            if ($category['parent_id'] == $parentId) {
                $category['level'] = $level;
                $category['children'] = $this->buildCategoryHierarchy($categories, $category['id'], $level + 1);
                $branch[] = $category;
            }
        }

        return $branch;
    }

    private function buildBrandHierarchy(array $brands, $parentId = null, $level = 0): array
    {
        $branch = [];

        foreach ($brands as $brand) {
            if ($brand['parent_id'] == $parentId) {
                $brand['level'] = $level;
                $brand['children'] = $this->buildBrandHierarchy($brands, $brand['id'], $level + 1);
                $branch[] = $brand;
            }
        }

        return $branch;
    }

    public function create()
    {
        $categories = Category::orderBy('order')->get()->map(fn($cat) => [
            'id' => $cat->id,
            'name' => $cat->name,
            'parent_id' => $cat->parent_id,
        ]);

        $brands = Brand::where('is_active', true)->get()->map(fn($brand) => [
            'id' => $brand->id,
            'name' => $brand->name,
        ]);

        return Inertia::render('admin/products/form', [
            'product' => null,
            'categories' => $this->buildCategoryTree($categories),
            'brands' => $brands,
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            // Auto-generate slug if not provided (use English name)
            $englishName = $validated['name']['en'] ?? '';
            $slug = $validated['slug'] ?? Str::slug($englishName);

            // Create product with translations
            $product = Product::create([
                'name' => $validated['name'], // Spatie handles the array
                'slug' => $slug,
                'title' => $validated['title'] ?? ['en' => '', 'lt' => ''],
                'short_description' => $validated['short_description'] ?? ['en' => '', 'lt' => ''],
                'description' => $validated['description'] ?? ['en' => '', 'lt' => ''],
                'additional_information' => $validated['additional_information'] ?? ['en' => '', 'lt' => ''],
                'ingredients' => $validated['ingredients'] ?? ['en' => '', 'lt' => ''],
                'meta_title' => $validated['meta_title'] ?? ['en' => '', 'lt' => ''],
                'meta_description' => $validated['meta_description'] ?? ['en' => '', 'lt' => ''],
                'brand_id' => $validated['brand_id'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'is_featured' => $validated['is_featured'] ?? false,
            ]);

            // Sync categories
            if (!empty($validated['category_ids'])) {
                $product->categories()->sync($validated['category_ids']);
            }

            // Create variants
            foreach ($validated['variants'] as $variantData) {
                $product->variants()->create([
                    'sku' => $variantData['sku'],
                    'size' => $variantData['size'],
                    'price' => $variantData['price'],
                    'compare_at_price' => $variantData['compare_at_price'] ?? null,
                    'stock' => $variantData['stock'],
                    'low_stock_threshold' => $variantData['low_stock_threshold'] ?? 5,
                    'is_default' => $variantData['is_default'] ?? false,
                    'image_id' => $variantData['image_id'] ?? null,
                ]);
            }
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Product created successfully.');
    }

    public function edit(Product $product)
    {
        $product->load(['categories', 'brand', 'images', 'variants.image']);

        $categories = Category::orderBy('order')->get()->map(fn($cat) => [
            'id' => $cat->id,
            'name' => $cat->name,
            'parent_id' => $cat->parent_id,
        ]);

        $brands = Brand::where('is_active', true)->get()->map(fn($brand) => [
            'id' => $brand->id,
            'name' => $brand->name,
        ]);

        return Inertia::render('admin/products/form', [
            'product' => [
                'id' => $product->id,
                'name' => $product->getTranslations('name'),
                'slug' => $product->slug,
                'title' => $product->getTranslations('title'),
                'short_description' => $product->getTranslations('short_description'),
                'description' => $product->getTranslations('description'),
                'additional_information' => $product->getTranslations('additional_information'),
                'ingredients' => $product->getTranslations('ingredients'),
                'meta_title' => $product->getTranslations('meta_title'),
                'meta_description' => $product->getTranslations('meta_description'),
                'brand_id' => $product->brand_id,
                'is_active' => $product->is_active,
                'is_featured' => $product->is_featured,
                'category_ids' => $product->categories->pluck('id')->toArray(),
                'variants' => $product->variants->map(fn($v) => [
                    'id' => $v->id,
                    'sku' => $v->sku,
                    'size' => $v->size,
                    'price' => (float) $v->price,
                    'compare_at_price' => $v->compare_at_price ? (float) $v->compare_at_price : null,
                    'stock' => $v->stock,
                    'low_stock_threshold' => $v->low_stock_threshold,
                    'is_default' => $v->is_default,
                    'image_id' => $v->image_id,
                    'image_url' => $v->image?->url,
                ])->toArray(),
                'images' => $product->images->map(fn($img) => [
                    'id' => $img->id,
                    'url' => $img->url,
                    'alt_text' => $img->getTranslations('alt_text'),
                    'is_primary' => $img->is_primary,
                    'order' => $img->order,
                ])->toArray(),
            ],
            'categories' => $this->buildCategoryTree($categories),
            'brands' => $brands,
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $product) {
            // Auto-generate slug if not provided (use English name)
            $englishName = $validated['name']['en'] ?? '';
            $slug = $validated['slug'] ?? Str::slug($englishName);

            // Update product with translations
            $product->update([
                'name' => $validated['name'], // Spatie handles the array
                'slug' => $slug,
                'title' => $validated['title'] ?? ['en' => '', 'lt' => ''],
                'short_description' => $validated['short_description'] ?? ['en' => '', 'lt' => ''],
                'description' => $validated['description'] ?? ['en' => '', 'lt' => ''],
                'additional_information' => $validated['additional_information'] ?? ['en' => '', 'lt' => ''],
                'ingredients' => $validated['ingredients'] ?? ['en' => '', 'lt' => ''],
                'meta_title' => $validated['meta_title'] ?? ['en' => '', 'lt' => ''],
                'meta_description' => $validated['meta_description'] ?? ['en' => '', 'lt' => ''],
                'brand_id' => $validated['brand_id'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'is_featured' => $validated['is_featured'] ?? false,
            ]);

            // Sync categories
            $product->categories()->sync($validated['category_ids'] ?? []);

            // Delete variants marked for deletion
            if (!empty($validated['delete_variant_ids'])) {
                $product->variants()->whereIn('id', $validated['delete_variant_ids'])->delete();
            }

            // Update or create variants
            foreach ($validated['variants'] as $variantData) {
                if (!empty($variantData['id'])) {
                    // Update existing variant
                    $product->variants()->where('id', $variantData['id'])->update([
                        'sku' => $variantData['sku'],
                        'size' => $variantData['size'],
                        'price' => $variantData['price'],
                        'compare_at_price' => $variantData['compare_at_price'] ?? null,
                        'stock' => $variantData['stock'],
                        'low_stock_threshold' => $variantData['low_stock_threshold'] ?? 5,
                        'is_default' => $variantData['is_default'] ?? false,
                        'image_id' => $variantData['image_id'] ?? null,
                    ]);
                } else {
                    // Create new variant
                    $product->variants()->create([
                        'sku' => $variantData['sku'],
                        'size' => $variantData['size'],
                        'price' => $variantData['price'],
                        'compare_at_price' => $variantData['compare_at_price'] ?? null,
                        'stock' => $variantData['stock'],
                        'low_stock_threshold' => $variantData['low_stock_threshold'] ?? 5,
                        'is_default' => $variantData['is_default'] ?? false,
                        'image_id' => $variantData['image_id'] ?? null,
                    ]);
                }
            }
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        // Soft delete the product
        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }

    /**
     * Quick update variant (SKU, price, stock)
     */
    public function quickUpdateVariant(Request $request, Product $product, $variantId)
    {
        $request->validate([
            'sku' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $variant = $product->variants()->findOrFail($variantId);

        $variant->update($request->only(['sku', 'price', 'stock', 'is_active']));

        return response()->json([
            'success' => true,
            'variant' => [
                'id' => $variant->id,
                'sku' => $variant->sku,
                'size' => $variant->size,
                'price' => (float) $variant->price,
                'stock' => $variant->stock,
                'is_default' => $variant->is_default,
                'is_active' => $variant->is_active,
            ],
        ]);
    }

    /**
     * Build hierarchical category tree with indentation
     */
    private function buildCategoryTree($categories, $parentId = null, $prefix = '')
    {
        $tree = [];

        foreach ($categories as $category) {
            if ($category['parent_id'] == $parentId) {
                $tree[] = [
                    'id' => $category['id'],
                    'name' => $prefix . $category['name'],
                ];

                $children = $this->buildCategoryTree($categories, $category['id'], $prefix . '— ');
                $tree = array_merge($tree, $children);
            }
        }

        return $tree;
    }
}
