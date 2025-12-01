<!DOCTYPE html>
<html lang="{{ $locale ?? 'en' }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', config('app.name'))</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #F3F4F6;
            line-height: 1.5;
        }
        .container {
            max-width: 600px;
            width: 100%;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 0;
        }
        .header {
            border-radius: 12px 12px 0 0;
            background: #ffffff;
            padding: 32px 24px;
            text-align: center;
            margin-top: 24px;
            border-bottom: 3px solid #C2A363;
        }
        .logo-img {
            max-width: 180px;
            height: auto;
        }
        .header-subtitle {
            color: #6B7280;
            font-size: 14px;
            margin-top: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .content {
            padding: 32px 24px 0 24px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1F2937;
            margin: 0 0 16px 0;
        }
        .message {
            font-size: 15px;
            color: #374151;
            margin: 0 0 12px 0;
            line-height: 1.6;
        }
        .message strong {
            color: #1F2937;
        }
        .highlight-box {
            background-color: #FFF9F0;
            border-left: 4px solid #C2A363;
            border-radius: 0 8px 8px 0;
            padding: 16px;
            margin: 20px 0;
        }
        .highlight-title {
            font-size: 14px;
            font-weight: 600;
            color: #C2A363;
            margin: 0 0 8px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .highlight-value {
            font-size: 15px;
            color: #374151;
            margin: 0;
            line-height: 1.6;
        }
        .info-list {
            margin: 16px 0;
            padding: 0;
            list-style: none;
        }
        .info-list li {
            font-size: 15px;
            color: #374151;
            padding: 8px 0;
            border-bottom: 1px solid #F3F4F6;
        }
        .info-list li:last-child {
            border-bottom: none;
        }
        .info-list li strong {
            color: #1F2937;
        }
        .bullet-list {
            margin: 12px 0;
            padding-left: 20px;
        }
        .bullet-list li {
            font-size: 15px;
            color: #374151;
            padding: 4px 0;
            line-height: 1.6;
        }
        .button-container {
            text-align: center;
            margin: 28px 0;
        }
        .button {
            display: inline-block;
            padding: 14px 40px;
            background: linear-gradient(135deg, #C2A363 0%, #B89654 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            text-align: center;
            box-shadow: 0 4px 15px rgba(194, 163, 99, 0.3);
        }
        .button-secondary {
            background: #2a2a2a;
        }
        .link-box {
            background: #f8f8f8;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            word-break: break-all;
            font-size: 12px;
            color: #666;
            border: 1px dashed #ddd;
        }
        .security-notice {
            margin-top: 24px;
            font-size: 14px;
            line-height: 1.6;
            color: #6B7280;
            margin-bottom: 24px;
        }
        .regards {
            font-size: 15px;
            line-height: 1.6;
            color: #374151;
            margin: 32px 0 24px 0;
            padding-top: 24px;
            border-top: 1px solid #E5E7EB;
        }
        .regards p {
            margin: 0;
        }
        .regards p:first-child {
            margin-bottom: 4px;
        }
        .help-section {
            display: table;
            width: 100%;
            margin-top: 40px;
            border-top: 1px solid #E5E7EB;
        }
        .help-column {
            display: table-cell;
            width: 50%;
            padding: 32px 16px;
            text-align: center;
            vertical-align: top;
        }
        .help-column:first-child {
            border-right: 1px solid #E5E7EB;
        }
        .help-title {
            font-size: 17px;
            font-weight: 600;
            color: #1F2937;
            margin: 0 0 10px 0;
        }
        .help-description {
            font-size: 14px;
            color: #6B7280;
            margin: 0 0 18px 0;
            line-height: 1.5;
        }
        .help-button {
            display: inline-block;
            padding: 11px 32px;
            background: linear-gradient(135deg, #C2A363 0%, #B89654 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 50px;
            font-size: 15px;
            font-weight: 600;
        }
        .footer {
            background: linear-gradient(135deg, #3D3D3D 0%, #2a2a2a 100%);
            padding: 32px;
            color: #9CA3AF;
            font-size: 13px;
            line-height: 1.6;
            border-radius: 0 0 12px 12px;
        }
        .footer-content {
            text-align: center;
        }
        .footer-logo {
            max-width: 120px;
            height: auto;
            margin-bottom: 16px;
            filter: brightness(0) invert(1);
        }
        .footer-warning {
            color: #D1D5DB;
            margin: 0 0 20px 0;
            font-size: 14px;
        }
        .footer-links {
            margin: 20px 0;
        }
        .footer-links a {
            color: #C2A363;
            text-decoration: none;
            margin: 0 14px;
            font-weight: 500;
        }
        .footer-company {
            margin-top: 20px;
            color: #9CA3AF;
        }
        .footer-copyright {
            color: #D1D5DB;
            margin: 6px 0;
        }
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #C2A363, transparent);
            margin: 24px 0;
        }
        .text-muted {
            color: #6B7280;
            font-size: 14px;
        }
        .text-small {
            font-size: 13px;
        }
        .text-gold {
            color: #C2A363;
        }
        .mt-0 { margin-top: 0; }
        .mb-0 { margin-bottom: 0; }
        .mt-16 { margin-top: 16px; }
        .mb-16 { margin-bottom: 16px; }
        .mt-24 { margin-top: 24px; }
        .mb-24 { margin-bottom: 24px; }

        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
            }
            .header {
                margin-top: 0;
                border-radius: 0;
            }
            .footer {
                border-radius: 0;
            }
            .content {
                padding: 24px 16px 0 16px;
            }
            .help-section {
                display: block;
            }
            .help-column {
                display: block;
                width: 100%;
                border-right: none !important;
                border-bottom: 1px solid #E5E7EB;
            }
            .help-column:last-child {
                border-bottom: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <a href="{{ config('app.url') }}">
                <img src="{{ config('app.url') }}/images/shop-natural-logo.png" alt="Shop Natural" class="logo-img">
            </a>
        </div>

        <!-- Content -->
        <div class="content">
            @yield('content')

            <!-- Regards -->
            <div class="regards">
                <p>{{ ($locale ?? 'en') === 'lt' ? 'Pagarbiai,' : 'Kind regards,' }}</p>
                <p><strong>Shop Natural</strong></p>
            </div>
        </div>

        @hasSection('help_section')
            @yield('help_section')
        @else
            <!-- Help Section -->
            <div class="help-section">
                <div class="help-column">
                    <div class="help-title">
                        {{ ($locale ?? 'en') === 'lt' ? 'Turite klausimų?' : 'Have questions?' }}
                    </div>
                    <div class="help-description">
                        {{ ($locale ?? 'en') === 'lt' ? 'Mūsų klientų aptarnavimo komanda visada pasiruošusi padėti.' : 'Our customer support team is available to assist you.' }}
                    </div>
                    <a href="{{ config('app.url') }}/contact" class="help-button">
                        {{ ($locale ?? 'en') === 'lt' ? 'Susisiekti' : 'Contact Us' }}
                    </a>
                </div>
                <div class="help-column">
                    <div class="help-title">
                        {{ ($locale ?? 'en') === 'lt' ? 'Naršykite produktus' : 'Browse Products' }}
                    </div>
                    <div class="help-description">
                        {{ ($locale ?? 'en') === 'lt' ? 'Atraskite mūsų natūralių produktų kolekciją.' : 'Discover our collection of natural products.' }}
                    </div>
                    <a href="{{ config('app.url') }}/{{ ($locale ?? 'en') === 'lt' ? 'lt/produktai' : 'products' }}" class="help-button">
                        {{ ($locale ?? 'en') === 'lt' ? 'Parduotuvė' : 'Shop Now' }}
                    </a>
                </div>
            </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <div class="footer-content">
                <img src="{{ config('app.url') }}/images/shop-natural-logo.png" alt="Shop Natural" class="footer-logo">

                @hasSection('footer_warning')
                    <div class="footer-warning">
                        @yield('footer_warning')
                    </div>
                @endif

                <div class="footer-links">
                    <a href="{{ config('app.url') }}/{{ ($locale ?? 'en') === 'lt' ? 'lt/privatumo-politika' : 'privacy-policy' }}">
                        {{ ($locale ?? 'en') === 'lt' ? 'Privatumo politika' : 'Privacy Policy' }}
                    </a>
                    <a href="{{ config('app.url') }}/{{ ($locale ?? 'en') === 'lt' ? 'lt/grazinimo-politika' : 'return-policy' }}">
                        {{ ($locale ?? 'en') === 'lt' ? 'Grąžinimo politika' : 'Return Policy' }}
                    </a>
                </div>

                <div class="footer-company">
                    <p class="footer-copyright">&copy; {{ date('Y') }} Shop Natural. {{ ($locale ?? 'en') === 'lt' ? 'Visos teisės saugomos.' : 'All rights reserved.' }}</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
