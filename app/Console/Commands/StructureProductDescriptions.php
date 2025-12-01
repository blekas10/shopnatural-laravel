<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;

class StructureProductDescriptions extends Command
{
    protected $signature = 'products:structure-descriptions {--dry-run : Show what would be changed without saving}';
    protected $description = 'Structure product descriptions with h5 headers and p paragraphs';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('DRY RUN MODE - No changes will be saved');
        }

        $products = Product::all();
        $updated = 0;

        foreach ($products as $product) {
            $changed = false;
            $descriptions = $product->getTranslations('description');

            foreach (['en', 'lt'] as $locale) {
                if (!isset($descriptions[$locale]) || empty($descriptions[$locale])) {
                    continue;
                }

                $original = $descriptions[$locale];
                $structured = $locale === 'en'
                    ? $this->structureEnglish($original)
                    : $this->structureLithuanian($original);

                if ($structured !== $original) {
                    $descriptions[$locale] = $structured;
                    $changed = true;
                }
            }

            if ($changed) {
                $updated++;

                if ($dryRun) {
                    $this->line("Would update: {$product->name}");
                } else {
                    $product->setTranslations('description', $descriptions);
                    $product->save();
                    $this->line("Updated: {$product->name}");
                }
            }
        }

        $this->info("Total products " . ($dryRun ? "would be " : "") . "updated: {$updated}");

        return Command::SUCCESS;
    }

    private function structureEnglish(string $text): string
    {
        // Skip if already structured with h5
        if (str_contains($text, '<h5>')) {
            return $text;
        }

        // Strip existing HTML
        $text = strip_tags($text);
        $text = html_entity_decode($text, ENT_QUOTES, 'UTF-8');
        $text = trim($text);

        if (empty($text)) {
            return $text;
        }

        // Headers to look for (with colon)
        $headers = [
            'Application:' => 'APPLICATION',
            'Features and Benefits:' => 'FEATURES AND BENEFITS',
            'Suitable for:' => 'SUITABLE FOR',
            'Features And Benefits:' => 'FEATURES AND BENEFITS',
        ];

        // Headers without colon (only if followed by uppercase or newline)
        $headersNoColon = [
            'Application' => 'APPLICATION',
            'Features and Benefits' => 'FEATURES AND BENEFITS',
            'Suitable for' => 'SUITABLE FOR',
        ];

        // Replace headers with colon
        foreach ($headers as $search => $replace) {
            $text = preg_replace(
                '/\b' . preg_quote($search, '/') . '\s*/i',
                "\n<h5>{$replace}</h5>\n<p>",
                $text
            );
        }

        // Replace headers without colon (only if followed by uppercase letter or newline)
        foreach ($headersNoColon as $search => $replace) {
            $text = preg_replace(
                '/\b' . preg_quote($search, '/') . '(?=\s*[A-Z\n])/i',
                "\n<h5>{$replace}</h5>\n<p>",
                $text
            );
        }

        // If we added h5 tags, we need to close p tags
        if (str_contains($text, '<h5>')) {
            // Close paragraphs before h5 tags
            $text = preg_replace('/<p>\s*<h5>/', '</p><h5>', $text);

            // Add closing p tag at the end if needed
            if (preg_match('/<p>[^<]*$/', $text)) {
                $text .= '</p>';
            }

            // Clean up empty paragraphs
            $text = preg_replace('/<p>\s*<\/p>/', '', $text);

            // Ensure text starts properly
            $text = preg_replace('/^\s*<\/p>/', '', $text);
            $text = trim($text);

            // If doesn't start with h5, wrap in p
            if (!str_starts_with($text, '<h5>')) {
                $text = '<p>' . $text;
            }
        } else {
            // No headers found, just wrap in paragraph
            $text = '<p>' . $text . '</p>';
        }

        // Clean up multiple newlines and spaces
        $text = preg_replace('/\n{2,}/', "\n", $text);
        $text = preg_replace('/\s+/', ' ', $text);
        $text = str_replace('> <', '><', $text);
        $text = str_replace(' </p>', '</p>', $text);
        $text = str_replace('<p> ', '<p>', $text);

        return trim($text);
    }

    private function structureLithuanian(string $text): string
    {
        // Skip if already structured with h5
        if (str_contains($text, '<h5>')) {
            return $text;
        }

        // Strip existing HTML
        $text = strip_tags($text);
        $text = html_entity_decode($text, ENT_QUOTES, 'UTF-8');
        $text = trim($text);

        if (empty($text)) {
            return $text;
        }

        // Lithuanian headers
        $headers = [
            'Naudojimas:' => 'NAUDOJIMAS',
            'Savybės ir privalumai:' => 'SAVYBĖS IR PRIVALUMAI',
            'Tinka:' => 'TINKA',
            'Sudėtis:' => 'SUDĖTIS',
        ];

        // Headers without colon
        $headersNoColon = [
            'Naudojimas' => 'NAUDOJIMAS',
            'Savybės ir privalumai' => 'SAVYBĖS IR PRIVALUMAI',
            'Tinka' => 'TINKA',
        ];

        // Replace headers with colon
        foreach ($headers as $search => $replace) {
            $text = preg_replace(
                '/\b' . preg_quote($search, '/') . '\s*/iu',
                "\n<h5>{$replace}</h5>\n<p>",
                $text
            );
        }

        // Replace headers without colon
        foreach ($headersNoColon as $search => $replace) {
            $text = preg_replace(
                '/\b' . preg_quote($search, '/') . '(?=\s*[A-ZĄČĘĖĮŠŲŪŽ\n])/iu',
                "\n<h5>{$replace}</h5>\n<p>",
                $text
            );
        }

        // Same cleanup as English
        if (str_contains($text, '<h5>')) {
            $text = preg_replace('/<p>\s*<h5>/', '</p><h5>', $text);

            if (preg_match('/<p>[^<]*$/', $text)) {
                $text .= '</p>';
            }

            $text = preg_replace('/<p>\s*<\/p>/', '', $text);
            $text = preg_replace('/^\s*<\/p>/', '', $text);
            $text = trim($text);

            if (!str_starts_with($text, '<h5>')) {
                $text = '<p>' . $text;
            }
        } else {
            $text = '<p>' . $text . '</p>';
        }

        $text = preg_replace('/\n{2,}/', "\n", $text);
        $text = preg_replace('/\s+/', ' ', $text);
        $text = str_replace('> <', '><', $text);
        $text = str_replace(' </p>', '</p>', $text);
        $text = str_replace('<p> ', '<p>', $text);

        return trim($text);
    }
}
