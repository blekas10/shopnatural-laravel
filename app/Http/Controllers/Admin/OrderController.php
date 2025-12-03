<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of orders
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by payment status
        if ($request->filled('payment_status') && $request->payment_status !== 'all') {
            $query->where('payment_status', $request->payment_status);
        }

        // Search by order number or customer email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%")
                  ->orWhere('shipping_first_name', 'like', "%{$search}%")
                  ->orWhere('shipping_last_name', 'like', "%{$search}%");
            });
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $orders = $query->paginate(20)->through(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_email' => $order->customer_email,
                'customer_name' => $order->getShippingFullName(),
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'total' => $order->total,
                'currency' => $order->currency,
                'items_count' => $order->items->count(),
                'created_at' => $order->created_at->format('Y-m-d H:i'),
                'shipping_method' => $order->shipping_method,
            ];
        });

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => [
                'status' => $request->status,
                'payment_status' => $request->payment_status,
                'search' => $request->search,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
            'statuses' => [
                'pending' => __('orders.status.pending'),
                'confirmed' => __('orders.status.confirmed'),
                'processing' => __('orders.status.processing'),
                'shipped' => __('orders.status.shipped'),
                'completed' => __('orders.status.completed'),
                'cancelled' => __('orders.status.cancelled'),
            ],
            'paymentStatuses' => [
                'pending' => __('orders.payment.pending'),
                'paid' => __('orders.payment.paid'),
                'failed' => __('orders.payment.failed'),
                'refunded' => __('orders.payment.refunded'),
            ],
        ]);
    }

    /**
     * Display the specified order
     */
    public function show(Order $order)
    {
        $order->load(['items.product', 'items.variant', 'user', 'promoCode']);

        return Inertia::render('admin/orders/show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'payment_status' => $order->payment_status,

                // Customer info
                'customer_email' => $order->customer_email,
                'customer_notes' => $order->customer_notes,

                // Shipping address
                'shipping_first_name' => $order->shipping_first_name,
                'shipping_last_name' => $order->shipping_last_name,
                'shipping_company' => $order->shipping_company,
                'shipping_street_address' => $order->shipping_street_address,
                'shipping_apartment' => $order->shipping_apartment,
                'shipping_city' => $order->shipping_city,
                'shipping_state' => $order->shipping_state,
                'shipping_postal_code' => $order->shipping_postal_code,
                'shipping_country' => $order->shipping_country,
                'shipping_phone' => $order->shipping_phone,

                // Billing address
                'billing_first_name' => $order->billing_first_name,
                'billing_last_name' => $order->billing_last_name,
                'billing_company' => $order->billing_company,
                'billing_street_address' => $order->billing_street_address,
                'billing_apartment' => $order->billing_apartment,
                'billing_city' => $order->billing_city,
                'billing_state' => $order->billing_state,
                'billing_postal_code' => $order->billing_postal_code,
                'billing_country' => $order->billing_country,
                'billing_phone' => $order->billing_phone,

                // Shipping details
                'shipping_method' => $order->shipping_method,
                'venipak_pickup_point' => $order->venipak_pickup_point,
                'tracking_number' => $order->tracking_number,

                // Price breakdown
                'original_subtotal' => $order->original_subtotal ?? $order->subtotal,
                'product_discount' => $order->product_discount ?? '0.00',
                'subtotal' => $order->subtotal,
                'subtotal_excl_vat' => $order->subtotal_excl_vat ?? number_format((float) $order->subtotal / 1.21, 2, '.', ''),
                'vat_amount' => $order->vat_amount ?? number_format((float) $order->subtotal - ((float) $order->subtotal / 1.21), 2, '.', ''),
                'shipping_cost' => $order->shipping_cost,
                'promo_code' => $order->promoCode ? [
                    'code' => $order->promoCode->code,
                ] : null,
                'promo_code_value' => $order->promo_code_value,
                'discount' => $order->discount,
                'total' => $order->total,
                'currency' => $order->currency,

                // Dates
                'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $order->updated_at->format('Y-m-d H:i:s'),
                'shipped_at' => $order->shipped_at?->format('Y-m-d H:i:s'),
                'delivered_at' => $order->delivered_at?->format('Y-m-d H:i:s'),

                // Items
                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_name' => $item->product_name,
                        'product_sku' => $item->product_sku,
                        'variant_size' => $item->variant_size,
                        'unit_price' => $item->unit_price,
                        'quantity' => $item->quantity,
                        'subtotal' => $item->subtotal,
                        'tax' => $item->tax,
                        'total' => $item->total,
                        'product_id' => $item->product_id,
                        'product_slug' => $item->product?->slug,
                    ];
                }),
            ],
            'statuses' => [
                'pending' => __('orders.status.pending'),
                'confirmed' => __('orders.status.confirmed'),
                'processing' => __('orders.status.processing'),
                'shipped' => __('orders.status.shipped'),
                'completed' => __('orders.status.completed'),
                'cancelled' => __('orders.status.cancelled'),
            ],
            'paymentStatuses' => [
                'pending' => __('orders.payment.pending'),
                'paid' => __('orders.payment.paid'),
                'failed' => __('orders.payment.failed'),
                'refunded' => __('orders.payment.refunded'),
            ],
        ]);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:confirmed,processing,shipped,completed,cancelled',
            'tracking_number' => 'nullable|string|max:255',
        ]);

        $oldStatus = $order->status;

        $order->update([
            'status' => $validated['status'],
        ]);

        // Update tracking number if provided and status is shipped
        if ($validated['status'] === 'shipped') {
            $order->update([
                'tracking_number' => $validated['tracking_number'] ?? null,
                'shipped_at' => now(),
            ]);
        }

        // Update completed timestamp
        if ($validated['status'] === 'completed') {
            $order->update([
                'delivered_at' => now(),
            ]);
        }

        return redirect()->back()->with('success', __('order.status_updated'));
    }

    /**
     * Update payment status
     */
    public function updatePaymentStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:pending,paid,failed,refunded',
        ]);

        $order->update([
            'payment_status' => $validated['payment_status'],
        ]);

        return redirect()->back()->with('success', __('order.payment_status_updated'));
    }

    /**
     * Download invoice PDF
     */
    public function downloadInvoice(Order $order)
    {
        $order->load(['items.product', 'items.variant', 'promoCode']);

        // Use current locale (from URL prefix)
        $locale = app()->getLocale();

        $pdf = Pdf::loadView('emails.invoice-pdf', [
            'order' => $order,
            'locale' => $locale,
        ]);

        $filename = 'invoice-' . $order->order_number . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * View invoice in browser
     */
    public function viewInvoice(Order $order)
    {
        $order->load(['items.product', 'items.variant', 'promoCode']);

        // Use current locale (from URL prefix)
        $locale = app()->getLocale();

        $pdf = Pdf::loadView('emails.invoice-pdf', [
            'order' => $order,
            'locale' => $locale,
        ]);

        return $pdf->stream('invoice-' . $order->order_number . '.pdf');
    }
}
