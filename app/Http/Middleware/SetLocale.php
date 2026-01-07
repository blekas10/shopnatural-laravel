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
            // For Fortify auth routes (register, login, etc.) check form data first, then session
            // This ensures validation messages are in the correct language
            if ($this->isFortifyRoute($request)) {
                // Check if locale is sent in form data (from login/register forms)
                $formLocale = $request->input('locale');
                if ($formLocale && in_array($formLocale, config('app.available_locales'))) {
                    $locale = $formLocale;
                } else {
                    $locale = session('locale', config('app.locale'));
                }
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
        // Preserve locale for auth POST requests (login, register, etc.)
        return $request->isMethod('POST') && $request->is('login', 'register', 'forgot-password', 'reset-password', 'logout');
    }
}
