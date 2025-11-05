# 🗄️ Database Architecture - Shop Natural

## Overview

Complete e-commerce database schema with:
- ✅ **Nested categories** (unlimited depth)
- ✅ **Full product details** (name, title, size, descriptions, ingredients)
- ✅ **Multi-language support** (EN/LT via JSON columns)
- ✅ **Multiple categories per product**
- ✅ **Product image gallery**

---

## 📊 Entity Relationship Diagram

```
┌──────────────┐
│  categories  │
│──────────────│
│ id           │◄────┐
│ parent_id    │─────┘ (self-referencing for nesting)
│ slug         │
│ name (JSON)  │
│ description  │
│ image        │
│ order        │
│ is_active    │
│ timestamps   │
└──────────────┘
       │
       │ Many-to-Many
       │
       ├──────────┐
       │          │
       ▼          ▼
┌────────────────────┐     ┌──────────────────┐
│ category_product   │     │     products     │
│────────────────────│     │──────────────────│
│ id                 │     │ id               │
│ category_id        │────►│ sku (unique)     │
│ product_id         │◄────│ slug (unique)    │
│ timestamps         │     │ name (JSON)      │
└────────────────────┘     │ title (JSON)     │
                           │ short_description│
                           │ description (JSON)│
                           │ additional_info  │
                           │ ingredients (JSON)│
                           │ size (ml)        │
                           │ price            │
                           │ compare_at_price │
                           │ stock            │
                           │ low_stock_thres..│
                           │ is_active        │
                           │ is_featured      │
                           │ meta_title       │
                           │ meta_description │
                           │ timestamps       │
                           │ deleted_at       │
                           └──────────────────┘
                                    │
                                    │ One-to-Many
                                    ▼
                           ┌──────────────────┐
                           │ product_images   │
                           │──────────────────│
                           │ id               │
                           │ product_id       │
                           │ path             │
                           │ alt_text (JSON)  │
                           │ is_primary       │
                           │ order            │
                           │ timestamps       │
                           └──────────────────┘
```

---

## 📋 Tables in Detail

### 1. `categories`

Hierarchical category structure (unlimited nesting depth).

**Structure:**
| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `parent_id` | bigint (nullable) | Parent category ID (null = root category) |
| `slug` | string (unique) | URL-friendly identifier |
| `name` | JSON | Translatable: `{"en":"Body Care","lt":"Kūno priežiūra"}` |
| `description` | JSON (nullable) | Translatable category description |
| `image` | string (nullable) | Category image path |
| `order` | integer | Display order (for manual sorting) |
| `is_active` | boolean | Active/inactive status |
| `timestamps` | | `created_at`, `updated_at` |

**Example Hierarchy:**
```
Body Care (parent_id: null)
 └── Lotions (parent_id: 1)
     └── Hand Lotions (parent_id: 2)
```

**Indexes:**
- `parent_id`
- `is_active`
- `order`

---

### 2. `products`

Main products table with all product information.

**Structure:**
| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `sku` | string (unique) | Stock Keeping Unit (e.g., "SHMP-001") |
| `slug` | string (unique) | URL-friendly identifier |
| `name` | JSON | **Translatable** product name |
| `title` | JSON (nullable) | **Translatable** tagline/subtitle |
| `short_description` | JSON (nullable) | **Translatable** brief description for listings |
| `description` | JSON | **Translatable** full product description |
| `additional_information` | JSON (nullable) | **Translatable** usage instructions, care tips |
| `ingredients` | JSON | **Translatable** list of ingredients |
| `size` | decimal(8,2) (nullable) | Size in ml (e.g., 250.00, 500.00) |
| `price` | decimal(10,2) | Current price in EUR |
| `compare_at_price` | decimal(10,2) (nullable) | Original price (for sale items) |
| `stock` | integer | Current stock quantity |
| `low_stock_threshold` | integer | Alert when stock falls below this |
| `is_active` | boolean | Active/inactive status |
| `is_featured` | boolean | Show on homepage/featured section |
| `meta_title` | JSON (nullable) | **Translatable** SEO title |
| `meta_description` | JSON (nullable) | **Translatable** SEO description |
| `timestamps` | | `created_at`, `updated_at` |
| `deleted_at` | timestamp (nullable) | Soft delete (preserves order history) |

