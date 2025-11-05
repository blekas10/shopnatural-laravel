# Architecture Patterns & Guidelines

## Project Architecture

### Full-Stack Architecture
This is a monolithic Laravel application with React frontend, connected via Inertia.js for a SPA-like experience without building a separate API.

### Key Architectural Decisions

1. **Inertia.js**: Server-driven client-side routing
   - Laravel handles routing and responds with Inertia responses
   - React components receive data as props
   - No separate REST API needed for most features
   - Type-safe routes using Laravel Wayfinder

2. **Laravel Resources**: All API responses use Resource classes (✅ IMPLEMENTED)
   - Consistent data serialization
   - Single source of truth for transformations
   - Located in `app/Http/Resources/`

3. **Service Layer**: Business logic extracted from controllers (✅ IMPLEMENTED)
   - `ProductService` handles product queries
   - Controllers remain thin and focused
   - Located in `app/Services/`

4. **Mobile First**: All UI components and layouts prioritize mobile experience

5. **Component-Based UI**: shadcn/ui + Radix UI for accessible, composable components

## Design Patterns

### Frontend Patterns

#### Centralized Type Definitions (✅ IMPLEMENTED)
Located in `resources/js/types/`
- **product.d.ts**: All product-related interfaces
  - `BaseProduct`: Core product fields
  - `ProductListItem`: Extended for listings with brand/categories
  - `ProductDetail`: Full detail with description, variants, images
  - `ProductVariant`: Variant data (size formatted as "500ml")
  - `ProductImage`: Image metadata
  - `Category`: Hierarchical category structure
  - `Brand`: Brand information

**Usage**:
```typescript
import type { ProductDetail, ProductVariant } from '@/types/product';
```

#### Reusable Components (✅ IMPLEMENTED)
**ProductCard** (`components/product-card.tsx`):
- Consistent product display across site
- Used in: homepage, products index, related products
- Features: sale badges, price formatting, lazy loading, animations
- Props: `product`, `href`, `index`, `className`

**Example**:
```typescript
<ProductCard
    product={product}
    href={route('products.show', { slug: product.slug })}
    index={index}
/>
```

#### Component Composition
```typescript
// Use composition over inheritance
// Combine shadcn components to build features
<Dialog>
  <DialogContent>
    <Form>...</Form>
  </DialogContent>
</Dialog>
```

#### Custom Hooks
Located in `resources/js/hooks/`
- **`use-translation.ts`**: i18n with memoization (✅ OPTIMIZED)
  - Memoized `t()` function with useCallback
  - Memoized `route()` helper
  - Returns memoized object to prevent re-renders
- `use-mobile.tsx` - Detect mobile viewport
- `use-clipboard.ts` - Clipboard operations
- `use-appearance.tsx` - Theme/appearance management
- `use-two-factor-auth.ts` - 2FA logic
- `use-mobile-navigation.ts` - Mobile nav state

Create custom hooks for:
- Shared stateful logic
- API interactions
- Complex UI state

#### Layout Pattern
Located in `resources/js/layouts/`
- `app-layout.tsx` - Main app layout
- `auth-layout.tsx` - Authentication pages layout
- Settings layouts with nested navigation

Use layouts to wrap pages and provide consistent UI structure.

#### Page Components
Located in `resources/js/pages/`
- Each route corresponds to a page component
- Receive data via Inertia props
- Use layouts for consistent structure
- **home.tsx**: Homepage with featured products
- **products/index.tsx**: Product catalog with client-side filtering
- **products/show.tsx**: Product detail with variant selection

### Backend Patterns

#### Laravel Resources (✅ IMPLEMENTED)
Located in `app/Http/Resources/`

**ProductResource** - List/grid display:
```php
// Handles: products list, homepage, related products
// Features: conditional fields with mergeWhen
// Usage: ProductResource::collection($products)->resolve()
```

**ProductDetailResource** - Single product:
```php
// Extends ProductResource
// Adds: sku, descriptions, ingredients, images, variants, categories
// Always returns arrays (never undefined)
// Formats: size as "500ml" (integer + 'ml')
```

**CategoryResource** - Hierarchical categories:
```php
// Recursive children mapping (3 levels deep)
// Always returns children as array
```

