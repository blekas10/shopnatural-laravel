<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Brand;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('app.url'), '/');
    }

    /**
     * Generate XML sitemap
     */
    public function index(): Response
    {
        $urls = collect();

        // Add static pages
        $urls = $urls->merge($this->getStaticPages());

        // Add products
        $urls = $urls->merge($this->getProducts());

        // Add categories
        $urls = $urls->merge($this->getCategories());

        // Add brands
        $urls = $urls->merge($this->getBrands());

        $xml = $this->generateXml($urls);

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }

    /**
     * Get static pages with both language versions
     */
    private function getStaticPages(): array
    {
        $pages = [
            // Home
            [
                'loc' => $this->baseUrl,
                'alternates' => [
                    ['hreflang' => 'en', 'href' => $this->baseUrl],
                    ['hreflang' => 'lt', 'href' => "{$this->baseUrl}/lt"],
                    ['hreflang' => 'x-default', 'href' => $this->baseUrl],
                ],
                'priority' => '1.0',
                'changefreq' => 'daily',
            ],
            // About
            [
                'loc' => "{$this->baseUrl}/about",
                'alternates' => [
                    ['hreflang' => 'en', 'href' => "{$this->baseUrl}/about"],
                    ['hreflang' => 'lt', 'href' => "{$this->baseUrl}/lt/apie-mus"],
                ],
                'priority' => '0.8',
                'changefreq' => 'monthly',
            ],
            // Contact
            [
                'loc' => "{$this->baseUrl}/contact",
                'alternates' => [
                    ['hreflang' => 'en', 'href' => "{$this->baseUrl}/contact"],
                    ['hreflang' => 'lt', 'href' => "{$this->baseUrl}/lt/kontaktai"],
                ],
                'priority' => '0.8',
                'changefreq' => 'monthly',
            ],
            // Products listing
            [
                'loc' => "{$this->baseUrl}/products",
                'alternates' => [
                    ['hreflang' => 'en', 'href' => "{$this->baseUrl}/products"],
                    ['hreflang' => 'lt', 'href' => "{$this->baseUrl}/lt/produktai"],
                ],
                'priority' => '0.9',
                'changefreq' => 'daily',
            ],
            // Categories listing
            [
                'loc' => "{$this->baseUrl}/categories",
                'alternates' => [
                    ['hreflang' => 'en', 'href' => "{$this->baseUrl}/categories"],
                    ['hreflang' => 'lt', 'href' => "{$this->baseUrl}/lt/kategorijos"],
                ],
                'priority' => '0.8',
                'changefreq' => 'weekly',
            ],
            // Shipping Policy
            [
                'loc' => "{$this->baseUrl}/shipping-policy",
                'alternates' => [
                    ['hreflang' => 'en', 'href' => "{$this->baseUrl}/shipping-policy"],
                    ['hreflang' => 'lt', 'href' => "{$this->baseUrl}/lt/pristatymo-politika"],
                ],
                'priority' => '0.5',
                'changefreq' => 'monthly',
            ],
            // Return Policy
            [
                'loc' => "{$this->baseUrl}/return-policy",
                'alternates' => [
                    ['hreflang' => 'en', 'href' => "{$this->baseUrl}/return-policy"],
                    ['hreflang' => 'lt', 'href' => "{$this->baseUrl}/lt/grazinimo-politika"],
                ],
                'priority' => '0.5',
                'changefreq' => 'monthly',
            ],
            // Privacy Policy
            [
                'loc' => "{$this->baseUrl}/privacy-policy",
                'alternates' => [
                    ['hreflang' => 'en', 'href' => "{$this->baseUrl}/privacy-policy"],
                    ['hreflang' => 'lt', 'href' => "{$this->baseUrl}/lt/privatumo-politika"],
                ],
                'priority' => '0.4',
                'changefreq' => 'yearly',
            ],
        ];

        return $pages;
    }

    /**
     * Get all active products
     */
    private function getProducts(): array
    {
        $products = Product::where('is_active', true)
            ->select(['id', 'slug', 'updated_at'])
            ->get();

        return $products->map(function ($product) {
            $enSlug = $product->getTranslation('slug', 'en');
            $ltSlug = $product->getTranslation('slug', 'lt');

            return [
                'loc' => "{$this->baseUrl}/products/{$enSlug}",
                'lastmod' => $product->updated_at->toW3cString(),
                'alternates' => [
                    ['hreflang' => 'en', 'href' => "{$this->baseUrl}/products/{$enSlug}"],
                    ['hreflang' => 'lt', 'href' => "{$this->baseUrl}/lt/produktai/{$ltSlug}"],
                ],
                'priority' => '0.8',
                'changefreq' => 'weekly',
            ];
        })->toArray();
    }

    /**
     * Get all active categories
     */
    private function getCategories(): array
    {
        $categories = Category::where('is_active', true)
            ->select(['id', 'slug', 'updated_at'])
            ->get();

        return $categories->map(function ($category) {
            $enSlug = $category->getTranslation('slug', 'en');
            $ltSlug = $category->getTranslation('slug', 'lt');

            return [
                'loc' => "{$this->baseUrl}/categories/{$enSlug}",
                'lastmod' => $category->updated_at->toW3cString(),
                'alternates' => [
                    ['hreflang' => 'en', 'href' => "{$this->baseUrl}/categories/{$enSlug}"],
                    ['hreflang' => 'lt', 'href' => "{$this->baseUrl}/lt/kategorijos/{$ltSlug}"],
                ],
                'priority' => '0.7',
                'changefreq' => 'weekly',
            ];
        })->toArray();
    }

    /**
     * Get all active brands
     */
    private function getBrands(): array
    {
        $brands = Brand::where('is_active', true)
            ->select(['id', 'slug', 'updated_at'])
            ->get();

        return $brands->map(function ($brand) {
            // SEO-optimized brand URLs: /{brand}-cosmetics (EN), /lt/kosmetika-{brand} (LT)
            return [
                'loc' => "{$this->baseUrl}/{$brand->slug}-cosmetics",
                'lastmod' => $brand->updated_at->toW3cString(),
                'alternates' => [
                    ['hreflang' => 'en', 'href' => "{$this->baseUrl}/{$brand->slug}-cosmetics"],
                    ['hreflang' => 'lt', 'href' => "{$this->baseUrl}/lt/kosmetika-{$brand->slug}"],
                ],
                'priority' => '0.7',
                'changefreq' => 'weekly',
            ];
        })->toArray();
    }

    /**
     * Generate XML from URLs array
     */
    private function generateXml(iterable $urls): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' . PHP_EOL;

        foreach ($urls as $url) {
            $xml .= '  <url>' . PHP_EOL;
            $xml .= '    <loc>' . htmlspecialchars($url['loc']) . '</loc>' . PHP_EOL;

            if (!empty($url['lastmod'])) {
                $xml .= '    <lastmod>' . $url['lastmod'] . '</lastmod>' . PHP_EOL;
            }

            if (!empty($url['changefreq'])) {
                $xml .= '    <changefreq>' . $url['changefreq'] . '</changefreq>' . PHP_EOL;
            }

            if (!empty($url['priority'])) {
                $xml .= '    <priority>' . $url['priority'] . '</priority>' . PHP_EOL;
            }

            // Add hreflang alternates for multilingual support
            if (!empty($url['alternates'])) {
                foreach ($url['alternates'] as $alt) {
                    $xml .= '    <xhtml:link rel="alternate" hreflang="' . $alt['hreflang'] . '" href="' . htmlspecialchars($alt['href']) . '" />' . PHP_EOL;
                }
            }

            $xml .= '  </url>' . PHP_EOL;
        }

        $xml .= '</urlset>';

        return $xml;
    }
}
