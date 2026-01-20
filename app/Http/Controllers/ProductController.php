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
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        private ProductService $productService
    ) {}

    /**
     * Parse comma-separated IDs to array of integers
     */
    private function parseCommaSeparatedIds(mixed $input): array
    {
        if (empty($input)) {
            return [];
        }

        if (is_array($input)) {
            return array_map('intval', $input);
        }

        return array_map('intval', array_filter(explode(',', (string) $input), fn($val) => $val !== ''));
    }

    /**
     * Display product listing page with server-side pagination
     */
    public function index(Request $request): Response
    {
        // Get price range for filter
        $priceRange = $this->productService->getPriceRange();

        // Extract filter parameters
        $filters = [
            'search' => $request->input('search'),
            'categories' => $this->parseCommaSeparatedIds($request->input('categories')),
            'brands' => $this->parseCommaSeparatedIds($request->input('brands')),
            'minPrice' => $request->input('minPrice') ? (float) $request->input('minPrice') : null,
            'maxPrice' => $request->input('maxPrice') ? (float) $request->input('maxPrice') : null,
            'onSale' => $request->boolean('onSale'),
            'inStock' => $request->boolean('inStock'),
            'sort' => $request->input('sort', 'featured'),
        ];

        // Get paginated products
        $products = $this->productService->getFilteredPaginatedProducts($filters, 24);

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
            'products' => ProductResource::collection($products)->resolve(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem(),
            ],
            'priceExtent' => [$priceRange['min'], $priceRange['max']],
            'brands' => BrandResource::collection($brands)->resolve(),
            'categories' => CategoryResource::collection($categories)->resolve(),
            'appliedFilters' => [
                'categoryIds' => $filters['categories'],
                'brandIds' => $filters['brands'],
                'priceRange' => [
                    (float) ($filters['minPrice'] ?? $priceRange['min']),
                    (float) ($filters['maxPrice'] ?? $priceRange['max']),
                ],
                'sort' => $filters['sort'],
                'search' => $filters['search'] ?? '',
                'onSale' => $filters['onSale'],
                'inStock' => $filters['inStock'],
            ],
        ]);
    }

    /**
     * Display product detail page
     */
    public function show(string $slug): Response
    {
        // Query slug from both English and Lithuanian translations
        $product = Product::with(['categories', 'images', 'defaultVariant', 'variants.image', 'brand.parent'])
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
