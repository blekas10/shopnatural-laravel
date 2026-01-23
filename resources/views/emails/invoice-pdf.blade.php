<!DOCTYPE html>
<html lang="{{ $locale }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $locale === 'lt' ? 'PVM sąskaita faktūra' : 'VAT Invoice' }} - {{ $order->order_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 9pt;
            line-height: 1.5;
            color: #333;
            background: #fff;
        }

        .container {
            padding: 30px 40px;
            max-width: 800px;
            margin: 0 auto;
        }

        /* Header with logo and invoice info */
        .header {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }

        .header-left {
            display: table-cell;
            width: 45%;
            vertical-align: top;
        }

        .header-right {
            display: table-cell;
            width: 55%;
            vertical-align: top;
            text-align: right;
        }

        .logo-img {
            max-width: 180px;
            height: auto;
        }

        .invoice-title {
            font-size: 14pt;
            font-weight: bold;
            color: #333;
            margin-bottom: 12px;
        }

        .invoice-meta {
            font-size: 9pt;
        }

        .invoice-meta-row {
            display: table;
            width: 100%;
            margin-bottom: 3px;
        }

        .invoice-meta-label {
            display: table-cell;
            font-weight: bold;
            color: #333;
            text-align: left;
            padding-right: 15px;
        }

        .invoice-meta-value {
            display: table-cell;
            text-align: right;
            color: #333;
        }

        /* Three column addresses */
        .addresses {
            display: table;
            width: 100%;
            margin-bottom: 25px;
            border-top: 2px solid #C2A363;
            padding-top: 20px;
        }

        .address-column {
            display: table-cell;
            width: 33.33%;
            vertical-align: top;
            padding-right: 15px;
        }

        .address-column:last-child {
            padding-right: 0;
        }

        .address-title {
            font-weight: bold;
            font-size: 9pt;
            margin-bottom: 8px;
            color: #333;
        }

        .address-content {
            font-size: 9pt;
            color: #333;
            line-height: 1.6;
        }

        /* Products table */
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            font-size: 8.5pt;
        }

        .products-table th {
            background: #f5f5f5;
            border: 1px solid #e0e0e0;
            padding: 10px 8px;
            text-align: left;
            font-weight: bold;
            color: #333;
            text-transform: uppercase;
            font-size: 8pt;
        }

        .products-table td {
            border: 1px solid #e0e0e0;
            padding: 10px 8px;
            vertical-align: top;
        }

        .products-table .text-center {
            text-align: center;
        }

        .products-table .text-right {
            text-align: right;
        }

        .products-table tbody tr:nth-child(even) {
            background: #fafafa;
        }

        /* Summary section */
        .summary-wrapper {
            display: table;
            width: 100%;
        }

        .summary-spacer {
            display: table-cell;
            width: 50%;
        }

        .summary-table-wrapper {
            display: table-cell;
            width: 50%;
        }

        .summary-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
        }

        .summary-table td {
            padding: 8px 12px;
            border: 1px solid #e0e0e0;
        }

        .summary-table .label {
            font-weight: bold;
            text-align: right;
            background: #f5f5f5;
            width: 60%;
        }

        .summary-table .value {
            text-align: right;
            width: 40%;
        }

        .summary-table .discount {
            color: #C2A363;
        }

        .summary-table .total-row td {
            font-weight: bold;
            font-size: 10pt;
            background: #f5f5f5;
        }

        /* Footer */
        .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #666;
            font-size: 8pt;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                <img src="{{ public_path('images/shop-natural-logo.png') }}" alt="Shop Natural" class="logo-img">
            </div>
            <div class="header-right">
                <div class="invoice-title">{{ $locale === 'lt' ? 'PVM sąskaita faktūra' : 'VAT Invoice' }}</div>
                <div class="invoice-meta">
                    <div class="invoice-meta-row">
                        <span class="invoice-meta-label">{{ $locale === 'lt' ? 'Sąskaitos numeris' : 'Invoice Number' }}</span>
                        <span class="invoice-meta-value">{{ $order->invoice_number ?? '-' }}</span>
                    </div>
                    <div class="invoice-meta-row">
                        <span class="invoice-meta-label">{{ $locale === 'lt' ? 'Užsakymo numeris' : 'Order Number' }}</span>
                        <span class="invoice-meta-value">{{ $order->order_number }}</span>
                    </div>
                    <div class="invoice-meta-row">
                        <span class="invoice-meta-label">{{ $locale === 'lt' ? 'Užsakymo data' : 'Order Date' }}</span>
                        <span class="invoice-meta-value">{{ $locale === 'lt' ? $order->created_at->translatedFormat('d F Y') : $order->created_at->format('d F Y') }}</span>
                    </div>
                    <div class="invoice-meta-row">
                        <span class="invoice-meta-label">{{ $locale === 'lt' ? 'Mokėjimo būdas' : 'Payment Method' }}</span>
                        <span class="invoice-meta-value">{{ $order->payment_method ?? ($locale === 'lt' ? 'Visi populiarūs mokėjimo būdai' : 'All popular payment methods') }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Three Column Addresses -->
        <div class="addresses">
            <div class="address-column">
                <div class="address-title">{{ $locale === 'lt' ? 'Parduotuvės informacija:' : 'Store Information:' }}</div>
                <div class="address-content">
                    shop-natural<br>
                    Vaidoto g. 1<br>
                    LT-45387 Kaunas<br>
                    Lietuva<br>
                    +370 601 17017
                </div>
            </div>
            <div class="address-column">
                <div class="address-title">{{ $locale === 'lt' ? 'Pristatymo adresas' : 'Shipping Address' }}</div>
                <div class="address-content">
                    {{ $order->shipping_first_name }} {{ $order->shipping_last_name }}<br>
                    {{ $order->shipping_street_address }}@if($order->shipping_apartment) {{ $order->shipping_apartment }}@endif<br>
                    {{ $order->shipping_city }}<br>
                    {{ $order->shipping_country }}<br>
                    {{ $order->shipping_postal_code }}<br>
                    @if($order->shipping_phone)Tel: {{ $order->shipping_phone }}@endif
                </div>
            </div>
            <div class="address-column">
                <div class="address-title">{{ $locale === 'lt' ? 'Mokėjimo adresas' : 'Billing Address' }}</div>
                <div class="address-content">
                    {{ $order->billing_first_name ?? $order->shipping_first_name }} {{ $order->billing_last_name ?? $order->shipping_last_name }}<br>
                    {{ $order->billing_street_address ?? $order->shipping_street_address }}@if($order->billing_apartment ?? $order->shipping_apartment) {{ $order->billing_apartment ?? $order->shipping_apartment }}@endif<br>
                    {{ $order->billing_city ?? $order->shipping_city }}<br>
                    {{ $order->billing_country ?? $order->shipping_country }}<br>
                    {{ $order->billing_postal_code ?? $order->shipping_postal_code }}<br>
                    @if($order->shipping_phone)Tel: {{ $order->shipping_phone }}@endif
                </div>
            </div>
        </div>

        <!-- Products Table -->
        <table class="products-table">
            <thead>
                <tr>
                    <th style="width: 24%;">{{ $locale === 'lt' ? 'PRODUKTAS' : 'PRODUCT' }}</th>
                    <th style="width: 10%;" class="text-center">{{ $locale === 'lt' ? 'KODAS' : 'SKU' }}</th>
                    <th style="width: 6%;" class="text-center">{{ $locale === 'lt' ? 'KIEKIS' : 'QTY' }}</th>
                    <th style="width: 10%;" class="text-right">{{ $locale === 'lt' ? 'KAINA' : 'PRICE' }}</th>
                    <th style="width: 10%;" class="text-right">{{ $locale === 'lt' ? 'NUOLAIDA' : 'DISCOUNT' }}</th>
                    <th style="width: 12%;" class="text-right">{{ $locale === 'lt' ? 'BE PVM' : 'EX VAT' }}</th>
                    <th style="width: 8%;" class="text-center">{{ $locale === 'lt' ? 'PVM %' : 'VAT %' }}</th>
                    <th style="width: 10%;" class="text-right">{{ $locale === 'lt' ? 'PVM €' : 'VAT €' }}</th>
                    <th style="width: 10%;" class="text-right">{{ $locale === 'lt' ? 'VISO' : 'TOTAL' }}</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                @php
                    $vatRate = 21;
                    // Original unit price (before discount), or current price if no discount
                    $originalUnitPrice = $item->original_unit_price ?? $item->unit_price;
                    // Current unit price (after discount)
                    $unitPrice = $item->unit_price;
                    // Discount per unit
                    $discountPerUnit = $originalUnitPrice - $unitPrice;
                    $hasDiscount = $discountPerUnit > 0;
                    // Unit price without VAT (after discount)
                    $unitPriceExVat = $unitPrice / (1 + $vatRate / 100);
                    // VAT amount for line
                    $lineTotal = $item->total;
                    $linePriceExVat = $lineTotal / (1 + $vatRate / 100);
                    $lineVatAmount = $lineTotal - $linePriceExVat;
                @endphp
                <tr>
                    <td>
                        {{ $item->product_name }}@if($item->variant_size) - {{ $item->variant_size }}@endif
                    </td>
                    <td class="text-center">{{ $item->product_sku }}</td>
                    <td class="text-center">{{ $item->quantity }}</td>
                    <td class="text-right">{{ number_format($originalUnitPrice, 2, ',', ' ') }} €</td>
                    <td class="text-right">
                        @if($hasDiscount)
                            <span style="color: #C2A363;">-{{ number_format($discountPerUnit, 2, ',', ' ') }} €</span>
                        @else
                            -
                        @endif
                    </td>
                    <td class="text-right">{{ number_format($unitPriceExVat, 2, ',', ' ') }} €</td>
                    <td class="text-center">{{ $vatRate }}%</td>
                    <td class="text-right">{{ number_format($lineVatAmount, 2, ',', ' ') }} €</td>
                    <td class="text-right">{{ number_format($lineTotal, 2, ',', ' ') }} €</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Summary -->
        @php
            // Calculate values with fallbacks for old orders
            $originalSubtotal = $order->original_subtotal ?? $order->subtotal;
            $productDiscount = $order->product_discount ?? 0;
            $subtotal = $order->subtotal;
            $subtotalExclVat = $order->subtotal_excl_vat ?? ($subtotal / 1.21);
            $vatAmount = $order->vat_amount ?? ($subtotal - $subtotalExclVat);
            $promoCodeDiscount = $order->discount ?? 0;
            $promoCode = $order->promoCode?->code ?? null;
        @endphp
        <div class="summary-wrapper">
            <div class="summary-spacer"></div>
            <div class="summary-table-wrapper">
                <table class="summary-table">
                    <tr>
                        <td class="label">{{ $locale === 'lt' ? 'Pristatymo būdas' : 'Shipping Method' }}</td>
                        <td class="value">{{ $order->shipping_method ? ucwords(str_replace(['-', '_'], ' ', $order->shipping_method)) : '-' }}</td>
                    </tr>
                    @if($order->venipak_pickup_point && isset($order->venipak_pickup_point['name']))
                    <tr>
                        <td class="label">{{ $locale === 'lt' ? 'Atsiėmimo vieta' : 'Pickup Location' }}</td>
                        <td class="value">{{ $order->venipak_pickup_point['name'] }}@if(isset($order->venipak_pickup_point['address'])), {{ $order->venipak_pickup_point['address'] }}@endif</td>
                    </tr>
                    @endif
                    <tr>
                        <td class="label">{{ $locale === 'lt' ? 'Prekių kaina' : 'Product Price' }}</td>
                        <td class="value">{{ number_format($originalSubtotal, 2, ',', ' ') }} €</td>
                    </tr>
                    @if($productDiscount > 0)
                    <tr>
                        <td class="label">{{ $locale === 'lt' ? 'Produktų nuolaida' : 'Product Discount' }}</td>
                        <td class="value discount">-{{ number_format($productDiscount, 2, ',', ' ') }} €</td>
                    </tr>
                    @endif
                    <tr>
                        <td class="label">{{ $locale === 'lt' ? 'Tarpinė suma' : 'Subtotal' }}</td>
                        <td class="value">{{ number_format($subtotal, 2, ',', ' ') }} €</td>
                    </tr>
                    <tr>
                        <td class="label">{{ $locale === 'lt' ? 'Kaina be PVM' : 'Price excl. VAT' }}</td>
                        <td class="value">{{ number_format($subtotalExclVat, 2, ',', ' ') }} €</td>
                    </tr>
                    <tr>
                        <td class="label">{{ $locale === 'lt' ? 'PVM (21%)' : 'VAT (21%)' }}</td>
                        <td class="value">{{ number_format($vatAmount, 2, ',', ' ') }} €</td>
                    </tr>
                    @if($promoCodeDiscount > 0)
                    <tr>
                        <td class="label">{{ $locale === 'lt' ? 'Nuolaidos kodas' : 'Promo Code' }}@if($promoCode) ({{ $promoCode }})@endif</td>
                        <td class="value discount">-{{ number_format($promoCodeDiscount, 2, ',', ' ') }} €</td>
                    </tr>
                    @endif
                    <tr>
                        <td class="label">{{ $locale === 'lt' ? 'Pristatymo kaina' : 'Shipping Cost' }}</td>
                        <td class="value">{{ number_format($order->shipping_cost, 2, ',', ' ') }} €</td>
                    </tr>
                    <tr class="total-row">
                        <td class="label">{{ $locale === 'lt' ? 'Viso mokėti' : 'Total to Pay' }}</td>
                        <td class="value">{{ number_format($order->total, 2, ',', ' ') }} €</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            {{ $locale === 'lt' ? 'Dėkojame už jūsų užsakymą!' : 'Thank you for your order!' }} | shop-natural.com | info@shop-natural.com
        </div>
    </div>
</body>
</html>
