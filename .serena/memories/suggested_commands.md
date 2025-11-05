# Suggested Commands

## Development

### Start Development Environment
```bash
# Start Docker containers
docker-compose up -d

# Run frontend dev server (Vite)
npm run dev

# Full dev stack (server + queue + logs + vite) - requires local PHP
composer dev

# With SSR support
composer dev:ssr
```

### Frontend Commands
```bash
# Development server (Vite hot reload)
npm run dev

# Build for production
npm run build

# Build with SSR
npm run build:ssr

# Type checking
npm run types

# Linting (with auto-fix)
npm run lint

# Format code
npm run format

# Check formatting only
npm run format:check
```

### Docker Commands
```bash
# Execute artisan commands in container
docker exec shop-natural-app php artisan <command>

# Execute composer in container
docker exec shop-natural-app composer <command>

# View logs
docker logs shop-natural-app
docker logs shop-natural-webserver
docker logs shop-natural-db

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Laravel Artisan Commands
```bash
# Inside container (prefix with: docker exec shop-natural-app)
php artisan migrate          # Run migrations
php artisan migrate:fresh    # Drop all tables and re-migrate
php artisan migrate:fresh --seed  # With seeding
php artisan db:seed          # Run seeders

php artisan make:model ModelName -m  # Create model with migration
php artisan make:controller ControllerName
php artisan make:migration migration_name

php artisan route:list       # List all routes
php artisan config:cache     # Cache configuration
php artisan config:clear     # Clear config cache
php artisan route:cache      # Cache routes
php artisan route:clear      # Clear route cache
php artisan view:cache       # Cache views
php artisan view:clear       # Clear view cache
php artisan cache:clear      # Clear application cache

php artisan storage:link     # Create storage symlink

php artisan tinker          # Laravel REPL
php artisan pail            # Real-time log viewer
php artisan queue:listen    # Start queue worker
php artisan serve           # Start dev server (local PHP)
```

## Testing

```bash
# Run PHP tests (Pest)
composer test
# or in container
docker exec shop-natural-app php artisan test

# Run specific test
docker exec shop-natural-app php artisan test --filter=TestName
```

## Code Quality

```bash
# PHP code formatting (Laravel Pint)
docker exec shop-natural-app ./vendor/bin/pint

# Type checking
npm run types

# Linting
npm run lint

# Format code
npm run format
```

## Database

```bash
# Access MySQL
docker exec -it shop-natural-db mysql -u root -pshop_natural shop_natural

# Create migration
docker exec shop-natural-app php artisan make:migration create_table_name

# Run migrations
docker exec shop-natural-app php artisan migrate

# Rollback
docker exec shop-natural-app php artisan migrate:rollback

# Fresh migration with seed
docker exec shop-natural-app php artisan migrate:fresh --seed
```

## Utilities (macOS Darwin)

```bash
# File operations (use native tools, not these in code when possible)
ls                  # List directory contents
find . -name "*.php"  # Find files
grep -r "search" .    # Search in files

# Git
git status
git add .
git commit -m "message"
git push
git pull

# View processes
ps aux | grep node
ps aux | grep php

# Port checking
lsof -i :80
lsof -i :3306
```

## Service Access URLs

- Application: http://localhost
- phpMyAdmin: http://localhost:8080
- Mailpit UI: http://localhost:8025
- MySQL: localhost:3306 (user: root, password: shop_natural, db: shop_natural)