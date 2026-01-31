<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\URL;

class FacebookFeedController extends Controller
{
    /**
     * Generate Facebook Product Catalog feed (CSV format)
     * URL: /feeds/facebook.csv
     */
    public function index(): Response
    {
        $products = Product::with([
            'variants' => fn($q) => $q->where('is_active', true),
            'primaryImage',
            'images',
            'brand',
            'categories',
        ])
            ->where('is_active', true)
            ->get();

        $csv = $this->generateCsv($products);

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'inline; filename="facebook-feed.csv"',
        ]);
    }

    private function generateCsv($products): string
    {
        // Facebook required columns
        $headers = [
            'id',
            'title',
            'description',
            'availability',
            'condition',
            'price',
            'sale_price',
            'link',
            'image_link',
            'brand',
            'google_product_category',
            'product_type',
            'item_group_id',
            'size',
        ];

        $rows = [];
        $rows[] = implode(',', $headers);

        foreach ($products as $product) {
            foreach ($product->variants as $variant) {
                $row = $this->buildProductRow($product, $variant);
                $rows[] = $this->arrayToCsvLine($row);
            }
        }

        return implode("\n", $rows);
    }

    private function buildProductRow(Product $product, $variant): array
    {
        // Get primary image or first image
        $image = $product->primaryImage ?? $product->images->first();
        $imageUrl = $image ? URL::to('/storage/' . $image->path) : '';

        // Get product URL (Lithuanian locale for now)
        $productUrl = URL::to('/lt/produktai/' . $product->getTranslation('slug', 'lt'));

        // Get category for product type
        $category = $product->categories->first();
        $productType = $category ? $category->getTranslation('name', 'lt') : 'Kosmetika';

        // Determine availability
        $availability = $variant->inStock() ? 'in stock' : 'out of stock';

        // Price formatting (Facebook requires "XX.XX EUR" format)
        $price = number_format($variant->price, 2, '.', '') . ' EUR';
        $salePrice = '';

        if ($variant->isOnSale() && $variant->compare_at_price) {
            // If on sale, the current price is sale price, compare_at is original
            $salePrice = $price;
            $price = number_format($variant->compare_at_price, 2, '.', '') . ' EUR';
        }

        return [
            'id' => $variant->sku ?: "product-{$product->id}-{$variant->id}",
            'title' => $this->sanitize($product->getTranslation('name', 'lt') . ($variant->size ? " - {$variant->size}" : '')),
            'description' => $this->sanitize($product->getTranslation('short_description', 'lt') ?: $product->getTranslation('description', 'lt') ?: $product->getTranslation('name', 'lt')),
            'availability' => $availability,
            'condition' => 'new',
            'price' => $price,
            'sale_price' => $salePrice,
            'link' => $productUrl,
            'image_link' => $imageUrl,
            'brand' => $product->brand ? $this->sanitize($product->brand->name) : 'Shop Natural',
            'google_product_category' => '469', // Health & Beauty > Personal Care > Cosmetics
            'product_type' => $this->sanitize($productType),
            'item_group_id' => "product-{$product->id}",
            'size' => $variant->size ?: '',
        ];
    }

    private function sanitize(?string $text): string
    {
        if (!$text) {
            return '';
        }

        // Remove HTML tags
        $text = strip_tags($text);

        // Remove newlines and extra spaces
        $text = preg_replace('/\s+/', ' ', $text);

        // Trim
        $text = trim($text);

        return $text;
    }

    private function arrayToCsvLine(array $row): string
    {
        $escaped = array_map(function ($value) {
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            $value = str_replace('"', '""', $value);
            if (preg_match('/[,"\n\r]/', $value)) {
                return '"' . $value . '"';
            }
            return $value;
        }, $row);

        return implode(',', $escaped);
    }
}
