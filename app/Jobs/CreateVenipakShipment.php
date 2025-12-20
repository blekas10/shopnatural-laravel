<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\VenipakShipmentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CreateVenipakShipment implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public Order $order
    ) {}

    public function handle(VenipakShipmentService $venipakService): void
    {
        // Skip if shipment already created
        if ($this->order->venipak_pack_no) {
            Log::info('Venipak: Shipment already exists', [
                'order_id' => $this->order->id,
                'pack_no' => $this->order->venipak_pack_no,
            ]);
            return;
        }

        // Skip if country not supported
        $country = $this->order->shipping_country;
        if (!$venipakService->isCountrySupported($country)) {
            Log::info('Venipak: Country not supported, skipping', [
                'order_id' => $this->order->id,
                'country' => $country,
            ]);
            return;
        }

        // Create shipment
        $result = $venipakService->createShipment($this->order);

        if (!$result['success']) {
            // Store error on order
            $this->order->update([
                'venipak_error' => $result['error'] ?? 'Unknown error',
            ]);

            Log::error('Venipak: Failed to create shipment', [
                'order_id' => $this->order->id,
                'error' => $result['error'],
            ]);

            // Re-throw to trigger retry
            throw new \Exception('Venipak shipment creation failed: ' . ($result['error'] ?? 'Unknown error'));
        }

        // Clear any previous error
        $this->order->update(['venipak_error' => null]);

        Log::info('Venipak: Shipment job completed', [
            'order_id' => $this->order->id,
            'pack_no' => $result['pack_no'],
        ]);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Venipak: Job failed permanently', [
            'order_id' => $this->order->id,
            'error' => $exception->getMessage(),
        ]);

        $this->order->update([
            'venipak_error' => 'Job failed: ' . $exception->getMessage(),
        ]);
    }
}
