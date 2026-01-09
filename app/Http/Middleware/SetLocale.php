<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Cookie name for storing locale preference
     */
    private const LOCALE_COOKIE = 'locale_preference';

    /**
     * Cookie lifetime in minutes (30 days)
     */
    private const COOKIE_LIFETIME = 43200;

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $availableLocales = config('app.available_locales', ['en', 'lt']);
        $defaultLocale = config('app.locale', 'en');

        // Get locale from URL segment (first segment if it's a valid locale)
        $urlLocale = $request->segment(1);
        $hasLocaleInUrl = in_array($urlLocale, $availableLocales);

        // Determine the current locale from URL or default
        if ($hasLocaleInUrl) {
            $locale = $urlLocale;
        } else {
            // For Fortify auth routes, check form data first
            if ($this->isFortifyRoute($request)) {
                $formLocale = $request->input('locale');
                if ($formLocale && in_array($formLocale, $availableLocales)) {
                    $locale = $formLocale;
                } else {
                    $locale = session('locale', $defaultLocale);
                }
            } else {
                $locale = $defaultLocale; // English (no prefix)
            }
        }

        // Check if this is a first-time visitor (no locale preference cookie)
        $storedPreference = $request->cookie(self::LOCALE_COOKIE);

        // Auto-detect and redirect only for first-time visitors on the root English site
        if (
            !$storedPreference &&
            !$hasLocaleInUrl &&
            $this->shouldAutoRedirect($request)
        ) {
            $detectedLocale = $this->detectBrowserLocale($request, $availableLocales);

            // If Lithuanian detected and currently on English, redirect to /lt
            if ($detectedLocale === 'lt') {
                $redirectPath = $this->buildLocalizedPath($request, 'lt');

                // Create response with cookie
                $response = redirect($redirectPath);
                $response->cookie(self::LOCALE_COOKIE, 'lt', self::COOKIE_LIFETIME);

                return $response;
            }

            // Store English preference for non-LT users
            $response = $next($request);
            if ($response instanceof Response) {
                $response->headers->setCookie(
                    cookie(self::LOCALE_COOKIE, 'en', self::COOKIE_LIFETIME)
                );
            }

            app()->setLocale($locale);
            session(['locale' => $locale]);

            return $response;
        }

        // If user manually switched locale (has cookie but URL locale differs),
        // update the cookie to match URL locale
        if ($storedPreference && $hasLocaleInUrl && $storedPreference !== $locale) {
            $response = $next($request);
            if ($response instanceof Response) {
                $response->headers->setCookie(
                    cookie(self::LOCALE_COOKIE, $locale, self::COOKIE_LIFETIME)
                );
            }

            app()->setLocale($locale);
            session(['locale' => $locale]);

            return $response;
        }

        // Also update cookie when switching from /lt to / (English)
        if ($storedPreference && !$hasLocaleInUrl && $storedPreference === 'lt') {
            // User is on English URL but had LT preference - they manually switched
            $response = $next($request);
            if ($response instanceof Response) {
                $response->headers->setCookie(
                    cookie(self::LOCALE_COOKIE, 'en', self::COOKIE_LIFETIME)
                );
            }

            app()->setLocale($locale);
            session(['locale' => $locale]);

            return $response;
        }

        app()->setLocale($locale);
        session(['locale' => $locale]);

        return $next($request);
    }

    /**
     * Detect browser locale from Accept-Language header
     */
    private function detectBrowserLocale(Request $request, array $availableLocales): string
    {
        $acceptLanguage = $request->header('Accept-Language', '');

        if (empty($acceptLanguage)) {
            return config('app.locale', 'en');
        }

        // Parse Accept-Language header
        // Format: lt,en-US;q=0.9,en;q=0.8
        $languages = [];

        foreach (explode(',', $acceptLanguage) as $part) {
            $part = trim($part);
            if (empty($part)) continue;

            // Check for quality value
            if (str_contains($part, ';q=')) {
                [$lang, $q] = explode(';q=', $part);
                $quality = (float) $q;
            } else {
                $lang = $part;
                $quality = 1.0;
            }

            // Extract primary language code (e.g., 'en-US' -> 'en')
            $langCode = strtolower(explode('-', trim($lang))[0]);
            $languages[$langCode] = $quality;
        }

        // Sort by quality (highest first)
        arsort($languages);

        // Find first matching available locale
        foreach (array_keys($languages) as $langCode) {
            if (in_array($langCode, $availableLocales)) {
                return $langCode;
            }
        }

        return config('app.locale', 'en');
    }

    /**
     * Check if we should auto-redirect this request
     */
    private function shouldAutoRedirect(Request $request): bool
    {
        // Only redirect on GET requests to avoid breaking forms
        if (!$request->isMethod('GET')) {
            return false;
        }

        // Don't redirect API, webhook, or asset requests
        if ($request->is('api/*', 'webhook/*', '_debugbar/*', 'storage/*', 'build/*')) {
            return false;
        }

        // Don't redirect auth callback routes
        if ($request->is('auth/*', 'login', 'register', 'logout')) {
            return false;
        }

        return true;
    }

    /**
     * Build localized path for redirect
     */
    private function buildLocalizedPath(Request $request, string $locale): string
    {
        $path = $request->path();

        if ($path === '/' || $path === '') {
            return $locale === 'en' ? '/' : '/' . $locale;
        }

        // For the homepage
        if ($locale === 'lt') {
            return '/lt';
        }

        return '/';
    }

    /**
     * Check if request is for a Fortify authentication route
     */
    private function isFortifyRoute(Request $request): bool
    {
        return $request->isMethod('POST') && $request->is('login', 'register', 'forgot-password', 'reset-password', 'logout');
    }
}
