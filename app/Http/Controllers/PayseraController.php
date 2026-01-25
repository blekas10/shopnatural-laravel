<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\InvoiceService;
use App\Services\PromoCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use WebToPay;

class PayseraController extends Controller
{
    /**
     * Handle payment callback from Paysera
     */
    public function callback(Request $request)
    {
        // Log raw request data for debugging
        Log::info('Paysera callback RAW request', [
            'all_data' => $request->all(),
            'method' => $request->method(),
            'url' => $request->fullUrl(),
        ]);

        try {
            // Validate callback data
            $response = WebToPay::validateAndParseData(
                $request->all(),
                config('paysera.project_id'),
                config('paysera.sign_password')
            );

            Log::info('Paysera callback received', [
                'order_number' => $response['orderid'],
                'status' => $response['status'],
                'amount' => $response['amount'],
            ]);

            // Find order by order_number (more reliable than database ID)
            $order = Order::where('order_number', $response['orderid'])->first();

            if (!$order) {
                Log::error('Paysera callback: Order not found', ['order_number' => $response['orderid']]);
                return response('Order not found', 404);
            }

            // Check payment status
            if ($response['status'] == '1') {
                // Payment successful
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'confirmed',
                    'payment_intent_id' => $response['requestid'] ?? null,
                ]);

                // Assign invoice number for paid orders (order number already assigned at checkout)
                $order->assignInvoiceNumber();

                // Generate and store invoice PDFs for both locales
                $invoiceService = app(InvoiceService::class);
                $invoiceService->generateBothLocales($order);

                // Confirm promo code usage now that payment is complete
                $promoCodeService = app(PromoCodeService::class);
                $promoCodeService->confirmUsage($order);

                Log::info('Paysera payment successful', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'invoice_number' => $order->invoice_number,
                    'invoice_path' => $order->invoice_path,
                ]);

                // Send confirmation emails
                Log::info('Paysera: About to send confirmation emails', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_email' => $order->customer_email,
                    'order_exists' => Order::where('id', $order->id)->exists(),
                ]);

                $order->sendOrderConfirmationEmails();

                Log::info('Paysera: Confirmation emails dispatched', [
                    'order_id' => $order->id,
                ]);

                // Venipak shipment is created manually via admin panel
            } elseif ($response['status'] == '0') {
                // Payment not executed yet
                Log::info('Paysera payment not executed', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                ]);
            } elseif ($response['status'] == '2') {
                // Payment accepted but needs additional confirmation - keep as pending
                Log::info('Paysera payment awaiting confirmation', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                ]);
            } elseif ($response['status'] == '3') {
                // Additional information received - don't change status, just log
                // This callback just provides buyer info, payment may already be confirmed
                Log::info('Paysera additional info received', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'current_status' => $order->payment_status,
                ]);
            } else {
                // Unknown status - only mark as failed if not already paid
                if ($order->payment_status !== 'paid') {
                    $order->update(['payment_status' => 'failed']);
                }

                Log::warning('Paysera unknown status', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $response['status'],
                ]);
            }

            return response('OK', 200);
        } catch (\WebToPayException $e) {
            Log::error('Paysera callback error', [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
            ]);

            return response('Callback validation failed', 400);
        } catch (\Exception $e) {
            Log::error('Paysera callback: Unexpected error', [
                'error' => $e->getMessage(),
            ]);

            return response('Internal server error', 500);
        }
    }

    /**
     * Handle successful payment redirect
     */
    public function accept(Request $request)
    {
        try {
            // Validate data
            $response = WebToPay::validateAndParseData(
                $request->all(),
                config('paysera.project_id'),
                config('paysera.sign_password')
            );

            $orderNumber = $response['orderid'];

            // Get order by order_number
            $order = Order::where('order_number', $orderNumber)->first();
            $locale = $order?->locale ?? config('app.locale');

            // Use order_number for redirect
            $orderIdentifier = $orderNumber;

            return redirect()->route($locale . '.order.confirmation', ['orderNumber' => $orderIdentifier]);
        } catch (\WebToPayException $e) {
            Log::error('Paysera accept error', ['error' => $e->getMessage()]);
            return redirect()->route('checkout')->with('error', __('checkout.payment_validation_failed'));
        }
    }

    /**
     * Handle cancelled/failed payment redirect
     */
    public function cancel(Request $request)
    {
        $locale = config('app.locale');

        try {
            // Validate data if present
            if ($request->has('data')) {
                $response = WebToPay::validateAndParseData(
                    $request->all(),
                    config('paysera.project_id'),
                    config('paysera.sign_password')
                );

                $orderNumber = $response['orderid'];
                $order = Order::where('order_number', $orderNumber)->first();

                if ($order) {
                    $order->update(['payment_status' => 'failed']);
                    $locale = $order->locale ?? $locale;
                }
            }
        } catch (\WebToPayException $e) {
            Log::error('Paysera cancel error', ['error' => $e->getMessage()]);
        }

        return redirect()->route($locale . '.checkout')->with('error', __('checkout.payment_cancelled'));
    }
}
