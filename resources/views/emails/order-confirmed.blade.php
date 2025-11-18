<!DOCTYPE html>
<html lang="{{ $locale }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $locale === 'lt' ? 'Užsakymas patvirtintas' : 'Order Confirmed' }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
            line-height: 1.6;
        }

        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header {
            background: linear-gradient(135deg, #C2A363 0%, #B89654 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }

        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
            letter-spacing: 1px;
        }

        .header-subtitle {
            font-size: 14px;
            opacity: 0.95;
        }

        .success-icon {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 50%;
            margin: 20px auto 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
        }

        .content {
            padding: 40px 30px;
        }

        .title {
            font-size: 24px;
            color: #333;
            margin-bottom: 15px;
            font-weight: 600;
        }

        .message {
            color: #666;
            font-size: 16px;
            margin-bottom: 30px;
            line-height: 1.8;
        }

        .order-summary {
            background: #f8f8f8;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
            border-left: 4px solid #C2A363;
        }

        .order-summary-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 15px;
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }

        .detail-row:last-child {
            border-bottom: none;
        }

        .detail-label {
            color: #666;
            font-weight: 500;
        }

        .detail-value {
            color: #333;
            font-weight: 600;
        }

        .items-table {
            width: 100%;
            margin: 20px 0;
            border-collapse: collapse;
        }

        .items-table th {
            background: #f0f0f0;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #555;
            font-size: 14px;
        }

        .items-table td {
            padding: 15px 12px;
            border-bottom: 1px solid #f0f0f0;
            color: #666;
        }

        .items-table tr:last-child td {
            border-bottom: none;
        }

        .product-name {
            font-weight: 500;
            color: #333;
        }

        .totals {
            background: #f8f8f8;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 15px;
        }

        .total-row.grand-total {
            border-top: 2px solid #C2A363;
            margin-top: 10px;
            padding-top: 15px;
            font-size: 18px;
            font-weight: bold;
            color: #C2A363;
        }

        .shipping-info {
            background: #fff;
            border: 2px solid #f0f0f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }

        .shipping-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }

        .shipping-title::before {
            content: "📦";
            margin-right: 8px;
            font-size: 20px;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #C2A363 0%, #B89654 100%);
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 15px rgba(194, 163, 99, 0.3);
            transition: transform 0.2s;
        }

        .cta-button:hover {
            transform: translateY(-2px);
        }

        .footer {
            background: #2a2a2a;
            color: white;
            padding: 30px;
            text-align: center;
        }

        .footer-title {
            font-size: 18px;
            margin-bottom: 10px;
        }

        .footer-text {
            color: #aaa;
            font-size: 14px;
            line-height: 1.8;
        }

        .footer-links {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #444;
        }

        .footer-links a {
            color: #C2A363;
            text-decoration: none;
            margin: 0 10px;
        }

        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #C2A363, transparent);
            margin: 30px 0;
        }

        .highlight-box {
            background: #fff9f0;
            border-left: 4px solid #C2A363;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }

        @media only screen and (max-width: 600px) {
            .email-wrapper {
                border-radius: 0;
            }

            .content {
                padding: 30px 20px;
            }

            .items-table th,
            .items-table td {
                padding: 10px 8px;
                font-size: 13px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
            <div class="logo">Shop Natural</div>
            <div class="header-subtitle">{{ $locale === 'lt' ? 'Natūralių produktų parduotuvė' : 'Natural Products Store' }}</div>
            <div class="success-icon">✓</div>
        </div>

        <!-- Content -->
        <div class="content">
            <h1 class="title">
                {{ $locale === 'lt' ? 'Jūsų užsakymas patvirtintas!' : 'Your Order is Confirmed!' }}
            </h1>

            <p class="message">
                @if($locale === 'lt')
                    Sveiki, <strong>{{ $order->shipping_first_name }}</strong>!<br><br>
                    Dėkojame už jūsų užsakymą! Jūsų užsakymas <strong>{{ $order->order_number }}</strong> buvo sėkmingai patvirtintas ir šiuo metu yra vykdomas. Netrukus gausite naujinimą apie siuntą.
                @else
                    Hello, <strong>{{ $order->shipping_first_name }}</strong>!<br><br>
                    Thank you for your order! Your order <strong>{{ $order->order_number }}</strong> has been successfully confirmed and is now being processed. You'll receive an update about your shipment soon.
                @endif
            </p>

            <div class="divider"></div>

            <!-- Order Summary -->
            <div class="order-summary">
                <div class="order-summary-title">{{ $locale === 'lt' ? 'Užsakymo informacija' : 'Order Information' }}</div>
                <div class="detail-row">
                    <span class="detail-label">{{ $locale === 'lt' ? 'Užsakymo numeris' : 'Order Number' }}</span>
                    <span class="detail-value">{{ $order->order_number }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">{{ $locale === 'lt' ? 'Užsakymo data' : 'Order Date' }}</span>
                    <span class="detail-value">{{ $order->created_at->format('Y-m-d H:i') }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">{{ $locale === 'lt' ? 'Mokėjimo būsena' : 'Payment Status' }}</span>
                    <span class="detail-value">{{ ucfirst($order->payment_status) }}</span>
                </div>
            </div>

            <!-- Shipping Information -->
            @if($order->shipping_method)
            <div class="shipping-info">
                <div class="shipping-title">{{ $locale === 'lt' ? 'Pristatymo informacija' : 'Shipping Information' }}</div>
                <div class="detail-row">
                    <span class="detail-label">{{ $locale === 'lt' ? 'Pristatymo būdas' : 'Shipping Method' }}</span>
                    <span class="detail-value">{{ ucwords(str_replace('-', ' ', $order->shipping_method)) }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">{{ $locale === 'lt' ? 'Pristatymo adresas' : 'Shipping Address' }}</span>
                    <span class="detail-value">
                        {{ $order->shipping_street_address }}
                        @if($order->shipping_apartment), {{ $order->shipping_apartment }}@endif<br>
                        {{ $order->shipping_city }}, {{ $order->shipping_postal_code }}<br>
                        {{ $order->shipping_country }}
                    </span>
                </div>
                @if($order->venipak_pickup_point)
                <div class="highlight-box">
                    <strong>{{ $locale === 'lt' ? 'Venipak atsiėmimo punktas:' : 'Venipak Pickup Point:' }}</strong><br>
                    {{ $order->venipak_pickup_point['name'] ?? '' }}<br>
                    {{ $order->venipak_pickup_point['address'] ?? '' }}<br>
                    {{ $order->venipak_pickup_point['city'] ?? '' }}, {{ $order->venipak_pickup_point['zip'] ?? '' }}
                </div>
                @endif
            </div>
            @endif

            <!-- Order Items -->
            <h2 style="font-size: 18px; margin: 30px 0 15px; color: #333;">
                {{ $locale === 'lt' ? 'Užsakyti produktai' : 'Ordered Items' }}
            </h2>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>{{ $locale === 'lt' ? 'Produktas' : 'Product' }}</th>
                        <th style="text-align: center;">{{ $locale === 'lt' ? 'Kiekis' : 'Qty' }}</th>
                        <th style="text-align: right;">{{ $locale === 'lt' ? 'Kaina' : 'Price' }}</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                    <tr>
                        <td>
                            <div class="product-name">{{ $item->product_name }}</div>
                            <div style="font-size: 13px; color: #999;">{{ $item->variant_size }} - {{ $item->product_sku }}</div>
                        </td>
                        <td style="text-align: center;">{{ $item->quantity }}</td>
                        <td style="text-align: right;">€{{ number_format($item->total, 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>

            <!-- Totals -->
            <div class="totals">
                <div class="total-row">
                    <span>{{ $locale === 'lt' ? 'Tarpinė suma' : 'Subtotal' }}</span>
                    <span>€{{ number_format($order->subtotal, 2) }}</span>
                </div>
                <div class="total-row">
                    <span>{{ $locale === 'lt' ? 'Pristatymas' : 'Shipping' }}</span>
                    <span>€{{ number_format($order->shipping_cost, 2) }}</span>
                </div>
                @if($order->discount > 0)
                <div class="total-row">
                    <span>{{ $locale === 'lt' ? 'Nuolaida' : 'Discount' }}</span>
                    <span style="color: #e74c3c;">-€{{ number_format($order->discount, 2) }}</span>
                </div>
                @endif
                <div class="total-row">
                    <span>{{ $locale === 'lt' ? 'PVM (21%)' : 'VAT (21%)' }}</span>
                    <span>€{{ number_format($order->tax, 2) }}</span>
                </div>
                <div class="total-row grand-total">
                    <span>{{ $locale === 'lt' ? 'IŠ VISO' : 'TOTAL' }}</span>
                    <span>€{{ number_format($order->total, 2) }}</span>
                </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
                <a href="{{ config('app.url') }}" class="cta-button">
                    {{ $locale === 'lt' ? 'Apsilankyti parduotuvėje' : 'Visit Our Store' }}
                </a>
            </div>

            <div class="highlight-box">
                <strong>{{ $locale === 'lt' ? '📄 Sąskaita faktūra' : '📄 Invoice Attached' }}</strong><br>
                {{ $locale === 'lt' ? 'Jūsų sąskaita faktūra pridėta prie šio el. laiško PDF formatu.' : 'Your invoice is attached to this email as a PDF.' }}
            </div>

            <p class="message" style="font-size: 14px; margin-top: 30px;">
                @if($locale === 'lt')
                    Jei turite klausimų apie savo užsakymą, nedvejodami susisiekite su mumis el. paštu <a href="mailto:info@shopnatural.com" style="color: #C2A363;">info@shopnatural.com</a>
                @else
                    If you have any questions about your order, please don't hesitate to contact us at <a href="mailto:info@shopnatural.com" style="color: #C2A363;">info@shopnatural.com</a>
                @endif
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-title">{{ $locale === 'lt' ? 'Dėkojame, kad renkate Shop Natural!' : 'Thank you for choosing Shop Natural!' }}</div>
            <div class="footer-text">
                {{ $locale === 'lt' ? 'Natūralūs produktai jūsų gerovei' : 'Natural products for your wellbeing' }}
            </div>
            <div class="footer-links">
                <a href="{{ config('app.url') }}">{{ $locale === 'lt' ? 'Parduotuvė' : 'Shop' }}</a>
                <a href="{{ config('app.url') }}/contact">{{ $locale === 'lt' ? 'Kontaktai' : 'Contact' }}</a>
                <a href="{{ config('app.url') }}/about">{{ $locale === 'lt' ? 'Apie mus' : 'About Us' }}</a>
            </div>
            <div style="margin-top: 20px; font-size: 12px; color: #666;">
                © {{ date('Y') }} Shop Natural. {{ $locale === 'lt' ? 'Visos teisės saugomos.' : 'All rights reserved.' }}
            </div>
        </div>
    </div>
</body>
</html>