**BrandResource**, **ProductVariantResource**, **ProductImageResource**

**IMPORTANT**: Always call `->resolve()` when passing to Inertia:
```php
Inertia::render('products/index', [
    'allProducts' => ProductResource::collection($products)->resolve(),
]);
```

#### Service Layer (✅ IMPLEMENTED)
Located in `app/Services/`

**ProductService**:
- `getFeaturedProducts(int $limit = 8)`: Homepage products
- `getRelatedProducts(Product $product, int $limit = 4)`: Category-based recommendations
- `getAllActiveProducts()`: Full catalog for index page

**Pattern**:
```php
class ProductController extends Controller
{
    public function __construct(
        private ProductService $productService
    ) {}

    public function index(): Response
    {
        $products = $this->productService->getAllActiveProducts();
        return Inertia::render('products/index', [
            'allProducts' => ProductResource::collection($products)->resolve(),
        ]);
    }
}
```

**Benefits**:
- Controllers stay thin and focused
- Business logic reusable and testable
- Clear separation of concerns

#### Action Classes
Located in `app/Actions/`
- Single-responsibility classes for complex operations
- Reusable across controllers
- Easier to test
- Example: Fortify actions for user registration/password reset

#### Repository Pattern (if needed)
For complex data access:
- Abstraction over Eloquent models
- Useful for testing
- Located in `app/Repositories/`
- **Not currently needed** - Services + Resources sufficient

## Routing Strategy

### Route Organization (✅ UPDATED)
**routes/web.php**:
```php
// English routes (default, no prefix)
Route::get('/', [HomeController::class, 'index'])->name('en.home');
Route::get('products', [ProductController::class, 'index'])->name('en.products.index');
Route::get('products/{slug}', [ProductController::class, 'show'])->name('en.products.show');

// Lithuanian routes (with /lt prefix and translated segments)
Route::prefix('lt')->group(function () {
    Route::get('/', [HomeController::class, 'index'])->name('lt.home');
    Route::get('produktai', [ProductController::class, 'index'])->name('lt.products.index');
    Route::get('produktai/{slug}', [ProductController::class, 'show'])->name('lt.products.show');
});
```

**Controllers**:
- `HomeController`: Featured products for homepage
- `ProductController`: index (catalog), show (detail)
- `LocaleController`: Language switching
- `Settings/*`: User account management

### Type-Safe Routes (Wayfinder)
- Routes defined in Laravel
- Automatically generate TypeScript types
- Access via `useTranslation` hook:
```typescript
const { route } = useTranslation();
route('products.show', { slug: product.slug })
```

## State Management

### Server State (Primary)
- Inertia.js handles server state automatically
- Page props contain data from Laravel
- Mutations trigger page reloads with fresh data

### Client State
- React 19 features (useState, useReducer, useMemo, useCallback)
- Context API for global state (theme, mobile nav, translations)
- **Memoization**: Use useCallback/useMemo to prevent unnecessary re-renders
- No Redux or external state library (keep it simple)

### Client-Side Filtering Pattern (✅ IMPLEMENTED)
**products/index.tsx**:
- Load ALL products once
- Use `useMemo` for filtering by: categories, brands, price range, search
- Use `useMemo` for sorting
- Instant filtering without server requests
- Works well for catalogs up to 500 products

```typescript
const filteredProducts = useMemo(() => {
    let filtered = allProducts;
    // Apply category filters
    // Apply brand filters
    // Apply price range filters
    // Apply sorting
    return filtered;
}, [allProducts, filters, sortBy]);
```

### Forms
- Use React 19's `useFormStatus` hook
- Use Inertia's form helper for mutations
- Validation errors from Laravel passed as props

## Data Flow

### Laravel → Inertia → React
```
1. Controller queries data (via Service)
2. Service returns Eloquent collections
3. Controller transforms via Resources
4. Resource::collection($data)->resolve() returns plain arrays
5. Inertia passes arrays as props to React
6. React receives typed props (TypeScript interfaces)
```

**Example**:
```php
// Controller
$products = $this->productService->getAllActiveProducts();
return Inertia::render('products/index', [
    'allProducts' => ProductResource::collection($products)->resolve(),
]);
```

