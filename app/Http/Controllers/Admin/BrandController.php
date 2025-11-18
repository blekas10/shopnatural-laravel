<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BrandController extends Controller
{
    public function index()
    {
        // Get all brands with their relationships
        $brands = Brand::with(['parent', 'children'])
            ->orderBy('order')
            ->get()
            ->map(function ($brand) {
                return [
                    'id' => $brand->id,
                    'name' => $brand->name,
                    'slug' => $brand->slug,
                    'description' => $brand->description,
                    'logo' => $brand->logo,
                    'parent_id' => $brand->parent_id,
                    'parent_name' => $brand->parent?->name,
                    'order' => $brand->order,
                    'is_active' => $brand->is_active,
                    'children_count' => $brand->children->count(),
                    'products_count' => $brand->products()->count(),
                ];
            });

        // Build hierarchical structure
        $hierarchical = $this->buildHierarchy($brands);

        return Inertia::render('admin/brands/index', [
            'brands' => $hierarchical,
        ]);
    }

    public function create()
    {
        $allBrands = Brand::orderBy('order')->get()->map(function ($brand) {
            return [
                'id' => $brand->id,
                'name' => $brand->name,
                'parent_id' => $brand->parent_id,
            ];
        });

        return Inertia::render('admin/brands/form', [
            'brand' => null,
            'allBrands' => $this->buildBrandOptions($allBrands),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|array',
            'name.en' => 'required|string|max:255',
            'name.lt' => 'nullable|string|max:255',
            'slug' => 'nullable|string|unique:brands,slug|max:255',
            'description' => 'nullable|array',
            'description.en' => 'nullable|string',
            'description.lt' => 'nullable|string',
            'logo' => 'nullable|string|max:500',
            'parent_id' => 'nullable|exists:brands,id',
            'order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        // Auto-generate slug if not provided (use English name)
        if (empty($validated['slug'])) {
            $englishName = $validated['name']['en'] ?? '';
            $validated['slug'] = Str::slug($englishName);
        }

        $validated['is_active'] = $request->boolean('is_active');

        // Ensure description has default values
        if (!isset($validated['description'])) {
            $validated['description'] = ['en' => '', 'lt' => ''];
        }

        Brand::create($validated);

        return redirect()->route('admin.brands.index')
            ->with('success', 'Brand created successfully.');
    }

    public function edit(Brand $brand)
    {
        $allBrands = Brand::where('id', '!=', $brand->id)
            ->orderBy('order')
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'name' => $b->name,
                    'parent_id' => $b->parent_id,
                ];
            });

        return Inertia::render('admin/brands/form', [
            'brand' => [
                'id' => $brand->id,
                'name' => $brand->getTranslations('name'),
                'slug' => $brand->slug,
                'description' => $brand->getTranslations('description'),
                'logo' => $brand->logo,
                'parent_id' => $brand->parent_id,
                'order' => $brand->order,
                'is_active' => $brand->is_active,
            ],
            'allBrands' => $this->buildBrandOptions($allBrands),
        ]);
    }

    public function update(Request $request, Brand $brand)
    {
        $validated = $request->validate([
            'name' => 'required|array',
            'name.en' => 'required|string|max:255',
            'name.lt' => 'nullable|string|max:255',
            'slug' => 'nullable|string|unique:brands,slug,' . $brand->id . '|max:255',
            'description' => 'nullable|array',
            'description.en' => 'nullable|string',
            'description.lt' => 'nullable|string',
            'logo' => 'nullable|string|max:500',
            'parent_id' => 'nullable|exists:brands,id',
            'order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        // Auto-generate slug if not provided (use English name)
        if (empty($validated['slug'])) {
            $englishName = $validated['name']['en'] ?? '';
            $validated['slug'] = Str::slug($englishName);
        }

        $validated['is_active'] = $request->boolean('is_active');

        // Ensure description has default values
        if (!isset($validated['description'])) {
            $validated['description'] = ['en' => '', 'lt' => ''];
        }

        // Prevent setting itself as parent
        if (isset($validated['parent_id']) && $validated['parent_id'] == $brand->id) {
            return back()->withErrors(['parent_id' => 'A brand cannot be its own parent.']);
        }

        $brand->update($validated);

        return redirect()->route('admin.brands.index')
            ->with('success', 'Brand updated successfully.');
    }

    public function destroy(Brand $brand)
    {
        // Check if brand has children
        if ($brand->children()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete brand with sub-brands. Delete sub-brands first.']);
        }

        // Check if brand has products
        if ($brand->products()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete brand with products. Remove products first.']);
        }

        $brand->delete();

        return redirect()->route('admin.brands.index')
            ->with('success', 'Brand deleted successfully.');
    }

    /**
     * Build hierarchical array from flat brand collection
     */
    private function buildHierarchy($brands, $parentId = null, $level = 0)
    {
        $branch = [];

        foreach ($brands as $brand) {
            if ($brand['parent_id'] == $parentId) {
                $brand['level'] = $level;
                $brand['children'] = $this->buildHierarchy($brands, $brand['id'], $level + 1);
                $branch[] = $brand;
            }
        }

        return $branch;
    }

    /**
     * Build brand options with indentation for parent selection
     */
    private function buildBrandOptions($brands, $parentId = null, $prefix = '')
    {
        $options = [];

        foreach ($brands as $brand) {
            if ($brand['parent_id'] == $parentId) {
                $options[] = [
                    'id' => $brand['id'],
                    'name' => $prefix . $brand['name'],
                ];

                // Recursively get children
                $childOptions = $this->buildBrandOptions($brands, $brand['id'], $prefix . '— ');
                $options = array_merge($options, $childOptions);
            }
        }

        return $options;
    }
}
