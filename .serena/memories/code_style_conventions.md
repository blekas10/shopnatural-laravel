# Code Style & Conventions

## TypeScript/React Style

### General Rules
- **Semi-colons**: Required (semi: true)
- **Quotes**: Single quotes for strings
- **Print Width**: 80 characters
- **Tab Width**: 4 spaces
- **Indentation**: Spaces, not tabs

### React Specific
- React version: 19.2.0 (detect automatically)
- JSX runtime: Automatic (no need to import React)
- No PropTypes (using TypeScript instead)
- Unescaped entities allowed in JSX
- One or multiple attributes per line (not enforced)

### Import Organization
- Imports are automatically organized by Prettier
- Plugin: prettier-plugin-organize-imports

### Tailwind CSS
- Plugin: prettier-plugin-tailwindcss
- Custom functions: `clsx`, `cn`
- Main stylesheet: resources/css/app.css
- Use `cn()` utility from lib/utils.ts for combining classes

### TypeScript
- Strict type checking enabled
- No emitting (types check only with `npm run types`)
- ESLint TypeScript recommended rules applied

## PHP/Laravel Style

### Laravel Conventions
- PSR-4 Autoloading
- Namespaces:
  - `App\` → app/
  - `Database\Factories\` → database/factories/
  - `Database\Seeders\` → database/seeders/
  - `Tests\` → tests/

### Code Quality
- Use Laravel Pint for code formatting
- Follow Laravel best practices
- Use Pest for testing with Laravel plugin

## File Structure Conventions

### Frontend (resources/js)
- **Components**: resources/js/components/ (reusable UI components)
  - **UI Components**: resources/js/components/ui/ (shadcn components)
- **Pages**: resources/js/pages/ (Inertia pages/routes)
- **Layouts**: resources/js/layouts/ (page layouts)
- **Hooks**: resources/js/hooks/ (custom React hooks)
- **Actions**: resources/js/actions/ (type-safe API actions from Wayfinder)
- **Types**: resources/js/types/ (TypeScript type definitions)
- **Routes**: resources/js/routes/ (route definitions)
- **Lib**: resources/js/lib/ (utility functions)

### Backend (app)
- **Models**: app/Models/
- **Controllers**: app/Http/Controllers/
- **Actions**: app/Actions/ (single-responsibility action classes)
- **Providers**: app/Providers/

## Naming Conventions

### React Components
- PascalCase for component files and exports (e.g., AppHeader.tsx)
- kebab-case for file names (e.g., app-header.tsx)
- Descriptive component names

### TypeScript
- Interfaces: PascalCase with descriptive names
- Types: PascalCase
- Variables/functions: camelCase
- Constants: UPPER_SNAKE_CASE for true constants

### Laravel
- Models: PascalCase singular (e.g., User)
- Controllers: PascalCase with Controller suffix
- Routes: kebab-case
- Database tables: snake_case plural

## Component Architecture

### shadcn/ui Usage
- ALWAYS use shadcn/ui components for UI elements
- Check Context7 documentation before implementing new features
- Components are in resources/js/components/ui/
- Use Radix UI primitives as base

### Mobile First
- Design for mobile screens first
- Use responsive Tailwind classes (md:, lg:, xl:)
- Test on mobile viewport during development
- Progressive enhancement for desktop