<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    /**
     * Show the checkout page
     */
    public function index(): Response
    {
        // Get cart items from request (passed from frontend)
        // In a real app, you'd fetch from authenticated user's cart

        $shippingMethods = [
            [
                'id' => 'pickup',
                'name' => 'Pick Up',
                'description' => 'Pick up from our store',
                'price' => 0,
                'estimatedDays' => 'Available today',
            ],
            [
                'id' => 'standard',
                'name' => 'Standard Shipping',
                'description' => 'Free for orders over €50',
                'price' => 5.99,
                'estimatedDays' => '5-7 business days',
            ],
            [
                'id' => 'express',
                'name' => 'Express Shipping',
                'description' => '1-2 business days',
                'price' => 9.99,
                'estimatedDays' => '1-2 business days',
            ],
        ];

        $paymentMethods = [
            [
                'id' => 'cash',
                'name' => 'Cash on Delivery',
                'description' => 'Pay with cash when you receive your order',
            ],
            [
                'id' => 'card',
                'name' => 'Credit / Debit Card',
                'description' => 'Pay securely with your card',
            ],
        ];

        return Inertia::render('checkout', [
            'shippingMethods' => $shippingMethods,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    /**
     * Process the checkout and create an order
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'contact.fullName' => 'required|string',
            'contact.email' => 'required|email',
            'contact.phone' => 'nullable|string',
            'shippingAddress.addressLine1' => 'required|string',
            'shippingAddress.addressLine2' => 'nullable|string',
            'shippingAddress.city' => 'required|string',
            'shippingAddress.state' => 'nullable|string',
            'shippingAddress.postalCode' => 'required|string',
            'shippingAddress.country' => 'required|string',
            'billingSameAsShipping' => 'required|boolean',
            'billingAddress.addressLine1' => 'required_if:billingSameAsShipping,false|nullable|string',
            'billingAddress.addressLine2' => 'nullable|string',
            'billingAddress.city' => 'required_if:billingSameAsShipping,false|nullable|string',
            'billingAddress.state' => 'nullable|string',
            'billingAddress.postalCode' => 'required_if:billingSameAsShipping,false|nullable|string',
            'billingAddress.country' => 'required_if:billingSameAsShipping,false|nullable|string',
            'shippingMethod' => 'required|string',
            'venipakPickupPoint' => 'nullable|array',
            'venipakPickupPoint.id' => 'nullable|integer',
            'venipakPickupPoint.name' => 'nullable|string',
            'venipakPickupPoint.address' => 'nullable|string',
            'venipakPickupPoint.city' => 'nullable|string',
            'venipakPickupPoint.zip' => 'nullable|string',
            'paymentMethod' => 'required|string',
            'cardDetails' => 'nullable|array',
            'cardDetails.cardNumber' => 'required_if:paymentMethod,card|nullable|string',
            'cardDetails.expiryDate' => 'required_if:paymentMethod,card|nullable|string',
            'cardDetails.cvv' => 'required_if:paymentMethod,card|nullable|string',
            'cardDetails.cardholderName' => 'required_if:paymentMethod,card|nullable|string',
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|integer|exists:products,id',
            'items.*.variantId' => 'nullable|integer|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'shipping' => 'required|numeric|min:0',
            'tax' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'agreeToTerms' => 'required|accepted',
        ]);

        DB::beginTransaction();

        try {
            // Split contact full name into first and last name
            $contactName = explode(' ', $validated['contact']['fullName'], 2);
            $billingAddress = $validated['billingSameAsShipping']
                ? $validated['shippingAddress']
                : $validated['billingAddress'];

            // Create the order
            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(Str::random(10)),
                'user_id' => auth()->id(), // null for guests
                'status' => 'pending',
                'payment_status' => 'pending',
                'subtotal' => $validated['subtotal'],
                'tax' => $validated['tax'],
                'shipping_cost' => $validated['shipping'],
                'shipping_method' => $validated['shippingMethod'],
                'venipak_pickup_point' => $validated['venipakPickupPoint'] ?? null,
                'discount' => $validated['discount'],
                'total' => $validated['total'],
                'currency' => 'EUR',

                // Shipping address
                'shipping_first_name' => $contactName[0],
                'shipping_last_name' => $contactName[1] ?? '',
                'shipping_street_address' => $validated['shippingAddress']['addressLine1'],
                'shipping_apartment' => $validated['shippingAddress']['addressLine2'] ?? null,
                'shipping_city' => $validated['shippingAddress']['city'],
                'shipping_state' => $validated['shippingAddress']['state'] ?? null,
                'shipping_postal_code' => $validated['shippingAddress']['postalCode'],
                'shipping_country' => $validated['shippingAddress']['country'],
                'shipping_phone' => $validated['contact']['phone'] ?? null,

                // Billing address
                'billing_first_name' => $contactName[0],
                'billing_last_name' => $contactName[1] ?? '',
                'billing_street_address' => $billingAddress['addressLine1'],
                'billing_apartment' => $billingAddress['addressLine2'] ?? null,
                'billing_city' => $billingAddress['city'],
                'billing_state' => $billingAddress['state'] ?? null,
                'billing_postal_code' => $billingAddress['postalCode'],
                'billing_country' => $billingAddress['country'],
                'billing_phone' => $validated['contact']['phone'] ?? null,

                'customer_email' => $validated['contact']['email'],
            ]);

            // Create order items with historical product data
            foreach ($validated['items'] as $item) {
                // Fetch product and variant for historical data
                $product = Product::find($item['productId']);
                $variant = ProductVariant::find($item['variantId']);

                if (!$product || !$variant) {
                    throw new \Exception('Product or variant not found');
                }

                $unitPrice = $item['price'];
                $quantity = $item['quantity'];
                $subtotal = $unitPrice * $quantity;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['productId'],
                    'product_variant_id' => $item['variantId'],

                    // Store product details at time of order
                    'product_name' => $product->getTranslation('name', app()->getLocale()),
                    'product_sku' => $variant->sku,
                    'variant_size' => $variant->size . 'ml',

                    // Pricing
                    'unit_price' => $unitPrice,
                    'quantity' => $quantity,
                    'subtotal' => $subtotal,
                    'tax' => 0, // Calculate if needed
                    'total' => $subtotal,
                ]);
            }

            DB::commit();

            // Send order confirmation emails to customer and admin
            $order->sendOrderConfirmationEmails();

            // For guest orders, store the email in session to allow confirmation page access
            if (!auth()->check()) {
                $request->session()->put('guest_order_email', $validated['contact']['email']);
            }

            // Clear cart (will be handled by frontend)
            // Redirect to order confirmation page with locale
            $locale = app()->getLocale();
            return redirect()->route($locale . '.order.confirmation', ['orderNumber' => $order->order_number]);

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors([
                'error' => __('checkout.error', 'Failed to process order. Please try again.'),
            ]);
        }
    }
}
