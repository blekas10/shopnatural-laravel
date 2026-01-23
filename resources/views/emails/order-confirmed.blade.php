@extends('emails.layouts.base')

@section('title')
    {{ $locale === 'lt' ? 'Užsakymas patvirtintas' : 'Order Confirmed' }}
@endsection

@section('content')
    <h2 class="greeting">
        @if($locale === 'lt')
            Jūsų užsakymas patvirtintas! ✓
        @else
            Your Order is Confirmed! ✓
        @endif
    </h2>

    <p class="message">
        @if($locale === 'lt')
            Sveiki, <strong>{{ $order->shipping_first_name }}</strong>!<br><br>
            Dėkojame už jūsų užsakymą! Jūsų užsakymas <strong>{{ $order->order_number }}</strong> buvo sėkmingai patvirtintas ir šiuo metu yra vykdomas.
        @else
            Hello, <strong>{{ $order->shipping_first_name }}</strong>!<br><br>
            Thank you for your order! Your order <strong>{{ $order->order_number }}</strong> has been successfully confirmed and is now being processed.
        @endif
    </p>

    <div class="divider"></div>

    <!-- Order Summary -->
    <div class="highlight-box">
        <div class="highlight-title">
            {{ $locale === 'lt' ? 'Užsakymo informacija' : 'Order Information' }}
        </div>
        <div class="highlight-value">
            <strong>{{ $locale === 'lt' ? 'Užsakymo nr.' : 'Order #' }}</strong> {{ $order->order_number }}<br>
            <strong>{{ $locale === 'lt' ? 'Data' : 'Date' }}:</strong> {{ $order->created_at->format('Y-m-d H:i') }}<br>
            <strong>{{ $locale === 'lt' ? 'Būsena' : 'Status' }}:</strong> {{ ucfirst($order->payment_status) }}
        </div>
    </div>

    <!-- Shipping Information -->
    @if($order->shipping_method)
    <div class="highlight-box" style="background-color: #f8f8f8; border-left-color: #6B7280;">
        <div class="highlight-title" style="color: #374151;">
            📦 {{ $locale === 'lt' ? 'Pristatymo informacija' : 'Shipping Information' }}
        </div>
        <div class="highlight-value">
            <strong>{{ $locale === 'lt' ? 'Būdas' : 'Method' }}:</strong> {{ ucwords(str_replace('-', ' ', $order->shipping_method)) }}<br>
            <strong>{{ $locale === 'lt' ? 'Adresas' : 'Address' }}:</strong><br>
            {{ $order->shipping_street_address }}@if($order->shipping_apartment), {{ $order->shipping_apartment }}@endif<br>
            {{ $order->shipping_city }}, {{ $order->shipping_postal_code }}<br>
            {{ $order->shipping_country }}
        </div>
    </div>

    @if($order->venipak_pickup_point)
    <div class="highlight-box">
        <div class="highlight-title">
            {{ $locale === 'lt' ? 'Venipak atsiėmimo punktas' : 'Venipak Pickup Point' }}
        </div>
        <div class="highlight-value">
            {{ $order->venipak_pickup_point['name'] ?? '' }}<br>
            {{ $order->venipak_pickup_point['address'] ?? '' }}<br>
            {{ $order->venipak_pickup_point['city'] ?? '' }}, {{ $order->venipak_pickup_point['zip'] ?? '' }}
        </div>
    </div>
    @endif
    @endif

    <!-- Order Items -->
    <h3 style="font-size: 16px; margin: 24px 0 12px; color: #1F2937; text-transform: uppercase; letter-spacing: 0.5px;">
        {{ $locale === 'lt' ? 'Užsakyti produktai' : 'Ordered Items' }}
    </h3>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
            <tr style="background-color: #f8f8f8;">
                <th style="padding: 12px; text-align: left; font-size: 13px; color: #6B7280; text-transform: uppercase;">{{ $locale === 'lt' ? 'Produktas' : 'Product' }}</th>
                <th style="padding: 12px; text-align: center; font-size: 13px; color: #6B7280; text-transform: uppercase;">{{ $locale === 'lt' ? 'Kiekis' : 'Qty' }}</th>
                <th style="padding: 12px; text-align: right; font-size: 13px; color: #6B7280; text-transform: uppercase;">{{ $locale === 'lt' ? 'Kaina' : 'Price' }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
                    <div style="font-weight: 600; color: #1F2937;">{{ $item->product_name }}</div>
                    <div style="font-size: 13px; color: #6B7280;">{{ $item->variant_size }} - {{ $item->product_sku }}</div>
                </td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #f0f0f0; color: #374151;">{{ $item->quantity }}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #1F2937;">€{{ number_format($item->total, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Totals -->
    @php
        // Calculate values with fallbacks for old orders
        $subtotalExclVat = $order->subtotal_excl_vat ?? ($order->subtotal / 1.21);
        $vatAmount = $order->vat_amount ?? ($order->subtotal - $subtotalExclVat);
        $shippingCost = $order->shipping_cost ?? 0;
        $promoDiscount = $order->discount ?? 0;
    @endphp
    <table style="width: 100%; background-color: #f8f8f8; border-radius: 8px; border-collapse: collapse;">
        <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #374151; border-bottom: 1px solid #e5e5e5;">
                {{ $locale === 'lt' ? 'Tarpinė suma' : 'Subtotal' }}
            </td>
            <td style="padding: 12px 16px; font-size: 14px; color: #374151; text-align: right; border-bottom: 1px solid #e5e5e5;">
                €{{ number_format($order->subtotal, 2) }}
            </td>
        </tr>
        <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #374151; border-bottom: 1px solid #e5e5e5;">
                {{ $locale === 'lt' ? 'Pristatymas' : 'Shipping' }}
            </td>
            <td style="padding: 12px 16px; font-size: 14px; color: #374151; text-align: right; border-bottom: 1px solid #e5e5e5;">
                @if($shippingCost > 0)
                    €{{ number_format($shippingCost, 2) }}
                @else
                    {{ $locale === 'lt' ? 'Nemokamas' : 'Free' }}
                @endif
            </td>
        </tr>
        @if($promoDiscount > 0)
        <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #C2A363; border-bottom: 1px solid #e5e5e5;">
                {{ $locale === 'lt' ? 'Nuolaida' : 'Discount' }}
                @if($order->promoCode)
                    ({{ $order->promoCode->code }})
                @endif
            </td>
            <td style="padding: 12px 16px; font-size: 14px; color: #C2A363; text-align: right; border-bottom: 1px solid #e5e5e5;">
                -€{{ number_format($promoDiscount, 2) }}
            </td>
        </tr>
        @endif
        <tr>
            <td style="padding: 12px 16px; font-size: 13px; color: #6B7280; border-bottom: 1px solid #e5e5e5;">
                {{ $locale === 'lt' ? 'Kaina be PVM' : 'Price excl. VAT' }}
            </td>
            <td style="padding: 12px 16px; font-size: 13px; color: #6B7280; text-align: right; border-bottom: 1px solid #e5e5e5;">
                €{{ number_format($subtotalExclVat, 2) }}
            </td>
        </tr>
        <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #374151; border-bottom: 1px solid #e5e5e5;">
                {{ $locale === 'lt' ? 'PVM (21%)' : 'VAT (21%)' }}
            </td>
            <td style="padding: 12px 16px; font-size: 14px; color: #374151; text-align: right; border-bottom: 1px solid #e5e5e5;">
                €{{ number_format($vatAmount, 2) }}
            </td>
        </tr>
        <tr>
            <td style="padding: 16px; font-size: 18px; font-weight: 700; color: #C2A363; border-top: 2px solid #C2A363;">
                {{ $locale === 'lt' ? 'IŠ VISO' : 'TOTAL' }}
            </td>
            <td style="padding: 16px; font-size: 18px; font-weight: 700; color: #C2A363; text-align: right; border-top: 2px solid #C2A363;">
                €{{ number_format($order->total, 2) }}
            </td>
        </tr>
    </table>

    <div class="button-container">
        <a href="{{ config('app.url') }}" class="button">
            {{ $locale === 'lt' ? 'Apsilankyti parduotuvėje' : 'Visit Our Store' }}
        </a>
    </div>

    <div class="highlight-box">
        <div class="highlight-title">
            📄 {{ $locale === 'lt' ? 'Sąskaita faktūra' : 'Invoice Attached' }}
        </div>
        <div class="highlight-value">
            {{ $locale === 'lt' ? 'Jūsų sąskaita faktūra pridėta prie šio el. laiško PDF formatu.' : 'Your invoice is attached to this email as a PDF.' }}
        </div>
    </div>
@endsection

@section('footer_warning')
    @if($locale === 'lt')
        Netrukus gausite naujinimą apie jūsų siuntą.
    @else
        You'll receive an update about your shipment soon.
    @endif
@endsection
