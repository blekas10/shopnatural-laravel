# Venipak API Integration Documentation

> Last updated: 2025-12-08
> Tested and verified working

## Overview

This document contains the complete Venipak shipping API integration guide based on actual testing and analysis of official plugins (PrestaShop, Magento, WooCommerce).

## API Base URLs

| Environment | URL |
|-------------|-----|
| **Production** | `https://go.venipak.lt/` |
| **Test/UAT** | `https://venipak.uat.megodata.com/` |

## Our Credentials

| Credential | Value |
|------------|-------|
| **User ID** | 10281 |
| **Username** | naturalbeauty |
| **Password** | naturalbeauty1 |

---

## 1. Create Shipment

### Endpoint
```
POST https://go.venipak.lt/import/send_auth_basic.php
```

### Authentication
- **Type:** Basic Auth
- **Username:** Your Venipak username
- **Password:** Your Venipak password

### Headers
```
Content-Type: text/xml
```

### Request Body (XML)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<description type="1">
  <manifest title="10281251208001" name="Order Name">
    <shipment>
      <consignee>
        <name>Recipient Name</name>
        <country>LT</country>
        <city>Vilnius</city>
        <address>Street Address 1</address>
        <post_code>01103</post_code>
        <contact_person>Contact Name</contact_person>
        <contact_tel>+37060000000</contact_tel>
        <contact_email>email@example.com</contact_email>
      </consignee>
      <attribute>
        <delivery_type>nwd</delivery_type>
        <cod>0</cod>
      </attribute>
      <pack>
        <pack_no>V10281E1000025</pack_no>
        <weight>1</weight>
      </pack>
    </shipment>
  </manifest>
</description>
```

### Success Response
```xml
<?xml version="1.0" encoding="UTF-8"?>
<answer type="ok">
  <text>V10281E1000025</text>
</answer>
```

### Error Response
```xml
<?xml version="1.0" encoding="UTF-8"?>
<answer type="error">
  <error shipment="0" pack="V10281E1000009" code="42">
    <text>Pack number PACK_NO is already in use -> V10281E1000009.</text>
  </error>
</answer>
```

### cURL Example
```bash
curl -X POST "https://go.venipak.lt/import/send_auth_basic.php" \
  -u "naturalbeauty:naturalbeauty1" \
  -H "Content-Type: text/xml" \
  -d @shipment.xml
```

### PHP/Laravel Example
```php
$response = Http::withBasicAuth($username, $password)
    ->withBody($xml, 'text/xml')
    ->post('https://go.venipak.lt/import/send_auth_basic.php');
```

---

## 2. Get Label PDF

### Endpoint
```
POST https://go.venipak.lt/ws/print_label
```

### Authentication
- **Type:** Form data (user/pass fields)

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user` | string | Yes | Your Venipak username |
| `pass` | string | Yes | Your Venipak password |
| `pack_no` | string | Yes | Pack number (V10281E1000025) |
| `format` | string | No | `a4` = A4 page, `other` = 100x150mm sticker |
| `carrier` | string | No | `venipak` (default), `global`, `all` |
| `printReturns` | string | No | `1` = include return label, `0` = no return label |

### Response
- **Content-Type:** `application/pdf`
- **Body:** PDF binary data

### cURL Example
```bash
curl -X POST "https://go.venipak.lt/ws/print_label" \
  -d "user=naturalbeauty" \
  -d "pass=naturalbeauty1" \
  -d "pack_no=V10281E1000025" \
  -d "format=other" \
  -o label.pdf
```

### PHP/Laravel Example
```php
$response = Http::asForm()->post('https://go.venipak.lt/ws/print_label', [
    'user' => $username,
    'pass' => $password,
    'pack_no' => $packNo,
    'format' => 'other', // 100x150mm sticker
]);

if ($response->successful()) {
    Storage::put("labels/{$packNo}.pdf", $response->body());
}
```

---

## 3. Track Shipment

### Endpoint
```
GET https://go.venipak.lt/ws/tracking.php
```

### Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `type` | `1` | Tracking type |
| `output` | `json` or `html` | Response format |
| `code` | `V10281E1000025` | Pack number |

### cURL Example
```bash
curl "https://go.venipak.lt/ws/tracking.php?type=1&output=json&code=V10281E1000025"
```

### JSON Response Example
```json
[
  {
    "pack_no": "V10281E1000025",
    "siunt_id": 96218192,
    "date": "2025-12-08 13:42:24",
    "status": "At sender",
    "terminal": null
  }
]
```

