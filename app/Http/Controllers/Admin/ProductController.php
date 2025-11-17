<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
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
        return Inertia::render('admin/products/create');
    }
}
