# Discount System Implementation Guide

## Overview

Two types of discounts:

1. **Product Discounts** - Admin sets discounts on products/brands/categories
2. **Promo Codes** - Customer enters code at checkout

## Key Rules

1. All product prices are stored WITH VAT included (21%)
2. Product discount is applied FIRST
3. Tax is calculated FROM the discounted price
4. Promo code is applied to cart total at checkout

---

## Display Format

### Cart Page

```
┌─────────────────────────────────────────┐
│ ORDER SUMMARY                           │
├─────────────────────────────────────────┤
│ Product Price:           €50.00         │  ← originalSubtotal (with VAT)
│ Product Discount:       -€10.00         │  ← productDiscount
├─────────────────────────────────────────┤
│ Subtotal:                €40.00         │  ← subtotal (after discount, with VAT)
│ Price excl. VAT:         €33.06         │  ← subtotal / 1.21
│ VAT (21%):               €6.94          │  ← subtotal - priceExclVat
├─────────────────────────────────────────┤
│ GRAND TOTAL:             €40.00         │  ← subtotal
└─────────────────────────────────────────┘
```

### Checkout Page

```
┌─────────────────────────────────────────┐
│ ORDER SUMMARY                           │
├─────────────────────────────────────────┤
│ Product Price:           €50.00         │  ← originalSubtotal
│ Product Discount:       -€10.00         │  ← productDiscount
├─────────────────────────────────────────┤
│ Subtotal:                €40.00         │  ← subtotal
│ Price excl. VAT:         €33.06         │  ← subtotal / 1.21
│ VAT (21%):               €6.94          │  ← subtotal - priceExclVat
│ Shipping:                €20.00         │  ← shippingCost
│ Promo Code (SAVE10):    -€4.00          │  ← promoDiscount
├─────────────────────────────────────────┤
│ GRAND TOTAL:             €56.00         │  ← subtotal + shipping - promoDiscount
└─────────────────────────────────────────┘
```

---

## Calculation Formulas

### Frontend (TypeScript)

```typescript
const VAT_RATE = 0.21;

// 1. Calculate original subtotal (sum of compareAtPrice or price, WITH VAT)
const originalSubtotal = items.reduce((sum, item) => {
    const originalPrice = item.variant?.compareAtPrice || item.product.compareAtPrice
        || item.variant?.price || item.product.price;
    return sum + originalPrice * item.quantity;
}, 0);

// 2. Calculate current subtotal (sum of actual prices, WITH VAT)
const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.price || item.product.price;
    return sum + price * item.quantity;
}, 0);

// 3. Product discount = difference
const productDiscount = originalSubtotal - subtotal;

// 4. Price without VAT (calculated from DISCOUNTED subtotal)
const priceExclVat = subtotal / (1 + VAT_RATE);

// 5. VAT amount
const vatAmount = subtotal - priceExclVat;

// 6. Promo code discount (only at checkout)
const promoDiscount = appliedPromoCode?.discount_amount || 0;

// 7. Grand total
const grandTotal = subtotal + shipping - promoDiscount;
```

### Backend (PHP)

```php
$vatRate = 0.21;

// From validated request
$subtotal = $validated['subtotal'];           // After product discount, with VAT
$productDiscount = $validated['productDiscount'];
$shipping = $validated['shipping'];
$promoDiscount = $validated['promoDiscount'];

// Calculate for storage
$priceExclVat = $subtotal / (1 + $vatRate);
$vatAmount = $subtotal - $priceExclVat;
$grandTotal = $subtotal + $shipping - $promoDiscount;
```

---

## Database Schema

### Orders Table - New/Modified Columns

```php
Schema::table('orders', function (Blueprint $table) {
    // Original product total (before product discounts, with VAT)
    $table->decimal('original_subtotal', 10, 2)->default(0);

    // Product discount amount
    $table->decimal('product_discount', 10, 2)->default(0);

    // Subtotal after product discount (with VAT) - already exists as 'subtotal'

    // Price excluding VAT (calculated from subtotal)
    $table->decimal('subtotal_excl_vat', 10, 2)->default(0);

    // VAT amount
    $table->decimal('vat_amount', 10, 2)->default(0);

    // Promo code discount
    $table->decimal('promo_discount', 10, 2)->default(0);

    // Promo code reference
    $table->foreignId('promo_code_id')->nullable()->constrained('promo_codes');
    $table->string('promo_code_value')->nullable();

    // shipping_cost - already exists
    // total - already exists (grand total)
});
```

