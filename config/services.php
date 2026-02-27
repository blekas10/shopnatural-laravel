<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'venipak' => [
        // API URLs
        // Production: https://go.venipak.lt
        // UAT/Test: https://venipak.uat.megodata.com
        'base_url' => env('VENIPAK_BASE_URL', 'https://go.venipak.lt'),

        // Credentials
        'username' => env('VENIPAK_USERNAME', ''),
        'password' => env('VENIPAK_PASSWORD', ''),
        'user_id' => env('VENIPAK_USER_ID', '10281'),

        // Pack number configuration
        // First pack number to use if no previous shipments exist
        // Format: V{user_id}E{7-digit-number}
        'first_pack_number' => env('VENIPAK_FIRST_PACK_NUMBER', 1000050),

        // Feature flags
        'enabled' => env('VENIPAK_ENABLED', true),
        'auto_create_shipment' => env('VENIPAK_AUTO_CREATE_SHIPMENT', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Google OAuth Configuration
    |--------------------------------------------------------------------------
    |
    | To set up Google OAuth:
    | 1. Go to https://console.cloud.google.com/
    | 2. Create a new project or select existing
    | 3. Enable "Google+ API" or "Google Identity" in APIs & Services
    | 4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
    | 5. Set Application type to "Web application"
    | 6. Add authorized redirect URI: https://yourdomain.com/auth/google/callback
    | 7. Copy Client ID and Client Secret to .env file
    |
    */
    'facebook' => [
        'pixel_id' => env('FACEBOOK_PIXEL_ID', ''),
        'access_token' => env('FACEBOOK_ACCESS_TOKEN', ''),
        'api_version' => env('FACEBOOK_API_VERSION', 'v24.0'),
        'capi_enabled' => env('FACEBOOK_CAPI_ENABLED', false),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', '/auth/google/callback'),
    ],

];
