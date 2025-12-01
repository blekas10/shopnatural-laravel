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
        $locale = app()->getLocale();

        return [
            'id' => $this->id,
            'name' => $this->getTranslation('name', $locale),
            'slug' => $this->getTranslation('slug', $locale),
            'children' => $this->when(
                $this->relationLoaded('activeChildren'),
                function () use ($locale) {
                    return $this->activeChildren->map(function ($child) use ($locale) {
                        return [
                            'id' => $child->id,
                            'name' => $child->getTranslation('name', $locale),
                            'slug' => $child->getTranslation('slug', $locale),
                            'children' => $child->relationLoaded('activeChildren')
                                ? $child->activeChildren->map(function ($grandchild) use ($locale) {
                                    return [
                                        'id' => $grandchild->id,
                                        'name' => $grandchild->getTranslation('name', $locale),
                                        'slug' => $grandchild->getTranslation('slug', $locale),
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
