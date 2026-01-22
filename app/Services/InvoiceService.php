<?php

namespace App\Services;

use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class InvoiceService
{
    /**
     * Generate and store invoice PDF for an order
     * Called when payment is confirmed
     */
    public function generateAndStore(Order $order, string $locale = 'en'): ?string
    {
        try {
            // Generate the PDF
            $pdf = Pdf::loadView('emails.invoice-pdf', [
                'order' => $order,
                'locale' => $locale,
            ]);

            // Create filename based on invoice number or order number
            $invoiceNumber = $order->invoice_number ?? $order->order_number;
            $filename = "invoices/{$invoiceNumber}-{$locale}.pdf";

            // Store the PDF
            Storage::disk('local')->put($filename, $pdf->output());

            // Update order with invoice path
            $order->update(['invoice_path' => $filename]);

            Log::info('Invoice PDF stored', [
                'order_id' => $order->id,
                'invoice_number' => $invoiceNumber,
                'path' => $filename,
            ]);

            return $filename;
        } catch (\Exception $e) {
            Log::error('Failed to store invoice PDF', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Get stored invoice PDF path for an order
     */
    public function getStoredPath(Order $order, string $locale = 'en'): ?string
    {
        // Check if we have a stored path
        if ($order->invoice_path && Storage::disk('local')->exists($order->invoice_path)) {
            return $order->invoice_path;
        }

        // Try to find by invoice number
        $invoiceNumber = $order->invoice_number ?? $order->order_number;
        $filename = "invoices/{$invoiceNumber}-{$locale}.pdf";

        if (Storage::disk('local')->exists($filename)) {
            return $filename;
        }

        return null;
    }

    /**
     * Generate invoice for both locales (EN and LT)
     */
    public function generateBothLocales(Order $order): void
    {
        $this->generateAndStore($order, 'en');
        $this->generateAndStore($order, 'lt');
    }

    /**
     * Get or generate invoice PDF
     */
    public function getOrGenerate(Order $order, string $locale = 'en'): string
    {
        $path = $this->getStoredPath($order, $locale);

        if ($path) {
            return Storage::disk('local')->get($path);
        }

        // Generate on-the-fly if not stored
        $pdf = Pdf::loadView('emails.invoice-pdf', [
            'order' => $order,
            'locale' => $locale,
        ]);

        // Store for future use
        $this->generateAndStore($order, $locale);

        return $pdf->output();
    }
}
