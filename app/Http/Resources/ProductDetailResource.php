<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ProductDetailResource extends ProductResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $baseData = parent::toArray($request);

        // Collect variant image IDs that are explicitly assigned to variants
        $variantImageIds = $this->relationLoaded('variants')
            ? $this->variants->pluck('image_id')->filter()->unique()->toArray()
            : [];

        // Gallery logic:
        // - If product has variant images assigned: show ONLY variant images (no duplicates/confusion)
        // - If product has NO variant images: show general gallery images (order < 100)
        $hasVariantImages = count($variantImageIds) > 0;

        $images = $this->relationLoaded('images')
            ? $this->images
                ->filter(function($img) use ($variantImageIds, $hasVariantImages) {
                    if ($hasVariantImages) {
                        // Product has variants with images: show ONLY variant images
                        return in_array($img->id, $variantImageIds);
                    } else {
                        // Product has no variant images: show general gallery images
                        return $img->order < 100;
                    }
                })
                ->sortBy('order')
                ->values()
                ->map(fn($img) => [
                    'id' => $img->id,
                    'url' => $img->url,
                    'altText' => $img->alt_text ? $img->getTranslation('alt_text', app()->getLocale()) : null,
                    'isPrimary' => $img->is_primary,
                ])
                ->toArray()
            : [];

        $variants = $this->relationLoaded('variants')
            ? $this->variants->map(fn($v) => [
                'id' => $v->id,
                'sku' => $v->sku,
                'size' => $v->size . 'ml', // Format as "500ml", "1000ml"
                'price' => (float) $v->price,
                'compareAtPrice' => $v->compare_at_price ? (float) $v->compare_at_price : null,
                'stock' => $v->stock,
                'inStock' => $v->inStock(),
                'isDefault' => $v->is_default,
                'image' => $v->image?->url,
            ])->values()->toArray()
            : [];

        $categories = $this->relationLoaded('categories')
            ? $this->categories->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->getTranslation('name', app()->getLocale()),
                'slug' => $c->slug,
            ])->toArray()
            : [];

        return array_merge($baseData, [
            'sku' => $this->defaultVariant?->sku ?? '',
            'shortDescription' => $this->short_description ? $this->getTranslation('short_description', app()->getLocale()) : null,
            'description' => $this->getTranslation('description', app()->getLocale()),
            'additionalInformation' => $this->additional_information ? $this->getTranslation('additional_information', app()->getLocale()) : null,
            'ingredients' => $this->getTranslation('ingredients', app()->getLocale()),
            'inStock' => $this->inStock(),
            'categories' => $categories,
            'images' => $images,
            'variants' => $variants,
        ]);
    }
}
