<?php

namespace App\Mail;

use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class OrderConfirmed extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Order $order,
        public string $emailLocale = 'en'
    ) {
        Log::info('OrderConfirmed: Mailable constructed', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'customer_email' => $order->customer_email,
            'locale' => $emailLocale,
        ]);

        $this->order->load('items.product', 'items.variant');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->emailLocale === 'lt'
            ? 'Užsakymas patvirtintas - ' . $this->order->order_number
            : 'Order Confirmed - ' . $this->order->order_number;

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.order-confirmed',
            with: [
                'order' => $this->order,
                'locale' => $this->emailLocale,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $pdf = Pdf::loadView('emails.invoice-pdf', [
            'order' => $this->order,
            'locale' => $this->emailLocale,
        ]);

        $filename = 'invoice-' . $this->order->order_number . '.pdf';

        return [
            Attachment::fromData(fn () => $pdf->output(), $filename)
                ->withMime('application/pdf'),
        ];
    }
}
