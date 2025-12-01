<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Add proper authorization later
    }

    public function rules(): array
    {
        return [
            // Basic product info with translations
            'name' => 'required|array',
            'name.en' => 'required|string|max:255',
            'name.lt' => 'nullable|string|max:255',
            'slug' => 'nullable|array',
            'slug.en' => 'nullable|string|max:255',
            'slug.lt' => 'nullable|string|max:255',
            'title' => 'nullable|array',
            'title.en' => 'nullable|string|max:255',
            'title.lt' => 'nullable|string|max:255',
            'short_description' => 'nullable|array',
            'short_description.en' => 'nullable|string|max:500',
            'short_description.lt' => 'nullable|string|max:500',
            'description' => 'nullable|array',
            'description.en' => 'nullable|string',
            'description.lt' => 'nullable|string',
            'additional_information' => 'nullable|array',
            'additional_information.en' => 'nullable|string',
            'additional_information.lt' => 'nullable|string',
            'ingredients' => 'nullable|array',
            'ingredients.en' => 'nullable|string',
            'ingredients.lt' => 'nullable|string',
            'meta_title' => 'nullable|array',
            'meta_title.en' => 'nullable|string|max:255',
            'meta_title.lt' => 'nullable|string|max:255',
            'meta_description' => 'nullable|array',
            'meta_description.en' => 'nullable|string|max:500',
            'meta_description.lt' => 'nullable|string|max:500',
            'focus_keyphrase' => 'nullable|array',
            'focus_keyphrase.en' => 'nullable|string|max:255',
            'focus_keyphrase.lt' => 'nullable|string|max:255',

            // Relationships
            'brand_id' => 'nullable|exists:brands,id',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',

            // Status
            'is_active' => 'boolean',
            'is_featured' => 'boolean',

            // Variants
            'variants' => 'required|array|min:1',
            'variants.*.id' => 'nullable|exists:product_variants,id',
            'variants.*.sku' => 'required|string|max:255',
            'variants.*.size' => 'required|integer|min:1',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.compare_at_price' => 'nullable|numeric|min:0',
            'variants.*.stock' => 'required|integer|min:0',
            'variants.*.low_stock_threshold' => 'nullable|integer|min:0',
            'variants.*.is_default' => 'boolean',

            // Variants to delete
            'delete_variant_ids' => 'nullable|array',
            'delete_variant_ids.*' => 'exists:product_variants,id',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->boolean('is_active'),
            'is_featured' => $this->boolean('is_featured'),
        ]);

        // Ensure at least one variant is marked as default
        if ($this->has('variants') && is_array($this->variants)) {
            $variants = $this->variants;
            $hasDefault = false;

            foreach ($variants as $variant) {
                if (!empty($variant['is_default'])) {
                    $hasDefault = true;
                    break;
                }
            }

            if (!$hasDefault && count($variants) > 0) {
                $variants[0]['is_default'] = true;
                $this->merge(['variants' => $variants]);
            }
        }
    }
}
