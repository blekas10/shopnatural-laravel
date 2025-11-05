# 🛒 E-Commerce Implementation Roadmap

## 📊 Current Status: **Foundation Complete (15%)**

✅ Authentication system (login, register, 2FA)
✅ Translation system (EN/LT)
✅ Landing page with hero, features, promises sections
✅ UI components (shadcn/ui)
✅ Docker environment

🚧 **Next:** Build core e-commerce functionality

---

## 🎯 Implementation Phases

### **PHASE 1: Product Foundation** 🔴 **HIGH PRIORITY**
*Estimated Time: 2-3 days*

**Why First?** Without products, you can't build cart, checkout, or orders.

#### 1.1 Database Schema
```bash
php artisan make:migration create_products_table
php artisan make:migration create_categories_table
php artisan make:migration create_category_product_table
php artisan make:migration create_product_images_table
```

**Products Table:**
- `id`, `sku` (unique), `slug`
- `name` (JSON - translatable)
- `description` (JSON - translatable)
- `short_description` (JSON - translatable)
- `price`, `compare_at_price` (for sale prices)
- `stock`, `low_stock_threshold`
- `is_active`, `is_featured`
- `meta_title`, `meta_description` (JSON - SEO)
- `timestamps`, `soft_deletes`

**Categories Table:**
- `id`, `slug`, `parent_id` (for hierarchical categories)
- `name` (JSON - translatable)
- `description` (JSON - translatable)
- `image`, `order`
- `is_active`
- `timestamps`

**Product Images Table:**
- `id`, `product_id`, `path`, `alt_text` (JSON)
- `is_primary`, `order`
- `timestamps`

#### 1.2 Models & Relationships
```bash
php artisan make:model Product
php artisan make:model Category
php artisan make:model ProductImage
```

**Relationships:**
- Product `belongsToMany` Categories
- Category `belongsToMany` Products
- Category `hasMany` Categories (children)
- Category `belongsTo` Category (parent)
- Product `hasMany` ProductImages
- ProductImage `belongsTo` Product

#### 1.3 Seeders
```bash
php artisan make:seeder CategorySeeder
php artisan make:seeder ProductSeeder
```

Create sample products:
- 12-20 cosmetic products
- 4-6 categories (Face Care, Body Care, Hair Care, Makeup)
- Multiple images per product
- Realistic Lithuanian & English names/descriptions

#### 1.4 Product Pages (Frontend)

**Routes:**
- `/products` - Product listing (with filters, sorting)
- `/products/{slug}` - Product detail page
- `/categories/{slug}` - Category page

**Components to Build:**
- `ProductCard` - Grid item with image, name, price, "Add to Cart"
- `ProductGrid` - Responsive grid layout
- `ProductFilters` - Filter sidebar (category, price range, in stock)
- `ProductDetail` - Full product page with image gallery
- `ProductImageGallery` - Swipeable image gallery
- `Breadcrumbs` - Navigation trail

**Features:**
- ✅ Mobile-first responsive design
- ✅ Image zoom on hover (desktop)
- ✅ Add to cart button
- ✅ Stock indicator
- ✅ Sale badge if `compare_at_price` exists
- ✅ Lazy loading images

---

### **PHASE 2: Shopping Cart** 🟡 **MEDIUM PRIORITY**
*Estimated Time: 2 days*

#### 2.1 Cart Storage Strategy

**Decision: Session-based cart (for guests + authenticated)**

**Why?** Allows guest checkout + persistence when user logs in.

**Implementation:**
```php
// Cart stored in session as:
session('cart') = [
    'product_id_1' => ['quantity' => 2, 'price' => 15.99],
    'product_id_2' => ['quantity' => 1, 'price' => 24.99],
]
```

#### 2.2 Cart Service
```bash
php artisan make:service CartService
```

**Methods:**
- `add($productId, $quantity)`
- `update($productId, $quantity)`
- `remove($productId)`
- `clear()`
- `getItems()` - with product details
- `getTotal()`
- `getItemCount()`

#### 2.3 Cart Components (React)

**Components:**
- `CartButton` - Header icon with item count badge
- `CartDrawer` - Slide-out cart (mobile-friendly)
- `CartItem` - Individual item with quantity controls
- `CartSummary` - Subtotal, shipping, total