**Indexes:**
- `sku`
- `slug`
- `is_active`
- `is_featured`
- `stock`

**Example Product:**
```php
[
    'sku' => 'SHMP-ALO-500',
    'name' => [
        'en' => 'Aloe & Sandalwood Shampoo',
        'lt' => 'Alavijo ir santalmedžio šampūnas'
    ],
    'title' => [
        'en' => 'For daily care',
        'lt' => 'Kasdienei priežiūrai'
    ],
    'size' => 500.00,
    'price' => 15.99,
    'ingredients' => [
        'en' => 'Aloe vera, Sandalwood extract, Water, Natural oils',
        'lt' => 'Alavijas, Santalmedžio ekstraktas, Vanduo, Natūralūs aliejai'
    ]
]
```

---

### 3. `category_product` (Pivot Table)

Many-to-many relationship between categories and products.

**Structure:**
| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `category_id` | bigint | Foreign key to `categories` |
| `product_id` | bigint | Foreign key to `products` |
| `timestamps` | | `created_at`, `updated_at` |

**Constraints:**
- Unique constraint on `category_id + product_id` (prevents duplicates)
- Cascade delete (if category or product deleted, remove pivot entry)

**Usage:**
A product can belong to multiple categories:
```
Product: "Aloe Shampoo"
 ├─ Hair Care
 ├─ Natural Products
 └─ Best Sellers
```

---

### 4. `product_images`

Product image gallery (multiple images per product).

**Structure:**
| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `product_id` | bigint | Foreign key to `products` |
| `path` | string | Storage path (e.g., "products/shampoo-1.jpg") |
| `alt_text` | JSON (nullable) | **Translatable** alt text for SEO/accessibility |
| `is_primary` | boolean | Is this the main product image? |
| `order` | integer | Display order |
| `timestamps` | | `created_at`, `updated_at` |

**Indexes:**
- `product_id`
- `is_primary`
- `order`

**Example:**
```php
// Product has 3 images
ProductImage::create([
    'product_id' => 1,
    'path' => 'products/shampoo-front.jpg',
    'is_primary' => true,
    'order' => 1
]);

ProductImage::create([
    'product_id' => 1,
    'path' => 'products/shampoo-ingredients.jpg',
    'is_primary' => false,
    'order' => 2
]);
```

---

## 🔗 Relationships

### Category Model Relationships

```php
// Parent category
$category->parent // BelongsTo

// Child categories
$category->children // HasMany

// All descendants (recursive)
$category->descendants // HasMany with nested 'descendants'

// Products in this category
$category->products // BelongsToMany

// Active child categories only
$category->activeChildren // HasMany with where('is_active', true)
```

### Product Model Relationships

```php
// Categories this product belongs to
$product->categories // BelongsToMany

// All product images
$product->images // HasMany (ordered by 'order')

// Main product image only
$product->primaryImage // HasOne where('is_primary', true)
```

### ProductImage Model Relationships

```php
// The product this image belongs to
$image->product // BelongsTo
```

---

## 📝 Model Traits & Features

### Category Model

**Traits:**
- `HasTranslations` - Makes `name`, `description` translatable

**Helper Methods:**
```php
$category->hasChildren() // bool
$category->isRoot() // bool
$category->getBreadcrumbs() // array (trail from root to this category)
```

**Scopes:**
```php
Category::active()->get() // Only active categories
Category::roots()->get() // Only root categories (no parent)
```

---

### Product Model

**Traits:**
- `HasTranslations` - Makes name, title, descriptions, ingredients translatable
- `SoftDeletes` - Soft delete for order history preservation

**Helper Methods:**
```php
$product->isOnSale() // bool
$product->getSalePercentage() // int (e.g., 25)
$product->inStock() // bool
$product->isLowStock() // bool (stock <= low_stock_threshold)
```

**Scopes:**
```php
Product::active()->get() // Only active products
Product::featured()->get() // Only featured products
Product::inStock()->get() // Only products with stock > 0
Product::inCategory($categoryId)->get() // Products in specific category
```

