<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class WelcomeVerificationNotification extends Notification
{
    // Removed Queueable to send immediately with session context

    /**
     * The locale for this notification.
     */
    public string $emailLocale;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $emailLocale = 'en')
    {
        $this->emailLocale = $emailLocale;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        // Set locale for translations
        $previousLocale = app()->getLocale();
        app()->setLocale($this->emailLocale);

        $subject = $this->emailLocale === 'lt'
            ? 'Sveiki atvykę į Shop Natural!'
            : 'Welcome to Shop Natural!';

        $mailMessage = (new MailMessage())
            ->subject($subject)
            ->view('emails.welcome-verification', [
                'url' => $verificationUrl,
                'user' => $notifiable,
                'locale' => $this->emailLocale,
            ]);

        // Restore previous locale
        app()->setLocale($previousLocale);

        return $mailMessage;
    }

    /**
     * Get the verification URL for the given notifiable.
     * Includes locale parameter so user lands on correct language after verification.
     */
    protected function verificationUrl($notifiable): string
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
                'locale' => $this->emailLocale,
            ]
        );
    }
}
