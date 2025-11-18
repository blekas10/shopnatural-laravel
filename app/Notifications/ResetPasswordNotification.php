<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;

class ResetPasswordNotification extends Notification
{
    // Removed Queueable to send immediately with session context

    /**
     * The password reset token.
     */
    public string $token;

    /**
     * The locale for this notification.
     */
    public string $emailLocale;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $token, string $emailLocale = 'en')
    {
        $this->token = $token;
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
        // Build locale-aware URL
        $baseUrl = url('/');
        $localePrefix = $this->emailLocale === 'lt' ? '/lt' : '';
        $resetPath = '/reset-password/' . $this->token;
        $email = $notifiable->getEmailForPasswordReset();

        $url = $baseUrl . $localePrefix . $resetPath . '?email=' . urlencode($email);

        // Set locale for translations
        $previousLocale = app()->getLocale();
        app()->setLocale($this->emailLocale);

        $subject = $this->emailLocale === 'lt'
            ? 'Slaptažodžio atkūrimas'
            : 'Reset Password Notification';

        $mailMessage = (new MailMessage())
            ->subject($subject)
            ->view('emails.reset-password', [
                'url' => $url,
                'user' => $notifiable,
                'locale' => $this->emailLocale,
            ]);

        // Restore previous locale
        app()->setLocale($previousLocale);

        return $mailMessage;
    }
}
