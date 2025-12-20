<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
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

        return $request->wantsJson()
            ? new JsonResponse('', 204)
            : redirect()->intended($dashboardPath);
    }
}