**Features:**
- ✅ Real-time updates
- ✅ Quantity +/- buttons
- ✅ Remove item
- ✅ "Continue Shopping" / "Checkout" buttons
- ✅ Empty cart message
- ✅ Optimistic UI updates (React 19 `useOptimistic`)

#### 2.4 Cart Routes
```php
POST   /cart/add
PATCH  /cart/update/{product}
DELETE /cart/remove/{product}
DELETE /cart/clear
GET    /cart
```

---

### **PHASE 3: Checkout Flow** 🔴 **HIGH PRIORITY**
*Estimated Time: 3-4 days*

#### 3.1 Database Schema
```bash
php artisan make:migration create_orders_table
php artisan make:migration create_order_items_table
php artisan make:migration create_addresses_table
```

**Orders Table:**
- `id`, `order_number` (unique, e.g., SN-2025-0001)
- `user_id` (nullable - for guest checkout)
- `guest_email`, `guest_name` (for guests)
- `status` (enum: pending, processing, shipped, delivered, cancelled)
- `payment_status` (enum: pending, paid, failed, refunded)
- `payment_method` (stripe, paypal, bank_transfer)
- `subtotal`, `shipping_cost`, `tax`, `total`
- `shipping_address_id`, `billing_address_id`
- `notes`, `admin_notes`
- `timestamps`, `shipped_at`, `delivered_at`

**Order Items Table:**
- `id`, `order_id`, `product_id`
- `product_name` (snapshot at purchase)
- `product_sku`
- `quantity`, `price`
- `total`
- `timestamps`

**Addresses Table:**
- `id`, `user_id` (nullable)
- `first_name`, `last_name`
- `company` (nullable)
- `address_line_1`, `address_line_2`
- `city`, `state`, `postal_code`, `country`
- `phone`
- `is_default_shipping`, `is_default_billing`
- `timestamps`

#### 3.2 Checkout Steps

**Step 1: Cart Review**
- Show all items
- Update quantities
- Apply coupon (future)

**Step 2: Guest or Login**
- Guest checkout option
- Or login/register

**Step 3: Shipping Information**
- Form for address
- Save address for logged-in users
- Address autocomplete (future)

**Step 4: Payment Method**
- Stripe integration
- PayPal (optional)
- Bank transfer (for Lithuania)

**Step 5: Order Review**
- Summary of everything
- Terms & conditions checkbox
- "Place Order" button

**Step 6: Confirmation**
- Order number
- Email confirmation sent
- "Continue Shopping" button

#### 3.3 Checkout Components (React)

**Pages:**
- `/checkout` - Multi-step checkout form
- `/checkout/success` - Order confirmation

**Components:**
- `CheckoutProgress` - Step indicator (1/5, 2/5, etc.)
- `ShippingForm` - Address form with validation
- `PaymentMethodSelector` - Radio buttons for payment
- `OrderSummary` - Sticky sidebar with cart items
- `OrderConfirmation` - Success page with order details

#### 3.4 Order Processing (Laravel)

**Controllers:**
```bash
php artisan make:controller CheckoutController
php artisan make:controller OrderController
```