---

### ProductImage Model

**Traits:**
- `HasTranslations` - Makes `alt_text` translatable

**Accessor:**
```php
$image->url // Returns full URL: asset('storage/' . $image->path)
```

---

## 🌍 Translation System

All text fields marked as **JSON** are translatable. Stored format:

```json
{
    "en": "English text",
    "lt": "Lietuviškas tekstas"
}
```

**Automatic retrieval** based on current locale:
```php
app()->setLocale('en');
$product->name; // "Natural Shampoo"

app()->setLocale('lt');
$product->name; // "Natūralus šampūnas"
```

**Manual retrieval:**
```php
$product->getTranslation('name', 'en'); // Force English
$product->getTranslation('name', 'lt'); // Force Lithuanian
$product->getTranslations('name'); // Get all: ['en' => '...', 'lt' => '...']
```

---

## 📦 Sample Data Structure

### Creating a Product with Categories

```php
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;

// Create nested categories
$bodyCare = Category::create([
    'slug' => 'body-care',
    'name' => ['en' => 'Body Care', 'lt' => 'Kūno priežiūra'],
    'is_active' => true,
    'order' => 1
]);

$lotions = Category::create([
    'parent_id' => $bodyCare->id,
    'slug' => 'lotions',
    'name' => ['en' => 'Lotions', 'lt' => 'Losjonai'],
    'is_active' => true,
    'order' => 1
]);

// Create product
$product = Product::create([
    'sku' => 'LOT-ALO-250',
    'slug' => 'aloe-body-lotion-250ml',
    'name' => [
        'en' => 'Aloe Body Lotion',
        'lt' => 'Alavijo kūno losjonas'
    ],
    'title' => [
        'en' => 'Hydrates and soothes',
        'lt' => 'Drėkina ir nuramina'
    ],
    'short_description' => [
        'en' => 'Natural body lotion with organic aloe vera',
        'lt' => 'Natūralus kūno losjonas su ekologišku alaviju'
    ],
    'description' => [
        'en' => 'Our Aloe Body Lotion provides deep hydration...',
        'lt' => 'Mūsų alavijo kūno losjonas suteikia gilų drėkinimą...'
    ],
    'ingredients' => [
        'en' => 'Aloe vera (70%), Shea butter, Coconut oil, Vitamin E',
        'lt' => 'Alavijas (70%), Sviesto riešutų sviestas, Kokosų aliejus, Vitaminas E'
    ],
    'size' => 250.00,
    'price' => 18.99,
    'stock' => 50,
    'is_active' => true,
    'is_featured' => true
]);

// Attach to multiple categories
$product->categories()->attach([$bodyCare->id, $lotions->id]);

// Add images
ProductImage::create([
    'product_id' => $product->id,
    'path' => 'products/aloe-lotion-front.jpg',
    'alt_text' => ['en' => 'Aloe body lotion bottle', 'lt' => 'Alavijo kūno losjono butelis'],
    'is_primary' => true,
    'order' => 1
]);

ProductImage::create([
    'product_id' => $product->id,
    'path' => 'products/aloe-lotion-texture.jpg',
    'alt_text' => ['en' => 'Lotion texture', 'lt' => 'Losjono tekstūra'],
    'is_primary' => false,
    'order' => 2
]);
```

---

## ✅ Next Steps

1. **Run migrations:**
   ```bash
   php artisan migrate
   ```

2. **Create seeders** for sample data

3. **Build frontend pages:**
   - Product listing (`/products`)
   - Product detail (`/products/{slug}`)
   - Category page (`/categories/{slug}`)

4. **Implement image upload** functionality

---

## 📊 Database Stats (Estimated)

For a small shop:
- **Categories:** ~15-20 (3-4 levels deep)
- **Products:** ~50-100 initially
- **Product Images:** ~200-300 (2-3 per product)
- **Category-Product relations:** ~150-200

**Storage:**
- Products table: ~30KB (100 products)
- Images metadata: ~10KB (300 images)
- Actual image files: ~500MB-1GB (depending on quality)

---

**Created:** 2025-01-05
**Status:** ✅ Migrations & Models Complete - Ready for Seeding
