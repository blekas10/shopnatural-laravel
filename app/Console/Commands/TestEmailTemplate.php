<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmailTemplate extends Command
{
    protected $signature = 'email:test {email? : Email address to send to} {--locale=en : Language (en or lt)}';
    protected $description = 'Send a test welcome verification email to preview the template';

    public function handle(): int
    {
        $email = $this->argument('email') ?? 'test@example.com';
        $locale = $this->option('locale');

        $this->info("Sending test welcome email to: {$email} (locale: {$locale})");

        // Create a fake user for testing
        $user = new User([
            'name' => 'Test User',
            'email' => $email,
        ]);

        $url = config('app.url') . '/verify-email/test-token';

        try {
            Mail::send('emails.welcome-verification', [
                'user' => $user,
                'url' => $url,
                'locale' => $locale,
            ], function ($message) use ($email, $locale) {
                $subject = $locale === 'lt'
                    ? 'Sveiki atvykę į Shop Natural - Patvirtinkite el. paštą'
                    : 'Welcome to Shop Natural - Verify Your Email';

                $message->to($email)
                    ->subject($subject);
            });

            $this->info('Email sent successfully! Check your Mailtrap inbox.');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to send email: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
