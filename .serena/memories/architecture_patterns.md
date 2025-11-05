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

2. **Mobile First**: All UI components and layouts prioritize mobile experience

3. **Component-Based UI**: shadcn/ui + Radix UI for accessible, composable components

## Design Patterns

### Frontend Patterns

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

### Backend Patterns

#### Action Classes
Located in `app/Actions/`
- Single-responsibility classes for complex operations
- Reusable across controllers
- Easier to test

#### Service Layer (Future)
For complex business logic:
- Create service classes in `app/Services/`
- Keep controllers thin
- Services handle orchestration

#### Repository Pattern (if needed)
For complex data access:
- Abstraction over Eloquent models
- Useful for testing
- Located in `app/Repositories/`

## Routing Strategy

### Type-Safe Routes (Wayfinder)
- Routes defined in Laravel
- Automatically generate TypeScript types
- Import from `resources/js/actions/`
- Example:
```typescript
import { store } from '@/actions/App/Http/Controllers/Settings/ProfileController';
store({ name: 'John', email: 'john@example.com' });
```

### Route Organization
- Simple routes in `routes/web.php`
- Authenticated routes grouped with middleware
- Settings routes nested under `/settings`

## State Management

### Server State (Primary)
- Inertia.js handles server state automatically
- Page props contain data from Laravel
- Mutations trigger page reloads with fresh data

### Client State
- React 19 features (useState, useReducer)
- Context API for global state (theme, mobile nav)
- No Redux or external state library (keep it simple)

### Forms
- Use React 19's `useFormStatus` hook
- Use Inertia's form helper for mutations
- Validation errors from Laravel passed as props

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

### Component Styling
- Use `cn()` utility to combine classes
- Define variants with `class-variance-authority`
- Keep styles co-located with components

### Theme System
- Light/dark/system modes
- Managed via `use-appearance` hook
- CSS variables for theme colors

## Performance Considerations

### Code Splitting
- Vite handles automatic code splitting
- Lazy load heavy components when needed

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

## Security Best Practices

- CSRF protection (Laravel default)
- Input validation on server side
- Sanitize user input
- Use prepared statements (Eloquent does this)
- Environment variables for secrets
- No sensitive data in client-side code