<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Get all wishlist items for the authenticated user
     */
    public function items(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['items' => []]);
        }

        $wishlistItems = Wishlist::where('user_id', auth()->id())
            ->with(['product', 'variant'])
            ->latest()
            ->get()
            ->map(function ($item) {
                return [
                    'productId' => $item->product_id,
                    'variantId' => $item->product_variant_id,
                    'productName' => $item->product->name,
                ];
            });

        return response()->json(['items' => $wishlistItems]);
    }

    /**
     * Add item to wishlist
     */
    public function add(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['success' => false, 'message' => 'Authentication required'], 401);
        }

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
        ]);

        $wishlistItem = Wishlist::firstOrCreate([
            'user_id' => auth()->id(),
            'product_id' => $validated['product_id'],
            'product_variant_id' => $validated['product_variant_id'] ?? null,
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Remove item from wishlist
     */
    public function remove(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['success' => false, 'message' => 'Authentication required'], 401);
        }

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
        ]);

        Wishlist::where('user_id', auth()->id())
            ->where('product_id', $validated['product_id'])
            ->where('product_variant_id', $validated['product_variant_id'] ?? null)
            ->delete();

        return response()->json(['success' => true]);
    }
}
