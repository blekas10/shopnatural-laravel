<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductDiscount;
use App\Services\ProductDiscountService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductDiscountController extends Controller
{
    public function __construct(
        protected ProductDiscountService $discountService
    ) {}

    public function index()
    {
        $discounts = ProductDiscount::orderByDesc('priority')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($discount) {
                return [
                    'id' => $discount->id,
                    'name' => $discount->name,
                    'type' => $discount->type,
                    'value' => (float) $discount->value,
                    'formattedValue' => $discount->getFormattedValue(),
                    'scope' => $discount->scope,
                    'categoryIds' => $discount->category_ids ?? [],
                    'brandIds' => $discount->brand_ids ?? [],
                    'productIds' => $discount->product_ids ?? [],
                    'startsAt' => $discount->starts_at?->toIso8601String(),
                    'endsAt' => $discount->ends_at?->toIso8601String(),
                    'isActive' => $discount->is_active,
                    'priority' => $discount->priority,
                    'isValid' => $discount->isValid(),
                    'createdAt' => $discount->created_at->toIso8601String(),
                ];
            });

        return Inertia::render('admin/product-discounts/index', [
            'discounts' => $discounts,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/product-discounts/form', [
            'discount' => null,
            'categories' => $this->getCategoryOptions(),
            'brands' => $this->getBrandOptions(),
            'products' => $this->getProductOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'scope' => 'required|in:all,categories,brands,products',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'brand_ids' => 'nullable|array',
            'brand_ids.*' => 'exists:brands,id',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'is_active' => 'boolean',
            'priority' => 'nullable|integer|min:0',
        ]);

        // Validate percentage isn't over 100
        if ($validated['type'] === 'percentage' && $validated['value'] > 100) {
            return back()->withErrors(['value' => 'Percentage discount cannot exceed 100%.']);
        }

        $validated['is_active'] = $request->boolean('is_active');
        $validated['priority'] = $validated['priority'] ?? 0;

        // Clear scope-specific fields based on scope
        $this->clearScopeFields($validated);

        ProductDiscount::create($validated);

        // Clear cache
        $this->discountService->clearCache();

        return redirect()->route('admin.product-discounts.index')
            ->with('success', 'Product discount created successfully.');
    }

    public function edit(ProductDiscount $productDiscount)
    {
        return Inertia::render('admin/product-discounts/form', [
            'discount' => [
                'id' => $productDiscount->id,
                'name' => $productDiscount->name,
                'type' => $productDiscount->type,
                'value' => (float) $productDiscount->value,
                'scope' => $productDiscount->scope,
                'category_ids' => $productDiscount->category_ids ?? [],
                'brand_ids' => $productDiscount->brand_ids ?? [],
                'product_ids' => $productDiscount->product_ids ?? [],
                'starts_at' => $productDiscount->starts_at?->format('Y-m-d\TH:i'),
                'ends_at' => $productDiscount->ends_at?->format('Y-m-d\TH:i'),
                'is_active' => $productDiscount->is_active,
                'priority' => $productDiscount->priority,
            ],
            'categories' => $this->getCategoryOptions(),
            'brands' => $this->getBrandOptions(),
            'products' => $this->getProductOptions(),
        ]);
    }

    public function update(Request $request, ProductDiscount $productDiscount)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'scope' => 'required|in:all,categories,brands,products',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'brand_ids' => 'nullable|array',
            'brand_ids.*' => 'exists:brands,id',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'is_active' => 'boolean',
            'priority' => 'nullable|integer|min:0',
        ]);

        // Validate percentage isn't over 100
        if ($validated['type'] === 'percentage' && $validated['value'] > 100) {
            return back()->withErrors(['value' => 'Percentage discount cannot exceed 100%.']);
        }

        $validated['is_active'] = $request->boolean('is_active');
        $validated['priority'] = $validated['priority'] ?? 0;

        // Clear scope-specific fields based on scope
        $this->clearScopeFields($validated);

        $productDiscount->update($validated);

        // Clear cache
        $this->discountService->clearCache();

        return redirect()->route('admin.product-discounts.index')
            ->with('success', 'Product discount updated successfully.');
    }

    public function destroy(ProductDiscount $productDiscount)
    {
        $productDiscount->delete();

        // Clear cache
        $this->discountService->clearCache();

        return redirect()->route('admin.product-discounts.index')
            ->with('success', 'Product discount deleted successfully.');
    }

    /**
     * Clear scope-specific fields based on selected scope
     */
    private function clearScopeFields(array &$validated): void
    {
        switch ($validated['scope']) {
            case 'all':
                $validated['category_ids'] = null;
                $validated['brand_ids'] = null;
                $validated['product_ids'] = null;
                break;
            case 'categories':
                $validated['brand_ids'] = null;
                $validated['product_ids'] = null;
                break;
            case 'brands':
                $validated['category_ids'] = null;
                $validated['product_ids'] = null;
                break;
            case 'products':
                $validated['category_ids'] = null;
                $validated['brand_ids'] = null;
                break;
        }
    }

    private function getCategoryOptions(): array
    {
        return Category::orderBy('order')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->getTranslation('name', 'en'),
            ])
            ->toArray();
    }

    private function getBrandOptions(): array
    {
        return Brand::orderBy('order')
            ->get()
            ->map(fn ($b) => [
                'id' => $b->id,
                'name' => $b->getTranslation('name', 'en'),
            ])
            ->toArray();
    }

    private function getProductOptions(): array
    {
        return Product::orderBy('name->en')
            ->limit(500) // Limit for performance
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->getTranslation('name', 'en'),
            ])
            ->toArray();
    }
}