```typescript
// React component
interface ProductsIndexProps {
    allProducts: ProductListItem[];
}
export default function ProductsIndex({ allProducts }: ProductsIndexProps) {
    // allProducts is plain array of objects
}
```

## Authentication

- **Laravel Fortify** handles auth logic
- **Two-factor authentication** supported
- Session-based (not token-based)
- Auth pages use specialized layouts

## Styling Strategy

### Tailwind CSS 4.0
- Utility-first approach
- Mobile-first breakpoints
- Custom color palette: gold (#d1af7f), electric/teal
- Dark mode support via `appearance.tsx`

### Design System
- **Gold (#d1af7f)**: CTAs, sale badges, prices on sale, active states, accents
- **Red**: Only for out-of-stock indicators
- **Grey/Muted**: Unselected states, borders, secondary text
- **Transitions**: duration-300 standard for hover/active states

### Component Styling
- Use `cn()` utility to combine classes
- Define variants with `class-variance-authority`
- Keep styles co-located with components

### Theme System
- Light/dark/system modes
- Managed via `use-appearance` hook
- CSS variables for theme colors

## Performance Optimizations (✅ IMPLEMENTED)

### Database Indexes
Migration: `2025_11_05_160821_add_indexes_for_performance.php`
- **Products**: is_active, is_featured, slug, brand_id, [is_active, is_featured]
- **Categories**: parent_id, is_active, order, [is_active, order]
- **Product Variants**: product_id, is_default, stock, [product_id, is_default]
- **Product Images**: product_id, is_primary, [product_id, is_primary], [product_id, order]
- **Brands**: is_active, slug

**Impact**: 20-30% faster queries

### React Optimizations
- **Memoization**: useCallback for functions, useMemo for computed values
- **Lazy Loading**: Images use loading="lazy"
- **Code Splitting**: Vite handles automatic splitting
- **Efficient Filtering**: Client-side with useMemo

### Image Optimization
- Store images in `storage/app/public`
- Symlink via `php artisan storage:link`
- Optimize images before upload

### Caching
- Route caching in production
- Config caching in production
- View caching for Blade templates

## Accessibility

- Use semantic HTML
- ARIA labels via shadcn/Radix components
- Keyboard navigation support
- Screen reader friendly
- Focus management in modals/dialogs

## Error Handling

### Frontend
- Display validation errors from Laravel
- Use `alert` components for user feedback
- Handle loading states
- Null-safe operations: `product.images?.[0]`, `selectedImage?.id`

### Backend
- Use Laravel's exception handling
- Return appropriate HTTP status codes
- Provide user-friendly error messages

## Testing Strategy

### PHP Tests (Pest)
- Feature tests for API endpoints
- Unit tests for complex logic
- Located in `tests/`

### Frontend Testing (Future)
- Consider Vitest for unit tests
- Consider Playwright for E2E tests

## Development Tools Integration

### Context7 MCP
- Check documentation for new libraries
- Get up-to-date examples
- Before implementing, search Context7

### shadcn/ui MCP
- List available components
- Get component documentation
- Follow shadcn patterns

### Serena MCP
- Symbolic code navigation
- Read only necessary code
- Use find_symbol, search_for_pattern

## Security Best Practices

- CSRF protection (Laravel default)
- Input validation on server side
- Sanitize user input
- Use prepared statements (Eloquent does this)
- Environment variables for secrets
- No sensitive data in client-side code

## Best Practices Summary

### DO ✅
- Use Resources for all API responses
- Call `.resolve()` on Resources before passing to Inertia
- Use Service layer for business logic
- Centralize TypeScript types
- Extract reusable components (like ProductCard)
- Use memoization (useCallback, useMemo) for performance
- Always return arrays from Resources (never undefined)
- Format data in Resources (e.g., size: "500ml")
- Use optional chaining for safety (`images?.[0]`)

### DON'T ❌
- Don't map data inline in controllers
- Don't duplicate type definitions
- Don't repeat component logic
- Don't skip memoization in expensive operations
- Don't return Resource collections directly to Inertia
- Don't let Resources return undefined (always default to empty arrays)
- Don't pass raw integers when UI expects formatted strings