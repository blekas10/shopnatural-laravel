<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Form Submission</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%);
            padding: 30px 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 28px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .content {
            padding: 40px;
        }
        .info-row {
            margin-bottom: 24px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e4e4e7;
        }
        .info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .label {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #71717a;
            margin-bottom: 8px;
        }
        .value {
            font-size: 16px;
            color: #18181b;
            word-wrap: break-word;
        }
        .message-content {
            background-color: #fafafa;
            border-left: 4px solid #d4af37;
            padding: 20px;
            border-radius: 4px;
            margin-top: 8px;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .footer {
            background-color: #fafafa;
            padding: 20px 40px;
            text-align: center;
            font-size: 12px;
            color: #71717a;
        }
        .footer a {
            color: #d4af37;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 20px;
            }
            .header, .content, .footer {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Contact Form Submission</h1>
        </div>

        <div class="content">
            <div class="info-row">
                <div class="label">From</div>
                <div class="value">{{ $senderName }}</div>
            </div>

            <div class="info-row">
                <div class="label">Email</div>
                <div class="value">
                    <a href="mailto:{{ $senderEmail }}" style="color: #d4af37; text-decoration: none;">
                        {{ $senderEmail }}
                    </a>
                </div>
            </div>

            <div class="info-row">
                <div class="label">Subject</div>
                <div class="value">{{ $formSubject }}</div>
            </div>

            <div class="info-row">
                <div class="label">Message</div>
                <div class="message-content">{{ $messageContent }}</div>
            </div>
        </div>

        <div class="footer">
            <p>This message was sent via the contact form on <a href="{{ config('app.url') }}">{{ config('app.name') }}</a></p>
            <p>Reply directly to this email to respond to {{ $senderName }}</p>
        </div>
    </div>
</body>
</html>
