<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmailTemplate extends Command
{
    protected $signature = 'email:test
                            {type=welcome : Email type (welcome, reset, order, contact)}
                            {--email=test@test.com : Email address to send to}
                            {--locale=en : Language (en or lt)}';

    protected $description = 'Send test emails to preview templates (welcome, reset, order, contact)';

    public function handle(): int
    {
        $type = $this->argument('type');
        $email = $this->option('email');
        $locale = $this->option('locale');

        $this->info("Sending test '{$type}' email to: {$email} (locale: {$locale})");

        try {
            match ($type) {
                'welcome' => $this->sendWelcomeEmail($email, $locale),
                'reset' => $this->sendResetEmail($email, $locale),
                'order' => $this->sendOrderEmail($email, $locale),
                'contact' => $this->sendContactEmail($email),
                default => throw new \InvalidArgumentException("Unknown email type: {$type}"),
            };

            $this->info('Email sent successfully! Check your Mailpit inbox.');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to send email: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

    private function sendWelcomeEmail(string $email, string $locale): void
    {
        $user = new User(['name' => 'Test User', 'email' => $email]);
        $url = config('app.url') . '/verify-email/test-token';

        Mail::send('emails.welcome-verification', [
            'user' => $user,
            'url' => $url,
            'locale' => $locale,
        ], function ($message) use ($email, $locale) {
            $subject = $locale === 'lt'
                ? 'Sveiki atvykę į Shop Natural - Patvirtinkite el. paštą'
                : 'Welcome to Shop Natural - Verify Your Email';
            $message->to($email)->subject($subject);
        });
    }

    private function sendResetEmail(string $email, string $locale): void
    {
        $url = config('app.url') . '/reset-password/test-token';

        Mail::send('emails.reset-password', [
            'url' => $url,
            'locale' => $locale,
        ], function ($message) use ($email, $locale) {
            $subject = $locale === 'lt'
                ? 'Atkurti slaptažodį - Shop Natural'
                : 'Reset Password - Shop Natural';
            $message->to($email)->subject($subject);
        });
    }

    private function sendOrderEmail(string $email, string $locale): void
    {
        // Create a fake order object for testing
        $order = new \stdClass();
        $order->order_number = 'SN-2024-00123';
        $order->shipping_first_name = 'Jonas';
        $order->created_at = now();
        $order->payment_status = 'paid';
        $order->shipping_method = 'courier';
        $order->shipping_street_address = 'Gedimino pr. 1';
        $order->shipping_apartment = '5';
        $order->shipping_city = 'Vilnius';
        $order->shipping_postal_code = 'LT-01103';
        $order->shipping_country = 'Lithuania';
        $order->venipak_pickup_point = null;
        $order->subtotal = 45.00;
        $order->shipping_cost = 3.99;
        $order->discount = 0;
        $order->tax = 10.29;
        $order->total = 59.28;

        // Create fake order items
        $item1 = new \stdClass();
        $item1->product_name = 'Naturalmente Shampoo';
        $item1->variant_size = '250ml';
        $item1->product_sku = 'NSC001';
        $item1->quantity = 2;
        $item1->total = 25.00;

        $item2 = new \stdClass();
        $item2->product_name = 'Organic Face Cream';
        $item2->variant_size = '50ml';
        $item2->product_sku = 'NSC024';
        $item2->quantity = 1;
        $item2->total = 20.00;

        $order->items = [$item1, $item2];

        Mail::send('emails.order-confirmed', [
            'order' => $order,
            'locale' => $locale,
        ], function ($message) use ($email, $locale) {
            $subject = $locale === 'lt'
                ? 'Užsakymas patvirtintas - Shop Natural'
                : 'Order Confirmed - Shop Natural';
            $message->to($email)->subject($subject);
        });
    }

    private function sendContactEmail(string $email): void
    {
        Mail::send('emails.contact-form', [
            'senderName' => 'John Smith',
            'senderEmail' => 'john@example.com',
            'formSubject' => 'Question about products',
            'messageContent' => "Hello,\n\nI would like to know more about your natural cosmetics range.\n\nDo you ship internationally?\n\nThank you,\nJohn",
        ], function ($message) use ($email) {
            $message->to($email)->subject('New Contact Form Submission - Shop Natural');
        });
    }
}
