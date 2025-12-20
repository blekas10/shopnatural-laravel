<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
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

        return $request->wantsJson()
            ? new JsonResponse('', 201)
            : redirect()->intended($dashboardPath);
    }
}
