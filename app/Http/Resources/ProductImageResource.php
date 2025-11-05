<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductImageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => $this->url,
            'altText' => $this->alt_text ? $this->getTranslation('alt_text', app()->getLocale()) : null,
            'isPrimary' => $this->is_primary,
        ];
    }
}
