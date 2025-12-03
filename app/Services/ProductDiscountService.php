<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductDiscount;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class ProductDiscountService
{
    /**
     * Cache TTL in seconds (5 minutes)
     */
    private const CACHE_TTL = 300;

    /**
     * Find the best applicable discount for a product
     */
    public function findApplicableDiscount(Product $product): ?ProductDiscount
    {
        // Get all active and valid discounts, ordered by priority (highest first)
        $discounts = $this->getActiveDiscounts();

        // Find the first discount that applies to this product
        foreach ($discounts as $discount) {
            if ($discount->appliesToProduct($product)) {
                return $discount;
            }
        }

        return null;
    }

    /**
     * Apply discount to a product and return pricing info
     */
    public function applyDiscount(Product $product): array
    {
        // Get original price from product or default variant
        $originalPrice = (float) $product->price;
        if ($originalPrice <= 0 && $product->relationLoaded('defaultVariant') && $product->defaultVariant) {
            $originalPrice = (float) $product->defaultVariant->price;
        }

        $discount = $this->findApplicableDiscount($product);

        if (!$discount || $originalPrice <= 0) {
            return [
                'price' => $originalPrice,
                'compareAtPrice' => null,
                'discountPercentage' => null,
                'discountAmount' => 0,
                'hasDiscount' => false,
            ];
        }

        $discountedPrice = $discount->calculateDiscountedPrice($originalPrice);

        // Safety: ensure discounted price is not 0 or negative
        if ($discountedPrice <= 0) {
            return [
                'price' => $originalPrice,
                'compareAtPrice' => null,
                'discountPercentage' => null,
                'discountAmount' => 0,
                'hasDiscount' => false,
            ];
        }

        $discountAmount = $originalPrice - $discountedPrice;
        $discountPercentage = $originalPrice > 0
            ? round(($discountAmount / $originalPrice) * 100)
            : 0;

        return [
            'price' => $discountedPrice,
            'compareAtPrice' => $originalPrice,
            'discountPercentage' => (int) $discountPercentage,
            'discountAmount' => $discountAmount,
            'hasDiscount' => true,
        ];
    }

    /**
     * Apply discount to a product variant
     */
    public function applyDiscountToVariant(Product $product, float $variantPrice): array
    {
        $discount = $this->findApplicableDiscount($product);

        if (!$discount) {
            return [
                'price' => $variantPrice,
                'compareAtPrice' => null,
                'discountPercentage' => null,
                'discountAmount' => 0,
                'hasDiscount' => false,
            ];
        }

        $discountedPrice = $discount->calculateDiscountedPrice($variantPrice);
        $discountAmount = $variantPrice - $discountedPrice;
        $discountPercentage = $variantPrice > 0
            ? round(($discountAmount / $variantPrice) * 100)
            : 0;

        return [
            'price' => $discountedPrice,
            'compareAtPrice' => $variantPrice,
            'discountPercentage' => $discountPercentage,
            'discountAmount' => $discountAmount,
            'hasDiscount' => true,
        ];
    }

    /**
     * Get discounted price for a product
     */
    public function getDiscountedPrice(Product $product): float
    {
        $pricing = $this->applyDiscount($product);

        return $pricing['price'];
    }

    /**
     * Check if a product has an active discount
     */
    public function hasDiscount(Product $product): bool
    {
        return $this->findApplicableDiscount($product) !== null;
    }

    /**
     * Get all active discounts, cached
     */
    protected function getActiveDiscounts(): Collection
    {
        return Cache::remember('active_product_discounts', self::CACHE_TTL, function () {
            return ProductDiscount::activeAndValid()
                ->orderByDesc('priority')
                ->get();
        });
    }

    /**
     * Clear the discounts cache
     */
    public function clearCache(): void
    {
        Cache::forget('active_product_discounts');
    }

    /**
     * Get discount info for display (without applying)
     */
    public function getDiscountInfo(Product $product): ?array
    {
        $discount = $this->findApplicableDiscount($product);

        if (!$discount) {
            return null;
        }

        return [
            'id' => $discount->id,
            'name' => $discount->name,
            'type' => $discount->type,
            'value' => $discount->value,
            'formattedValue' => $discount->getFormattedValue(),
        ];
    }

    /**
     * Calculate total product discount for a cart
     */
    public function calculateCartProductDiscount(array $items): float
    {
        $totalDiscount = 0;

        foreach ($items as $item) {
            $product = Product::find($item['productId'] ?? $item['product_id'] ?? null);
            if (!$product) {
                continue;
            }

            $originalPrice = (float) ($item['originalPrice'] ?? $item['compareAtPrice'] ?? $product->price);
            $currentPrice = (float) ($item['price'] ?? $product->price);
            $quantity = (int) ($item['quantity'] ?? 1);

            // If there's a compareAtPrice, calculate discount from that
            if ($originalPrice > $currentPrice) {
                $totalDiscount += ($originalPrice - $currentPrice) * $quantity;
            }
        }

        return round($totalDiscount, 2);
    }
}
