<?php

namespace App\Http\Controllers;

use App\Http\Resources\BrandResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Services\ProductService;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        private ProductService $productService
    ) {}

    /**
     * Display product listing page
     */
    public function index(): Response
    {
        // Get all active products for client-side filtering
        $products = $this->productService->getAllActiveProducts();

        // Get all active brands with product counts (hierarchical)
        $brands = Brand::where('is_active', true)
            ->with([
                'activeChildren' => function ($query) {
                    $query->withCount(['products' => function ($q) {
                        $q->where('is_active', true);
                    }]);
                },
                'activeChildren.activeChildren' => function ($query) {
                    $query->withCount(['products' => function ($q) {
                        $q->where('is_active', true);
                    }]);
                }
            ])
            ->withCount(['products' => function ($query) {
                $query->where('is_active', true);
            }])
            ->whereNull('parent_id') // Only root brands
            ->orderBy('name->en')
            ->get();

        // Get categories with hierarchy (3 levels)
        $categories = Category::active()
            ->roots()
            ->with('activeChildren.activeChildren')
            ->orderBy('order')
            ->get();

        return Inertia::render('products/index', [
            'allProducts' => ProductResource::collection($products)->resolve(),
            'brands' => BrandResource::collection($brands)->resolve(),
            'categories' => CategoryResource::collection($categories)->resolve(),
        ]);
    }

    /**
     * Display product detail page
     */
    public function show(string $slug): Response
    {
        // Query slug from both English and Lithuanian translations
        $product = Product::with(['categories', 'images', 'defaultVariant', 'variants.image', 'brand'])
            ->where(function ($query) use ($slug) {
                $query->where('slug->en', $slug)
                      ->orWhere('slug->lt', $slug);
            })
            ->active()
            ->firstOrFail();

        $relatedProducts = $this->productService->getRelatedProducts($product, 4);

        return Inertia::render('products/show', [
            'product' => (new ProductDetailResource($product))->resolve(),
            'relatedProducts' => ProductResource::collection($relatedProducts)->resolve(),
        ]);
    }
}
