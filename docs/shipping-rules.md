# Shipping Rules & Venipak Integration

## Overview

Shop Natural uses **Venipak** as the primary shipping provider. Venipak handles shipments across different regions with varying service levels and pricing.

---

## Shipping Zones & Pricing

### 1. Baltic Countries (Domestic)
**Countries:** Lithuania (LT), Latvia (LV), Estonia (EE)

| Option | Price | Delivery Time |
|--------|-------|---------------|
| Venipak Courier | €4.00 | 1-5 business days |
| Venipak Pickup Point | €4.00 | 1-5 business days |

**Features:**
- Both courier and pickup point options available
- Direct Venipak delivery (no secondary carrier)
- Tracking via Venipak pack number
- Pickup points available in all three countries
- SMS notification for pickup point deliveries (requires mobile number)

**Technical Notes:**
- Shipment type: `domestic`
- No additional XML blocks required
- Pickup points fetched from: `/api/venipak/pickup-points?country={LT|LV|EE}`

---

### 2. International (Neighboring Countries)
**Countries:** Poland (PL), Finland (FI)

| Option | Price | Delivery Time |
|--------|-------|---------------|
| Venipak Courier | €4.00 | 1-5 business days |

**Features:**
- Courier delivery only (no pickup points)
- Venipak handles first-mile, GLS handles last-mile
- Secondary tracking number provided later (when sorted at hub)

**Technical Notes:**
- Shipment type: `international`
- Requires `<international></international>` XML block
- Package weight limit: 30kg per package (different weight groups cannot be mixed)
- Packages >30kg require dimensions

---

### 3. Global (Rest of Europe & World)
**Countries:** All other EU countries + Rest of World

| Option | Price | Delivery Time |
|--------|-------|---------------|
| Courier Shipping | €20.00 | 2-10 business days |

**Features:**
- Courier delivery only
- Venipak + secondary carrier (TNT/GLS Economy - `reg_eco`)
- **Instant secondary tracking number** returned on shipment creation
- Customer receives both Venipak pack number AND carrier tracking number

**Technical Notes:**
- Shipment type: `global`
- Requires `<global>` XML block with:
  - `<global_delivery>global</global_delivery>`
  - `<shipment_description>Cosmetics and beauty products</shipment_description>`
  - `<value>{order_total}</value>`
- Package dimensions required (in meters)
- Phone number must match destination country format

---

## Country Codes Reference

### Baltic (Domestic)
```
LT - Lithuania
LV - Latvia
EE - Estonia
```

### International
```
PL - Poland
FI - Finland
```

### Global (EU Examples)
```
DE - Germany       FR - France        ES - Spain
IT - Italy         NL - Netherlands   BE - Belgium
AT - Austria       CZ - Czech Republic SE - Sweden
DK - Denmark       PT - Portugal      IE - Ireland
GR - Greece        HU - Hungary       RO - Romania
BG - Bulgaria      HR - Croatia       SK - Slovakia
SI - Slovenia      LU - Luxembourg    MT - Malta
CY - Cyprus
```

---

## Phone Number Requirements

Venipak validates phone numbers per country. Format: `+{country_code}{number}`

| Country | Format | Example |
|---------|--------|---------|
| Lithuania | +370 6XXXXXXX | +37061234567 |
| Latvia | +371 2XXXXXXX | +37120000000 |
| Estonia | +372 5XXXXXXX | +37251234567 |
| Poland | +48 XXXXXXXXX | +48501234567 |
| Finland | +358 4XXXXXXXX | +358401234567 |
| Germany | +49 1XXXXXXXXX | +491701234567 |
| France | +33 6XXXXXXXX | +33612345678 |

**Important:** Pickup point deliveries require **mobile numbers** (for SMS with pickup code).

---

## Postal Code Validation

Venipak validates postal codes per country:

| Country | Format | Example |
|---------|--------|---------|
| Lithuania | XXXXX or LT-XXXXX | 01234, LT-01234 |
| Latvia | LV-XXXX | LV-1010 |
| Estonia | XXXXX | 10140 |
| Poland | XX-XXX (send as XXXXX) | 00-001 → 00001 |
| Finland | XXXXX | 00100 |
| Germany | XXXXX | 10117 |

---

## API Response Examples

### Domestic/International Success
```xml
<answer type="ok">
  <text>V10281E1000057</text>
</answer>
```

### Global Success (with carrier tracking)
```xml
<answer type="ok">
  <text tracking="887295903448" carrier="reg_eco" shipment="096906988">V10281E1000056</text>
</answer>
```

**Response fields:**
- `text` content: Venipak pack number
- `tracking`: Secondary carrier tracking number
- `carrier`: Carrier code (e.g., `reg_eco` = TNT/GLS Economy)
- `shipment`: Venipak shipment ID

### Error Response
```xml
<answer type="error">
  <error shipment="0" pack="" code="150">
    <text>delivery_address.postal_code Unknown error code: postal_code_is_not_valid-VALIDATION0019</text>
  </error>
</answer>
```

---

## Database Fields

Orders table stores Venipak shipment data:

```
venipak_pack_no          - Venipak tracking number (V10281E1234567)
venipak_manifest_id      - Daily manifest ID
venipak_label_path       - Path to PDF label
venipak_shipment_created_at - Timestamp
venipak_error            - Last error message (if failed)
venipak_status           - Current tracking status
venipak_status_updated_at - Last status check
venipak_delivered_at     - Delivery timestamp
venipak_carrier_code     - Secondary carrier (e.g., reg_eco)
venipak_carrier_tracking - Secondary tracking number
venipak_shipment_id      - Venipak internal shipment ID
```

---

## Implementation Files

| File | Purpose |
|------|---------|
| `app/Services/VenipakShipmentService.php` | Main Venipak API integration |
| `app/Jobs/CreateVenipakShipment.php` | Background job for shipment creation |
| `app/Http/Controllers/VenipakController.php` | Pickup points API |
| `resources/js/utils/shipping-methods.ts` | Frontend shipping options |
| `resources/js/components/venipak-pickup-selector.tsx` | Pickup point selector UI |

---

## Future Improvements

- [ ] Add postal code format validation per country on checkout
- [ ] Add mobile number validation for pickup point orders
- [ ] Implement automatic tracking status updates via cron job
- [ ] Add support for COD (Cash on Delivery) for domestic orders
- [ ] Consider Express service for LT<>EE (1-day delivery)
- [ ] Add package weight calculation based on products

---

*Last updated: December 2024*
