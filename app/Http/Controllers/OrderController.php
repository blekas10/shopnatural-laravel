<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
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
            ->with(['items.product.primaryImage', 'items.variant.image'])
            ->latest()
            ->paginate(15);

        return Inertia::render('orders/index', [
            'orders' => OrderResource::collection(collect($orders->items())),
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
                'items.variant.image',
                'payment',
                'promoCode',
            ])
            ->firstOrFail();

        // Simple authorization: check if user owns the order
        if ($order->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to order');
        }

        return Inertia::render('orders/show', [
            'order' => new OrderResource($order),
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
                'items.variant.image',
                'promoCode',
            ])
            ->firstOrFail();

        // Authorization: authenticated users must own the order
        // Guest orders (user_id = null) are accessible by anyone with the order number
        if (auth()->check() && $order->user_id !== null && $order->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to order');
        }

        // Calculate VAT values with fallbacks for old orders
        $subtotal = (float) $order->subtotal;
        $subtotalExclVat = $order->subtotal_excl_vat ?? ($subtotal / 1.21);
        $vatAmount = $order->vat_amount ?? ($subtotal - $subtotalExclVat);

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
                            'image' => $item->variant?->image?->url,
                        ] : null,
                    ];
                })->toArray(),
                // Price breakdown
                'originalSubtotal' => (float) ($order->original_subtotal ?? $order->subtotal),
                'productDiscount' => (float) ($order->product_discount ?? 0),
                'subtotal' => $subtotal,
                'subtotalExclVat' => (float) $subtotalExclVat,
                'vatAmount' => (float) $vatAmount,
                'shipping' => (float) $order->shipping_cost,
                'promoCode' => $order->promoCode ? [
                    'code' => $order->promoCode->code,
                    'value' => $order->promo_code_value,
                ] : null,
                'promoCodeDiscount' => (float) ($order->discount ?? 0),
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
                    'name' => $this->getShippingMethodName($order->shipping_method),
                ],
                'paymentMethod' => [
                    'name' => $this->getPaymentMethodName($order->payment_method),
                ],
                'estimatedDelivery' => null,
                'createdAt' => $order->created_at->toISOString(),
            ],
        ]);
    }

    /**
     * Download invoice PDF
     *
     * Accessible to:
     * - Authenticated users who own the order
     * - Guests from the order confirmation page (session email matches)
     */
    public function downloadInvoice(Request $request, string $orderNumber)
    {
        // Find order by order_number
        $order = Order::where('order_number', $orderNumber)
            ->with(['items.product.primaryImage', 'items.variant.image', 'promoCode'])
            ->firstOrFail();

        // Authorization: authenticated users must own the order
        // Guest orders (user_id = null) are accessible by anyone with the order number
        if (auth()->check() && $order->user_id !== null && $order->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to order');
        }

        // Generate PDF using the same template as admin
        // Use the order's stored locale for consistent language
        $pdf = Pdf::loadView('emails.invoice-pdf', [
            'order' => $order,
            'locale' => $order->locale ?? app()->getLocale(),
        ]);

        $filename = 'invoice-' . $order->order_number . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * View invoice in browser
     */
    public function viewInvoice(Request $request, string $orderNumber)
    {
        // Find order by order_number
        $order = Order::where('order_number', $orderNumber)
            ->with(['items.product.primaryImage', 'items.variant.image', 'promoCode'])
            ->firstOrFail();

        // Authorization: check if user owns the order
        if ($order->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to order');
        }

        // Generate PDF using the same template as admin
        $pdf = Pdf::loadView('emails.invoice-pdf', [
            'order' => $order,
            'locale' => app()->getLocale(),
        ]);

        return $pdf->stream('invoice-' . $order->order_number . '.pdf');
    }

    /**
     * Get formatted payment method name
     */
    private function getPaymentMethodName(?string $paymentMethod): string
    {
        return match($paymentMethod) {
            'stripe' => __('Stripe (Credit/Debit Card)'),
            'paysera' => __('Paysera'),
            default => __('N/A'),
        };
    }

    /**
     * Get formatted shipping method name
     */
    private function getShippingMethodName(?string $shippingMethod): string
    {
        return match($shippingMethod) {
            'pickup' => __('Pick Up'),
            'standard' => __('Standard Shipping'),
            'express' => __('Express Shipping'),
            'venipak_courier' => __('Venipak Courier'),
            'venipak_pickup' => __('Venipak Pickup Location'),
            'courier' => __('Courier Shipping'),
            default => __('N/A'),
        };
    }
}
