<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WishlistController extends Controller
{
    /**
     * Display the wishlist page with full product details
     */
    public function index(Request $request)
    {
        $wishlistItems = [];

        if (auth()->check()) {
            // Authenticated users: fetch from database
            $wishlistItems = Wishlist::where('user_id', auth()->id())
                ->with(['product.images', 'product.variants', 'variant'])
                ->latest()
                ->get()
                ->map(function ($item) {
                    $product = $item->product;
                    $variant = $item->variant;

                    // Get the primary image or first image
                    $primaryImage = $product->images()->where('is_primary', true)->first()
                        ?? $product->images()->first();

                    // If variant exists and has an image, use that; otherwise use product image
                    $imageUrl = $variant && $variant->image
                        ? $variant->image
                        : ($primaryImage ? $primaryImage->url : '/images/placeholder.png');

                    // Calculate price information
                    $price = $variant ? $variant->price : $product->price;
                    $compareAtPrice = $variant ? $variant->compare_at_price : $product->compare_at_price;
                    $isOnSale = $compareAtPrice && $compareAtPrice > $price;
                    $salePercentage = $isOnSale
                        ? round((($compareAtPrice - $price) / $compareAtPrice) * 100)
                        : null;

                    return [
                        'id' => $item->id,
                        'productId' => $product->id,
                        'productSlug' => $product->slug,
                        'productName' => $product->name,
                        'productTitle' => $product->title,
                        'variantId' => $variant?->id,
                        'variantSize' => $variant?->size,
                        'variantSku' => $variant?->sku ?? $product->sku,
                        'image' => $imageUrl,
                        'price' => $price,
                        'compareAtPrice' => $compareAtPrice,
                        'isOnSale' => $isOnSale,
                        'salePercentage' => $salePercentage,
                        'inStock' => $variant ? $variant->inStock() : $product->inStock(),
                        'stock' => $variant ? $variant->stock : 0,
                        'addedAt' => $item->created_at->toISOString(),
                    ];
                });
        }

        return Inertia::render('wishlist/index', [
            'wishlistItems' => $wishlistItems,
        ]);
    }
}