### What Each Field Stores

| Field | Example | Description |
|-------|---------|-------------|
| `original_subtotal` | 50.00 | Sum of original prices (with VAT) |
| `product_discount` | 10.00 | Amount saved from product discounts |
| `subtotal` | 40.00 | After product discount (with VAT) |
| `subtotal_excl_vat` | 33.06 | Subtotal without VAT |
| `vat_amount` | 6.94 | VAT on subtotal |
| `shipping_cost` | 20.00 | Shipping fee |
| `promo_discount` | 4.00 | Promo code discount |
| `total` | 56.00 | Grand total to pay |

### Math Verification

```
original_subtotal = 50.00
product_discount = 10.00
subtotal = original_subtotal - product_discount = 40.00
subtotal_excl_vat = subtotal / 1.21 = 33.06
vat_amount = subtotal - subtotal_excl_vat = 6.94
shipping_cost = 20.00
promo_discount = 4.00
total = subtotal + shipping_cost - promo_discount = 56.00

Verification: 40 + 20 - 4 = 56 ✓
```

---

## Data Flow

### 1. Product Has Discount (Admin Sets)

Product in database:
```
price: 40.00          (sale price, VAT included)
compare_at_price: 50.00   (original price, VAT included)
```

### 2. Cart Calculation (Frontend)

```typescript
// Item: { price: 40, compareAtPrice: 50, quantity: 1 }

originalSubtotal = 50 * 1 = 50
subtotal = 40 * 1 = 40
productDiscount = 50 - 40 = 10
priceExclVat = 40 / 1.21 = 33.06
vatAmount = 40 - 33.06 = 6.94
grandTotal = 40
```

### 3. Checkout Calculation (Frontend)

```typescript
// Same as cart, plus:
shipping = 20
promoDiscount = 4  // From applied code
grandTotal = 40 + 20 - 4 = 56
```

### 4. Send to Backend

```typescript
const checkoutData = {
    items: [...],
    originalSubtotal: 50,
    productDiscount: 10,
    subtotal: 40,
    subtotalExclVat: 33.06,
    vatAmount: 6.94,
    shipping: 20,
    promoDiscount: 4,
    promoCode: 'SAVE10',
    total: 56,
};
```

### 5. Backend Validates & Stores

```php
// Recalculate server-side to prevent tampering
$itemsTotal = collect($items)->sum(fn($item) => $item['price'] * $item['quantity']);
$originalTotal = collect($items)->sum(fn($item) =>
    ($item['compareAtPrice'] ?? $item['price']) * $item['quantity']
);

$order = Order::create([
    'original_subtotal' => $originalTotal,
    'product_discount' => $originalTotal - $itemsTotal,
    'subtotal' => $itemsTotal,
    'subtotal_excl_vat' => $itemsTotal / 1.21,
    'vat_amount' => $itemsTotal - ($itemsTotal / 1.21),
    'shipping_cost' => $shipping,
    'promo_discount' => $promoDiscountAmount,
    'promo_code_id' => $promoCode?->id,
    'promo_code_value' => $promoCode?->code,
    'total' => $itemsTotal + $shipping - $promoDiscountAmount,
]);
```

---

## Files to Create/Modify

### Phase 1: Product Discounts (Admin)

| File | Action | Purpose |
|------|--------|---------|
| `database/migrations/xxx_create_product_discounts_table.php` | Create | Store discount rules |
| `app/Models/ProductDiscount.php` | Create | Eloquent model |
| `app/Services/ProductDiscountService.php` | Create | Apply discounts to products |
| `app/Http/Controllers/Admin/ProductDiscountController.php` | Create | CRUD for admin |
| `resources/js/pages/admin/product-discounts/` | Create | Admin UI |

### Phase 2: Promo Codes

| File | Action | Purpose |
|------|--------|---------|
| `database/migrations/xxx_create_promo_codes_table.php` | Create | Store promo codes |
| `app/Models/PromoCode.php` | Create | Eloquent model |
| `app/Services/PromoCodeService.php` | Create | Validate & apply codes |
| `app/Http/Controllers/Api/PromoCodeController.php` | Create | Validate code API |
| `app/Http/Controllers/Admin/PromoCodeController.php` | Create | Admin CRUD |

