<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
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

        return response()->json(['success' => true]);
    }

    /**
     * Update cart item quantity by product and variant
     */
    public function updateQuantity(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:0|max:100',
        ]);

        $cart = $this->getOrCreateCart();

        $cartItem = $cart->items()
            ->where('product_id', $request->product_id)
            ->where('product_variant_id', $request->variant_id)
            ->first();

        if (!$cartItem) {
            // Item not in database cart - this is okay, frontend already updated
            \Log::info('Update quantity: Item not found in database cart', [
                'product_id' => $request->product_id,
                'variant_id' => $request->variant_id,
            ]);
            return response()->json(['success' => true, 'message' => 'Item not in database cart']);
        }

        if ($request->quantity > 0) {
            $cartItem->update(['quantity' => $request->quantity]);
        } else {
            $cartItem->delete();
        }

        return response()->json(['success' => true]);
    }

    /**
     * Remove item from cart by product and variant
     */
    public function removeByProduct(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'required|exists:product_variants,id',
        ]);

        $cart = $this->getOrCreateCart();

        $cartItem = $cart->items()
            ->where('product_id', $request->product_id)
            ->where('product_variant_id', $request->variant_id)
            ->first();

        if (!$cartItem) {
            // Item not in database cart - this is okay, frontend already removed it
            \Log::info('Remove: Item not found in database cart', [
                'product_id' => $request->product_id,
                'variant_id' => $request->variant_id,
            ]);
            return response()->json(['success' => true, 'message' => 'Item not in database cart']);
        }

        $cartItem->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Update cart item quantity (legacy - by cart item ID)
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

        return response()->json(['success' => true]);
    }

    /**
     * Remove item from cart (legacy - by cart item ID)
     */
    public function removeItem(CartItem $item)
    {
        $cart = $this->getOrCreateCart();

        // Verify item belongs to this cart
        if ($item->cart_id !== $cart->id) {
            abort(403);
        }

        $item->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Clear cart
     */
    public function clear()
    {
        $cart = $this->getOrCreateCart();
        $cart->items()->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Restore cart from a draft order
     * Allows users to continue abandoned checkouts
     */
    public function restoreFromDraftOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
        ]);

        // Find the draft order belonging to this user
        $order = Order::where('id', $validated['order_id'])
            ->where('status', 'draft')
            ->where('user_id', auth()->id())
            ->with(['items.product.primaryImage', 'items.variant'])
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Draft order not found or does not belong to you.',
            ], 404);
        }

        // Build cart items from order items
        $cartItems = $order->items->map(function ($item) {
            return [
                'id' => "{$item->product_id}-{$item->product_variant_id}",
                'productId' => $item->product_id,
                'variantId' => $item->product_variant_id,
                'quantity' => $item->quantity,
                'name' => $item->product_name,
                'price' => (float) $item->unit_price,
                'image' => $item->product?->primaryImage?->url,
                'size' => $item->variant_size,
                'sku' => $item->product_sku,
                // Include full product and variant data for cart context
                'product' => $item->product ? [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'price' => (float) $item->unit_price,
                    'image' => $item->product->primaryImage?->url,
                ] : null,
                'variant' => $item->variant ? [
                    'id' => $item->variant->id,
                    'size' => $item->variant->size,
                    'price' => (float) $item->unit_price,
                    'sku' => $item->variant->sku,
                ] : null,
            ];
        });

        \Log::info('Cart: Restored cart from draft order', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'items_count' => $cartItems->count(),
        ]);

        return response()->json([
            'success' => true,
            'items' => $cartItems,
            'orderNumber' => $order->order_number,
            'orderId' => $order->id,
        ]);
    }

    /**
     * Get or create ACTIVE cart for current user/session
     */
    protected function getOrCreateCart(): Cart
    {
        $user = auth()->user();

        if ($user) {
            // Get or create ACTIVE cart for authenticated user
            $cart = Cart::active()
                ->where('user_id', $user->id)
                ->first();

            if (!$cart) {
                $cart = Cart::create([
                    'user_id' => $user->id,
                    'expires_at' => null,
                    'status' => 'active',
                ]);
            }

            return $cart;
        }

        // Get or create ACTIVE cart for guest session
        $sessionId = Session::getId();

        $cart = Cart::active()
            ->where('session_id', $sessionId)
            ->first();

        if (!$cart) {
            $cart = Cart::create([
                'session_id' => $sessionId,
                'expires_at' => null, // Never expire - keep for analytics
                'status' => 'active',
            ]);
        }

        return $cart;
    }
}
