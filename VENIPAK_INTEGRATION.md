# Venipak Pickup Point Integration

## Overview

This integration allows customers to select Venipak pickup points and lockers during checkout. When Lithuania is selected as the shipping country and "Pick Up" is chosen as the delivery method, customers can browse and select from all available Venipak pickup locations with both list and map views.

## Features

✅ **Fetch Venipak Pickup Points** - Automatically fetches all pickup points for Lithuania
✅ **Google Maps Integration** - Visual map view showing all pickup locations
✅ **Search Functionality** - Search by city, address, or postal code
✅ **List & Map Views** - Toggle between list and interactive map
✅ **Locker & Pickup Point Types** - Distinguishes between lockers (type 3) and pickup points (type 1)
✅ **Caching** - 24-hour cache to reduce API calls
✅ **Multi-language** - Full support for LT and EN languages

## API Endpoint

**Venipak Pickup Points API:**
`https://go.venipak.lt/ws/get_pickup_points`

Returns all pickup points for Estonia (EE), Latvia (LV), and Lithuania (LT).

## Files Created

### Backend

1. **`app/Http/Controllers/VenipakController.php`**
   - Fetches pickup points from Venipak API
   - Filters by country (LT)
   - Implements 24-hour caching
   - Provides cache clearing endpoint

2. **Routes added to `routes/web.php`:**
   ```php
   Route::get('api/venipak/pickup-points', [VenipakController::class, 'getPickupPoints'])
   Route::post('api/venipak/clear-cache', [VenipakController::class, 'clearCache'])
   ```

### Frontend

3. **`resources/js/components/venipak-pickup-selector.tsx`**
   - Main component for pickup point selection
   - List view with search
   - Google Maps integration
   - Responsive design

4. **`resources/js/components/ui/scroll-area.tsx`**
   - UI component for scrollable lists

5. **Translation keys added to:**
   - `lang/lt.json`
   - `lang/en.json`

## Required Setup Steps

### 1. Install Required NPM Packages

```bash
npm install @radix-ui/react-scroll-area @types/google.maps
```

### 2. Get Google Maps API Key

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable "Maps JavaScript API" and "Places API"
4. Create API credentials (API Key)
5. Restrict the API key to your domain

### 3. Add Google Maps API Key to Laravel Config

Add to `config/services.php`:

```php
return [
    // ... other services

    'google_maps' => [
        'api_key' => env('GOOGLE_MAPS_API_KEY', ''),
    ],
];
```

Then add to `.env`:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 4. Integrate into Checkout Flow

Update `resources/js/pages/checkout.tsx` to show Venipak selector in Step 3 (Delivery):

```typescript
import { VenipakPickupSelector, VenipakPickupPoint } from '@/components/venipak-pickup-selector';

// Add state
const [selectedVenipakPoint, setSelectedVenipakPoint] = useState<VenipakPickupPoint | null>(null);

// In Step 3 (Delivery Method), after shipping method selection:
{selectedShippingMethod === 'pickup' && shippingAddress.country === 'LT' && (
    <div className="mt-6">
        <VenipakPickupSelector
            country={shippingAddress.country}
            selectedPickupPoint={selectedVenipakPoint}
            onSelect={setSelectedVenipakPoint}
        />
    </div>
)}

// Add validation in validateShipping():
if (selectedShippingMethod === 'pickup' && shippingAddress.country === 'LT' && !selectedVenipakPoint) {
    toast.error(t('venipak.please_select', 'Please select a pickup point'));
    return false;
}

// Include in checkout submission:
const checkoutData: CheckoutFormData = {
    // ... existing fields
    venipakPickupPoint: selectedVenipakPoint,
};
```

### 5. Update Checkout TypeScript Types

Add to `resources/js/types/checkout.d.ts`:

```typescript
import type { VenipakPickupPoint } from '@/components/venipak-pickup-selector';

export interface CheckoutFormData {
    // ... existing fields
    venipakPickupPoint?: VenipakPickupPoint | null;
}
```

### 6. Update Backend Checkout Controller

Modify `app/Http/Controllers/CheckoutController.php` to handle Venipak pickup point:

```php
public function store(Request $request)
{
    // ... existing validation

    if ($request->input('shippingMethod') === 'pickup' && $request->input('shippingAddress.country') === 'LT') {
        $request->validate([
            'venipakPickupPoint' => 'required|array',
            'venipakPickupPoint.id' => 'required|integer',
            'venipakPickupPoint.name' => 'required|string',
            'venipakPickupPoint.address' => 'required|string',
        ]);
    }

    // Store venipakPickupPoint data in order
    $order = Order::create([
        // ... existing fields
        'venipak_pickup_point' => $request->input('venipakPickupPoint'),
    ]);
}
```

### 7. Update Orders Table Migration

Create migration to add Venipak pickup point field:

```bash
php artisan make:migration add_venipak_pickup_point_to_orders_table
```

```php
public function up()
{
    Schema::table('orders', function (Blueprint $table) {
        $table->json('venipak_pickup_point')->nullable()->after('billing_address');
    });
}

public function down()
{
    Schema::table('orders', function (Blueprint $table) {
        $table->dropColumn('venipak_pickup_point');
    });
}
```

Then run:
```bash
php artisan migrate
```

## Venipak API Credentials

Your Venipak account credentials (from the image you provided):

```
Venipak User ID: 10281
Username: naturalbeauty
Password: naturalbeauty1
First Pack Number: 1000009
```

**Note:** These credentials are for creating shipping labels via Venipak API (separate from pickup point selection).

## Testing

1. **Test Pickup Points API:**
   ```bash
   curl http://localhost/api/venipak/pickup-points?country=LT
   ```

2. **Test in Checkout:**
   - Go to checkout
   - Select Lithuania as country
   - Choose "Pick Up" delivery method
   - Verify Venipak selector appears
   - Test both list and map views
   - Select a pickup point
   - Complete checkout

3. **Clear Cache (if needed):**
   ```bash
   curl -X POST http://localhost/api/venipak/clear-cache
   ```

## Pricing Structure

As implemented in `resources/js/utils/shipping-methods.ts`:

- **Lithuania:** Pickup €2
- **Other EU:** Pickup €4
- **Rest of World:** Pickup €20

## Pickup Point Data Structure

```typescript
{
    id: number;              // Unique identifier
    name: string;            // Internal name
    display_name?: string;   // Display name for UI
    address: string;         // Street address
    city: string;            // City name
    zip: string;             // Postal code
    country: string;         // Country code (LT, LV, EE)
    lat: string;             // Latitude
    lng: string;             // Longitude
    type: number;            // 1 = Pickup Point, 3 = Locker
    pick_up_enabled: number; // 0 or 1
    cod_enabled: number;     // Cash on delivery (0 or 1)
    max_height?: number;     // Max parcel height
    max_width?: number;      // Max parcel width
    max_length?: number;     // Max parcel length
    working_hours?: string;  // JSON string of hours
}
```

## Future Enhancements

- [ ] Add working hours display
- [ ] Filter by pickup point type (locker vs pickup point)
- [ ] Filter by COD support
- [ ] Show parcel size restrictions
- [ ] Integration with Venipak label generation API
- [ ] Automatic shipment creation
- [ ] Tracking integration

## Resources

- **Venipak API Documentation:** https://documenter.getpostman.com/view/12497207/TVYCC1o1
- **Venipak Website:** https://venipak.com/lt/en/
- **Pickup Points List (JSON):** https://go.venipak.lt/ws/get_pickup_points

## Support

For Venipak API support, contact: api@venipak.com
