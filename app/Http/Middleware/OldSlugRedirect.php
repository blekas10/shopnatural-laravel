<?php

namespace App\Http\Middleware;

use App\Models\Product;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OldSlugRedirect
{
    public function handle(Request $request, Closure $next): Response
    {
        $slug = $request->route('slug');

        if (!$slug) {
            return $next($request);
        }

        // Determine locale from route
        $locale = str_starts_with($request->path(), 'lt/') ? 'lt' : 'en';

        // First check if current slug exists (fast path)
        $product = Product::where("slug->{$locale}", $slug)->first();

        if ($product) {
            return $next($request);
        }

        // Check old slugs for redirect
        $product = Product::whereRaw(
            "JSON_CONTAINS(old_slugs->'\$.{$locale}', ?)",
            ['"' . $slug . '"']
        )->first();

        if ($product) {
            $newSlug = $product->getTranslation('slug', $locale);

            // Build redirect URL
            if ($locale === 'lt') {
                $redirectUrl = url("/lt/produktai/{$newSlug}");
            } else {
                $redirectUrl = url("/products/{$newSlug}");
            }

            return redirect($redirectUrl, 301);
        }

        return $next($request);
    }
}
