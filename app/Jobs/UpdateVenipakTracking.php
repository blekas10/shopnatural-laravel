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

class UpdateVenipakTracking implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 300; // 5 minutes max

    public function __construct()
    {
    }

    public function handle(VenipakShipmentService $venipakService): void
    {
        Log::info('Venipak: Starting tracking update job');

        // Get all orders with Venipak shipments that are not delivered/completed/cancelled
        $orders = Order::whereNotNull('venipak_pack_no')
            ->whereNull('venipak_delivered_at')
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->get();

        $updated = 0;
        $failed = 0;

        foreach ($orders as $order) {
            try {
                $result = $venipakService->updateOrderTracking($order);

                if ($result) {
                    $updated++;
                } else {
                    $failed++;
                }

                // Small delay to avoid rate limiting
                usleep(200000); // 200ms

            } catch (\Exception $e) {
                $failed++;
                Log::error('Venipak: Error updating tracking for order', [
                    'order_id' => $order->id,
                    'pack_no' => $order->venipak_pack_no,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Venipak: Tracking update job completed', [
            'total' => $orders->count(),
            'updated' => $updated,
            'failed' => $failed,
        ]);
    }
}
