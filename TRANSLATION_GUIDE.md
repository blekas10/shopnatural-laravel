# 🌍 Translation System Guide

## ⚠️ CRITICAL REMINDER
**THIS SITE IS FULLY TRANSLATABLE - ALL USER-FACING TEXT MUST USE TRANSLATIONS!**

Before adding ANY new text to components, pages, or emails:
1. ✅ Add the translation key to `lang/en.json` and `lang/lt.json`
2. ✅ Use `t('key.name')` instead of hardcoded strings
3. ✅ Test in both languages before committing

---

## 📋 Current Setup

### Supported Languages
- **English (en)** - Default/Primary
- **Lithuanian (lt)** - Secondary

### Translation Files Location
```
lang/
├── en.json  # English translations
└── lt.json  # Lithuanian translations
```

---

## 🎯 How to Add Translations

### 1. **UI Strings** (Buttons, Labels, Messages)

**Step 1:** Add to JSON files
```json
// lang/en.json
{
  "checkout.button": "Proceed to Checkout",
  "cart.empty": "Your cart is empty"
}

// lang/lt.json
{
  "checkout.button": "Tęsti atsiskaitymą",
  "cart.empty": "Jūsų krepšelis tuščias"
}
```

**Step 2:** Use in React components
```tsx
import { useTranslation } from '@/hooks/use-translation';

function CartPage() {
    const { t } = useTranslation();

    return (
        <div>
            <p>{t('cart.empty')}</p>
            <button>{t('checkout.button')}</button>
        </div>
    );
}
```

**Step 3:** Use in Laravel (Blade/Controllers)
```php
// In controller
return Inertia::render('cart', [
    'message' => __('cart.empty')
]);

// In Blade (if used)
{{ __('checkout.button') }}
```

---

### 2. **Database Content** (Product Names, Descriptions)

For content that comes from database (products, categories, etc.), use **translatable model attributes**.

**Step 1:** Migration with JSON columns
```php
// database/migrations/xxxx_create_products_table.php
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->string('sku')->unique();
    $table->json('name');              // Translatable
    $table->json('description');        // Translatable
    $table->json('short_description');  // Translatable
    $table->decimal('price', 10, 2);
    $table->integer('stock')->default(0);
    $table->timestamps();
});
```

**Step 2:** Model with HasTranslations trait
```php
// app/Models/Product.php
use Spatie\Translatable\HasTranslations;

class Product extends Model
{
    use HasTranslations;

    public $translatable = ['name', 'description', 'short_description'];

    protected $fillable = ['sku', 'name', 'description', 'price', 'stock'];
}
```

**Step 3:** Seeding/Creating with translations
```php
Product::create([
    'sku' => 'SHMP-001',
    'name' => [
        'en' => 'Natural Shampoo',
        'lt' => 'Natūralus šampūnas',
    ],
    'description' => [
        'en' => 'Organic shampoo with natural ingredients',
        'lt' => 'Ekologiškas šampūnas su natūraliais ingredientais',
    ],
    'price' => 15.99,
    'stock' => 100,
]);
```

**Step 4:** Automatic retrieval in current locale
```php
$product = Product::find(1);
echo $product->name; // Automatically returns 'Natural Shampoo' or 'Natūralus šampūnas'
                     // based on app()->getLocale()
```

---

## 📝 Translation Key Naming Convention

Use **dot notation** with clear hierarchy:

```json
{
  "nav.home": "Home",
  "nav.shop": "Shop",
  "nav.categories": "Categories",

  "auth.login": "Login",
  "auth.logout": "Logout",
  "auth.register": "Register",

  "shop.add_to_cart": "Add to Cart",
  "shop.checkout": "Checkout",
  "shop.total": "Total",

  "product.price": "Price",
  "product.stock": "In Stock",
  "product.out_of_stock": "Out of Stock",

  "cart.empty": "Your cart is empty",
  "cart.item_count": "{count} items",

  "checkout.shipping": "Shipping Information",
  "checkout.payment": "Payment Method",
  "checkout.complete": "Complete Order",

  "order.confirmed": "Order Confirmed",
  "order.tracking": "Track Order",

  "footer.about": "About Us",
  "footer.contact": "Contact",

  "common.loading": "Loading...",
  "common.save": "Save",
  "common.cancel": "Cancel"
}
```

