<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class VenipakShipmentService
{
    private string $baseUrl;
    private string $username;
    private string $password;
    private string $userId;

    // Shipping costs by type
    public const SHIPPING_COST_DOMESTIC = 4.00;
    public const SHIPPING_COST_INTERNATIONAL = 4.00;
    public const SHIPPING_COST_GLOBAL = 20.00;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.venipak.base_url', 'https://go.venipak.lt'), '/');
        $this->username = config('services.venipak.username');
        $this->password = config('services.venipak.password');
        $this->userId = config('services.venipak.user_id', '10281');
    }

    /**
     * Check if Venipak integration is properly configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->username) && !empty($this->password);
    }

    /**
     * Create a shipment for an order
     */
    public function createShipment(Order $order): array
    {
        try {
            if (!$this->isConfigured()) {
                return [
                    'success' => false,
                    'error' => 'Venipak not configured. Missing username or password.',
                ];
            }

            // Generate pack number
            $packNo = $this->generatePackNumber();

            // Generate manifest title (daily manifest)
            $manifestTitle = $this->generateManifestTitle();

            // Determine delivery type
            $isPickupPoint = $this->isPickupPointDelivery($order);
            $countryCode = $this->mapCountryCode($order->shipping_country);
            $shipmentType = $this->getShipmentType($countryCode);

            // Build XML
            $xml = $this->buildShipmentXml($order, $packNo, $manifestTitle);

            Log::info('Venipak: Creating shipment', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'pack_no' => $packNo,
                'manifest_title' => $manifestTitle,
                'country' => $order->shipping_country,
                'country_code' => $countryCode,
                'shipment_type' => $shipmentType,
                'is_pickup_point' => $isPickupPoint,
                'shipping_method' => $order->shipping_method,
            ]);

            // Log full XML for debugging
            Log::debug('Venipak: XML Request', [
                'xml' => $xml,
            ]);

            // Send to Venipak API
            $response = Http::withBasicAuth($this->username, $this->password)
                ->withBody($xml, 'text/xml')
                ->post("{$this->baseUrl}/import/send_auth_basic.php");

            Log::info('Venipak: API response', [
                'order_id' => $order->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            // Parse response
            $result = $this->parseCreateResponse($response->body());

            if (!$result['success']) {
                return $result;
            }

            // Update order with shipment info
            // For global shipments, use external carrier tracking number if available
            $trackingNumber = !empty($result['external_tracking']) ? $result['external_tracking'] : $packNo;

            $order->update([
                'venipak_pack_no' => $packNo,
                'tracking_number' => $trackingNumber,
                'venipak_manifest_id' => $manifestTitle,
                'venipak_shipment_created_at' => now(),
                'venipak_status' => 'At sender',
                'venipak_status_updated_at' => now(),
                'venipak_error' => null,
                // Secondary carrier info (for global shipments)
                'venipak_carrier_code' => $result['carrier'] ?? null,
                'venipak_carrier_tracking' => $result['external_tracking'] ?? null,
                'venipak_shipment_id' => $result['shipment_id'] ?? null,
            ]);

            Log::info('Venipak: Shipment response details', [
                'order_id' => $order->id,
                'pack_no' => $packNo,
                'external_tracking' => $result['external_tracking'] ?? null,
                'carrier' => $result['carrier'] ?? null,
                'shipment_id' => $result['shipment_id'] ?? null,
            ]);

            // Get and store label
            $labelPath = $this->getAndStoreLabel($packNo, $order);
            if ($labelPath) {
                $order->update(['venipak_label_path' => $labelPath]);
            }

            Log::info('Venipak: Shipment created successfully', [
                'order_id' => $order->id,
                'pack_no' => $packNo,
                'label_path' => $labelPath,
            ]);

            return [
                'success' => true,
                'pack_no' => $packNo,
                'tracking_number' => $packNo,
                'label_path' => $labelPath,
            ];

        } catch (\Exception $e) {
            Log::error('Venipak: Exception creating shipment', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Build shipment XML for an order
     */
    private function buildShipmentXml(Order $order, string $packNo, string $manifestTitle): string
    {
        $isPickupPoint = $this->isPickupPointDelivery($order);
        $countryCode = $this->mapCountryCode($order->shipping_country);
        $shipmentType = $this->getShipmentType($countryCode);

        // Build consignee block (recipient)
        if ($isPickupPoint && $order->venipak_pickup_point) {
            $consignee = $this->buildPickupPointConsignee($order->venipak_pickup_point, $order);
        } else {
            $consignee = $this->buildHomeDeliveryConsignee($order);
        }

        $weight = $this->calculateOrderWeight($order);
        $orderNumber = $this->escapeXml($order->order_number);

        // Build attribute block based on shipment type (includes shipment_code for reference)
        $attributeBlock = $this->buildAttributeBlock($shipmentType, $order->order_number, $order);

        // Build pack block (with dimensions for international >30kg or global)
        $packBlock = $this->buildPackBlock($packNo, $weight, $shipmentType);

        // Build XML - no <shipper> block needed for type="1" (data import)
        return <<<XML
<?xml version="1.0" encoding="UTF-8"?><description type="1"><manifest title="{$manifestTitle}" name="Shop Natural {$orderNumber}"><shipment>{$consignee}{$attributeBlock}{$packBlock}</shipment></manifest></description>
XML;
    }

    /**
     * Determine shipment type based on destination country
     * - Domestic: LT, LV, EE (Baltic countries - Venipak direct)
     * - International: PL, FI (requires <international> block - uses GLS)
     * - Global: All others (requires <global> block - uses TNT/GLS)
     */
    private function getShipmentType(string $countryCode): string
    {
        $domesticCountries = ['LT', 'LV', 'EE'];
        $internationalCountries = ['PL', 'FI'];

        if (in_array($countryCode, $domesticCountries)) {
            return 'domestic';
        }

        if (in_array($countryCode, $internationalCountries)) {
            return 'international';
        }

        return 'global';
    }

    /**
     * Build attribute block based on shipment type and delivery method
     */
    private function buildAttributeBlock(string $shipmentType, string $orderNumber, ?Order $order = null): string
    {
        // nwd = next working day (standard delivery)
        $deliveryType = 'nwd';
        $shipmentCode = $this->escapeXml($orderNumber);

        $base = "<attribute><shipment_code>{$shipmentCode}</shipment_code><delivery_type>{$deliveryType}</delivery_type><cod>0</cod>";

        // International shipments (PL/FI) require international block
        if ($shipmentType === 'international') {
            $base .= '<international></international>';
        }

        // Global shipments require additional block with required fields
        if ($shipmentType === 'global' && $order) {
            $value = number_format((float) $order->total, 2, '.', '');
            $base .= '<global>';
            $base .= '<global_delivery>global</global_delivery>'; // Use cheapest global option
            $base .= '<shipment_description>Cosmetics and beauty products</shipment_description>';
            $base .= "<value>{$value}</value>";
            $base .= '</global>';
        }

        $base .= '</attribute>';
        return $base;
    }

    /**
     * Build pack block with dimensions if needed
     */
    private function buildPackBlock(string $packNo, float $weight, string $shipmentType): string
    {
        $pack = "<pack><pack_no>{$packNo}</pack_no><weight>{$weight}</weight>";

        // Add dimensions for global shipments or heavy packages (>30kg)
        // Dimensions must be in METERS according to Venipak docs
        if ($shipmentType === 'global' || $weight > 30) {
            // Default dimensions for cosmetics packages in meters (30cm = 0.30m)
            $pack .= '<length>0.30</length><width>0.20</width><height>0.15</height>';
            $pack .= '<description>Cosmetics and beauty products</description>';
        }

        $pack .= '</pack>';
        return $pack;
    }

    /**
     * Build consignee block for pickup point delivery
     * For pickup points, the consignee is the pickup point with customer as contact
     */
    private function buildPickupPointConsignee(array $pickupPoint, Order $order): string
    {
        // Pickup point details - the pickup point is the recipient
        $name = $this->escapeXml($pickupPoint['name'] ?? $pickupPoint['display_name'] ?? 'Venipak Pickup');
        // IMPORTANT: Use 'code' field, NOT 'id' - Venipak requires the code (e.g., "16567708")
        $code = $this->escapeXml($pickupPoint['code'] ?? '');
        $address = $this->escapeXml($pickupPoint['address'] ?? '');
        $city = $this->escapeXml($pickupPoint['city'] ?? '');
        $postCode = $this->escapeXml($pickupPoint['zip'] ?? $pickupPoint['postal_code'] ?? '');
        $country = $this->escapeXml($pickupPoint['country'] ?? 'LT');

        // Log warning if code is missing (old orders before fix)
        if (empty($code)) {
            Log::warning('Venipak: Pickup point missing code field', [
                'order_id' => $order->id,
                'pickup_point' => $pickupPoint,
            ]);
        }

        // Customer contact info - the person who will pick up
        $contactPerson = $this->escapeXml($order->getShippingFullName());
        $contactTel = $this->escapeXml($this->normalizePhoneNumber($order->shipping_phone ?? '', $country));
        $contactEmail = $this->escapeXml($order->customer_email ?? '');

        // For pickup points, company_code is the pickup point code which identifies it to Venipak
        return "<consignee><name>{$name}</name><company_code>{$code}</company_code><country>{$country}</country><city>{$city}</city><address>{$address}</address><post_code>{$postCode}</post_code><contact_person>{$contactPerson}</contact_person><contact_tel>{$contactTel}</contact_tel><contact_email>{$contactEmail}</contact_email></consignee>";
    }

    /**
     * Build consignee block for home/courier delivery
     */
    private function buildHomeDeliveryConsignee(Order $order): string
    {
        $name = $this->escapeXml($order->getShippingFullName());
        $address = $this->escapeXml($order->shipping_street_address);
        $city = $this->escapeXml($order->shipping_city);
        $countryCode = $this->mapCountryCode($order->shipping_country);
        $postCode = $this->escapeXml($this->normalizePostalCode($order->shipping_postal_code, $countryCode));
        $country = $this->escapeXml($countryCode);
        $contactTel = $this->escapeXml($this->normalizePhoneNumber($order->shipping_phone ?? '', $countryCode));
        $contactEmail = $this->escapeXml($order->customer_email ?? '');

        return "<consignee><name>{$name}</name><country>{$country}</country><city>{$city}</city><address>{$address}</address><post_code>{$postCode}</post_code><contact_person>{$name}</contact_person><contact_tel>{$contactTel}</contact_tel><contact_email>{$contactEmail}</contact_email></consignee>";
    }

    /**
     * Normalize postal code for Venipak (remove hyphens/spaces for certain countries)
     */
    private function normalizePostalCode(string $postalCode, string $countryCode): string
    {
        // Poland uses XX-XXX format but Venipak wants XXXXX (digits only)
        if ($countryCode === 'PL') {
            return preg_replace('/[^0-9]/', '', $postalCode);
        }

        // Finland uses XXXXX format (5 digits) - already correct
        // Baltic countries use XXXXX or LXXXX format - already correct

        return $postalCode;
    }

    /**
     * Normalize phone number to international format for Venipak
     */
    private function normalizePhoneNumber(string $phone, string $countryCode): string
    {
        // Remove all non-digit characters except +
        $phone = preg_replace('/[^0-9+]/', '', $phone);

        // If already starts with +, return as-is
        if (str_starts_with($phone, '+')) {
            return $phone;
        }

        // Country code prefixes
        $prefixes = [
            'LT' => '+370',
            'LV' => '+371',
            'EE' => '+372',
            'PL' => '+48',
            'FI' => '+358',
            'DE' => '+49',
        ];

        $prefix = $prefixes[$countryCode] ?? '+370'; // Default to Lithuania

        // Remove leading 0 if present (local format)
        if (str_starts_with($phone, '0')) {
            $phone = substr($phone, 1);
        }

        return $prefix . $phone;
    }

    /**
     * Check if order is for pickup point delivery
     */
    private function isPickupPointDelivery(Order $order): bool
    {
        // Check various possible shipping method names
        $pickupMethods = ['venipak_pickup', 'venipak-pickup', 'pickup', 'pickup_point'];

        return in_array($order->shipping_method, $pickupMethods)
            && !empty($order->venipak_pickup_point);
    }

    /**
     * Generate unique pack number from database
     * Format: V{userId}E{7-digit-number}
     */
    private function generatePackNumber(): string
    {
        return DB::transaction(function () {
            // Get the highest pack number used
            $lastPackNo = Order::whereNotNull('venipak_pack_no')
                ->orderByRaw("CAST(SUBSTRING(venipak_pack_no, 8) AS UNSIGNED) DESC")
                ->value('venipak_pack_no');

            if ($lastPackNo) {
                // Extract the numeric part and increment
                $lastNumber = (int) substr($lastPackNo, 7); // After "V10281E"
                $nextNumber = $lastNumber + 1;
            } else {
                // Start from configured first pack number
                $nextNumber = (int) config('services.venipak.first_pack_number', 1000050);
            }

            return sprintf('V%sE%07d', $this->userId, $nextNumber);
        });
    }

    /**
     * Generate manifest title for today
     * Format: {userId}{YYMMDD}001
     */
    private function generateManifestTitle(): string
    {
        $date = now()->format('ymd');
        return $this->userId . $date . '001';
    }

    /**
     * Calculate order weight
     */
    private function calculateOrderWeight(Order $order): float
    {
        $defaultWeight = 0.5; // kg per item
        $totalItems = $order->items->sum('quantity');

        return max(0.1, $totalItems * $defaultWeight);
    }

    /**
     * Map country name to Venipak country code
     */
    private function mapCountryCode(string $country): string
    {
        $map = [
            'Lithuania' => 'LT',
            'Lietuva' => 'LT',
            'Latvia' => 'LV',
            'Latvija' => 'LV',
            'Estonia' => 'EE',
            'Eesti' => 'EE',
            'Poland' => 'PL',
            'Polska' => 'PL',
            'Finland' => 'FI',
            'Suomi' => 'FI',
        ];

        if (strlen($country) === 2) {
            return strtoupper($country);
        }

        return $map[$country] ?? 'LT';
    }

    /**
     * Escape XML special characters
     */
    private function escapeXml(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }

    /**
     * Parse create shipment response
     */
    private function parseCreateResponse(string $body): array
    {
        try {
            // Venipak sometimes returns invalid XML with <br> tags - strip them
            $body = preg_replace('/<br\s*\/?>/i', ' ', $body);

            $xml = simplexml_load_string($body);

            if ($xml === false) {
                return ['success' => false, 'error' => 'Failed to parse XML response'];
            }

            // Check response type
            $type = (string) ($xml['type'] ?? '');

            if ($type === 'error') {
                $errorText = (string) ($xml->error->text ?? $xml->error ?? 'Unknown error');
                return ['success' => false, 'error' => $errorText];
            }

            if ($type === 'ok') {
                $textNode = $xml->text;
                return [
                    'success' => true,
                    'pack_no' => (string) ($textNode ?? ''),
                    'external_tracking' => (string) ($textNode['tracking'] ?? ''),
                    'carrier' => (string) ($textNode['carrier'] ?? ''),
                    'shipment_id' => (string) ($textNode['shipment'] ?? ''),
                ];
            }

            // Fallback
            return ['success' => true];

        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'Parse error: ' . $e->getMessage()];
        }
    }

    /**
     * Get and store shipping label PDF
     */
    public function getAndStoreLabel(string $packNo, Order $order): ?string
    {
        try {
            $response = Http::asForm()->post("{$this->baseUrl}/ws/print_label", [
                'user' => $this->username,
                'pass' => $this->password,
                'pack_no' => $packNo,
                'format' => 'other', // 100x150mm sticker
            ]);

            if (!$response->successful()) {
                Log::error('Venipak: Failed to get label', [
                    'pack_no' => $packNo,
                    'status' => $response->status(),
                ]);
                return null;
            }

            $body = $response->body();
            if (!str_starts_with($body, '%PDF')) {
                Log::error('Venipak: Label response is not a PDF', [
                    'pack_no' => $packNo,
                    'body_start' => substr($body, 0, 100),
                ]);
                return null;
            }

            $filename = "venipak-labels/{$order->order_number}-{$packNo}.pdf";
            Storage::disk('local')->put($filename, $body);

            Log::info('Venipak: Label stored', ['pack_no' => $packNo, 'filename' => $filename]);

            return $filename;

        } catch (\Exception $e) {
            Log::error('Venipak: Exception getting label', [
                'pack_no' => $packNo,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Get tracking information
     */
    public function getTracking(string $packNo): array
    {
        try {
            $response = Http::get("{$this->baseUrl}/ws/tracking.php", [
                'type' => 1,
                'output' => 'json',
                'code' => $packNo,
            ]);

            if (!$response->successful()) {
                return ['success' => false, 'error' => 'Failed to get tracking info'];
            }

            $data = $response->json();

            if (empty($data)) {
                return ['success' => false, 'error' => 'No tracking data found'];
            }

            $latest = is_array($data) ? ($data[0] ?? $data) : $data;

            return [
                'success' => true,
                'status' => $latest['status'] ?? null,
                'date' => $latest['date'] ?? null,
                'tracking' => $data,
            ];

        } catch (\Exception $e) {
            Log::error('Venipak: Exception getting tracking', [
                'pack_no' => $packNo,
                'error' => $e->getMessage(),
            ]);

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Update tracking status for an order
     */
    public function updateOrderTracking(Order $order): bool
    {
        if (!$order->venipak_pack_no) {
            return false;
        }

        $result = $this->getTracking($order->venipak_pack_no);

        if (!$result['success']) {
            return false;
        }

        $status = $result['status'];
        $updateData = [
            'venipak_status' => $status,
            'venipak_status_updated_at' => now(),
        ];

        if ($this->isDeliveredStatus($status)) {
            $updateData['venipak_delivered_at'] = now();

            if (!in_array($order->status, ['completed', 'cancelled'])) {
                $updateData['status'] = 'completed';
                $updateData['delivered_at'] = now();
            }
        } elseif ($this->isInTransitStatus($status)) {
            if ($order->status === 'processing') {
                $updateData['status'] = 'shipped';
                $updateData['shipped_at'] = $updateData['shipped_at'] ?? now();
            }
        }

        $order->update($updateData);

        Log::info('Venipak: Tracking updated', [
            'order_id' => $order->id,
            'pack_no' => $order->venipak_pack_no,
            'status' => $status,
        ]);

        return true;
    }

    /**
     * Check if status indicates delivered
     */
    private function isDeliveredStatus(?string $status): bool
    {
        if (!$status) {
            return false;
        }

        $deliveredStatuses = [
            'Delivered',
            'Pristatyta',
            'Piegādāts',
            'Kohale toimetatud',
        ];

        return in_array($status, $deliveredStatuses) || stripos($status, 'deliver') !== false;
    }

    /**
     * Check if status indicates in transit
     */
    private function isInTransitStatus(?string $status): bool
    {
        if (!$status) {
            return false;
        }

        $transitStatuses = [
            'In transit',
            'Out for delivery',
            'At terminal',
            'Sorting',
        ];

        foreach ($transitStatuses as $transitStatus) {
            if (stripos($status, $transitStatus) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if shipping to this country is supported
     * All countries allowed - domestic (LT/LV/EE/PL/FI) or global (others)
     */
    public function isCountrySupported(string $country): bool
    {
        return true;
    }

    /**
     * Get shipping cost for a country
     */
    public function getShippingCost(string $country): float
    {
        $countryCode = $this->mapCountryCode($country);
        $shipmentType = $this->getShipmentType($countryCode);

        return match ($shipmentType) {
            'domestic' => self::SHIPPING_COST_DOMESTIC,
            'international' => self::SHIPPING_COST_INTERNATIONAL,
            'global' => self::SHIPPING_COST_GLOBAL,
            default => self::SHIPPING_COST_DOMESTIC,
        };
    }

    /**
     * Get Venipak tracking URL for a pack number
     */
    public function getTrackingUrl(string $packNo): string
    {
        return "https://go.venipak.lt/ws/tracking.php?type=1&output=html&code={$packNo}";
    }
}
