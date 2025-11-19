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
            // If not a valid locale in URL, default to English (not session)
            $locale = config('app.locale');
        }

        app()->setLocale($locale);

        // Store locale in session for use in notifications/emails
        session(['locale' => $locale]);

        return $next($request);
    }
}
