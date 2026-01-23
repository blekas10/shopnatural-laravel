<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\CreateVenipakShipment;
use App\Models\Order;
use App\Services\VenipakShipmentService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of orders
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items'])
            ->where('status', '!=', 'draft')
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
                'customer_phone' => $order->shipping_phone ?: $order->billing_phone,
                'customer_notes' => $order->customer_notes,

                // Shipping address
                'shipping_first_name' => $order->shipping_first_name,
                'shipping_last_name' => $order->shipping_last_name,
                'shipping_company' => $order->shipping_company,
                'shipping_address' => trim(($order->shipping_street_address ?: '') . ($order->shipping_apartment ? ', ' . $order->shipping_apartment : '')),
                'shipping_city' => $order->shipping_city,
                'shipping_state' => $order->shipping_state,
                'shipping_postal_code' => $order->shipping_postal_code,
                'shipping_country' => $order->shipping_country,

                // Billing address
                'billing_first_name' => $order->billing_first_name,
                'billing_last_name' => $order->billing_last_name,
                'billing_company' => $order->billing_company,
                'billing_address' => trim(($order->billing_street_address ?: '') . ($order->billing_apartment ? ', ' . $order->billing_apartment : '')),
                'billing_city' => $order->billing_city,
                'billing_state' => $order->billing_state,
                'billing_postal_code' => $order->billing_postal_code,
                'billing_country' => $order->billing_country,

                // Shipping details
                'shipping_method' => $order->shipping_method,
                'venipak_pickup_point' => $order->venipak_pickup_point,
                'tracking_number' => $order->tracking_number,

                // Venipak shipment info
                'venipak_pack_no' => $order->venipak_pack_no,
                'venipak_manifest_id' => $order->venipak_manifest_id,
                'venipak_label_path' => $order->venipak_label_path,
                'venipak_shipment_created_at' => $order->venipak_shipment_created_at?->format('Y-m-d H:i:s'),
                'venipak_error' => $order->venipak_error,
                'venipak_tracking_url' => $order->venipak_pack_no
                    ? 'https://go.venipak.lt/ws/tracking.php?type=1&output=html&code=' . $order->venipak_pack_no
                    : null,
                'venipak_status' => $order->venipak_status,
                'venipak_status_updated_at' => $order->venipak_status_updated_at?->format('Y-m-d H:i:s'),
                'venipak_delivered_at' => $order->venipak_delivered_at?->format('Y-m-d H:i:s'),
                // Secondary carrier info (for global shipments)
                'venipak_carrier_code' => $order->venipak_carrier_code,
                'venipak_carrier_tracking' => $order->venipak_carrier_tracking,
                'venipak_shipment_id' => $order->venipak_shipment_id,

                // Price breakdown
                'original_subtotal' => $order->original_subtotal ?? $order->subtotal,
                'product_discount' => $order->product_discount ?? '0.00',
                'subtotal' => $order->subtotal,
                'vat_amount' => $order->vat_amount ?? number_format((float) $order->subtotal * 0.21, 2, '.', ''),
                'subtotal_excl_vat' => $order->subtotal_excl_vat ?? number_format((float) $order->subtotal - ((float) $order->subtotal * 0.21), 2, '.', ''),
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
                        'original_unit_price' => $item->original_unit_price,
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
    public function downloadInvoice(Order $order, ?string $lang = null)
    {
        $order->load(['items.product', 'items.variant', 'promoCode']);

        // Use specified locale or fall back to current locale
        $locale = in_array($lang, ['en', 'lt']) ? $lang : app()->getLocale();

        $pdf = Pdf::loadView('emails.invoice-pdf', [
            'order' => $order,
            'locale' => $locale,
        ]);

        $filename = 'invoice-' . ($order->invoice_number ?? $order->order_number) . ($lang ? "-{$lang}" : '') . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * View invoice in browser
     */
    public function viewInvoice(Order $order, ?string $lang = null)
    {
        $order->load(['items.product', 'items.variant', 'promoCode']);

        // Use specified locale or fall back to current locale
        $locale = in_array($lang, ['en', 'lt']) ? $lang : app()->getLocale();

        $pdf = Pdf::loadView('emails.invoice-pdf', [
            'order' => $order,
            'locale' => $locale,
        ]);

        return $pdf->stream('invoice-' . ($order->invoice_number ?? $order->order_number) . '.pdf');
    }

    /**
     * Create Venipak shipment manually
     */
    public function createVenipakShipment(Order $order, VenipakShipmentService $venipakService)
    {
        // Check if Venipak is properly configured
        if (!$venipakService->isConfigured()) {
            return redirect()->back()->with('error', __('order.venipak_not_configured'));
        }

        // Check if shipment already exists
        if ($order->venipak_pack_no) {
            return redirect()->back()->with('error', __('order.venipak_shipment_exists'));
        }

        // Check if country is supported
        if (!$venipakService->isCountrySupported($order->shipping_country)) {
            return redirect()->back()->with('error', __('order.venipak_country_not_supported'));
        }

        // Clear any previous error
        $order->update(['venipak_error' => null]);

        // Dispatch job to create shipment - catch exception for sync queue
        try {
            CreateVenipakShipment::dispatch($order);
        } catch (\Throwable $e) {
            // Job failed - error is already saved on order, just redirect back
            $order->refresh();
            return redirect()->back();
        }

        // Check if shipment was created successfully (for sync queue)
        $order->refresh();
        if ($order->venipak_pack_no) {
            return redirect()->back()->with('success', __('order.venipak_shipment_created'));
        }

        // If error occurred (saved by job), just redirect - error shows in UI
        if ($order->venipak_error) {
            return redirect()->back();
        }

        return redirect()->back()->with('success', __('order.venipak_shipment_queued'));
    }

    /**
     * Retry failed Venipak shipment
     */
    public function retryVenipakShipment(Order $order, VenipakShipmentService $venipakService)
    {
        // Check if shipment already exists
        if ($order->venipak_pack_no) {
            return redirect()->back()->with('error', __('order.venipak_shipment_exists'));
        }

        // Clear any previous error
        $order->update(['venipak_error' => null]);

        // Dispatch job to create shipment - catch exception for sync queue
        try {
            CreateVenipakShipment::dispatch($order);
        } catch (\Throwable $e) {
            // Job failed - error is already saved on order, just redirect back
            $order->refresh();
            return redirect()->back();
        }

        // Check if shipment was created successfully (for sync queue)
        $order->refresh();
        if ($order->venipak_pack_no) {
            return redirect()->back()->with('success', __('order.venipak_shipment_created'));
        }

        // If error occurred (saved by job), just redirect - error shows in UI
        if ($order->venipak_error) {
            return redirect()->back();
        }

        return redirect()->back()->with('success', __('order.venipak_shipment_retry_queued'));
    }

    /**
     * Download Venipak shipping label
     * Always fetches fresh label to ensure all carrier labels are included
     */
    public function downloadVenipakLabel(Order $order, VenipakShipmentService $venipakService)
    {
        if (!$order->venipak_pack_no) {
            return redirect()->back()->with('error', __('order.venipak_no_shipment'));
        }

        // Always fetch fresh label to ensure we get all carrier labels (Venipak + GLS/TNT for international)
        $labelPath = $venipakService->getAndStoreLabel($order->venipak_pack_no, $order);

        if (!$labelPath) {
            return redirect()->back()->with('error', __('order.venipak_label_not_available'));
        }

        $order->update(['venipak_label_path' => $labelPath]);

        // Download the label
        if (Storage::disk('local')->exists($labelPath)) {
            return Storage::disk('local')->download(
                $labelPath,
                'venipak-label-' . $order->order_number . '.pdf'
            );
        }

        return redirect()->back()->with('error', __('order.venipak_label_not_found'));
    }

    /**
     * Refresh Venipak tracking status
     */
    public function refreshVenipakTracking(Order $order, VenipakShipmentService $venipakService)
    {
        if (!$order->venipak_pack_no) {
            return redirect()->back()->with('error', __('order.venipak_no_shipment'));
        }

        $result = $venipakService->updateOrderTracking($order);

        if ($result) {
            return redirect()->back()->with('success', __('order.venipak_tracking_updated'));
        }

        return redirect()->back()->with('error', __('order.venipak_tracking_failed'));
    }
}
