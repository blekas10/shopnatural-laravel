<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FacebookConversionsService
{
    private string $pixelId;
    private string $accessToken;
    private string $apiVersion;
    private bool $enabled;

    public function __construct()
    {
        $this->pixelId = config('services.facebook.pixel_id', '');
        $this->accessToken = config('services.facebook.access_token', '');
        $this->apiVersion = config('services.facebook.api_version', 'v24.0');
        $this->enabled = config('services.facebook.capi_enabled', false);
    }

    public function isConfigured(): bool
    {
        return $this->enabled && $this->pixelId !== '' && $this->accessToken !== '';
    }

    /**
     * Send a Purchase event to Facebook Conversions API.
     * Returns result array, never throws.
     */
    public function sendPurchaseEvent(Order $order): array
    {
        if (!$this->isConfigured()) {
            return ['success' => false, 'reason' => 'not_configured'];
        }

        try {
            $eventData = $this->buildPurchaseEvent($order);

            $url = "https://graph.facebook.com/{$this->apiVersion}/{$this->pixelId}/events";

            $response = Http::timeout(10)->post($url, [
                'data' => [$eventData],
                'access_token' => $this->accessToken,
            ]);

            if ($response->successful()) {
                Log::info('Facebook CAPI: Purchase event sent', [
                    'order_number' => $order->order_number,
                    'event_id' => $eventData['event_id'],
                    'response' => $response->json(),
                ]);

                return [
                    'success' => true,
                    'event_id' => $eventData['event_id'],
                    'response' => $response->json(),
                ];
            }

            Log::warning('Facebook CAPI: API returned error', [
                'order_number' => $order->order_number,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'reason' => 'api_error',
                'status' => $response->status(),
                'body' => $response->body(),
            ];
        } catch (\Exception $e) {
            Log::error('Facebook CAPI: Exception sending purchase event', [
                'order_number' => $order->order_number,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'reason' => 'exception',
                'error' => $e->getMessage(),
            ];
        }
    }

    private function buildPurchaseEvent(Order $order): array
    {
        $userData = [];

        // Hash PII with SHA256 per Facebook requirements
        if ($order->customer_email) {
            $userData['em'] = [hash('sha256', strtolower(trim($order->customer_email)))];
        }

        if ($order->shipping_phone) {
            // Normalize phone: remove spaces, dashes, parentheses
            $phone = preg_replace('/[\s\-\(\)]/', '', $order->shipping_phone);
            $userData['ph'] = [hash('sha256', $phone)];
        }

        if ($order->shipping_first_name) {
            $userData['fn'] = [hash('sha256', strtolower(trim($order->shipping_first_name)))];
        }

        if ($order->shipping_last_name) {
            $userData['ln'] = [hash('sha256', strtolower(trim($order->shipping_last_name)))];
        }

        if ($order->shipping_city) {
            $userData['ct'] = [hash('sha256', strtolower(str_replace(' ', '', $order->shipping_city)))];
        }

        if ($order->shipping_postal_code) {
            $userData['zp'] = [hash('sha256', $order->shipping_postal_code)];
        }

        if ($order->shipping_country) {
            $userData['country'] = [hash('sha256', strtolower($order->shipping_country))];
        }

        // External ID (user ID if registered)
        if ($order->user_id) {
            $userData['external_id'] = [hash('sha256', (string) $order->user_id)];
        }

        // Browser tracking data captured at checkout
        if ($order->fb_fbp) {
            $userData['fbp'] = $order->fb_fbp;
        }

        if ($order->fb_fbc) {
            $userData['fbc'] = $order->fb_fbc;
        }

        if ($order->fb_client_ip) {
            $userData['client_ip_address'] = $order->fb_client_ip;
        }

        if ($order->fb_user_agent) {
            $userData['client_user_agent'] = $order->fb_user_agent;
        }

        // Build content items
        $contents = [];
        $order->loadMissing('items');
        foreach ($order->items as $item) {
            $contents[] = [
                'id' => $item->product_sku ?? (string) $item->product_id,
                'quantity' => $item->quantity,
                'item_price' => (float) $item->unit_price,
            ];
        }

        return [
            'event_name' => 'Purchase',
            'event_time' => now()->unix(),
            'event_id' => "purchase_{$order->order_number}",
            'event_source_url' => config('app.url'),
            'action_source' => 'website',
            'user_data' => $userData,
            'custom_data' => [
                'currency' => $order->currency ?? 'EUR',
                'value' => (float) $order->total,
                'order_id' => $order->order_number,
                'contents' => $contents,
                'content_type' => 'product',
                'num_items' => $order->items->sum('quantity'),
            ],
        ];
    }
}
