<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BrandResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->getTranslation('name', app()->getLocale()),
            'productCount' => $this->when(isset($this->products_count), $this->products_count),
            'children' => $this->when(
                $this->relationLoaded('activeChildren'),
                function () {
                    return $this->activeChildren->map(function ($child) {
                        return [
                            'id' => $child->id,
                            'name' => $child->getTranslation('name', app()->getLocale()),
                            'productCount' => $child->products_count ?? 0,
                            'children' => $child->relationLoaded('activeChildren')
                                ? $child->activeChildren->map(function ($grandchild) {
                                    return [
                                        'id' => $grandchild->id,
                                        'name' => $grandchild->getTranslation('name', app()->getLocale()),
                                        'productCount' => $grandchild->products_count ?? 0,
                                    ];
                                })->toArray()
                                : [],
                        ];
                    })->toArray();
                },
                []
            ),
        ];
    }
}
