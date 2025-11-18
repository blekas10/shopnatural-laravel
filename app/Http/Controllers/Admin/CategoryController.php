<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        // Get all categories with their relationships
        $categories = Category::with(['parent', 'children'])
            ->orderBy('order')
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'parent_id' => $category->parent_id,
                    'parent_name' => $category->parent?->name,
                    'order' => $category->order,
                    'is_active' => $category->is_active,
                    'children_count' => $category->children->count(),
                    'products_count' => $category->products()->count(),
                ];
            });

        // Build hierarchical structure
        $hierarchical = $this->buildHierarchy($categories);

        return Inertia::render('admin/categories/index', [
            'categories' => $hierarchical,
        ]);
    }

    public function create()
    {
        $allCategories = Category::orderBy('order')->get()->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'parent_id' => $category->parent_id,
            ];
        });

        return Inertia::render('admin/categories/form', [
            'category' => null,
            'allCategories' => $this->buildCategoryOptions($allCategories),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|array',
            'name.en' => 'required|string|max:255',
            'name.lt' => 'nullable|string|max:255',
            'slug' => 'nullable|string|unique:categories,slug|max:255',
            'description' => 'nullable|array',
            'description.en' => 'nullable|string',
            'description.lt' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
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

        Category::create($validated);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category created successfully.');
    }

    public function edit(Category $category)
    {
        $allCategories = Category::where('id', '!=', $category->id)
            ->orderBy('order')
            ->get()
            ->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'name' => $cat->name, // Display name for options
                    'parent_id' => $cat->parent_id,
                ];
            });

        return Inertia::render('admin/categories/form', [
            'category' => [
                'id' => $category->id,
                'name' => $category->getTranslations('name'),
                'slug' => $category->slug,
                'description' => $category->getTranslations('description'),
                'parent_id' => $category->parent_id,
                'order' => $category->order,
                'is_active' => $category->is_active,
            ],
            'allCategories' => $this->buildCategoryOptions($allCategories),
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|array',
            'name.en' => 'required|string|max:255',
            'name.lt' => 'nullable|string|max:255',
            'slug' => 'nullable|string|unique:categories,slug,' . $category->id . '|max:255',
            'description' => 'nullable|array',
            'description.en' => 'nullable|string',
            'description.lt' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
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
        if (isset($validated['parent_id']) && $validated['parent_id'] == $category->id) {
            return back()->withErrors(['parent_id' => 'A category cannot be its own parent.']);
        }

        $category->update($validated);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        // Check if category has children
        if ($category->children()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete category with subcategories. Delete subcategories first.']);
        }

        // Check if category has products
        if ($category->products()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete category with products. Remove products first.']);
        }

        $category->delete();

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category deleted successfully.');
    }

    /**
     * Build hierarchical array from flat category collection
     */
    private function buildHierarchy($categories, $parentId = null, $level = 0)
    {
        $branch = [];

        foreach ($categories as $category) {
            if ($category['parent_id'] == $parentId) {
                $category['level'] = $level;
                $category['children'] = $this->buildHierarchy($categories, $category['id'], $level + 1);
                $branch[] = $category;
            }
        }

        return $branch;
    }

    /**
     * Build category options with indentation for parent selection
     */
    private function buildCategoryOptions($categories, $parentId = null, $prefix = '')
    {
        $options = [];

        foreach ($categories as $category) {
            if ($category['parent_id'] == $parentId) {
                $options[] = [
                    'id' => $category['id'],
                    'name' => $prefix . $category['name'],
                ];

                // Recursively get children
                $childOptions = $this->buildCategoryOptions($categories, $category['id'], $prefix . '— ');
                $options = array_merge($options, $childOptions);
            }
        }

        return $options;
    }
}
