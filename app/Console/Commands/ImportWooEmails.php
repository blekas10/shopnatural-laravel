<?php

namespace App\Console\Commands;

use App\Models\NewsletterSubscriber;
use Illuminate\Console\Command;

class ImportWooEmails extends Command
{
    protected $signature = 'import:woo-emails {file : Path to CSV file}';
    protected $description = 'Import customer emails from WooCommerce CSV export';

    public function handle(): int
    {
        $file = $this->argument('file');

        if (!file_exists($file)) {
            $this->error("File not found: {$file}");
            return 1;
        }

        $handle = fopen($file, 'r');
        if (!$handle) {
            $this->error("Could not open file: {$file}");
            return 1;
        }

        $header = fgetcsv($handle); // Skip header row
        $imported = 0;
        $skipped = 0;

        while (($row = fgetcsv($handle)) !== false) {
            $email = trim($row[0]);

            if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $skipped++;
                continue;
            }

            $existing = NewsletterSubscriber::where('email', $email)->first();

            if ($existing) {
                // Reactivate if inactive
                if (!$existing->is_active) {
                    $existing->update(['is_active' => true]);
                    $this->line("Reactivated: {$email}");
                    $imported++;
                } else {
                    $skipped++;
                }
                continue;
            }

            NewsletterSubscriber::create([
                'email' => $email,
                'locale' => 'lt',
                'is_active' => true,
            ]);

            $imported++;
        }

        fclose($handle);

        $this->info("Import complete: {$imported} imported, {$skipped} skipped");
        return 0;
    }
}
