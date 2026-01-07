<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StripeWebhookController extends Controller
{
    /**
     * Handle Stripe webhook events
     */
    public function handle(Request $request)
    {
        \Stripe\Stripe::setApiKey(config('stripe.secret'));

        // Verify webhook signature
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('stripe.webhook_secret');

        try {
            if ($webhookSecret) {
                $event = \Stripe\Webhook::constructEvent(
                    $payload,
                    $sigHeader,
                    $webhookSecret
                );
            } else {
                // For testing without webhook secret
                $event = json_decode($payload, true);
                $event = \Stripe\Event::constructFrom($event);
            }
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            Log::error('Stripe webhook: Invalid payload', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            // Invalid signature
            Log::error('Stripe webhook: Invalid signature', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event
        switch ($event->type) {
            case 'checkout.session.completed':
                $this->handleCheckoutSessionCompleted($event->data->object);
                break;

            case 'payment_intent.succeeded':
                $this->handlePaymentIntentSucceeded($event->data->object);
                break;

            case 'payment_intent.payment_failed':
                $this->handlePaymentIntentFailed($event->data->object);
                break;

            case 'charge.refunded':
                $this->handleChargeRefunded($event->data->object);
                break;

            default:
                Log::info('Stripe webhook: Unhandled event type', ['type' => $event->type]);
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Handle successful checkout session
     */
    protected function handleCheckoutSessionCompleted($session)
    {
        Log::info('Stripe webhook: Checkout session completed', [
            'session_id' => $session->id,
            'payment_intent' => $session->payment_intent ?? null,
            'metadata' => $session->metadata,
        ]);

        $paymentReference = $session->metadata->payment_reference ?? null;

        if (!$paymentReference) {
            Log::error('Stripe webhook: No payment reference in metadata');
            return;
        }

        $order = Order::where('payment_reference', $paymentReference)->first();

        if (!$order) {
            Log::error('Stripe webhook: Order not found', ['payment_reference' => $paymentReference]);
            return;
        }

        // Update order status and store the actual payment intent ID
        $updateData = [
            'payment_status' => 'paid',
            'status' => 'confirmed',
        ];

        // Store the payment intent ID if available (for refund tracking)
        if ($session->payment_intent) {
            $updateData['payment_intent_id'] = $session->payment_intent;
        }

        $order->update($updateData);

        // Assign order number and invoice number for paid orders
        $order->assignOrderNumber();
        $order->assignInvoiceNumber();

        Log::info('Stripe webhook: Order updated', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'invoice_number' => $order->invoice_number,
            'payment_intent_id' => $session->payment_intent ?? null,
        ]);

        // Send confirmation emails
        Log::info('Stripe webhook: About to send confirmation emails', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'customer_email' => $order->customer_email,
            'order_exists' => Order::where('id', $order->id)->exists(),
        ]);

        $order->sendOrderConfirmationEmails();

        Log::info('Stripe webhook: Confirmation emails dispatched', [
            'order_id' => $order->id,
        ]);

        // Venipak shipment is created manually via admin panel
    }

    /**
     * Handle successful payment intent
     */
    protected function handlePaymentIntentSucceeded($paymentIntent)
    {
        Log::info('Stripe webhook: Payment intent succeeded', [
            'payment_intent_id' => $paymentIntent->id,
        ]);

        // Additional handling if needed
    }

    /**
     * Handle failed payment intent
     */
    protected function handlePaymentIntentFailed($paymentIntent)
    {
        Log::error('Stripe webhook: Payment intent failed', [
            'payment_intent_id' => $paymentIntent->id,
        ]);

        // Find order and mark as failed
        $order = Order::where('payment_intent_id', $paymentIntent->id)->first();

        if ($order) {
            $order->update(['payment_status' => 'failed']);
        }
    }

    /**
     * Handle charge refunded
     */
    protected function handleChargeRefunded($charge)
    {
        Log::info('Stripe webhook: Charge refunded', [
            'charge_id' => $charge->id,
            'amount_refunded' => $charge->amount_refunded,
        ]);

        try {
            // Get the payment intent to access metadata
            $paymentIntentId = $charge->payment_intent;
            $paymentIntent = \Stripe\PaymentIntent::retrieve($paymentIntentId);

            // Try to get order_number from payment intent metadata
            $orderNumber = $paymentIntent->metadata->order_number ?? null;

            if (!$orderNumber) {
                // If no metadata on payment intent, try to get it from the checkout session
                // The latest_charge on a PaymentIntent links back, but we need the session
                // Try searching by session ID stored in payment_intent_id field
                $order = Order::where('payment_intent_id', $paymentIntent->id)->first();

                if (!$order) {
                    // Last resort: try LIKE search with payment intent ID
                    $order = Order::where('payment_intent_id', 'like', "%{$paymentIntentId}%")->first();
                }
            } else {
                // Find order by order number from metadata
                $order = Order::where('order_number', $orderNumber)->first();
            }

            if ($order) {
                $order->update([
                    'payment_status' => 'refunded',
                    'status' => 'cancelled',
                ]);

                Log::info('Stripe webhook: Order refunded', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                ]);
            } else {
                Log::warning('Stripe webhook: Order not found for refunded charge', [
                    'payment_intent_id' => $paymentIntentId,
                    'charge_id' => $charge->id,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Stripe webhook: Error handling refund', [
                'error' => $e->getMessage(),
                'charge_id' => $charge->id,
            ]);
        }
    }
}
