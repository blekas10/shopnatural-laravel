<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PromoCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    public function __construct(
        protected PromoCodeService $promoCodeService
    ) {}

    /**
     * Validate a promo code and return discount info
     */
    public function validate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'cart_total' => 'required|numeric|min:0',
            'locale' => 'nullable|string|in:en,lt',
        ]);

        // Set locale for translated error messages
        if (!empty($validated['locale'])) {
            app()->setLocale($validated['locale']);
        }

        $userId = auth()->id();
        $email = $request->input('email') ?? auth()->user()?->email;

        $result = $this->promoCodeService->validateAndGetInfo(
            $validated['code'],
            $validated['cart_total'],
            $userId,
            $email
        );

        return response()->json($result);
    }
}
