<?php

namespace App\Http\Resources;

use App\Services\ProductDiscountService;
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

        // Apply product discounts to variants
        $discountService = app(ProductDiscountService::class);
        $variants = $this->relationLoaded('variants')
            ? $this->variants->map(function ($v) use ($discountService) {
                $variantPrice = (float) $v->price;
                $discountInfo = $discountService->applyDiscountToVariant($this->resource, $variantPrice);

                return [
                    'id' => $v->id,
                    'sku' => $v->sku,
                    'size' => $v->size, // Stored with unit (e.g., "500ml", "30VNT")
                    'price' => $discountInfo['hasDiscount'] ? $discountInfo['price'] : $variantPrice,
                    'compareAtPrice' => $discountInfo['hasDiscount']
                        ? $discountInfo['compareAtPrice']
                        : ($v->compare_at_price ? (float) $v->compare_at_price : null),
                    'stock' => $v->stock,
                    'inStock' => $v->inStock(),
                    'isDefault' => $v->is_default,
                    'image' => $v->image?->url,
                ];
            })->values()->toArray()
            : [];

        $categories = $this->relationLoaded('categories')
            ? $this->categories->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->getTranslation('name', app()->getLocale()),
                'slug' => $c->getTranslation('slug', app()->getLocale()),
            ])->toArray()
            : [];

        // Get alternate locale slug for language switching
        $currentLocale = app()->getLocale();
        $alternateLocale = $currentLocale === 'en' ? 'lt' : 'en';
        $alternateSlug = $this->getTranslation('slug', $alternateLocale);

        // SEO fields with fallbacks - prefer translated content in current locale
        // Use getTranslations() to check if translation exists for current locale
        $metaTitleTranslations = $this->getTranslations('meta_title');
        $metaDescTranslations = $this->getTranslations('meta_description');
        $focusKeyphraseTranslations = $this->getTranslations('focus_keyphrase');

        // Meta title: use translated meta_title if exists, otherwise use name
        $metaTitle = isset($metaTitleTranslations[$currentLocale]) && !empty($metaTitleTranslations[$currentLocale])
            ? $metaTitleTranslations[$currentLocale]
            : $this->getTranslation('name', $currentLocale);

        // Meta description: prioritize translated content
        // 1. Use meta_description if it exists for current locale
        // 2. Fall back to short_description in current locale
        // 3. Fall back to description (first 160 chars)
        if (isset($metaDescTranslations[$currentLocale]) && !empty($metaDescTranslations[$currentLocale])) {
            $metaDescription = $metaDescTranslations[$currentLocale];
        } elseif ($this->short_description) {
            $metaDescription = strip_tags($this->getTranslation('short_description', $currentLocale));
        } else {
            $descriptionText = strip_tags($this->getTranslation('description', $currentLocale));
            $metaDescription = mb_strlen($descriptionText) > 160
                ? mb_substr($descriptionText, 0, 157) . '...'
                : $descriptionText;
        }

        $focusKeyphrase = isset($focusKeyphraseTranslations[$currentLocale]) && !empty($focusKeyphraseTranslations[$currentLocale])
            ? $focusKeyphraseTranslations[$currentLocale]
            : null;

        // Brand data for SEO and display
        $brand = null;
        $parentBrand = null;
        if ($this->relationLoaded('brand') && $this->brand) {
            $brand = [
                'id' => $this->brand->id,
                'name' => $this->brand->getTranslation('name', $currentLocale),
                'slug' => $this->brand->slug,
            ];
            // Get parent brand if exists (for sub-brands like "Botanic Skincare" -> "Naturalmente")
            if ($this->brand->parent_id && $this->brand->relationLoaded('parent') && $this->brand->parent) {
                $parentBrand = [
                    'id' => $this->brand->parent->id,
                    'name' => $this->brand->parent->getTranslation('name', $currentLocale),
                    'slug' => $this->brand->parent->slug,
                ];
            }
        }

        return array_merge($baseData, [
            'sku' => $this->defaultVariant?->sku ?? '',
            'shortDescription' => $this->short_description ? $this->getTranslation('short_description', $currentLocale) : null,
            'description' => $this->getTranslation('description', $currentLocale),
            'additionalInformation' => $this->additional_information ? $this->getTranslation('additional_information', $currentLocale) : null,
            'ingredients' => $this->getTranslation('ingredients', $currentLocale),
            'inStock' => $this->inStock(),
            'categories' => $categories,
            'images' => $images,
            'variants' => $variants,
            'alternateSlug' => $alternateSlug,
            // Brand data
            'brand' => $brand,
            'parentBrand' => $parentBrand,
            // SEO fields
            'metaTitle' => $metaTitle,
            'metaDescription' => $metaDescription,
            'focusKeyphrase' => $focusKeyphrase,
        ]);
    }
}