### Phase 3: Cart & Checkout Updates

| File | Action | Purpose |
|------|--------|---------|
| `resources/js/pages/cart.tsx` | Modify | Show new breakdown |
| `resources/js/components/order-summary.tsx` | Modify | New display format |
| `resources/js/pages/checkout.tsx` | Modify | Add promo code input, new totals |
| `resources/js/types/checkout.d.ts` | Modify | Update types |

### Phase 4: Order Storage

| File | Action | Purpose |
|------|--------|---------|
| `database/migrations/xxx_add_discount_fields_to_orders.php` | Create | New columns |
| `app/Models/Order.php` | Modify | Add fillable/casts |
| `app/Http/Controllers/CheckoutController.php` | Modify | Store all discount data |

### Phase 5: Order Display

| File | Action | Purpose |
|------|--------|---------|
| `app/Http/Controllers/OrderController.php` | Modify | Return discount data |
| `app/Http/Controllers/Admin/OrderController.php` | Modify | Return discount data |
| `app/Http/Resources/OrderResource.php` | Modify | Include discount fields |
| `resources/js/pages/order-confirmation.tsx` | Modify | Show breakdown |
| `resources/js/pages/orders/show.tsx` | Modify | Show breakdown |
| `resources/js/pages/admin/orders/show.tsx` | Modify | Show breakdown |
| `resources/views/emails/invoice-pdf.blade.php` | Modify | Show breakdown |

---

## Translations Needed

### English (lang/en.json)

```json
{
    "cart.product_price": "Product Price",
    "cart.product_discount": "Product Discount",
    "cart.subtotal": "Subtotal",
    "cart.price_excl_vat": "Price excl. VAT",
    "cart.vat": "VAT (21%)",
    "cart.shipping": "Shipping",
    "cart.promo_code": "Promo Code",
    "cart.grand_total": "Grand Total",
    "checkout.enter_promo_code": "Enter promo code",
    "checkout.apply": "Apply",
    "checkout.promo_applied": "Promo code applied!",
    "checkout.promo_invalid": "Invalid promo code",
    "checkout.promo_expired": "This promo code has expired",
    "checkout.promo_min_order": "Minimum order amount not met"
}
```

### Lithuanian (lang/lt.json)

```json
{
    "cart.product_price": "Produkto kaina",
    "cart.product_discount": "Produkto nuolaida",
    "cart.subtotal": "Tarpinė suma",
    "cart.price_excl_vat": "Kaina be PVM",
    "cart.vat": "PVM (21%)",
    "cart.shipping": "Pristatymas",
    "cart.promo_code": "Nuolaidos kodas",
    "cart.grand_total": "Galutinė suma",
    "checkout.enter_promo_code": "Įveskite nuolaidos kodą",
    "checkout.apply": "Pritaikyti",
    "checkout.promo_applied": "Nuolaidos kodas pritaikytas!",
    "checkout.promo_invalid": "Neteisingas nuolaidos kodas",
    "checkout.promo_expired": "Šis nuolaidos kodas nebegalioja",
    "checkout.promo_min_order": "Nepasiekta minimali užsakymo suma"
}
```

---

## Common Mistakes to Avoid

### ❌ WRONG: Calculate VAT from original price
```typescript
const vatAmount = originalSubtotal - (originalSubtotal / 1.21); // WRONG!
```

### ✅ CORRECT: Calculate VAT from discounted subtotal
```typescript
const vatAmount = subtotal - (subtotal / 1.21); // CORRECT!
```

### ❌ WRONG: Show "Subtotal" then subtract discount
```
Subtotal: €40.00
Discount: -€10.00
Total: €40.00  ← Math doesn't work!
```

### ✅ CORRECT: Show "Product Price" then subtract discount
```
Product Price: €50.00
Product Discount: -€10.00
Subtotal: €40.00  ← Clear!
```

### ❌ WRONG: Apply promo code to original price
```typescript
const promoDiscount = originalSubtotal * 0.10; // WRONG!
```

### ✅ CORRECT: Apply promo code to subtotal (after product discount)
```typescript
const promoDiscount = subtotal * 0.10; // CORRECT!
```

---

