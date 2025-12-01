<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class UpdateProductTranslations extends Command
{
    protected $signature = 'products:update-translations
                            {--dry-run : Show what would be updated without making changes}
                            {--file=products.json : Path to the JSON file with translations}';

    protected $description = 'Update product LT translations from WooCommerce export JSON';

    public function handle(): int
    {
        $filePath = base_path($this->option('file'));
        $dryRun = $this->option('dry-run');

        if (!File::exists($filePath)) {
            $this->error("File not found: {$filePath}");
            return Command::FAILURE;
        }

        $data = json_decode(File::get($filePath), true);

        if (!$data || !isset($data['products'])) {
            $this->error('Invalid JSON structure. Expected "products" array.');
            return Command::FAILURE;
        }

        $this->info($dryRun ? '🔍 DRY RUN MODE - No changes will be made' : '📝 Updating translations...');
        $this->newLine();

        $updated = 0;
        $notFound = 0;
        $skipped = 0;

        $progressBar = $this->output->createProgressBar(count($data['products']));
        $progressBar->start();

        $details = [];

        foreach ($data['products'] as $jsonProduct) {
            $enSlug = $jsonProduct['slug'] ?? null;

            if (!$enSlug) {
                $skipped++;
                $progressBar->advance();
                continue;
            }

            // Match by EN slug in the JSON column
            $product = Product::where('slug->en', $enSlug)->first();

            if (!$product) {
                $notFound++;
                $details[] = "❌ Not found: {$jsonProduct['name']} (slug: {$enSlug})";
                $progressBar->advance();
                continue;
            }

            $changes = [];

            // Update slug
            if (!empty($jsonProduct['lt_slug']) && $product->getTranslation('slug', 'lt', false) !== $jsonProduct['lt_slug']) {
                $changes['slug'] = $jsonProduct['lt_slug'];
            }

            // Update name
            if (!empty($jsonProduct['lt_name']) && $product->getTranslation('name', 'lt', false) !== $jsonProduct['lt_name']) {
                $changes['name'] = $jsonProduct['lt_name'];
            }

            // Update short_description
            if (!empty($jsonProduct['lt_short_description']) && $product->getTranslation('short_description', 'lt', false) !== $jsonProduct['lt_short_description']) {
                $changes['short_description'] = $jsonProduct['lt_short_description'];
            }

            // Update description
            if (!empty($jsonProduct['lt_description']) && $product->getTranslation('description', 'lt', false) !== $jsonProduct['lt_description']) {
                $changes['description'] = $jsonProduct['lt_description'];
            }

            // Update ingredients
            if (!empty($jsonProduct['lt_ingredients']) && $product->getTranslation('ingredients', 'lt', false) !== $jsonProduct['lt_ingredients']) {
                $changes['ingredients'] = $jsonProduct['lt_ingredients'];
            }

            // Update meta_description
            if (!empty($jsonProduct['lt_meta_description']) && $product->getTranslation('meta_description', 'lt', false) !== $jsonProduct['lt_meta_description']) {
                $changes['meta_description'] = $jsonProduct['lt_meta_description'];
            }

            // Update focus_keyphrase
            if (!empty($jsonProduct['lt_focus_keyphrase']) && $product->getTranslation('focus_keyphrase', 'lt', false) !== $jsonProduct['lt_focus_keyphrase']) {
                $changes['focus_keyphrase'] = $jsonProduct['lt_focus_keyphrase'];
            }

            if (empty($changes)) {
                $skipped++;
                $progressBar->advance();
                continue;
            }

            if (!$dryRun) {
                foreach ($changes as $field => $value) {
                    $product->setTranslation($field, 'lt', $value);
                }
                $product->save();
            }

            $updated++;
            $changedFields = implode(', ', array_keys($changes));
            $details[] = "✅ {$product->getTranslation('name', 'en')} - Updated: {$changedFields}";

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        // Show summary
        $this->info('=== SUMMARY ===');
        $this->line("Total in JSON: " . count($data['products']));
        $this->line("Updated: {$updated}");
        $this->line("Not found in DB: {$notFound}");
        $this->line("Skipped (no changes or no SKU): {$skipped}");

        if ($this->option('verbose') || $dryRun) {
            $this->newLine();
            $this->info('=== DETAILS ===');
            foreach ($details as $detail) {
                $this->line($detail);
            }
        }

        if ($dryRun && $updated > 0) {
            $this->newLine();
            $this->warn("Run without --dry-run to apply these changes.");
        }

        return Command::SUCCESS;
    }
}
