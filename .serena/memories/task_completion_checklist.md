# Task Completion Checklist

When completing a task, follow this checklist to ensure code quality and consistency:

## Before Committing Code

### 1. Type Checking
```bash
npm run types
```
Fix any TypeScript errors before proceeding.

### 2. Linting
```bash
npm run lint
```
This will auto-fix most issues. Review and fix any remaining warnings/errors.

### 3. Code Formatting
```bash
npm run format
```
Ensures consistent code style across the project.

### 4. Test the Changes
- Test in mobile viewport FIRST
- Test in desktop viewport
- Test all interactive elements
- Verify responsive behavior at breakpoints

### 5. Verify Build
```bash
npm run build
```
Ensure the production build succeeds without errors.

### 6. Database Migrations (if applicable)
If you created/modified migrations:
```bash
docker exec shop-natural-app php artisan migrate:fresh --seed
```
Test that migrations run successfully.

### 7. Clear Caches (if applicable)
If you modified routes, config, or views:
```bash
docker exec shop-natural-app php artisan config:clear
docker exec shop-natural-app php artisan route:clear
docker exec shop-natural-app php artisan view:clear
```

### 8. Run Tests (when available)
```bash
composer test
```

## Development Workflow

1. **Check Context7 Documentation**: Before implementing new features, especially with new libraries
2. **Use shadcn/ui Components**: Always check if a shadcn component exists before creating custom UI
3. **Mobile First**: Start with mobile design, then enhance for desktop
4. **Use React/Laravel Agents**: 
   - Use `laravel-12-backend-architect` agent for backend tasks
   - Use `react19-inertia-mobile` agent for frontend tasks
5. **Commit Often**: Make small, focused commits with clear messages

## Code Review Checklist

- [ ] Code follows project style conventions
- [ ] TypeScript types are properly defined (no `any`)
- [ ] Mobile-first responsive design implemented
- [ ] Accessible (proper ARIA labels, keyboard navigation)
- [ ] No console.log statements left in code
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Comments added for complex logic
- [ ] Component is reusable (if applicable)
- [ ] Follows Laravel best practices (backend)
- [ ] Uses React 19 best practices (frontend)
- [ ] shadcn/ui components used where applicable

## When to Use Agents

### Laravel Backend Agent
- Creating/modifying Laravel routes
- Building API endpoints
- Database schema design
- Service layer implementation
- Authentication/authorization
- Queue jobs
- Events and listeners

### React Frontend Agent  
- Building React components
- Implementing Inertia.js pages
- Mobile-first responsive layouts
- Form handling with validation
- Client-side state management
- React 19 features (useOptimistic, useFormStatus, etc.)
- Integrating with Laravel backend via Inertia