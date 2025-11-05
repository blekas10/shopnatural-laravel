<?php

namespace App\Helpers;

class RouteHelper
{
    protected static array $routeTranslations = [
        'products' => [
            'en' => 'products',
            'lt' => 'produktai',
        ],
        'about' => [
            'en' => 'about',
            'lt' => 'apie-mus',
        ],
        'contact' => [
            'en' => 'contact',
            'lt' => 'kontaktai',
        ],
        'dashboard' => [
            'en' => 'dashboard',
            'lt' => 'valdymas',
        ],
    ];

    /**
     * Get translated route segment for given locale
     */
    public static function trans(string $segment, string $locale): string
    {
        return self::$routeTranslations[$segment][$locale] ?? $segment;
    }

    /**
     * Get route segment key from translated value
     */
    public static function findKey(string $translatedSegment, string $locale): ?string
    {
        foreach (self::$routeTranslations as $key => $translations) {
            if ($translations[$locale] === $translatedSegment) {
                return $key;
            }
        }
        return null;
    }

    /**
     * Translate URL path from one locale to another
     */
    public static function translatePath(string $path, string $fromLocale, string $toLocale): string
    {
        $segments = explode('/', trim($path, '/'));
        $translatedSegments = [];

        foreach ($segments as $segment) {
            // Try to find if this segment is a translated route
            $key = self::findKey($segment, $fromLocale);
            if ($key) {
                $translatedSegments[] = self::trans($key, $toLocale);
            } else {
                // Keep the segment as is (e.g., product slugs)
                $translatedSegments[] = $segment;
            }
        }

        return '/' . implode('/', $translatedSegments);
    }
}
