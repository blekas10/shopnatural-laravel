<?php

namespace App\Http\Responses;

use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     */
    public function toResponse($request): Response
    {
        // Get locale from request (sent by login form)
        $locale = $request->input('locale', 'en');

        // Build locale-aware dashboard URL
        $dashboardPath = $locale === 'en' ? '/dashboard' : '/' . $locale . '/dashboard';

        // Use Inertia::location() to force a full page reload after login
        // This ensures the CSRF token is refreshed after session regeneration
        // Check for Inertia request via X-Inertia header (not wantsJson)
        if ($request->hasHeader('X-Inertia')) {
            return Inertia::location($dashboardPath);
        }

        return redirect()->intended($dashboardPath);
    }
}
