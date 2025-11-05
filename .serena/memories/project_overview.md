# Shop Natural - E-commerce Platform

## Project Purpose
Shop Natural is a cosmetics and beauty products e-commerce platform built with Laravel 12 and React 19. The shop sells natural beauty products including:
- Shampoos
- Body creams
- Skincare products
- Other natural cosmetics

**Design Inspiration**: The site takes design inspiration from shop-natural.com

**Primary Color Palette**:
- Gold: #d1af7f (primary brand color - used for CTAs, sale badges, accents)
- Electric/teal colors for accents
- Focus on natural, elegant aesthetics

## Development Philosophy
**MOBILE FIRST** - All development should prioritize mobile experience first, then scale up to desktop.

## Current Architecture Status (Updated 2025-11-05)

### Major Refactoring Completed ✅
The codebase underwent comprehensive refactoring to improve maintainability and follow best practices:
- **Laravel Resources**: All API responses use Resource classes (ProductResource, CategoryResource, BrandResource, etc.)
- **Service Layer**: Business logic extracted to ProductService
- **Component Extraction**: Reusable ProductCard component
- **Centralized Types**: All TypeScript interfaces in `types/product.d.ts`
- **Database Optimization**: Performance indexes added to all key tables
- **Clean Architecture**: Controllers → Services → Resources pattern

### Product Catalog Features
- **Product Variants**: Multiple sizes (500ml, 1000ml) with independent pricing
- **Client-Side Filtering**: All products loaded, filtered in React (categories, brands, price range, sorting)
- **Image Gallery**: Mobile slider with dot indicators, desktop thumbnail grid
- **Translation System**: Spatie Translatable with EN/LT support
- **Sale System**: Dynamic discounts with gold-themed badges

## Tech Stack

### Backend
- **Framework**: Laravel 12
- **PHP Version**: ^8.2
- **Key Packages**:
  - Inertia.js Laravel adapter (^2.0) - for SPA-like experience
  - Laravel Fortify (^1.30) - authentication
  - Laravel Wayfinder (^0.1.9) - type-safe routing
  - Spatie Translatable - JSON-based translations

### Frontend
- **Framework**: React 19.2.0
- **TypeScript**: ^5.7.2
- **Inertia.js**: ^2.1.4 (React adapter)
- **Styling**: Tailwind CSS 4.0.0
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: lucide-react
- **Build Tool**: Vite 7.0.4
- **State Management**: React 19 features (no external state library)
- **Animations**: Framer Motion

### Key Frontend Libraries
- @headlessui/react - accessible UI components
- @radix-ui/* - headless UI primitives (avatar, checkbox, dialog, dropdown, navigation-menu, select, slider, etc.)
- class-variance-authority - component variants
- tailwind-merge - utility class merging
- input-otp - OTP input component
- framer-motion - animations and transitions

### Development Tools
- **Linting**: ESLint 9 with TypeScript support
- **Formatting**: Prettier with plugins for Tailwind and import organization
- **Testing**: Pest (PHP testing framework)
- **Code Quality**: Laravel Pint (PHP code style fixer)
- **Docker**: Full Docker Compose setup with MySQL, nginx, mailpit, phpMyAdmin

## Project Structure

### Backend (`app/`)
```
app/
├── Http/
│   ├── Controllers/
│   │   ├── HomeController.php (homepage with featured products)
│   │   ├── ProductController.php (index, show)
│   │   └── Settings/ (user settings)
│   ├── Resources/ (API serialization)
│   │   ├── ProductResource.php
│   │   ├── ProductDetailResource.php
│   │   ├── ProductVariantResource.php
│   │   ├── ProductImageResource.php
│   │   ├── CategoryResource.php
│   │   └── BrandResource.php
│   └── Middleware/
│       ├── SetLocale.php
│       └── HandleInertiaRequests.php
├── Models/
│   ├── Product.php (with variants, images, categories)
│   ├── ProductVariant.php
│   ├── ProductImage.php
│   ├── Category.php (nested hierarchy)
│   └── Brand.php
└── Services/
    └── ProductService.php (business logic)
```

### Frontend (`resources/js/`)
```
resources/js/
├── components/
│   ├── product-card.tsx (reusable product display)
│   ├── products-section.tsx (homepage products grid)
│   ├── main-header.tsx
│   ├── footer.tsx
│   └── ui/ (shadcn components)
├── pages/
│   ├── home.tsx
│   ├── products/
│   │   ├── index.tsx (catalog with filters)
│   │   └── show.tsx (product detail with variants)
│   └── auth/ (authentication pages)
├── types/
│   ├── index.d.ts (global types)
│   └── product.d.ts (product-related interfaces)
├── hooks/
│   ├── use-translation.ts (i18n with memoization)
│   └── use-mobile.tsx
└── lib/
    ├── utils.ts (cn helper)
    └── route.ts (type-safe routing)
```

## Database Schema

### Core Tables
- **products**: Main product info (translatable name, description, etc.)
- **product_variants**: Size variations (500ml, 1000ml) with prices
- **product_images**: Product photos with order and primary flag
- **categories**: Hierarchical structure (parent_id, 3 levels deep)
- **brands**: Product brands (Naturalmente, MY.ORGANICS)
- **category_product**: Many-to-many pivot

### Performance Indexes
All tables have strategic indexes for:
- Active/featured filtering
- Slug lookups
- Foreign key relations
- Composite queries (e.g., active + featured)

## Docker Services
- `shop-natural-app`: PHP-FPM 8.3 container
- `shop-natural-webserver`: Nginx Alpine
- `shop-natural-db`: MySQL 8.0 (port 3306)
- `shop-natural-phpmyadmin`: phpMyAdmin (port 8080)
- `shop-natural-mailpit`: Email testing (UI: 8025, SMTP: 1025)

## Environment
- Database: MySQL (shop_natural database)
- Mail: Mailpit for development
- Session: Database driver
- Queue: Database driver
- Cache: Database store

## Key Implementation Notes

### Translation System
- Backend: Spatie Translatable with JSON columns
- Frontend: Custom `useTranslation` hook with memoization
- Supported locales: EN (default), LT
- Route prefixes: `/` (EN), `/lt` (LT)
- Translated routes: `/products` → `/lt/produktai`

### Product Variants
- Stored as integer in DB (500, 1000 = ml)
- **Formatted in Resource**: `size: $v->size . 'ml'` → "500ml"
- Frontend displays formatted strings
- Each variant has independent: price, compareAtPrice, stock, SKU

### Client-Side Filtering
- All products loaded on index page
- React useMemo for instant filtering
- No server roundtrips for filters
- Works well for catalogs up to 500 products

### Styling Conventions
- Gold (#d1af7f) for: sale badges, prices on sale, CTAs, accents
- Red only for: out of stock indicators
- Mobile-first breakpoints: sm, md, lg, xl
- Dark mode support built-in

## Documentation
- **REFACTORING_REPORT.md**: Detailed analysis of code improvements
- **IMPLEMENTATION_REPORT.md**: Complete refactoring changelog
- **DATABASE_ARCHITECTURE.md**: Database schema details
- **TRANSLATION_GUIDE.md**: i18n implementation guide
- **ECOMMERCE_ROADMAP.md**: Future features planned