### PHP/Laravel Example
```php
$response = Http::get('https://go.venipak.lt/ws/tracking.php', [
    'type' => 1,
    'output' => 'json',
    'code' => $packNo,
]);

$tracking = $response->json();
```

---

## 4. Get Pickup Points

### Endpoint
```
GET https://go.venipak.lt/ws/get_pickup_points
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `country` | string | Filter by country (LT, LV, EE) |
| `city` | string | Filter by city |
| `pick_up_type` | string | `1` = Pickup points, `3` = Lockers, `1,3` = Both |
| `view` | string | `json` (default), `csv` |

### cURL Example
```bash
curl "https://go.venipak.lt/ws/get_pickup_points?country=LT&pick_up_type=1,3&view=json"
```

---

## Pack Number Format

### Structure
```
V10281E1000025
│ │     │
│ │     └── 7-digit sequential number (0000001, 0000002, etc.)
│ └──────── Capital letter E
└────────── V + User ID (10281)
```

### Rules
- **Must be unique** - Venipak rejects duplicates
- **You generate it** - Not provided by Venipak
- **Sequential recommended** - Easier to manage
- **Store counter in database** - Not cache (cache can be cleared)

### Generation (How Official Plugins Do It)

**PrestaShop Plugin Pattern:**
```php
// Config key: MJVP_COUNTER_PACKS (default: 0)
$pack_no = (int)Configuration::get('MJVP_COUNTER_PACKS') + 1;
Configuration::updateValue('MJVP_COUNTER_PACKS', $pack_no);
$packNumber = sprintf('V%sE%07d', $userId, $pack_no);
```

**Laravel Implementation:**
```php
private function generatePackNumber(): string
{
    return DB::transaction(function () {
        $counter = DB::table('settings')
            ->where('key', 'venipak_pack_counter')
            ->lockForUpdate()
            ->value('value');

        $newCounter = (int)$counter + 1;

        DB::table('settings')
            ->where('key', 'venipak_pack_counter')
            ->update(['value' => $newCounter]);

        return sprintf('V%sE%07d', $this->userId, $newCounter);
    });
}
```

---

## Manifest Title

### Format
```
{user_id}{YYMMDD}{counter}
Example: 10281251208001
         │     │      │
         │     │      └── Daily counter (001, 002, etc.)
         │     └───────── Date (2025-12-08)
         └─────────────── User ID
```

### Strategy
- **One manifest per day** - Group all daily shipments
- **Same title = same manifest** - Shipments are grouped together
- **New day = new title** - Increment date portion
- **Can have multiple per day** - Increment counter (001, 002, etc.)

### Example
```php
private function generateManifestTitle(): string
{
    $date = now()->format('ymd'); // 251208
    return $this->userId . $date . '001'; // 10281251208001
}
```

---

## Shipment to Pickup Point / Locker

When shipping to a pickup point or locker, use the pickup point data as consignee:

```xml
<consignee>
  <!-- From get_pickup_points API -->
  <name>Venipak Pickup, Eurokos</name>
  <company_code>134519743</company_code>
  <address>Šeškinės g. 32</address>
  <city>Vilnius</city>
  <post_code>07157</post_code>
  <country>LT</country>
  <!-- Customer contact info -->
  <contact_person>John Smith</contact_person>
  <contact_tel>+37060012345</contact_tel>
  <contact_email>customer@email.com</contact_email>
</consignee>
```

### Steps
1. Get pickup points from `/ws/get_pickup_points`
2. Use pickup point's `name`, `company_code`, `address`, `city`, `zip`, `country`
3. Add customer's `contact_person`, `contact_tel`, `contact_email`

---

## Delivery Types

| Code | Description |
|------|-------------|
| `nwd` | Next working day (standard) |
| `nwd10` | Delivery before 10:00 |
| `nwd12` | Delivery before 12:00 |
| `nwd18_22` | Evening delivery 18:00-22:00 |
| `sat` | Saturday delivery |
| `tswd` | Same day delivery |

---

## Error Codes

| Code | Description |
|------|-------------|
| `2` | No XML data |
| `9` | Incorrect user name or password |
| `42` | Pack number already in use |

---

## Complete Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    ORDER PAID                            │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  1. Generate Pack Number                                 │
│     V10281E{next_counter}                               │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  2. Build XML                                            │
│     POST /import/send_auth_basic.php                    │
│     Auth: Basic Auth                                     │
│     Body: XML (text/xml)                                │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  3. Store Tracking Number                                │
│     order.venipak_pack_no = V10281E1000025              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  4. Get Label PDF                                        │
│     POST /ws/print_label                                │
│     Auth: Form data (user/pass)                         │
│     Params: pack_no, format=other                       │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  5. Store Label                                          │
│     storage/app/venipak-labels/{order}-{pack_no}.pdf   │
└─────────────────────┴───────────────────────────────────┘
```