---

## 🔄 Dynamic Values in Translations

### Simple replacement
```json
{
  "footer.copyright": "© {year} Shop Natural. All rights reserved."
}
```

```tsx
t('footer.copyright').replace('{year}', new Date().getFullYear())
```

### Pluralization (when needed)
```json
{
  "cart.items_one": "1 item",
  "cart.items_other": "{count} items"
}
```

---

## 🚫 What NOT to Translate

- **SKUs** - Keep as-is (e.g., `SHMP-001`)
- **Prices** - Numbers are universal (format may vary)
- **URLs/Slugs** - Keep in English for SEO consistency
- **Technical IDs** - Database IDs, API keys, etc.
- **Brand names** - "Shop Natural" stays the same

---

## 🧪 Testing Checklist

Before committing new features:

- [ ] All UI text uses `t()` function, not hardcoded strings
- [ ] Translations exist in both `en.json` and `lt.json`
- [ ] Tested language switcher with new content
- [ ] Database content uses translatable columns (if applicable)
- [ ] No console errors when switching languages
- [ ] Mobile view tested in both languages
- [ ] Forms validate in both languages

---

## 📦 Future: Migrating to Database (Pre-Launch)

When ready to go live, run this command to migrate JSON → Database:

```bash
php artisan make:command ImportTranslations
```

```php
// Import all JSON translations to language_lines table
foreach (config('app.available_locales') as $locale) {
    $translations = json_decode(
        file_get_contents(lang_path("{$locale}.json")),
        true
    );

    foreach ($translations as $key => $value) {
        LanguageLine::updateOrCreate(
            ['group' => 'app', 'key' => $key],
            ['text' => [$locale => $value]]
        );
    }
}
```

Then you can edit translations via admin panel!

---

## 🎨 Common Patterns

### React Component with Translations
```tsx
import { useTranslation } from '@/hooks/use-translation';

export default function ProductCard({ product }) {
    const { t } = useTranslation();

    return (
        <div>
            <h3>{product.name}</h3> {/* Auto-translated from DB */}
            <p>{product.price} €</p>
            <button>{t('shop.add_to_cart')}</button>
        </div>
    );
}
```

### Laravel Controller
```php
public function store(Request $request)
{
    // Validate
    $validated = $request->validate([
        'name.en' => 'required|string',
        'name.lt' => 'required|string',
    ]);

    // Create with translations
    $product = Product::create($validated);

    return redirect()->back()->with(
        'success',
        __('product.created_successfully')
    );
}
```

### Emails
```blade
{{-- resources/views/emails/order-confirmation.blade.php --}}
<h1>{{ __('email.order_confirmed') }}</h1>
<p>{{ __('email.order_number', ['number' => $order->id]) }}</p>
```

---

## 🔗 Quick Reference

| Task | Tool/Method |
|------|-------------|
| Add UI translation | Edit `lang/{locale}.json` |
| Use in React | `const { t } = useTranslation()` then `t('key')` |
| Use in Laravel | `__('key')` |
| Make model translatable | Add `HasTranslations` trait + `$translatable` |
| Switch language | Use `LocaleSwitcher` component (already in header) |
| Get current locale | `app()->getLocale()` (Laravel) or `usePage().props.locale` (React) |

---

## 📞 Need Help?

1. Check existing translations in `lang/en.json` for patterns
2. Use `useTranslation()` hook - it's already set up
3. Remember: **Every user-facing string = translation key**

---

**Last Updated:** 2025-01-05
**Translation System Version:** JSON-based (planned migration to DB before launch)
