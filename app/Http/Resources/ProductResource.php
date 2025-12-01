<?php

namespace App\Http\Resources;

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

        // Calculate price range if product has multiple variants with different prices
        $hasVariants = $this->variants->count() > 1;
        $prices = $this->variants->pluck('price')->unique()->sort()->values();
        $minPrice = $prices->first() ?? 0;
        $maxPrice = $prices->last() ?? 0;
        $hasPriceRange = $hasVariants && $minPrice != $maxPrice;

        $data = [
            'id' => $this->id,
            'name' => $this->getTranslation('name', app()->getLocale()),
            'title' => $this->title ? $this->getTranslation('title', app()->getLocale()) : null,
            'slug' => $this->getTranslation('slug', app()->getLocale()),
            'price' => $variant ? (float) $variant->price : $minPrice,
            'compareAtPrice' => $variant?->compare_at_price ? (float) $variant->compare_at_price : null,
            'minPrice' => $hasPriceRange ? (float) $minPrice : null,
            'maxPrice' => $hasPriceRange ? (float) $maxPrice : null,
            'image' => $this->primaryImage?->url ?? asset('images/placeholder.jpg'),
            'isOnSale' => $this->isOnSale(),
            'salePercentage' => $this->getSalePercentage(),
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
