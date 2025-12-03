<?php

namespace App\Http\Resources;

use App\Services\ProductDiscountService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $variant = $this->defaultVariant;
        $discountService = app(ProductDiscountService::class);

        // Get base price from variant or product
        $basePrice = $variant ? (float) $variant->price : (float) $this->price;

        // Apply product discount if applicable
        $discountInfo = $discountService->applyDiscount($this->resource);

        // Determine final price and compareAtPrice
        // Safety: if discount returns 0 price, fallback to base price
        $discountedPrice = $discountInfo['hasDiscount'] ? $discountInfo['price'] : $basePrice;
        $finalPrice = $discountedPrice > 0 ? $discountedPrice : $basePrice;

        $compareAtPrice = $discountInfo['hasDiscount'] && $discountedPrice > 0
            ? $discountInfo['compareAtPrice']
            : ($variant?->compare_at_price ? (float) $variant->compare_at_price : null);

        // Calculate price range if product has multiple variants with different prices
        $hasVariants = $this->variants->count() > 1;
        $prices = $this->variants->pluck('price')->unique()->sort()->values();
        $minPrice = $prices->first() ?? 0;
        $maxPrice = $prices->last() ?? 0;

        // Apply discount to price range if applicable
        if ($discountInfo['hasDiscount']) {
            $minPrice = $discountService->applyDiscountToVariant($this->resource, $minPrice)['price'];
            $maxPrice = $discountService->applyDiscountToVariant($this->resource, $maxPrice)['price'];
        }

        $hasPriceRange = $hasVariants && $minPrice != $maxPrice;

        // Determine sale status - only consider it a sale if discount produces valid price
        $hasValidDiscount = $discountInfo['hasDiscount'] && $discountedPrice > 0;
        $isOnSale = $hasValidDiscount || $this->isOnSale();
        $salePercentage = $hasValidDiscount
            ? (int) $discountInfo['discountPercentage']
            : $this->getSalePercentage();

        $data = [
            'id' => $this->id,
            'name' => $this->getTranslation('name', app()->getLocale()),
            'title' => $this->title ? $this->getTranslation('title', app()->getLocale()) : null,
            'slug' => $this->getTranslation('slug', app()->getLocale()),
            'price' => $finalPrice,
            'compareAtPrice' => $compareAtPrice,
            'minPrice' => $hasPriceRange ? (float) $minPrice : null,
            'maxPrice' => $hasPriceRange ? (float) $maxPrice : null,
            'image' => $this->primaryImage?->url ?? asset('images/placeholder.jpg'),
            'isOnSale' => $isOnSale,
            'salePercentage' => $salePercentage,
        ];

        // Add brand info if loaded
        if ($this->relationLoaded('brand')) {
            $data['brandId'] = $this->brand_id;
            $data['brandName'] = $this->brand?->getTranslation('name', app()->getLocale());
        }

        // Add category IDs if loaded
        if ($this->relationLoaded('categories')) {
            $data['categoryIds'] = $this->categories->pluck('id')->toArray();
        }

        return $data;
    }
}
