<?php

use App\Models\Brand;
use App\Models\Product;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Comprehensive SEO data fix for all products.
     * Follows 2025 SEO best practices:
     * - Meta titles: 30-60 characters
     * - Meta descriptions: 120-160 characters
     * - Focus keyphrases: 2-4 words, brand + product type
     */
    public function up(): void
    {
        // Load all brands for keyphrase generation
        $brands = Brand::with('parent')->get()->keyBy('id');

        Product::with('brand.parent')->chunk(50, function ($products) use ($brands) {
            foreach ($products as $product) {
                $updates = [];
                $metaTitleTranslations = $product->getTranslations('meta_title');
                $metaDescTranslations = $product->getTranslations('meta_description');
                $focusKeyphraseTranslations = $product->getTranslations('focus_keyphrase');
                $nameTranslations = $product->getTranslations('name');
                $shortDescTranslations = $product->getTranslations('short_description');

                // Get brand info for keyphrase
                $brand = $product->brand;
                $parentBrand = $brand?->parent;
                $brandNameEn = $parentBrand?->getTranslation('name', 'en') ?? $brand?->getTranslation('name', 'en') ?? '';
                $brandNameLt = $parentBrand?->getTranslation('name', 'lt') ?? $brand?->getTranslation('name', 'lt') ?? '';

                // ============================================
                // FIX 1: Missing LT meta_title
                // ============================================
                if (empty($metaTitleTranslations['lt']) && !empty($nameTranslations['lt'])) {
                    $ltName = $nameTranslations['lt'];
                    // Optimize length: should be 30-60 chars
                    if (mb_strlen($ltName) > 60) {
                        // Truncate smartly at word boundary
                        $ltName = $this->truncateAtWord($ltName, 57) . '...';
                    }
                    $metaTitleTranslations['lt'] = $ltName;
                    $updates['meta_title'] = $metaTitleTranslations;
                }

                // ============================================
                // FIX 2: Optimize EN meta_title length
                // ============================================
                if (!empty($metaTitleTranslations['en'])) {
                    $enTitle = $metaTitleTranslations['en'];
                    $changed = false;

                    // Too long (>60 chars) - truncate
                    if (mb_strlen($enTitle) > 60) {
                        $enTitle = $this->truncateAtWord($enTitle, 57) . '...';
                        $changed = true;
                    }
                    // Too short (<30 chars) - try to add brand
                    elseif (mb_strlen($enTitle) < 30 && !empty($brandNameEn)) {
                        // Only add brand if it's not already in the title
                        if (stripos($enTitle, $brandNameEn) === false) {
                            $enTitle = $brandNameEn . ' ' . $enTitle;
                            $changed = true;
                        }
                    }

                    if ($changed) {
                        $metaTitleTranslations['en'] = $enTitle;
                        $updates['meta_title'] = $metaTitleTranslations;
                    }
                }

                // ============================================
                // FIX 3: Missing LT meta_description
                // ============================================
                if (empty($metaDescTranslations['lt'])) {
                    $ltDesc = '';

                    // Try short_description first
                    if (!empty($shortDescTranslations['lt'])) {
                        $ltDesc = strip_tags($shortDescTranslations['lt']);
                    }
                    // Fallback to main description
                    elseif ($descLt = $product->getTranslation('description', 'lt')) {
                        $ltDesc = strip_tags($descLt);
                    }

                    if (!empty($ltDesc)) {
                        // Optimize length: 120-160 chars
                        $ltDesc = $this->optimizeMetaDescription($ltDesc);
                        $metaDescTranslations['lt'] = $ltDesc;
                        $updates['meta_description'] = $metaDescTranslations;
                    }
                }

                // ============================================
                // FIX 4: Optimize EN meta_description length
                // ============================================
                if (!empty($metaDescTranslations['en'])) {
                    $enDesc = $metaDescTranslations['en'];
                    $originalLen = mb_strlen($enDesc);

                    // Only optimize if too short or too long
                    if ($originalLen < 120 || $originalLen > 160) {
                        $enDesc = $this->optimizeMetaDescription($enDesc);

                        // If still too short, try to expand from short_description
                        if (mb_strlen($enDesc) < 120 && !empty($shortDescTranslations['en'])) {
                            $shortDesc = strip_tags($shortDescTranslations['en']);
                            if (mb_strlen($shortDesc) > mb_strlen($enDesc)) {
                                $enDesc = $this->optimizeMetaDescription($shortDesc);
                            }
                        }

                        if ($enDesc !== $metaDescTranslations['en']) {
                            $metaDescTranslations['en'] = $enDesc;
                            $updates['meta_description'] = $metaDescTranslations;
                        }
                    }
                }

                // ============================================
                // FIX 5: Generate focus_keyphrase (EN)
                // ============================================
                if (empty($focusKeyphraseTranslations['en']) && !empty($nameTranslations['en'])) {
                    $keyphrase = $this->generateKeyphrase($nameTranslations['en'], $brandNameEn, 'en');
                    if ($keyphrase) {
                        $focusKeyphraseTranslations['en'] = $keyphrase;
                        $updates['focus_keyphrase'] = $focusKeyphraseTranslations;
                    }
                }

                // ============================================
                // FIX 6: Generate focus_keyphrase (LT)
                // ============================================
                if (empty($focusKeyphraseTranslations['lt']) && !empty($nameTranslations['lt'])) {
                    $keyphrase = $this->generateKeyphrase($nameTranslations['lt'], $brandNameLt, 'lt');
                    if ($keyphrase) {
                        $focusKeyphraseTranslations['lt'] = $keyphrase;
                        if (!isset($updates['focus_keyphrase'])) {
                            $updates['focus_keyphrase'] = $focusKeyphraseTranslations;
                        } else {
                            $updates['focus_keyphrase']['lt'] = $keyphrase;
                        }
                    }
                }

                // Apply updates
                if (!empty($updates)) {
                    foreach ($updates as $field => $value) {
                        $product->setTranslations($field, $value);
                    }
                    $product->save();
                }
            }
        });

        // ============================================
        // FIX 7: Fix duplicate meta descriptions
        // ============================================
        $this->fixDuplicateMetaDescriptions();
    }

    /**
     * Truncate text at word boundary
     */
    private function truncateAtWord(string $text, int $maxLength): string
    {
        if (mb_strlen($text) <= $maxLength) {
            return $text;
        }

        $truncated = mb_substr($text, 0, $maxLength);
        $lastSpace = mb_strrpos($truncated, ' ');

        if ($lastSpace !== false && $lastSpace > $maxLength * 0.7) {
            return mb_substr($truncated, 0, $lastSpace);
        }

        return $truncated;
    }

    /**
     * Optimize meta description to 120-160 characters
     */
    private function optimizeMetaDescription(string $text): string
    {
        $text = trim($text);
        $len = mb_strlen($text);

        // Perfect length
        if ($len >= 120 && $len <= 160) {
            return $text;
        }

        // Too long - truncate at sentence or word boundary
        if ($len > 160) {
            // Try to find sentence end before 160
            $sentences = preg_split('/(?<=[.!?])\s+/', $text);
            $result = '';
            foreach ($sentences as $sentence) {
                if (mb_strlen($result . ' ' . $sentence) <= 160) {
                    $result = trim($result . ' ' . $sentence);
                } else {
                    break;
                }
            }

            // If no good sentence boundary, truncate at word
            if (mb_strlen($result) < 100) {
                $result = $this->truncateAtWord($text, 157) . '...';
            }

            return $result;
        }

        // Too short - just return as is (can't extend without context)
        return $text;
    }

    /**
     * Generate focus keyphrase from product name and brand
     * Best practice: 2-4 words, include brand name
     */
    private function generateKeyphrase(string $name, string $brand, string $locale): string
    {
        // Remove brand name from product name if it starts with it
        $cleanName = $name;
        if (!empty($brand) && stripos($name, $brand) === 0) {
            $cleanName = trim(substr($name, strlen($brand)));
        }

        // Extract key product words (remove common filler words)
        $fillerWordsEn = ['the', 'a', 'an', 'and', 'or', 'for', 'with', 'in', 'of', 'to', 'by'];
        $fillerWordsLt = ['ir', 'su', 'be', 'nuo', 'iki', 'per', 'apie', 'prie'];
        $fillerWords = $locale === 'lt' ? $fillerWordsLt : $fillerWordsEn;

        $words = preg_split('/[\s,\-&]+/', strtolower($cleanName));
        $keyWords = array_filter($words, function ($word) use ($fillerWords) {
            return strlen($word) > 2 && !in_array($word, $fillerWords);
        });

        // Take first 2-3 significant words
        $keyWords = array_slice(array_values($keyWords), 0, 3);

        // Build keyphrase: brand + key words
        $keyphrase = strtolower($brand);
        if (!empty($keyWords)) {
            $keyphrase .= ' ' . implode(' ', $keyWords);
        }

        return trim($keyphrase);
    }

    /**
     * Fix products with duplicate meta descriptions by making them unique
     */
    private function fixDuplicateMetaDescriptions(): void
    {
        // Group 1: Hand Creams (Vanilla, Mango, Citrus)
        $handCreams = [
            129 => ['variant' => 'Vanilla', 'variantLt' => 'Vanilės'],
            130 => ['variant' => 'Mango', 'variantLt' => 'Mango'],
            139 => ['variant' => 'Citrus', 'variantLt' => 'Citrusų'],
        ];

        foreach ($handCreams as $productId => $data) {
            $product = Product::find($productId);
            if ($product) {
                $metaDesc = $product->getTranslations('meta_description');
                $metaDesc['en'] = "Nourishing {$data['variant']} scented hand cream that moisturizes and protects. Natural formula for soft, smooth hands.";
                $metaDesc['lt'] = "Maitinantis {$data['variantLt']} aromato rankų kremas, kuris drėkina ir apsaugo. Natūrali formulė švelniai, lygiai odai.";
                $product->setTranslations('meta_description', $metaDesc);
                $product->save();
            }
        }

        // Group 2: Pigmented Shampoos
        $shampoos = [
            156 => ['variant' => 'Dark Shadow', 'variantLt' => 'Dark Shadow', 'color' => 'dark', 'colorLt' => 'tamsiems'],
            157 => ['variant' => 'Silver Shadow', 'variantLt' => 'Silver Shadow', 'color' => 'silver/gray', 'colorLt' => 'sidabriniams/pilkiems'],
            158 => ['variant' => 'Glossy', 'variantLt' => 'Glossy', 'color' => 'glossy', 'colorLt' => 'blizgiems'],
        ];

        foreach ($shampoos as $productId => $data) {
            $product = Product::find($productId);
            if ($product) {
                $metaDesc = $product->getTranslations('meta_description');
                $metaDesc['en'] = "Revitalizing {$data['variant']} pigmented shampoo enhances {$data['color']} hair color and adds shine. Professional salon quality.";
                $metaDesc['lt'] = "Atgaivinantis {$data['variantLt']} pigmentinis šampūnas sustiprina {$data['colorLt']} plaukų spalvą ir suteikia blizgesio.";
                $product->setTranslations('meta_description', $metaDesc);
                $product->save();
            }
        }

        // Group 3: Pigmented Conditioners (10 products)
        $conditioners = [
            159 => ['variant' => 'Warm Blond', 'variantLt' => 'Warm Blond', 'target' => 'warm blonde tones', 'targetLt' => 'šiltiems blondiniams atspalviams'],
            160 => ['variant' => 'Ice Blond', 'variantLt' => 'Ice Blond', 'target' => 'cool blonde and platinum hair', 'targetLt' => 'šaltiems blondiniams ir platinos plaukams'],
            161 => ['variant' => 'Mahogany', 'variantLt' => 'Mahogany', 'target' => 'rich mahogany shades', 'targetLt' => 'sodriam raudonmedžio atspalviui'],
            162 => ['variant' => 'Fire Red', 'variantLt' => 'Fire Red', 'target' => 'vibrant red and copper hair', 'targetLt' => 'ryškiems raudoniems ir variniams plaukams'],
            163 => ['variant' => 'Violet', 'variantLt' => 'Violet', 'target' => 'violet and purple tones', 'targetLt' => 'violetiniams ir purpuriniams atspalviams'],
            164 => ['variant' => 'Copper', 'variantLt' => 'Copper', 'target' => 'warm copper shades', 'targetLt' => 'šiltiems variniams atspalviams'],
            165 => ['variant' => 'Neutral Shades', 'variantLt' => 'Neutral Shades', 'target' => 'neutral and natural tones', 'targetLt' => 'neutraliems ir natūraliems atspalviams'],
            166 => ['variant' => 'Black Chocolate', 'variantLt' => 'Black Chocolate', 'target' => 'deep black and chocolate hair', 'targetLt' => 'giliems juodiems ir šokoladiniams plaukams'],
            167 => ['variant' => 'Ash Brown', 'variantLt' => 'Ash Brown', 'target' => 'cool ash brown shades', 'targetLt' => 'šaltiems peleniniams rudos atspalviams'],
            168 => ['variant' => 'Vanilla', 'variantLt' => 'Vanilla', 'target' => 'soft vanilla blonde tones', 'targetLt' => 'švelniems vanilės blondiniams atspalviams'],
        ];

        foreach ($conditioners as $productId => $data) {
            $product = Product::find($productId);
            if ($product) {
                $metaDesc = $product->getTranslations('meta_description');
                $metaDesc['en'] = "{$data['variant']} pigmented conditioner refreshes color and revitalizes shine. Perfect for {$data['target']}.";
                $metaDesc['lt'] = "{$data['variantLt']} pigmentinis kondicionierius atgaivina spalvą ir blizgesį. Puikiai tinka {$data['targetLt']}.";
                $product->setTranslations('meta_description', $metaDesc);
                $product->save();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot easily reverse SEO optimizations
        // Would need to restore from backup
    }
};
