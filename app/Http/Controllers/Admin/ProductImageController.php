<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends Controller
{
    /**
     * Upload images for a product
     */
    public function store(Request $request, Product $product)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MB max
        ]);

        $uploadedImages = [];

        foreach ($request->file('images') as $image) {
            // Store in products/{product_id}/ directory
            $path = $image->store("products/{$product->id}", 'public');

            // Get current max order
            $maxOrder = $product->images()->max('order') ?? -1;

            // Create image record
            $productImage = $product->images()->create([
                'path' => $path,
                'alt_text' => ['en' => '', 'lt' => ''],
                'is_primary' => $product->images()->count() === 0, // First image is primary
                'order' => $maxOrder + 1,
            ]);

            $uploadedImages[] = [
                'id' => $productImage->id,
                'url' => $productImage->url,
                'alt_text' => $productImage->alt_text,
                'is_primary' => $productImage->is_primary,
                'order' => $productImage->order,
            ];
        }

        return response()->json([
            'success' => true,
            'images' => $uploadedImages,
        ]);
    }

    /**
     * Delete an image
     */
    public function destroy(Product $product, ProductImage $image)
    {
        // Ensure image belongs to product
        if ($image->product_id !== $product->id) {
            abort(403);
        }

        // Delete file from storage
        Storage::disk('public')->delete($image->path);

        $wasPrimary = $image->is_primary;

        // Delete record
        $image->delete();

        // If was primary, set next image as primary
        if ($wasPrimary) {
            $nextImage = $product->images()->orderBy('order')->first();
            if ($nextImage) {
                $nextImage->update(['is_primary' => true]);
            }
        }

        return response()->json(['success' => true]);
    }

    /**
     * Set an image as primary
     */
    public function setPrimary(Product $product, ProductImage $image)
    {
        // Ensure image belongs to product
        if ($image->product_id !== $product->id) {
            abort(403);
        }

        // Remove primary from all other images
        $product->images()->update(['is_primary' => false]);

        // Set this as primary
        $image->update(['is_primary' => true]);

        return response()->json(['success' => true]);
    }

    /**
     * Update image order
     */
    public function reorder(Request $request, Product $product)
    {
        $request->validate([
            'image_ids' => 'required|array',
            'image_ids.*' => 'required|exists:product_images,id',
        ]);

        foreach ($request->image_ids as $order => $imageId) {
            ProductImage::where('id', $imageId)
                ->where('product_id', $product->id)
                ->update(['order' => $order]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Update image alt text
     */
    public function updateAlt(Request $request, Product $product, ProductImage $image)
    {
        $request->validate([
            'alt_text' => 'required|array',
            'alt_text.en' => 'nullable|string|max:255',
            'alt_text.lt' => 'nullable|string|max:255',
        ]);

        if ($image->product_id !== $product->id) {
            abort(403);
        }

        $image->update(['alt_text' => $request->alt_text]);

        return response()->json(['success' => true]);
    }
}
