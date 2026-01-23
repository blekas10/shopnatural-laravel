<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\PromoCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    /**
     * Show the checkout page
     */
    public function index(): Response
    {
        // Create or retrieve draft order for tracking
        $draftOrder = $this->getOrCreateDraftOrder();

        // For logged-in users, sync cart items to draft order
        if (auth()->check()) {
            $this->syncCartToDraftOrder($draftOrder);
        }

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
                'name' => __('payment.stripe_name'),
                'description' => __('payment.stripe_description'),
            ],
            [
                'id' => 'paysera',
                'name' => __('payment.paysera_name'),
                'description' => __('payment.paysera_description'),
            ],
        ];

        return Inertia::render('checkout', [
            'shippingMethods' => $shippingMethods,
            'paymentMethods' => $paymentMethods,
            'draftOrderId' => $draftOrder->id,
            'draftOrderNumber' => $draftOrder->order_number,
        ]);
    }

    /**
     * Get existing draft order or create a new one
     */
    protected function getOrCreateDraftOrder(): Order
    {
        $userId = auth()->id();
        $sessionId = Session::getId();

        // Try to find existing draft order for this user/session
        $draftOrder = Order::where('status', 'draft')
            ->where(function ($query) use ($userId, $sessionId) {
                if ($userId) {
                    $query->where('user_id', $userId);
                } else {
                    $query->where('session_id', $sessionId);
                }
            })
            ->first();

        if ($draftOrder) {
            Log::info('Checkout: Found existing draft order', [
                'order_id' => $draftOrder->id,
                'order_number' => $draftOrder->order_number,
            ]);
            return $draftOrder;
        }

        // Create new draft order with empty defaults for required address fields
        $draftOrder = Order::create([
            'order_number' => Order::generateOrderNumber(),
            'user_id' => $userId,
            'session_id' => $sessionId,
            'status' => 'draft',
            'payment_status' => 'pending',
            'locale' => app()->getLocale(),
            // Set defaults for required numeric fields
            'subtotal' => 0,
            'total' => 0,
            'currency' => 'EUR',
            // Set empty defaults for required address fields
            'shipping_first_name' => '',
            'shipping_last_name' => '',
            'shipping_street_address' => '',
            'shipping_city' => '',
            'shipping_postal_code' => '',
            'shipping_country' => '',
            'shipping_phone' => '',
            'billing_first_name' => '',
            'billing_last_name' => '',
            'billing_street_address' => '',
            'billing_city' => '',
            'billing_postal_code' => '',
            'billing_country' => '',
            'billing_phone' => '',
            'customer_email' => '',
        ]);

        Log::info('Checkout: Created new draft order', [
            'order_id' => $draftOrder->id,
            'order_number' => $draftOrder->order_number,
            'user_id' => $userId,
            'session_id' => $sessionId,
        ]);

        return $draftOrder;
    }

    /**
     * Sync cart items to draft order for logged-in users
     * This allows resuming abandoned checkouts
     */
    protected function syncCartToDraftOrder(Order $draftOrder): void
    {
        // Get active cart for this user
        $cart = Cart::where('user_id', auth()->id())
            ->where('status', 'active')
            ->with(['items.product.primaryImage', 'items.variant'])
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return;
        }

        // Clear existing draft order items (in case of re-sync)
        $draftOrder->items()->delete();

        // Copy cart items to order items
        foreach ($cart->items as $cartItem) {
            $product = $cartItem->product;
            $variant = $cartItem->variant;

            if (!$product || !$variant) {
                continue;
            }

            OrderItem::create([
                'order_id' => $draftOrder->id,
                'product_id' => $cartItem->product_id,
                'product_variant_id' => $cartItem->product_variant_id,
                'quantity' => $cartItem->quantity,
                'unit_price' => $cartItem->price,
                'product_name' => $product->getTranslation('name', app()->getLocale()),
                'product_sku' => $variant->sku ?? $product->sku,
                'variant_size' => $variant->size,
                // Calculate totals
                'subtotal' => $cartItem->price * $cartItem->quantity,
                'total' => $cartItem->price * $cartItem->quantity,
                'tax' => 0,
            ]);
        }

        // Update draft order totals
        $subtotal = $draftOrder->items()->sum('total');
        $draftOrder->update([
            'subtotal' => $subtotal,
            'total' => $subtotal, // Will be recalculated on checkout submit with shipping
        ]);

        Log::info('Checkout: Synced cart items to draft order', [
            'order_id' => $draftOrder->id,
            'items_count' => $cart->items->count(),
            'subtotal' => $subtotal,
        ]);
    }

    /**
     * Process the checkout and create an order
     */
    public function store(Request $request)
    {
        Log::info('Checkout: Starting checkout process', [
            'user_id' => auth()->id(),
            'session_id' => session()->getId(),
            'payment_method' => $request->input('paymentMethod'),
            'items_count' => count($request->input('items', [])),
        ]);

        $validated = $request->validate([
            'draftOrderId' => 'required|integer|exists:orders,id',
            'contact.fullName' => 'required|string',
            'contact.email' => 'required|email:strict,dns|max:255',
            'contact.phone' => 'nullable|string',
            'shippingAddress.addressLine1' => 'required|string',
            'shippingAddress.addressLine2' => 'nullable|string',
            'shippingAddress.city' => 'required|string',
            'shippingAddress.state' => 'nullable|string',
            'shippingAddress.postalCode' => 'required|string',
            'shippingAddress.country' => 'required|string|size:2', // ISO country code
            'billingSameAsShipping' => 'required|boolean',
            'billingAddress.addressLine1' => 'required_if:billingSameAsShipping,false|nullable|string',
            'billingAddress.addressLine2' => 'nullable|string',
            'billingAddress.city' => 'required_if:billingSameAsShipping,false|nullable|string',
            'billingAddress.state' => 'nullable|string',
            'billingAddress.postalCode' => 'required_if:billingSameAsShipping,false|nullable|string',
            'billingAddress.country' => 'required_if:billingSameAsShipping,false|nullable|string',
            'shippingMethod' => 'required|string|in:venipak-courier,venipak-pickup,fedex-courier',
            'venipakPickupPoint' => 'nullable|array',
            'venipakPickupPoint.id' => 'nullable|integer',
            'venipakPickupPoint.code' => 'nullable|string',
            'venipakPickupPoint.name' => 'nullable|string',
            'venipakPickupPoint.address' => 'nullable|string',
            'venipakPickupPoint.city' => 'nullable|string',
            'venipakPickupPoint.zip' => 'nullable|string',
            'venipakPickupPoint.country' => 'nullable|string',
            'paymentMethod' => 'required|string|in:stripe,paysera',
            // SECURITY: Only accept item IDs and quantities - prices calculated server-side
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|integer|exists:products,id',
            'items.*.variantId' => 'required|integer|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1|max:100',
            'promoCode' => 'nullable|string|max:50',
            'agreeToTerms' => 'required|accepted',
        ]);

        // SECURITY: Calculate ALL prices server-side - never trust client prices
        $calculatedPricing = $this->calculateOrderPricing(
            $validated['items'],
            $validated['shippingAddress']['country'],
            $validated['shippingMethod'],
            $validated['promoCode'] ?? null,
            $validated['contact']['email']
        );

        if (isset($calculatedPricing['error'])) {
            return back()->withErrors(['error' => $calculatedPricing['error']]);
        }

        // Promo code is already validated in calculateOrderPricing
        $promoCode = $calculatedPricing['promoCode'];

        Log::info('Checkout: Server-side pricing calculated', [
            'customer_email' => $validated['contact']['email'],
            'shipping_method' => $validated['shippingMethod'],
            'subtotal' => $calculatedPricing['subtotal'],
            'shipping_cost' => $calculatedPricing['shippingCost'],
            'promo_discount' => $calculatedPricing['promoCodeDiscount'],
            'total' => $calculatedPricing['total'],
        ]);

        DB::beginTransaction();

        try {
            // Find the draft order
            $order = Order::where('id', $validated['draftOrderId'])
                ->where('status', 'draft')
                ->first();

            if (!$order) {
                return back()->withErrors([
                    'error' => __('checkout.invalid_order'),
                ]);
            }

            // Split contact full name into first and last name
            $contactName = explode(' ', $validated['contact']['fullName'], 2);
            $billingAddress = $validated['billingSameAsShipping']
                ? $validated['shippingAddress']
                : $validated['billingAddress'];

            // Update the draft order to pending status with all details
            // SECURITY: ALL prices are server-calculated, never from client
            $order->update([
                'user_id' => auth()->id(), // null for guests
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $validated['paymentMethod'],
                // Price breakdown - ALL from server calculations
                'original_subtotal' => $calculatedPricing['originalSubtotal'],
                'product_discount' => $calculatedPricing['productDiscount'],
                'subtotal' => $calculatedPricing['subtotal'],
                'subtotal_excl_vat' => $calculatedPricing['subtotalExclVat'],
                'vat_amount' => $calculatedPricing['vatAmount'],
                'shipping_cost' => $calculatedPricing['shippingCost'],
                'shipping_method' => $validated['shippingMethod'],
                'venipak_pickup_point' => $validated['venipakPickupPoint'] ?? null,
                'discount' => $calculatedPricing['promoCodeDiscount'],
                'promo_code_id' => $promoCode?->id,
                'promo_code_value' => $promoCode ? $promoCode->getFormattedValue() : null,
                'total' => $calculatedPricing['total'],
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
                'locale' => app()->getLocale(),
            ]);

            Log::info('Checkout: Draft order updated to pending', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'customer_email' => $order->customer_email,
                'total' => $order->total,
            ]);

            // Delete any existing order items (in case of re-submission)
            $order->items()->delete();

            // Create order items with SERVER-CALCULATED prices
            foreach ($calculatedPricing['items'] as $calculatedItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $calculatedItem['productId'],
                    'product_variant_id' => $calculatedItem['variantId'],

                    // Store product details at time of order
                    'product_name' => $calculatedItem['productName'],
                    'product_sku' => $calculatedItem['sku'],
                    'variant_size' => $calculatedItem['size'],

                    // Pricing - ALL from server calculations
                    'original_unit_price' => $calculatedItem['originalPrice'] > $calculatedItem['price']
                        ? $calculatedItem['originalPrice']
                        : null,
                    'unit_price' => $calculatedItem['price'],
                    'quantity' => $calculatedItem['quantity'],
                    'subtotal' => $calculatedItem['subtotal'],
                    'tax' => 0,
                    'total' => $calculatedItem['subtotal'],
                ]);

                Log::debug('Checkout: Order item created with server-calculated price', [
                    'order_id' => $order->id,
                    'product_id' => $calculatedItem['productId'],
                    'variant_id' => $calculatedItem['variantId'],
                    'quantity' => $calculatedItem['quantity'],
                    'unit_price' => $calculatedItem['price'],
                ]);
            }

            // Apply promo code usage tracking
            if ($promoCode) {
                $promoCodeService = app(PromoCodeService::class);
                $promoCodeService->applyToOrder($order, $promoCode, $calculatedPricing['promoCodeDiscount']);
                Log::info('Checkout: Promo code applied', [
                    'order_id' => $order->id,
                    'promo_code' => $promoCode->code,
                    'discount_amount' => $calculatedPricing['promoCodeDiscount'],
                ]);
            }

            Log::info('Checkout: All order items created, committing transaction', [
                'order_id' => $order->id,
                'items_count' => count($calculatedPricing['items']),
            ]);

            DB::commit();

            Log::info('Checkout: Transaction committed successfully', [
                'order_id' => $order->id,
            ]);

            // Mark cart as completed and link to order
            $this->completeCart($order);

            
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

                // Prepare session params
                $sessionParams = [
                    'line_items' => $lineItems,
                    'mode' => 'payment',
                    'success_url' => route($locale . '.order.confirmation', ['orderNumber' => $order->id]),
                    'cancel_url' => route($locale . '.checkout'),
                    'customer_email' => $order->customer_email,
                    'locale' => $locale,
                    'metadata' => [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                    ],
                ];

                // Apply promo code discount if present
                if ($promoCode && $validated['promoCodeDiscount'] > 0) {
                    // Create a one-time Stripe coupon for this order
                    $coupon = \Stripe\Coupon::create([
                        'amount_off' => (int)($validated['promoCodeDiscount'] * 100),
                        'currency' => config('stripe.currency'),
                        'duration' => 'once',
                        'name' => $promoCode->code,
                        'max_redemptions' => 1,
                    ]);

                    $sessionParams['discounts'] = [
                        ['coupon' => $coupon->id],
                    ];

                    Log::info('Checkout: Stripe coupon created for promo code', [
                        'order_id' => $order->id,
                        'promo_code' => $promoCode->code,
                        'coupon_id' => $coupon->id,
                        'discount_amount' => $validated['promoCodeDiscount'],
                    ]);
                }

                $session = \Stripe\Checkout\Session::create($sessionParams);

                // Store session ID for reference
                $order->update(['payment_intent_id' => $session->id]);

                Log::info('Checkout: Stripe session created, redirecting to payment', [
                    'order_id' => $order->id,
                    'stripe_session_id' => $session->id,
                ]);

                // Redirect to Stripe Checkout (external redirect for Inertia)
                return \Inertia\Inertia::location($session->url);
            } elseif ($paymentMethod === 'paysera') {
                // Get base URL dynamically from the current request
                $baseUrl = $request->getSchemeAndHttpHost();

                // Create Paysera payment request
                $payseraData = [
                    'projectid' => config('paysera.project_id'),
                    'sign_password' => config('paysera.sign_password'),
                    'orderid' => $order->order_number,
                    'amount' => (int)($order->total * 100), // Convert to cents
                    'currency' => config('paysera.currency'),
                    'country' => 'LT',
                    'accepturl' => $baseUrl . '/paysera/accept',
                    'cancelurl' => $baseUrl . '/paysera/cancel',
                    'callbackurl' => $baseUrl . '/paysera/callback',
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

                    Log::info('Checkout: Paysera request created, redirecting to payment', [
                        'order_id' => $order->id,
                    ]);

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
     * Calculate all order pricing server-side
     * SECURITY: This is critical - never trust client-provided prices
     */
    protected function calculateOrderPricing(
        array $items,
        string $countryCode,
        string $shippingMethod,
        ?string $promoCodeString,
        string $customerEmail
    ): array {
        // Shipping pricing by region
        $balticCountries = ['LT', 'LV', 'EE'];
        $internationalCountries = ['PL', 'FI'];
        $euCountries = [
            'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'FR', 'DE', 'GR',
            'HU', 'IE', 'IT', 'LU', 'MT', 'NL', 'PT', 'RO', 'SK', 'SI',
            'ES', 'SE', 'GB', 'NO', 'CH'
        ];
        $northAmericaCountries = ['US', 'CA'];
        $freeShippingThreshold = 50; // €50 for Lithuania

        $calculatedItems = [];
        $originalSubtotal = 0;
        $subtotal = 0;

        // Calculate item prices from database
        foreach ($items as $item) {
            $product = Product::with('primaryImage')->find($item['productId']);
            $variant = ProductVariant::find($item['variantId']);

            if (!$product || !$variant) {
                return ['error' => __('checkout.product_not_found')];
            }

            // Verify variant belongs to product
            if ($variant->product_id !== $product->id) {
                Log::warning('Checkout: Variant/product mismatch attempt', [
                    'product_id' => $item['productId'],
                    'variant_id' => $item['variantId'],
                ]);
                return ['error' => __('checkout.invalid_product')];
            }

            // Get prices from DATABASE - never from client
            $originalPrice = (float) $variant->price;
            $currentPrice = $variant->sale_price && $variant->sale_price < $variant->price
                ? (float) $variant->sale_price
                : $originalPrice;

            $quantity = (int) $item['quantity'];
            $itemOriginalSubtotal = $originalPrice * $quantity;
            $itemSubtotal = $currentPrice * $quantity;

            $originalSubtotal += $itemOriginalSubtotal;
            $subtotal += $itemSubtotal;

            $calculatedItems[] = [
                'productId' => $product->id,
                'variantId' => $variant->id,
                'productName' => $product->getTranslation('name', app()->getLocale()),
                'sku' => $variant->sku,
                'size' => $variant->size,
                'originalPrice' => $originalPrice,
                'price' => $currentPrice,
                'quantity' => $quantity,
                'subtotal' => $itemSubtotal,
            ];
        }

        $productDiscount = $originalSubtotal - $subtotal;

        // Calculate shipping cost server-side
        $isLithuania = $countryCode === 'LT';
        $isBaltic = in_array($countryCode, $balticCountries);
        $isInternational = in_array($countryCode, $internationalCountries);
        $isEU = in_array($countryCode, $euCountries);
        $isNorthAmerica = in_array($countryCode, $northAmericaCountries);

        // Validate shipping method is valid for the country
        if (($isBaltic || $isInternational) && !in_array($shippingMethod, ['venipak-courier', 'venipak-pickup'])) {
            if ($isBaltic && $shippingMethod !== 'venipak-pickup') {
                // Allow venipak-courier for Baltic
            } elseif ($isInternational && $shippingMethod !== 'venipak-courier') {
                return ['error' => __('checkout.invalid_shipping_method')];
            }
        }
        if (($isEU || $isNorthAmerica) && $shippingMethod !== 'fedex-courier') {
            return ['error' => __('checkout.invalid_shipping_method')];
        }

        // Calculate shipping cost
        $shippingCost = 0;
        if ($isBaltic) {
            // Lithuania gets free shipping for orders over €50
            $hasFreeShipping = $isLithuania && $subtotal >= $freeShippingThreshold;
            $shippingCost = $hasFreeShipping ? 0 : 4;
        } elseif ($isInternational) {
            $shippingCost = 4;
        } elseif ($isEU || $isNorthAmerica) {
            $shippingCost = 20;
        } else {
            return ['error' => __('checkout.shipping_not_available')];
        }

        // Validate and calculate promo code discount server-side
        $promoCode = null;
        $promoCodeDiscount = 0;

        if (!empty($promoCodeString)) {
            $promoCodeService = app(PromoCodeService::class);
            $promoCode = $promoCodeService->validate(
                $promoCodeString,
                $subtotal,
                auth()->id(),
                $customerEmail
            );

            if (!$promoCode) {
                return ['error' => $promoCodeService->getError() ?? __('promo_code.invalid')];
            }

            // Calculate discount server-side
            $promoCodeDiscount = $promoCodeService->calculateDiscount($promoCode, $subtotal);
        }

        // Calculate VAT (Lithuania: 21% included in price)
        $subtotalAfterPromo = $subtotal - $promoCodeDiscount;
        $subtotalExclVat = round($subtotalAfterPromo / 1.21, 2);
        $vatAmount = round($subtotalAfterPromo - $subtotalExclVat, 2);

        // Calculate final total
        $total = $subtotal + $shippingCost - $promoCodeDiscount;

        Log::info('Checkout: Server-side price calculation complete', [
            'items_count' => count($calculatedItems),
            'original_subtotal' => $originalSubtotal,
            'product_discount' => $productDiscount,
            'subtotal' => $subtotal,
            'shipping_cost' => $shippingCost,
            'promo_discount' => $promoCodeDiscount,
            'total' => $total,
        ]);

        return [
            'items' => $calculatedItems,
            'originalSubtotal' => $originalSubtotal,
            'productDiscount' => $productDiscount,
            'subtotal' => $subtotal,
            'subtotalExclVat' => $subtotalExclVat,
            'vatAmount' => $vatAmount,
            'shippingCost' => $shippingCost,
            'promoCode' => $promoCode,
            'promoCodeDiscount' => $promoCodeDiscount,
            'total' => $total,
        ];
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
