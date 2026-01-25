<?php

namespace App\Console\Commands;

use App\Mail\RenewalMarketingMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestRenewalEmail extends Command
{
    protected $signature = 'mail:test-renewal {email=test@example.com} {--locale=lt}';
    protected $description = 'Send a test renewal marketing email';

    public function handle(): int
    {
        $email = $this->argument('email');
        $locale = $this->option('locale');

        $this->info("Sending test renewal email to: {$email} (locale: {$locale})");

        Mail::to($email)->send(new RenewalMarketingMail($locale));

        $this->info('Email sent! Check Mailpit at http://localhost:8025');

        return 0;
    }
}