## Testing Scenarios

### Scenario 1: Product discount only
- Product: €50 (original), €40 (sale)
- Expected: Product Price €50, Discount -€10, Subtotal €40, VAT €6.94, Total €40

### Scenario 2: Promo code only (no product discount)
- Product: €50
- Promo: 10% off
- Expected: Product Price €50, Subtotal €50, Promo -€5, Total €45

### Scenario 3: Both discounts
- Product: €50 (original), €40 (sale)
- Promo: 10% off
- Expected: Product Price €50, Product Discount -€10, Subtotal €40, Promo -€4, Total €36

### Scenario 4: With shipping
- Product: €40 (after discount)
- Shipping: €20
- Promo: €4 off
- Expected: Subtotal €40, Shipping €20, Promo -€4, Total €56

---

## Implementation Order

1. **Migration** - Add new columns to orders table
2. **Cart display** - Update to show new breakdown
3. **Checkout display** - Same breakdown + promo input
4. **CheckoutController** - Store all values correctly
5. **Order display pages** - Show stored values
6. **Product Discounts admin** - Create CRUD
7. **Promo Codes admin** - Create CRUD
8. **Testing** - Verify all scenarios

---

## Admin Dashboard - Product Discounts

### Sidebar Menu
Add under existing menu:
```
Discounts
├── Product Discounts
└── Promo Codes
```

### Product Discounts CRUD

**List Page** (`/admin/product-discounts`)
- Table columns: Name, Type (%), Value, Scope, Status, Valid From/To, Actions
- Filters: Active/Inactive, Scope type
- Actions: Edit, Delete, Toggle Active

**Create/Edit Form** (`/admin/product-discounts/create`, `/admin/product-discounts/{id}/edit`)

| Field | Type | Description |
|-------|------|-------------|
| Name | Text | "Summer Sale", "Black Friday" |
| Discount Type | Select | Percentage / Fixed Amount |
| Value | Number | 20 (for 20%) or 10.00 (for €10) |
| Scope | Select | All Products / Categories / Brands / Specific Products |
| Categories | Multi-select | Show if scope = Categories |
| Brands | Multi-select | Show if scope = Brands |
| Products | Multi-select | Show if scope = Specific Products |
| Start Date | DateTime | When discount starts (optional) |
| End Date | DateTime | When discount ends (optional) |
| Is Active | Toggle | Enable/disable discount |
| Priority | Number | Higher = applied first (for overlapping discounts) |

### Product Discounts Database Schema

```php
Schema::create('product_discounts', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->enum('type', ['percentage', 'fixed']);
    $table->decimal('value', 10, 2);
    $table->enum('scope', ['all', 'categories', 'brands', 'products']);
    $table->json('category_ids')->nullable();
    $table->json('brand_ids')->nullable();
    $table->json('product_ids')->nullable();
    $table->timestamp('starts_at')->nullable();
    $table->timestamp('ends_at')->nullable();
    $table->boolean('is_active')->default(true);
    $table->integer('priority')->default(0);
    $table->timestamps();
});
```

### How Product Discounts Apply

When loading products (in ProductResource, ProductDetailResource):
```php
// ProductDiscountService.php
public function applyDiscount(Product $product): array
{
    $discount = $this->findApplicableDiscount($product);

    if (!$discount) {
        return [
            'price' => $product->price,
            'compareAtPrice' => null,
        ];
    }

    $originalPrice = $product->price;
    $discountedPrice = $discount->type === 'percentage'
        ? $originalPrice * (1 - $discount->value / 100)
        : $originalPrice - $discount->value;

    return [
        'price' => max(0, round($discountedPrice, 2)),
        'compareAtPrice' => $originalPrice,
    ];
}
```

---

## Admin Dashboard - Promo Codes

### Promo Codes CRUD

**List Page** (`/admin/promo-codes`)
- Table columns: Code, Type, Value, Usage (used/limit), Status, Valid From/To, Actions
- Filters: Active/Inactive/Expired
- Actions: Edit, Delete, Toggle Active, Copy Code

**Create/Edit Form** (`/admin/promo-codes/create`, `/admin/promo-codes/{id}/edit`)

