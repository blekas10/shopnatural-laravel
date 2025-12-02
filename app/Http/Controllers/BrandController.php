<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    /**
     * Display a brand page with its children/collections.
     */
    public function show(string $slug): Response
    {
        $brand = Brand::where('slug', $slug)
            ->where('is_active', true)
            ->whereNull('parent_id') // Only top-level brands have public pages
            ->with(['activeChildren' => function ($query) {
                $query->orderBy('order');
            }])
            ->firstOrFail();

        return Inertia::render('brands/show', [
            'brand' => [
                'id' => $brand->id,
                'name' => $brand->name,
                'slug' => $brand->slug,
                'description' => $brand->description,
                'logo' => $brand->logo,
                'children' => $brand->activeChildren->map(fn ($child) => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'slug' => $child->slug,
                    'description' => $child->description,
                    'logo' => $child->logo,
                ]),
            ],
        ]);
    }
}
