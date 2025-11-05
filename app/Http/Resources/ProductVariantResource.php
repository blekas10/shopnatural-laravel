<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'size' => $this->size,
            'price' => (float) $this->price,
            'compareAtPrice' => $this->compare_at_price ? (float) $this->compare_at_price : null,
            'stock' => $this->stock,
            'inStock' => $this->inStock(),
            'isDefault' => $this->is_default,
        ];
    }
}
