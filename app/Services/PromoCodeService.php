<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PromoCode;
use App\Models\PromoCodeUsage;

class PromoCodeService
{
    private ?string $lastError = null;
    private ?string $lastErrorKey = null;

    /**
     * Validate a promo code
     *
     * @return PromoCode|null Returns the promo code if valid, null otherwise
     */
    public function validate(string $code, float $cartTotal, ?int $userId = null, ?string $email = null): ?PromoCode
    {
        $this->lastError = null;
        $this->lastErrorKey = null;

        // Find the code
        $promoCode = PromoCode::where('code', strtoupper(trim($code)))->first();

        if (!$promoCode) {
            $this->lastError = __('promo_code.invalid');
            $this->lastErrorKey = 'promo_code.invalid';

            return null;
        }

        // Check if this is a WELCOME code (requires logged-in user)
        if (str_starts_with($promoCode->code, 'WELCOME') && !$userId) {
            $this->lastError = __('promo_code.login_required');
            $this->lastErrorKey = 'promo_code.login_required';

            return null;
        }

        // Check if active
        if (!$promoCode->is_active) {
            $this->lastError = __('promo_code.inactive');
            $this->lastErrorKey = 'promo_code.inactive';

            return null;
        }

        // Check if not yet active
        if ($promoCode->isNotYetActive()) {
            $this->lastError = __('promo_code.not_yet_active');
            $this->lastErrorKey = 'promo_code.not_yet_active';

            return null;
        }

        // Check if expired
        if ($promoCode->isExpired()) {
            $this->lastError = __('promo_code.expired');
            $this->lastErrorKey = 'promo_code.expired';

            return null;
        }

        // Check usage limit
        if ($promoCode->isUsageLimitReached()) {
            $this->lastError = __('promo_code.usage_limit_reached');
            $this->lastErrorKey = 'promo_code.usage_limit_reached';

            return null;
        }

        // Check per-user limit
        if ($email && $promoCode->isPerUserLimitReached($userId, $email)) {
            $this->lastError = __('promo_code.per_user_limit_reached');
            $this->lastErrorKey = 'promo_code.per_user_limit_reached';

            return null;
        }

        // Check minimum order amount
        if (!$promoCode->meetsMinimumOrder($cartTotal)) {
            $this->lastError = __('promo_code.minimum_not_met', [
                'amount' => '€' . number_format($promoCode->min_order_amount, 2),
            ]);
            $this->lastErrorKey = 'promo_code.minimum_not_met';

            return null;
        }

        return $promoCode;
    }

    /**
     * Calculate discount amount
     */
    public function calculateDiscount(PromoCode $promoCode, float $cartTotal): float
    {
        return $promoCode->calculateDiscount($cartTotal);
    }

    /**
     * Apply promo code to an order (record usage)
     */
    public function applyToOrder(Order $order, PromoCode $promoCode, float $discountAmount): PromoCodeUsage
    {
        // Create usage record
        $usage = PromoCodeUsage::create([
            'promo_code_id' => $promoCode->id,
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'email' => $order->customer_email,
            'discount_amount' => $discountAmount,
        ]);

        // Increment usage count
        $promoCode->incrementUsage();

        return $usage;
    }

    /**
     * Get the last validation error message
     */
    public function getError(): ?string
    {
        return $this->lastError;
    }

    /**
     * Get the last validation error key (for frontend translation)
     */
    public function getErrorKey(): ?string
    {
        return $this->lastErrorKey;
    }

    /**
     * Validate and return full info for API response
     */
    public function validateAndGetInfo(string $code, float $cartTotal, ?int $userId = null, ?string $email = null): array
    {
        $promoCode = $this->validate($code, $cartTotal, $userId, $email);

        if (!$promoCode) {
            return [
                'valid' => false,
                'error' => $this->lastError,
                'error_key' => $this->lastErrorKey,
            ];
        }

        $discountAmount = $this->calculateDiscount($promoCode, $cartTotal);

        return [
            'valid' => true,
            'code' => $promoCode->code,
            'type' => $promoCode->type,
            'value' => (float) $promoCode->value,
            'discount_amount' => $discountAmount,
            'formatted_value' => $promoCode->getFormattedValue(),
        ];
    }
}
