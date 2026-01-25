<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class RegenerateSlugs extends Command
{
    protected $signature = 'slugs:regenerate
                            {--dry-run : Preview changes without applying}
                            {--force : Skip confirmation}';

    protected $description = 'Regenerate product slugs from titles (EN and LT)';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $products = Product::all();
        $changes = [];

        foreach ($products as $product) {
            $nameEn = $product->getTranslation('name', 'en');
            $nameLt = $product->getTranslation('name', 'lt');
            $currentSlugEn = $product->getTranslation('slug', 'en');
            $currentSlugLt = $product->getTranslation('slug', 'lt');

            $newSlugEn = Str::slug($nameEn);
            $newSlugLt = Str::slug($nameLt);

            // Check for duplicates and append suffix if needed
            $newSlugEn = $this->ensureUniqueSlug($newSlugEn, 'en', $product->id);
            $newSlugLt = $this->ensureUniqueSlug($newSlugLt, 'lt', $product->id);

            $enChanged = $currentSlugEn !== $newSlugEn;
            $ltChanged = $currentSlugLt !== $newSlugLt;

            if ($enChanged || $ltChanged) {
                $changes[] = [
                    'product' => $product,
                    'en_current' => $currentSlugEn,
                    'en_new' => $newSlugEn,
                    'en_changed' => $enChanged,
                    'lt_current' => $currentSlugLt,
                    'lt_new' => $newSlugLt,
                    'lt_changed' => $ltChanged,
                ];
            }
        }

        if (empty($changes)) {
            $this->info('No slug changes needed. All slugs match their titles.');
            return 0;
        }

        // Display changes
        $this->info(($dryRun ? '[DRY RUN] ' : '') . count($changes) . ' products will be updated:');
        $this->newLine();

        foreach ($changes as $change) {
            $this->line("ID {$change['product']->id}: {$change['product']->getTranslation('name', 'en')}");
            if ($change['en_changed']) {
                $this->line("  <fg=red>EN: {$change['en_current']}</>");
                $this->line("  <fg=green>EN: {$change['en_new']}</>");
            }
            if ($change['lt_changed']) {
                $this->line("  <fg=red>LT: {$change['lt_current']}</>");
                $this->line("  <fg=green>LT: {$change['lt_new']}</>");
            }
            $this->newLine();
        }

        if ($dryRun) {
            $this->warn('This was a dry run. No changes were made.');
            $this->info('Run without --dry-run to apply changes.');
            return 0;
        }

        // Confirm before applying
        if (!$this->option('force') && !$this->confirm('Apply these changes?')) {
            $this->info('Aborted.');
            return 0;
        }

        // Apply changes
        $bar = $this->output->createProgressBar(count($changes));
        $bar->start();

        foreach ($changes as $change) {
            $product = $change['product'];

            // Store old slugs for redirects
            $oldSlugs = $product->old_slugs ?? ['en' => [], 'lt' => []];

            if ($change['en_changed'] && !in_array($change['en_current'], $oldSlugs['en'] ?? [])) {
                $oldSlugs['en'][] = $change['en_current'];
            }
            if ($change['lt_changed'] && !in_array($change['lt_current'], $oldSlugs['lt'] ?? [])) {
                $oldSlugs['lt'][] = $change['lt_current'];
            }

            // Update product
            $product->old_slugs = $oldSlugs;

            if ($change['en_changed']) {
                $product->setTranslation('slug', 'en', $change['en_new']);
            }
            if ($change['lt_changed']) {
                $product->setTranslation('slug', 'lt', $change['lt_new']);
            }

            $product->save();
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info('Done! ' . count($changes) . ' products updated.');
        $this->info('Old slugs stored for 301 redirects.');

        return 0;
    }

    private function ensureUniqueSlug(string $slug, string $locale, int $excludeId): string
    {
        $original = $slug;
        $counter = 2;

        while ($this->slugExists($slug, $locale, $excludeId)) {
            $slug = $original . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    private function slugExists(string $slug, string $locale, int $excludeId): bool
    {
        return Product::where('id', '!=', $excludeId)
            ->where("slug->{$locale}", $slug)
            ->exists();
    }
}