**Logic:**
1. Validate cart (items in stock, prices haven't changed)
2. Calculate totals (subtotal, shipping, tax)
3. Create order record
4. Create order items (snapshot product data)
5. Process payment (Stripe API)
6. Clear cart
7. Send confirmation email
8. Redirect to success page

---

### **PHASE 4: Payment Integration** 🔴 **HIGH PRIORITY**
*Estimated Time: 1-2 days*

#### 4.1 Stripe Setup
```bash
composer require stripe/stripe-php
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**Environment Variables:**
```env
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 4.2 Payment Flow

**Frontend:**
1. User clicks "Place Order"
2. Create Payment Intent (Laravel API call)
3. Show Stripe Card Element
4. User enters card details
5. Submit payment to Stripe
6. Confirm order on success

**Backend:**
```php
// Create Payment Intent
$intent = \Stripe\PaymentIntent::create([
    'amount' => $order->total * 100, // cents
    'currency' => 'eur',
    'metadata' => ['order_id' => $order->id],
]);

return $intent->client_secret;
```

**Webhook Handler:**
```php
POST /webhook/stripe
// Handle payment success, failure events
```

#### 4.3 Alternative: Bank Transfer

For Lithuanian customers:
- Show bank details
- Order status = "pending_payment"
- Manual admin confirmation when payment received

---

### **PHASE 5: Order Management** 🟡 **MEDIUM PRIORITY**
*Estimated Time: 2 days*

#### 5.1 User Order History

**Route:** `/dashboard/orders`

**Features:**
- List all user orders
- Order details page
- Track shipment (future: integration with courier API)
- Download invoice (PDF)
- Reorder functionality

**Components:**
- `OrderList` - Table/cards of orders
- `OrderDetail` - Full order info
- `OrderStatus` - Visual status indicator

#### 5.2 Admin Order Management

**Route:** `/admin/orders`

**Features:**
- View all orders
- Filter by status, date, payment status
- Update order status
- Mark as shipped (send email notification)
- Cancel order (refund if paid)
- Add admin notes
- Print packing slip

---

### **PHASE 6: Admin Panel** 🟢 **LOW PRIORITY** (Can use manually at first)
*Estimated Time: 4-5 days*

#### 6.1 Product Management

**Routes:**
- `/admin/products` - List products
- `/admin/products/create` - Create product
- `/admin/products/{id}/edit` - Edit product

**Features:**
- CRUD for products
- Multi-language form tabs
- Image upload (drag & drop)
- Bulk actions (delete, activate/deactivate)
- Stock management
- SEO fields

#### 6.2 Category Management

**Routes:**
- `/admin/categories` - List categories
- `/admin/categories/create` - Create category

**Features:**
- CRUD for categories
- Drag-drop reordering
- Hierarchical tree view

#### 6.3 Dashboard

**Route:** `/admin/dashboard`

**Widgets:**
- Total sales (today, this week, this month)
- Total orders
- Low stock products
- Recent orders
- Top selling products
- Revenue chart

---

### **PHASE 7: Additional Features** 🟢 **NICE TO HAVE**
*Can be added incrementally*

#### 7.1 Product Reviews ⭐
- User can review purchased products
- Star rating + text review
- Admin moderation
- Display on product page

#### 7.2 Wishlist ❤️
- Save products for later
- Share wishlist
- Move wishlist item to cart

#### 7.3 Search & Filters 🔍
- Full-text search (Elasticsearch or Scout)
- Advanced filters (price range, brand, features)
- Sort by (price, name, newest, popularity)

#### 7.4 Coupons & Discounts 🎟️
- Create coupon codes
- Apply at checkout
- Percentage or fixed amount
- Usage limits

#### 7.5 Email Notifications 📧
- Order confirmation
- Shipping notification
- Delivery confirmation
- Abandoned cart reminder (after 24h)

#### 7.6 Inventory Management 📦
- Low stock alerts
- Out of stock = disable "Add to Cart"
- Restock notifications

#### 7.7 Related Products 🔗
- "You may also like" section
- Based on category or manual selection

---

## 🗓️ Recommended Timeline

### Week 1: Product Foundation
- **Day 1-2:** Database schema, models, relationships
- **Day 3:** Seeders with sample products
- **Day 4-5:** Product listing & detail pages (frontend)

### Week 2: Cart & Checkout
- **Day 1-2:** Shopping cart (backend + frontend)
- **Day 3-5:** Checkout flow (multi-step form)

### Week 3: Payment & Orders
- **Day 1-2:** Stripe integration
- **Day 3:** Order processing logic
- **Day 4-5:** User order history page

### Week 4: Admin Panel Basics
- **Day 1-3:** Product CRUD admin panel
- **Day 4-5:** Order management admin panel

### Week 5+: Polish & Features
- Testing, bug fixes
- Additional features (reviews, wishlist, etc.)
- Performance optimization

---

## 📋 Pre-Development Checklist

Before starting Phase 1:

- [ ] Review translation guide (TRANSLATION_GUIDE.md)
- [ ] All new text must be translatable
- [ ] Mobile-first design for all pages
- [ ] Use React 19 features (useOptimistic, useFormStatus)
- [ ] Follow Laravel 12 best practices
- [ ] Use Inertia.js for all page transitions
- [ ] Commit frequently with clear messages

---

## 🎨 Design Consistency

All e-commerce pages should follow:
- **Color palette:** Gold (#d1af7f), Teal accents
- **Components:** shadcn/ui
- **Fonts:** Current site fonts
- **Spacing:** Consistent with existing pages
- **Animations:** Subtle, smooth (framer-motion)

---

## 🚀 Ready to Start?

**Next Command:**
```bash
php artisan make:migration create_products_table
```

Open PHASE 1 and let's build! 🛠️
