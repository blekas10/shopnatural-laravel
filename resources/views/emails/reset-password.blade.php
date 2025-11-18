<!DOCTYPE html>
<html lang="{{ $locale }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $locale === 'lt' ? 'Atkurti slaptažodį' : 'Reset Password' }}</title>
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

        .icon {
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

        .info-box {
            background: #fff9f0;
            border-left: 4px solid #C2A363;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }

        .info-box-title {
            font-size: 16px;
            font-weight: 600;
            color: #C2A363;
            margin-bottom: 8px;
        }

        .info-box-text {
            color: #666;
            font-size: 14px;
            line-height: 1.6;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #C2A363 0%, #B89654 100%);
            color: white !important;
            padding: 16px 45px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 15px rgba(194, 163, 99, 0.3);
            transition: transform 0.2s;
        }

        .cta-button:hover {
            transform: translateY(-2px);
        }

        .button-container {
            text-align: center;
            margin: 30px 0;
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

        .warning-box {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }

        .warning-box-text {
            color: #856404;
            font-size: 14px;
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

        @media only screen and (max-width: 600px) {
            .email-wrapper {
                border-radius: 0;
            }

            .content {
                padding: 30px 20px;
            }

            .cta-button {
                padding: 14px 35px;
                font-size: 15px;
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
            <div class="icon">🔑</div>
        </div>

        <!-- Content -->
        <div class="content">
            <h1 class="title">
                {{ $locale === 'lt' ? 'Slaptažodžio atkūrimas' : 'Reset Your Password' }}
            </h1>

            <p class="message">
                @if($locale === 'lt')
                    Sveiki,<br><br>
                    Gavome jūsų prašymą atkurti slaptažodį. Spauskite žemiau esantį mygtuką, kad atkurtumėte savo slaptažodį.
                @else
                    Hello,<br><br>
                    We received a request to reset your password. Click the button below to reset your password.
                @endif
            </p>

            <div class="button-container">
                <a href="{{ $url }}" class="cta-button">
                    {{ $locale === 'lt' ? 'Atkurti slaptažodį' : 'Reset Password' }}
                </a>
            </div>

            <div class="info-box">
                <div class="info-box-title">
                    ⏰ {{ $locale === 'lt' ? 'Svarbu žinoti:' : 'Important to know:' }}
                </div>
                <div class="info-box-text">
                    @if($locale === 'lt')
                        Ši slaptažodžio atkūrimo nuoroda galioja tik <strong>60 minučių</strong>. Po šio laiko turėsite prašyti naujos nuorodos.
                    @else
                        This password reset link will expire in <strong>60 minutes</strong>. After that time, you'll need to request a new link.
                    @endif
                </div>
            </div>

            <div class="warning-box">
                <div class="warning-box-text">
                    @if($locale === 'lt')
                        <strong>Jei jūs neprašėte atkurti slaptažodžio</strong>, jokių veiksmų atlikti nereikia. Jūsų paskyra yra saugi.
                    @else
                        <strong>If you did not request a password reset</strong>, no further action is required. Your account is secure.
                    @endif
                </div>
            </div>

            <div class="divider"></div>

            <p class="message" style="font-size: 14px;">
                @if($locale === 'lt')
                    Jei kyla problemų spaudžiant "Atkurti slaptažodį" mygtuką, nukopijuokite ir įklijuokite žemiau pateiktą URL į savo naršyklę:
                @else
                    If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser:
                @endif
            </p>

            <div class="link-box">
                {{ $url }}
            </div>

            <div class="divider"></div>

            <p class="message" style="font-size: 14px; margin-top: 30px;">
                @if($locale === 'lt')
                    Jei turite klausimų arba reikia pagalbos, nedvejodami susisiekite su mumis el. paštu <a href="mailto:info@shopnatural.com" style="color: #C2A363;">info@shopnatural.com</a>
                @else
                    If you have any questions or need assistance, please don't hesitate to contact us at <a href="mailto:info@shopnatural.com" style="color: #C2A363;">info@shopnatural.com</a>
                @endif
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-title">Shop Natural</div>
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
