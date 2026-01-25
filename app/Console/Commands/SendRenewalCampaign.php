<?php

namespace App\Console\Commands;

use App\Mail\RenewalMarketingMail;
use App\Models\NewsletterSubscriber;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendRenewalCampaign extends Command
{
    protected $signature = 'campaign:send-renewal
                            {--dry-run : Preview without sending}
                            {--limit= : Limit number of emails to send}';

    protected $description = 'Send renewal marketing email to all active newsletter subscribers';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $limit = $this->option('limit');

        $query = NewsletterSubscriber::where('is_active', true);

        if ($limit) {
            $query->limit((int) $limit);
        }

        $subscribers = $query->get();

        $this->info(($dryRun ? '[DRY RUN] ' : '') . "Sending renewal email to {$subscribers->count()} subscribers...");
        $this->newLine();

        if ($dryRun) {
            foreach ($subscribers as $subscriber) {
                $this->line("Would send to: {$subscriber->email} (locale: {$subscriber->locale})");
            }
            $this->newLine();
            $this->warn('Dry run complete. No emails were sent.');
            $this->info('Run without --dry-run to send emails.');
            return 0;
        }

        if (!$this->confirm("Send renewal email to {$subscribers->count()} subscribers?")) {
            $this->info('Aborted.');
            return 0;
        }

        $bar = $this->output->createProgressBar($subscribers->count());
        $bar->start();

        $sent = 0;
        $failed = 0;

        foreach ($subscribers as $subscriber) {
            try {
                Mail::to($subscriber->email)
                    ->send(new RenewalMarketingMail($subscriber->locale));
                $sent++;
            } catch (\Exception $e) {
                $failed++;
                $this->newLine();
                $this->error("Failed to send to {$subscriber->email}: {$e->getMessage()}");
            }

            $bar->advance();

            // Small delay to avoid rate limiting
            usleep(100000); // 100ms
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Campaign complete!");
        $this->info("Sent: {$sent}");
        if ($failed > 0) {
            $this->warn("Failed: {$failed}");
        }

        return 0;
    }
}
