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

        return [
            'id' => $this->id,
            'name' => $this->getTranslation('name', app()->getLocale()),
            'title' => $this->title ? $this->getTranslation('title', app()->getLocale()) : null,
            'slug' => $this->slug,
            'price' => $variant ? (float) $variant->price : 0,
            'compareAtPrice' => $variant?->compare_at_price ? (float) $variant->compare_at_price : null,
            'image' => $this->primaryImage?->url ?? asset('images/placeholder.jpg'),
            'isOnSale' => $this->isOnSale(),
            'salePercentage' => $this->getSalePercentage(),

            // Conditional fields
            $this->mergeWhen($this->relationLoaded('brand'), [
                'brandId' => $this->brand_id,
                'brandName' => $this->brand?->getTranslation('name', app()->getLocale()),
            ]),

            $this->mergeWhen($this->relationLoaded('categories'), [
                'categoryIds' => $this->categories->pluck('id')->toArray(),
            ]),
        ];
    }
}
