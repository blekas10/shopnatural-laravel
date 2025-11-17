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
        $productId = $this->route('product')->id;

        return [
            // Basic product info
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:products,slug,' . $productId . '|max:255',
            'title' => 'nullable|string|max:255',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'additional_information' => 'nullable|string',
            'ingredients' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',

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
