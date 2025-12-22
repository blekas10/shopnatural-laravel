<?php

namespace App\Http\Responses;

use Inertia\Inertia;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Symfony\Component\HttpFoundation\Response;

class RegisterResponse implements RegisterResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     */
    public function toResponse($request): Response
    {
        // Get locale from request (sent by register form)
        $locale = $request->input('locale', 'en');

        // Build locale-aware dashboard URL
        $dashboardPath = $locale === 'en' ? '/dashboard' : '/' . $locale . '/dashboard';

        // Use Inertia::location() to force a full page reload after registration
        // This ensures the CSRF token is refreshed after session regeneration
        if ($request->wantsJson()) {
            return Inertia::location($dashboardPath);
        }

        return redirect()->intended($dashboardPath);
    }
}
