<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Stripe API Keys
    |--------------------------------------------------------------------------
    |
    | Get your API keys from: https://dashboard.stripe.com/apikeys
    | Use test keys (pk_test_...) for development
    | Use live keys (pk_live_...) for production
    |
    */

    'key' => env('STRIPE_KEY'),
    'secret' => env('STRIPE_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Stripe Webhook Secret
    |--------------------------------------------------------------------------
    |
    | Get this from: https://dashboard.stripe.com/webhooks
    | Used to verify webhook signatures
    |
    */

    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    |
    | The default currency for Stripe payments (e.g., 'usd', 'eur', 'gbp')
    |
    */

    'currency' => env('STRIPE_CURRENCY', 'eur'),

];
