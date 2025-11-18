<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VenipakController extends Controller
{
    /**
     * Get Venipak pickup points for a specific country
     *
     * @param string $country Country code (LT, LV, EE)
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPickupPoints(Request $request)
    {
        $country = $request->input('country', 'LT');

        // Cache the pickup points for 24 hours
        $cacheKey = "venipak_pickup_points_{$country}";

        $pickupPoints = Cache::remember($cacheKey, 86400, function () use ($country) {
            try {
                $response = Http::timeout(10)->get('https://go.venipak.lt/ws/get_pickup_points');

                if (!$response->successful()) {
                    Log::error('Venipak API error', [
                        'status' => $response->status(),
                        'body' => $response->body()
                    ]);
                    return [];
                }

                $allPoints = $response->json();

                // Filter by country
                $filteredPoints = array_filter($allPoints, function ($point) use ($country) {
                    return isset($point['country']) && strtoupper($point['country']) === strtoupper($country);
                });

                // Sort by city and name
                usort($filteredPoints, function ($a, $b) {
                    $cityCompare = strcmp($a['city'] ?? '', $b['city'] ?? '');
                    if ($cityCompare !== 0) {
                        return $cityCompare;
                    }
                    return strcmp($a['display_name'] ?? $a['name'] ?? '', $b['display_name'] ?? $b['name'] ?? '');
                });

                return array_values($filteredPoints);

            } catch (\Exception $e) {
                Log::error('Failed to fetch Venipak pickup points', [
                    'error' => $e->getMessage(),
                    'country' => $country
                ]);
                return [];
            }
        });

        return response()->json([
            'success' => true,
            'data' => $pickupPoints,
            'count' => count($pickupPoints)
        ]);
    }

    /**
     * Clear Venipak pickup points cache
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function clearCache()
    {
        $countries = ['LT', 'LV', 'EE'];

        foreach ($countries as $country) {
            Cache::forget("venipak_pickup_points_{$country}");
        }

        return response()->json([
            'success' => true,
            'message' => 'Venipak pickup points cache cleared'
        ]);
    }
}
