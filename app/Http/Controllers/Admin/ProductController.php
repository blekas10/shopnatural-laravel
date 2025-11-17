<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['categories', 'brand', 'images', 'defaultVariant', 'variants'])
            ->latest()
            ->get()
            ->map(function ($product) {
                $variant = $product->defaultVariant ?? $product->variants->first();

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'description' => $product->description,
                    'price' => $variant?->price ?? 0,
                    'stock' => $variant?->stock ?? 0,
                    'is_featured' => $product->is_featured,
                    'is_active' => $product->is_active,
                    'category' => $product->categories->first() ? [
                        'id' => $product->categories->first()->id,
                        'name' => $product->categories->first()->name,
                    ] : null,
                    'brand' => $product->brand ? [
                        'id' => $product->brand->id,
                        'name' => $product->brand->name,
                    ] : null,
                    'image' => $product->images->first()?->url,
                ];
            });

        return Inertia::render('admin/products/index', [
            'products' => $products,
        ]);
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
            // Auto-generate slug if not provided
            $slug = $validated['slug'] ?? Str::slug($validated['name']);

            // Create product
            $product = Product::create([
                'name' => $validated['name'],
                'slug' => $slug,
                'title' => $validated['title'] ?? null,
                'short_description' => $validated['short_description'] ?? null,
                'description' => $validated['description'] ?? null,
                'additional_information' => $validated['additional_information'] ?? null,
                'ingredients' => $validated['ingredients'] ?? null,
                'meta_title' => $validated['meta_title'] ?? null,
                'meta_description' => $validated['meta_description'] ?? null,
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
                ]);
            }
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Product created successfully.');
    }

    public function edit(Product $product)
    {
        $product->load(['categories', 'brand', 'images', 'variants']);

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
                'name' => $product->name,
                'slug' => $product->slug,
                'title' => $product->title,
                'short_description' => $product->short_description,
                'description' => $product->description,
                'additional_information' => $product->additional_information,
                'ingredients' => $product->ingredients,
                'meta_title' => $product->meta_title,
                'meta_description' => $product->meta_description,
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
            // Auto-generate slug if not provided
            $slug = $validated['slug'] ?? Str::slug($validated['name']);

            // Update product
            $product->update([
                'name' => $validated['name'],
                'slug' => $slug,
                'title' => $validated['title'] ?? null,
                'short_description' => $validated['short_description'] ?? null,
                'description' => $validated['description'] ?? null,
                'additional_information' => $validated['additional_information'] ?? null,
                'ingredients' => $validated['ingredients'] ?? null,
                'meta_title' => $validated['meta_title'] ?? null,
                'meta_description' => $validated['meta_description'] ?? null,
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
