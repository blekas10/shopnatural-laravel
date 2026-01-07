<?php

namespace App\Http\Controllers;

use App\Models\Order;
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
                'order_id' => $response['orderid'],
                'status' => $response['status'],
                'amount' => $response['amount'],
            ]);

            // Find order by ID
            $order = Order::find($response['orderid']);

            if (!$order) {
                Log::error('Paysera callback: Order not found', ['order_id' => $response['orderid']]);
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

                // Assign order number and invoice number for paid orders
                $order->assignOrderNumber();
                $order->assignInvoiceNumber();

                Log::info('Paysera payment successful', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'invoice_number' => $order->invoice_number,
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
                // Payment pending
                Log::info('Paysera payment pending', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                ]);
            } else {
                // Payment failed
                $order->update(['payment_status' => 'failed']);

                Log::warning('Paysera payment failed', [
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

            $orderId = $response['orderid'];

            // Get order by ID
            $order = Order::find($orderId);
            $locale = $order?->locale ?? config('app.locale');

            // Use order_number if assigned, otherwise order ID
            $orderIdentifier = $order?->order_number ?? $orderId;

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

                $orderId = $response['orderid'];
                $order = Order::find($orderId);

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
