<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RenewalMarketingMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $emailLocale;
    public string $promoCode;
    public int $discountPercent;

    public function __construct(
        string $locale = 'lt',
        string $promoCode = 'WELCOME2026',
        int $discountPercent = 12
    ) {
        $this->emailLocale = $locale;
        $this->promoCode = $promoCode;
        $this->discountPercent = $discountPercent;
    }

    public function envelope(): Envelope
    {
        $subject = $this->emailLocale === 'lt'
            ? 'Mes atsinaujinome! Gaukite 12% nuolaidą'
            : "We've Renewed! Get 12% Off Your Order";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.marketing.renewal',
            with: [
                'locale' => $this->emailLocale,
                'promoCode' => $this->promoCode,
                'discountPercent' => $this->discountPercent,
            ]
        );
    }
}