---

## API Endpoints Summary

| Action | Method | Endpoint | Auth |
|--------|--------|----------|------|
| Create Shipment | POST | `/import/send_auth_basic.php` | Basic Auth |
| Get Label PDF | POST | `/ws/print_label` | Form (user/pass) |
| Track Shipment | GET | `/ws/tracking.php` | None |
| Get Pickup Points | GET | `/ws/get_pickup_points` | None |

---

## Important Notes

1. **Pack numbers must be unique** - Generate and track them yourself
2. **Store counter in database** - Not cache (survives restarts)
3. **Basic Auth for shipment creation** - Not form fields
4. **Form fields for label PDF** - Not Basic Auth
5. **XML must be single line or properly formatted** - No broken tags
6. **Manifest groups shipments** - Same title = same manifest
7. **Labels are 100x150mm** - Use `format=other` for sticker size

---

## Testing Commands

### Create Shipment
```bash
curl -X POST "https://go.venipak.lt/import/send_auth_basic.php" \
  -u "naturalbeauty:naturalbeauty1" \
  -H "Content-Type: text/xml" \
  -d '<?xml version="1.0" encoding="UTF-8"?><description type="1"><manifest title="10281251208001" name="Test"><shipment><consignee><name>Test</name><country>LT</country><city>Vilnius</city><address>Test 1</address><post_code>01103</post_code><contact_person>Test</contact_person><contact_tel>+37060000000</contact_tel></consignee><attribute><delivery_type>nwd</delivery_type><cod>0</cod></attribute><pack><pack_no>V10281E1000099</pack_no><weight>1</weight></pack></shipment></manifest></description>'
```

### Get Label
```bash
curl -X POST "https://go.venipak.lt/ws/print_label" \
  -d "user=naturalbeauty" \
  -d "pass=naturalbeauty1" \
  -d "pack_no=V10281E1000099" \
  -d "format=other" \
  -o label.pdf
```

### Track
```bash
curl "https://go.venipak.lt/ws/tracking.php?type=1&output=json&code=V10281E1000099"
```

---

## Tested Examples (2025-12-08)

### Multiple Shipments on Same Manifest

Successfully tested creating 2 shipments on same manifest `10281251208003`:

**Shipment 1 - Home Delivery:**
```xml
<consignee>
  <name>Jonas Jonaitis</name>
  <country>LT</country>
  <city>Kaunas</city>
  <address>Laisves al. 100</address>
  <post_code>44001</post_code>
  <contact_person>Jonas Jonaitis</contact_person>
  <contact_tel>+37061234567</contact_tel>
</consignee>
<pack>
  <pack_no>V10281E1000030</pack_no>
  <weight>2</weight>
</pack>
```

**Shipment 2 - Pickup Point (EOLTAS Vilnius):**
```xml
<consignee>
  <!-- Pickup point data from /ws/get_pickup_points -->
  <name>Venipak Pickup, EOLTAS</name>
  <company_code>133769530</company_code>
  <country>LT</country>
  <city>Vilnius</city>
  <address>Kalvariju g. 206</address>
  <post_code>08314</post_code>
  <!-- Customer contact info -->
  <contact_person>Petras Petraitis</contact_person>
  <contact_tel>+37069876543</contact_tel>
  <contact_email>petras@test.lt</contact_email>
</consignee>
<pack>
  <pack_no>V10281E1000031</pack_no>
  <weight>1.5</weight>
</pack>
```

### Multiple Labels in One PDF

You can request multiple labels in a single PDF:
```bash
curl -X POST "https://go.venipak.lt/ws/print_label" \
  -d "user=naturalbeauty" \
  -d "pass=naturalbeauty1" \
  -d "pack_no=V10281E1000030" \
  -d "pack_no=V10281E1000031" \
  -d "format=other" \
  -o combined-labels.pdf
```
