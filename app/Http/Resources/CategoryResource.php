<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->getTranslation('name', app()->getLocale()),
            'slug' => $this->slug,
            'children' => $this->when(
                $this->relationLoaded('activeChildren'),
                function () {
                    return $this->activeChildren->map(function ($child) {
                        return [
                            'id' => $child->id,
                            'name' => $child->getTranslation('name', app()->getLocale()),
                            'slug' => $child->slug,
                            'children' => $child->relationLoaded('activeChildren')
                                ? $child->activeChildren->map(function ($grandchild) {
                                    return [
                                        'id' => $grandchild->id,
                                        'name' => $grandchild->getTranslation('name', app()->getLocale()),
                                        'slug' => $grandchild->slug,
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
