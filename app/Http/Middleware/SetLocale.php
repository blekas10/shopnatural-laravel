<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get locale from URL segment (first segment if it's a valid locale)
        $locale = $request->segment(1);

        // Check if the first segment is a valid locale
        if (!in_array($locale, config('app.available_locales'))) {
            // For Fortify auth routes (register, login, etc.) preserve session locale
            // Otherwise default to English
            if ($this->isFortifyRoute($request)) {
                $locale = session('locale', config('app.locale'));
            } else {
                $locale = config('app.locale');
            }
        }

        app()->setLocale($locale);

        // Store locale in session for use in notifications/emails
        session(['locale' => $locale]);

        return $next($request);
    }

    /**
     * Check if request is for a Fortify authentication route
     */
    private function isFortifyRoute(Request $request): bool
    {
        // Only preserve locale for register POST requests
        return $request->is('register') && $request->isMethod('POST');
    }
}
