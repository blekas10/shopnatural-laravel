<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        return $request->wantsJson()
            ? new JsonResponse('', 204)
            : redirect($homePath);
    }
}
