<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
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
                'id' => 'stripe',
                'name' => 'Credit / Debit Card',
                'description' => 'Pay securely with Stripe',
            ],
            [
                'id' => 'paysera',
                'name' => 'Paysera',
                'description' => 'Pay with Paysera (Bank transfer, cards)',
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
            'contact.email' => 'required|email:rfc',
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
            'paymentMethod' => 'required|string|in:stripe,paysera',
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

            // Create the order with pending status (will be confirmed after payment)
            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(Str::random(10)),
                'user_id' => auth()->id(), // null for guests
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $validated['paymentMethod'],
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
                'shipping_phone' => $validated['contact']['phone'] ?? '',

                // Billing address
                'billing_first_name' => $contactName[0],
                'billing_last_name' => $contactName[1] ?? '',
                'billing_street_address' => $billingAddress['addressLine1'],
                'billing_apartment' => $billingAddress['addressLine2'] ?? null,
                'billing_city' => $billingAddress['city'],
                'billing_state' => $billingAddress['state'] ?? null,
                'billing_postal_code' => $billingAddress['postalCode'],
                'billing_country' => $billingAddress['country'],
                'billing_phone' => $validated['contact']['phone'] ?? '',

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

            // Mark cart as completed and link to order
            $this->completeCart($order);

            // For guest orders, store the email in session to allow confirmation page access
            if (!auth()->check()) {
                $request->session()->put('guest_order_email', $validated['contact']['email']);
            }

            $locale = app()->getLocale();
            $paymentMethod = $validated['paymentMethod'];

            // Handle payment based on selected method
            if ($paymentMethod === 'stripe') {
                // Create Stripe Checkout Session
                \Stripe\Stripe::setApiKey(config('stripe.secret'));

                $lineItems = $order->items->map(function ($item) {
                    return [
                        'price_data' => [
                            'currency' => config('stripe.currency'),
                            'product_data' => [
                                'name' => $item->product_name,
                                'description' => $item->variant_size,
                            ],
                            'unit_amount' => (int)($item->unit_price * 100), // Convert to cents
                        ],
                        'quantity' => $item->quantity,
                    ];
                })->toArray();

                // Add shipping as a line item if applicable
                if ($order->shipping_cost > 0) {
                    $lineItems[] = [
                        'price_data' => [
                            'currency' => config('stripe.currency'),
                            'product_data' => [
                                'name' => __('checkout.shipping'),
                                'description' => ucfirst(str_replace('_', ' ', $order->shipping_method)),
                            ],
                            'unit_amount' => (int)($order->shipping_cost * 100),
                        ],
                        'quantity' => 1,
                    ];
                }

                $session = \Stripe\Checkout\Session::create([
                    'line_items' => $lineItems,
                    'mode' => 'payment',
                    'success_url' => route($locale . '.order.confirmation', ['orderNumber' => $order->order_number]),
                    'cancel_url' => route($locale . '.checkout'),
                    'customer_email' => $order->customer_email,
                    'locale' => $locale, // Set Stripe interface language based on site locale
                    'metadata' => [
                        'order_number' => $order->order_number,
                        'order_id' => $order->id,
                    ],
                ]);

                // Store session ID for reference
                $order->update(['payment_intent_id' => $session->id]);

                // Redirect to Stripe Checkout (external redirect for Inertia)
                return \Inertia\Inertia::location($session->url);
            } elseif ($paymentMethod === 'paysera') {
                // Create Paysera payment request
                $payseraData = [
                    'projectid' => config('paysera.project_id'),
                    'sign_password' => config('paysera.sign_password'),
                    'orderid' => $order->order_number,
                    'amount' => (int)($order->total * 100), // Convert to cents
                    'currency' => config('paysera.currency'),
                    'country' => 'LT',
                    'accepturl' => route('paysera.accept'),
                    'cancelurl' => route('paysera.cancel'),
                    'callbackurl' => route('paysera.callback'),
                    'test' => config('paysera.test_mode') ? '1' : '0',
                    'p_email' => $order->customer_email,
                    'p_firstname' => $order->shipping_first_name,
                    'p_lastname' => $order->shipping_last_name,
                ];

                try {
                    // Build signed request data
                    $requestData = \WebToPay::buildRequest($payseraData);

                    // Get payment URL
                    $paymentUrl = \WebToPay::getPaymentUrl();

                    // Build full URL with query parameters
                    $fullUrl = $paymentUrl . '?' . http_build_query($requestData);

                    // Redirect to Paysera payment page
                    return \Inertia\Inertia::location($fullUrl);
                } catch (\WebToPayException $e) {
                    DB::rollBack();
                    \Log::error('Paysera payment creation failed: ' . $e->getMessage());

                    return back()->withErrors([
                        'error' => __('checkout.payment_error'),
                    ]);
                }
            }

        } catch (\Exception $e) {
            DB::rollBack();

            // Log the actual error for debugging
            \Log::error('Checkout failed: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors([
                'error' => __('checkout.error'),
            ]);
        }
    }

    /**
     * Mark cart as completed and link to order
     */
    protected function completeCart(Order $order): void
    {
        $user = auth()->user();

        if ($user) {
            // Find active cart for authenticated user
            $cart = Cart::active()
                ->where('user_id', $user->id)
                ->first();
        } else {
            // Find active cart for guest session
            $sessionId = Session::getId();
            $cart = Cart::active()
                ->where('session_id', $sessionId)
                ->first();
        }

        // Mark cart as completed if found
        if ($cart) {
            $cart->complete($order);
            \Log::info('Cart marked as completed', [
                'cart_id' => $cart->id,
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ]);
        }
    }
}
