<?php

namespace App\Http\Responses;

use Inertia\Inertia;
use Laravel\Fortify\Contracts\LogoutResponse as LogoutResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LogoutResponse implements LogoutResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     */
    public function toResponse($request): Response
    {
        // Get locale from referer URL (check if it starts with /lt)
        $referer = $request->headers->get('referer', '');
        $locale = str_contains($referer, '/lt/') || str_ends_with($referer, '/lt') ? 'lt' : 'en';

        // Build locale-aware home URL
        $homePath = $locale === 'en' ? '/' : '/' . $locale;

        // Use Inertia::location() to force a full page reload after logout
        // This ensures the CSRF token is refreshed for subsequent login attempts
        if ($request->hasHeader('X-Inertia')) {
            return Inertia::location($homePath);
        }

        return redirect($homePath);
    }
}
