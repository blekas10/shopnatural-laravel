<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'productId' => $this->product_id,
            'productVariantId' => $this->product_variant_id,

            // Historical product data (as it was at order time)
            'productName' => $this->product_name,
            'productSku' => $this->product_sku,
            'variantSize' => $this->variant_size,

            // Pricing at time of order
            'unitPrice' => (float) $this->unit_price,
            'quantity' => $this->quantity,
            'subtotal' => (float) $this->subtotal,
            'tax' => (float) $this->tax,
            'total' => (float) $this->total,

            // Include current product data if relationship is loaded
            $this->mergeWhen($this->relationLoaded('product'), [
                'product' => $this->product ? [
                    'id' => $this->product->id,
                    'name' => $this->product->getTranslation('name', app()->getLocale()),
                    'slug' => $this->product->slug,
                    // Use variant image if available, otherwise use product primary image
                    'image' => $this->variant?->image?->url
                        ?? $this->product->primaryImage?->url
                        ?? asset('images/placeholder.jpg'),
                ] : null,
            ]),

            $this->mergeWhen($this->relationLoaded('variant'), [
                'variant' => $this->variant ? [
                    'id' => $this->variant->id,
                    'size' => $this->variant->size,
                    'currentPrice' => (float) $this->variant->price,
                    'inStock' => $this->variant->inStock(),
                    'image' => $this->variant->image?->url,
                ] : null,
            ]),
        ];
    }
}
