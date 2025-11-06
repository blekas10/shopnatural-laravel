<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display a listing of user's orders
     *
     * This route is protected by auth middleware, so only authenticated users can access it
     */
    public function index(Request $request): Response
    {
        // Only show orders that belong to the authenticated user
        $orders = Order::query()
            ->where('user_id', auth()->id())
            ->with(['items.product.primaryImage', 'items.variant'])
            ->latest()
            ->paginate(15);

        return Inertia::render('orders/index', [
            'orders' => OrderResource::collection($orders->items())->resolve(),
            'pagination' => [
                'currentPage' => $orders->currentPage(),
                'lastPage' => $orders->lastPage(),
                'perPage' => $orders->perPage(),
                'total' => $orders->total(),
            ],
            'isGuest' => false,
        ]);
    }

    /**
     * Display the specified order
     *
     * This route is protected by auth middleware, so only authenticated users can access it
     */
    public function show(Request $request, string $orderNumber): Response
    {
        // Find order by order_number
        $order = Order::where('order_number', $orderNumber)
            ->with([
                'items.product.primaryImage',
                'items.variant',
                'payment'
            ])
            ->firstOrFail();

        // Simple authorization: check if user owns the order
        if ($order->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to order');
        }

        return Inertia::render('orders/show', [
            'order' => (new OrderResource($order))->resolve(),
        ]);
    }

    /**
     * Display order confirmation page after successful checkout
     *
     * This route is accessible to both authenticated and guest users.
     * For guests, the email is stored in session during checkout.
     */
    public function confirmation(Request $request, string $orderNumber): Response
    {
        // Find order by order_number
        $order = Order::where('order_number', $orderNumber)
            ->with([
                'items.product.primaryImage',
                'items.variant',
            ])
            ->firstOrFail();

        // Simple authorization: check if user owns the order OR guest email matches
        if (auth()->check()) {
            // Authenticated user - must own the order
            if ($order->user_id !== auth()->id()) {
                abort(403, 'Unauthorized access to order');
            }
        } else {
            // Guest user - check if session email matches order email
            $guestEmail = $request->session()->get('guest_order_email');
            if (!$guestEmail || $guestEmail !== $order->customer_email) {
                abort(403, 'Unauthorized access to order');
            }
        }

        return Inertia::render('order-confirmation', [
            'order' => [
                'id' => $order->id,
                'orderNumber' => $order->order_number,
                'status' => $order->status,
                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'quantity' => $item->quantity,
                        'product' => [
                            'name' => $item->product_name,
                            'image' => $item->product->primaryImage?->url ?? '/images/placeholder.png',
                            'price' => (float) $item->unit_price,
                        ],
                        'variant' => $item->variant_size ? [
                            'size' => $item->variant_size,
                            'price' => (float) $item->unit_price,
                        ] : null,
                    ];
                })->toArray(),
                'subtotal' => (float) $order->subtotal,
                'shipping' => (float) $order->shipping_cost,
                'tax' => (float) $order->tax,
                'discount' => (float) $order->discount,
                'total' => (float) $order->total,
                'contact' => [
                    'email' => $order->customer_email,
                    'phone' => $order->shipping_phone,
                ],
                'shippingAddress' => [
                    'fullName' => $order->getShippingFullName(),
                    'addressLine1' => $order->shipping_street_address,
                    'addressLine2' => $order->shipping_apartment,
                    'city' => $order->shipping_city,
                    'postalCode' => $order->shipping_postal_code,
                    'country' => $order->shipping_country,
                ],
                'billingAddress' => [
                    'fullName' => $order->getBillingFullName(),
                    'addressLine1' => $order->billing_street_address,
                    'addressLine2' => $order->billing_apartment,
                    'city' => $order->billing_city,
                    'postalCode' => $order->billing_postal_code,
                    'country' => $order->billing_country,
                ],
                'shippingMethod' => [
                    'name' => 'Standard Shipping', // You could store this in the order
                ],
                'paymentMethod' => [
                    'name' => 'Cash on Delivery', // You could store this in the order
                ],
                'estimatedDelivery' => null,
                'createdAt' => $order->created_at->toISOString(),
            ],
        ]);
    }
}