| Field | Type | Description |
|-------|------|-------------|
| Code | Text | "SAVE10", "SUMMER2024" (auto-uppercase) |
| Description | Text | Internal notes |
| Discount Type | Select | Percentage / Fixed Amount |
| Value | Number | 10 (for 10%) or 5.00 (for €5) |
| Minimum Order | Number | Min cart total to use code (optional) |
| Maximum Discount | Number | Cap for percentage discounts (optional) |
| Usage Limit | Number | Total uses allowed (optional) |
| Per User Limit | Number | Uses per customer (optional) |
| Start Date | DateTime | When code activates (optional) |
| End Date | DateTime | When code expires (optional) |
| Is Active | Toggle | Enable/disable code |

### Promo Codes Database Schema

```php
Schema::create('promo_codes', function (Blueprint $table) {
    $table->id();
    $table->string('code')->unique();
    $table->string('description')->nullable();
    $table->enum('type', ['percentage', 'fixed']);
    $table->decimal('value', 10, 2);
    $table->decimal('min_order_amount', 10, 2)->nullable();
    $table->decimal('max_discount_amount', 10, 2)->nullable();
    $table->integer('usage_limit')->nullable();
    $table->integer('per_user_limit')->nullable();
    $table->integer('times_used')->default(0);
    $table->timestamp('starts_at')->nullable();
    $table->timestamp('ends_at')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});

// Track usage per user
Schema::create('promo_code_usages', function (Blueprint $table) {
    $table->id();
    $table->foreignId('promo_code_id')->constrained()->onDelete('cascade');
    $table->foreignId('order_id')->constrained()->onDelete('cascade');
    $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
    $table->string('email'); // For guest checkout tracking
    $table->decimal('discount_amount', 10, 2);
    $table->timestamps();
});
```

### Promo Code Validation API

```php
// POST /api/promo-code/validate
{
    "code": "SAVE10",
    "cart_total": 50.00,
    "user_id": 1,        // optional
    "email": "test@example.com"
}

// Response (success)
{
    "valid": true,
    "code": "SAVE10",
    "type": "percentage",
    "value": 10,
    "discount_amount": 5.00,
    "formatted_value": "10%"
}

// Response (error)
{
    "valid": false,
    "error": "promo_code.expired",
    "message": "This promo code has expired"
}
```

---

## Admin Files to Create

### Product Discounts

| File | Purpose |
|------|---------|
| `app/Models/ProductDiscount.php` | Model |
| `app/Services/ProductDiscountService.php` | Business logic |
| `app/Http/Controllers/Admin/ProductDiscountController.php` | CRUD controller |
| `app/Http/Requests/ProductDiscountRequest.php` | Validation |
| `resources/js/pages/admin/product-discounts/index.tsx` | List page |
| `resources/js/pages/admin/product-discounts/create.tsx` | Create form |
| `resources/js/pages/admin/product-discounts/edit.tsx` | Edit form |

### Promo Codes

| File | Purpose |
|------|---------|
| `app/Models/PromoCode.php` | Model |
| `app/Models/PromoCodeUsage.php` | Usage tracking model |
| `app/Services/PromoCodeService.php` | Validation & calculation |
| `app/Http/Controllers/Admin/PromoCodeController.php` | Admin CRUD |
| `app/Http/Controllers/Api/PromoCodeController.php` | Checkout API |
| `app/Http/Requests/PromoCodeRequest.php` | Validation |
| `resources/js/pages/admin/promo-codes/index.tsx` | List page |
| `resources/js/pages/admin/promo-codes/create.tsx` | Create form |
| `resources/js/pages/admin/promo-codes/edit.tsx` | Edit form |

### Routes to Add

```php
// routes/web.php (admin routes)
Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {
    // Product Discounts
    Route::resource('product-discounts', ProductDiscountController::class);

    // Promo Codes
    Route::resource('promo-codes', PromoCodeController::class);
});

// routes/api.php
Route::post('/promo-code/validate', [Api\PromoCodeController::class, 'validate']);
```

### Sidebar Update

```tsx
// app-sidebar.tsx
{
    title: t('sidebar.discounts', 'Discounts'),
    icon: Tag,
    items: [
        {
            title: t('sidebar.product_discounts', 'Product Discounts'),
            href: route('admin.product-discounts.index'),
        },
        {
            title: t('sidebar.promo_codes', 'Promo Codes'),
            href: route('admin.promo-codes.index'),
        },
    ],
}
```
