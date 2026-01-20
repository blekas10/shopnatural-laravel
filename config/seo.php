<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Twitter Handle
    |--------------------------------------------------------------------------
    |
    | Your Twitter/X account handle (with @) for Twitter Card attribution.
    | Leave empty if you don't have a Twitter account.
    |
    */
    'twitter_handle' => env('SEO_TWITTER_HANDLE', '@ShopNatural'),

    /*
    |--------------------------------------------------------------------------
    | Default Meta Image
    |--------------------------------------------------------------------------
    |
    | Default image for Open Graph and Twitter Cards if no specific image
    | is provided. Should be 1200x630px for best results.
    |
    */
    'default_image' => env('SEO_DEFAULT_IMAGE', '/images/og-image.jpg'),

    /*
    |--------------------------------------------------------------------------
    | Site Name
    |--------------------------------------------------------------------------
    |
    | Your site name for SEO purposes.
    |
    */
    'site_name' => env('APP_NAME', 'Shop Natural'),

    /*
    |--------------------------------------------------------------------------
    | Site URL
    |--------------------------------------------------------------------------
    |
    | Your site URL for canonical URLs and sitemaps.
    |
    */
    'site_url' => env('APP_URL', 'https://shop-natural.com'),
];
