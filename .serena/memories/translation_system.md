# Translation System Implementation

## Status: ✅ COMPLETE

### Languages Supported
- **English (en)** - Default/Primary
- **Lithuanian (lt)** - Secondary

### Implementation Details

#### Files
- `lang/en.json` - English translations
- `lang/lt.json` - Lithuanian translations
- `TRANSLATION_GUIDE.md` - Comprehensive guide for developers

#### Backend
- **Middleware:** `SetLocale` - Sets app locale from session
- **Controller:** `LocaleController` - Handles locale switching
- **Route:** `POST /locale` - Switch language endpoint
- **Inertia Middleware:** Shares `locale`, `availableLocales`, `translations` with frontend

#### Frontend
- **Hook:** `useTranslation()` - Returns `{ t, locale, availableLocales, switchLocale }`
- **Component:** `LocaleSwitcher` - Dropdown in header (desktop + mobile)
- **Usage:** `const { t } = useTranslation()` then `t('key.name')`

#### Translated Components
All main sections fully translated:
- MainHeader (navigation, categories)
- HeroSection
- FeaturesSection (3 feature cards)
- PromisesSection (2 promises)
- ProductsSection (title, button)
- Footer (all links, newsletter)

### For Future Development

#### UI Strings
Add to JSON files, use `t('key')` in components

#### Database Content (Products, Categories)
When creating products/categories, use JSON columns:

**Migration:**
```php
$table->json('name');
$table->json('description');
```

**Model:**
```php
use Spatie\Translatable\HasTranslations;

class Product extends Model {
    use HasTranslations;
    public $translatable = ['name', 'description'];
}
```

**Create:**
```php
Product::create([
    'name' => ['en' => 'Shampoo', 'lt' => 'Šampūnas'],
    'price' => 15.99
]);
```

**Retrieve:**
```php
$product->name; // Automatically returns translation for current locale
```

### Critical Rules
⚠️ **NEVER hardcode user-facing text**
✅ **ALWAYS use `t('translation.key')`**
✅ **Test in both languages before committing**

### Resources
- Full guide: `TRANSLATION_GUIDE.md`
- Config: `config/app.php` (available_locales)
- Type definitions: `resources/js/types/index.d.ts` (SharedData interface)
