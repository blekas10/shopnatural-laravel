<!DOCTYPE html>
<html lang="{{ $locale }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $locale === 'lt' ? 'Sąskaita faktūra' : 'Invoice' }} - {{ $order->order_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10pt;
            line-height: 1.6;
            color: #333;
        }

        .container {
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
        }

        .header {
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #C2A363;
        }

        .logo {
            font-size: 24pt;
            font-weight: bold;
            color: #C2A363;
            margin-bottom: 5px;
        }

        .company-info {
            color: #666;
            font-size: 9pt;
        }

        .invoice-details {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }

        .invoice-details > div {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }

        .invoice-title {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .detail-row {
            margin-bottom: 5px;
        }

        .label {
            font-weight: bold;
            color: #666;
        }

        .addresses {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }

        .address-block {
            display: table-cell;
            width: 50%;
            padding: 15px;
            background: #f8f8f8;
            vertical-align: top;
        }

        .address-block:first-child {
            margin-right: 10px;
        }

        .address-title {
            font-weight: bold;
            font-size: 11pt;
            margin-bottom: 8px;
            color: #C2A363;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        th {
            background: #C2A363;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }

        td {
            padding: 10px 12px;
            border-bottom: 1px solid #eee;
        }

        tr:last-child td {
            border-bottom: none;
        }

        .text-right {
            text-align: right;
        }

        .totals {
            margin-top: 20px;
            float: right;
            width: 300px;
        }

        .totals table {
            margin-bottom: 0;
        }

        .totals td {
            border-bottom: none;
            padding: 8px 12px;
        }

        .totals .total-row {
            font-size: 12pt;
            font-weight: bold;
            border-top: 2px solid #C2A363;
        }

        .totals .total-row td {
            padding-top: 12px;
        }

        .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 9pt;
            clear: both;
        }

        .shipping-info {
            background: #f8f8f8;
            padding: 15px;
            margin-bottom: 20px;
            border-left: 3px solid #C2A363;
        }

        .shipping-info-title {
            font-weight: bold;
            margin-bottom: 5px;
            color: #C2A363;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">Shop Natural</div>
            <div class="company-info">
                {{ $locale === 'lt' ? 'Natūralių produktų parduotuvė' : 'Natural Products Store' }}<br>
                info@shopnatural.com | www.shopnatural.com
            </div>
        </div>

        <!-- Invoice Details -->
        <div class="invoice-details">
            <div>
                <div class="invoice-title">{{ $locale === 'lt' ? 'SĄSKAITA FAKTŪRA' : 'INVOICE' }}</div>
                <div class="detail-row">
                    <span class="label">{{ $locale === 'lt' ? 'Užsakymo numeris:' : 'Order Number:' }}</span>
                    {{ $order->order_number }}
                </div>
                <div class="detail-row">
                    <span class="label">{{ $locale === 'lt' ? 'Data:' : 'Date:' }}</span>
                    {{ $order->created_at->format('Y-m-d') }}
                </div>
                <div class="detail-row">
                    <span class="label">{{ $locale === 'lt' ? 'Statusas:' : 'Status:' }}</span>
                    {{ ucfirst($order->status) }}
                </div>
            </div>
            <div style="text-align: right;">
                <div class="detail-row">
                    <span class="label">{{ $locale === 'lt' ? 'Mokėjimo būsena:' : 'Payment Status:' }}</span>
                    {{ ucfirst($order->payment_status) }}
                </div>
                @if($order->tracking_number)
                <div class="detail-row">
                    <span class="label">{{ $locale === 'lt' ? 'Sekimo numeris:' : 'Tracking Number:' }}</span>
                    {{ $order->tracking_number }}
                </div>
                @endif
            </div>
        </div>

        <!-- Customer & Billing Address -->
        <div class="addresses">
            <div class="address-block">
                <div class="address-title">{{ $locale === 'lt' ? 'Pirkėjas' : 'Customer' }}</div>
                {{ $order->shipping_first_name }} {{ $order->shipping_last_name }}<br>
                {{ $order->customer_email }}<br>
                @if($order->shipping_phone)
                    {{ $order->shipping_phone }}<br>
                @endif
            </div>
            <div class="address-block" style="margin-left: 10px;">
                <div class="address-title">{{ $locale === 'lt' ? 'Sąskaitos adresas' : 'Billing Address' }}</div>
                {{ $order->billing_street_address }}<br>
                @if($order->billing_apartment)
                    {{ $order->billing_apartment }}<br>
                @endif
                {{ $order->billing_city }}, {{ $order->billing_postal_code }}<br>
                {{ $order->billing_country }}
            </div>
        </div>

        <!-- Shipping Information -->
        @if($order->shipping_method)
        <div class="shipping-info">
            <div class="shipping-info-title">{{ $locale === 'lt' ? 'Pristatymo informacija' : 'Shipping Information' }}</div>
            <div class="detail-row">
                <span class="label">{{ $locale === 'lt' ? 'Pristatymo būdas:' : 'Shipping Method:' }}</span>
                {{ ucwords(str_replace('-', ' ', $order->shipping_method)) }}
            </div>
            <div class="detail-row">
                <span class="label">{{ $locale === 'lt' ? 'Pristatymo adresas:' : 'Shipping Address:' }}</span>
                {{ $order->shipping_street_address }}
                @if($order->shipping_apartment), {{ $order->shipping_apartment }}@endif,
                {{ $order->shipping_city }}, {{ $order->shipping_postal_code }}, {{ $order->shipping_country }}
            </div>
            @if($order->venipak_pickup_point)
            <div class="detail-row">
                <span class="label">{{ $locale === 'lt' ? 'Venipak atsiėmimo punktas:' : 'Venipak Pickup Point:' }}</span>
                {{ $order->venipak_pickup_point['name'] ?? '' }},
                {{ $order->venipak_pickup_point['address'] ?? '' }},
                {{ $order->venipak_pickup_point['city'] ?? '' }},
                {{ $order->venipak_pickup_point['zip'] ?? '' }}
            </div>
            @endif
        </div>
        @endif

        <!-- Order Items -->
        <table>
            <thead>
                <tr>
                    <th>{{ $locale === 'lt' ? 'Produktas' : 'Product' }}</th>
                    <th>{{ $locale === 'lt' ? 'SKU' : 'SKU' }}</th>
                    <th class="text-right">{{ $locale === 'lt' ? 'Kiekis' : 'Qty' }}</th>
                    <th class="text-right">{{ $locale === 'lt' ? 'Kaina' : 'Price' }}</th>
                    <th class="text-right">{{ $locale === 'lt' ? 'Suma' : 'Total' }}</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr>
                    <td>{{ $item->product_name }} - {{ $item->variant_size }}</td>
                    <td>{{ $item->product_sku }}</td>
                    <td class="text-right">{{ $item->quantity }}</td>
                    <td class="text-right">€{{ number_format($item->unit_price, 2) }}</td>
                    <td class="text-right">€{{ number_format($item->total, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
            <table>
                <tr>
                    <td>{{ $locale === 'lt' ? 'Tarpinė suma:' : 'Subtotal:' }}</td>
                    <td class="text-right">€{{ number_format($order->subtotal, 2) }}</td>
                </tr>
                <tr>
                    <td>{{ $locale === 'lt' ? 'Pristatymas:' : 'Shipping:' }}</td>
                    <td class="text-right">€{{ number_format($order->shipping_cost, 2) }}</td>
                </tr>
                @if($order->discount > 0)
                <tr>
                    <td>{{ $locale === 'lt' ? 'Nuolaida:' : 'Discount:' }}</td>
                    <td class="text-right">-€{{ number_format($order->discount, 2) }}</td>
                </tr>
                @endif
                <tr>
                    <td>{{ $locale === 'lt' ? 'PVM (21%):' : 'VAT (21%):' }}</td>
                    <td class="text-right">€{{ number_format($order->tax, 2) }}</td>
                </tr>
                <tr class="total-row">
                    <td>{{ $locale === 'lt' ? 'IŠ VISO:' : 'TOTAL:' }}</td>
                    <td class="text-right">€{{ number_format($order->total, 2) }}</td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div class="footer">
            {{ $locale === 'lt' ? 'Dėkojame už jūsų užsakymą!' : 'Thank you for your order!' }}<br>
            {{ $locale === 'lt' ? 'Klausimų atveju susisiekite su mumis' : 'For questions, please contact us at' }} info@shopnatural.com
        </div>
    </div>
</body>
</html>
