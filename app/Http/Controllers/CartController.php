<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class CartController extends Controller
{
    /**
     * Add item to cart
     */
    public function addItem(Request $request)
    {
        \Log::info('Cart addItem called', [
            'product_id' => $request->product_id,
            'variant_id' => $request->variant_id,
            'quantity' => $request->quantity,
            'session_id' => Session::getId(),
            'user_id' => auth()->id(),
        ]);

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'integer|min:1|max:100',
        ]);

        $cart = $this->getOrCreateCart();
        \Log::info('Cart found/created', ['cart_id' => $cart->id]);

        $variant = ProductVariant::findOrFail($request->variant_id);

        // Check if item already exists in cart
        $cartItem = $cart->items()
            ->where('product_id', $request->product_id)
            ->where('product_variant_id', $request->variant_id)
            ->first();

        if ($cartItem) {
            // Update quantity
            $cartItem->increment('quantity', $request->quantity ?? 1);
            \Log::info('Cart item updated', ['cart_item_id' => $cartItem->id]);
        } else {
            // Create new cart item
            $newItem = $cart->items()->create([
                'product_id' => $request->product_id,
                'product_variant_id' => $request->variant_id,
                'quantity' => $request->quantity ?? 1,
                'price' => $variant->price,
            ]);
            \Log::info('Cart item created', ['cart_item_id' => $newItem->id]);
        }

        return back();
    }

    /**
     * Update cart item quantity
     */
    public function updateItem(Request $request, CartItem $item)
    {
        $request->validate([
            'quantity' => 'required|integer|min:0|max:100',
        ]);

        $cart = $this->getOrCreateCart();

        // Verify item belongs to this cart
        if ($item->cart_id !== $cart->id) {
            abort(403);
        }

        if ($request->quantity > 0) {
            $item->update(['quantity' => $request->quantity]);
        } else {
            $item->delete();
        }

        return back();
    }

    /**
     * Remove item from cart
     */
    public function removeItem(CartItem $item)
    {
        $cart = $this->getOrCreateCart();

        // Verify item belongs to this cart
        if ($item->cart_id !== $cart->id) {
            abort(403);
        }

        $item->delete();

        return back();
    }

    /**
     * Clear cart
     */
    public function clear()
    {
        $cart = $this->getOrCreateCart();
        $cart->items()->delete();

        return back();
    }

    /**
     * Get or create cart for current user/session
     */
    protected function getOrCreateCart(): Cart
    {
        $user = auth()->user();

        if ($user) {
            // Get or create cart for authenticated user
            return Cart::firstOrCreate(
                ['user_id' => $user->id],
                ['expires_at' => null]
            );
        }

        // Get or create cart for guest session
        $sessionId = Session::getId();

        return Cart::firstOrCreate(
            ['session_id' => $sessionId],
            ['expires_at' => now()->addHours(12)]
        );
    }
}
