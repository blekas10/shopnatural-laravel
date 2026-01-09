<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeSocialNotification extends Notification
{
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
        // Set locale for translations
        $previousLocale = app()->getLocale();
        app()->setLocale($this->emailLocale);

        $subject = $this->emailLocale === 'lt'
            ? 'Sveiki atvykę į Shop Natural!'
            : 'Welcome to Shop Natural!';

        // Build the shop URL based on locale
        $shopUrl = $this->emailLocale === 'lt'
            ? config('app.url') . '/lt/produktai'
            : config('app.url') . '/products';

        $mailMessage = (new MailMessage())
            ->subject($subject)
            ->view('emails.welcome-social', [
                'user' => $notifiable,
                'locale' => $this->emailLocale,
                'shopUrl' => $shopUrl,
            ]);

        // Restore previous locale
        app()->setLocale($previousLocale);

        return $mailMessage;
    }
}
