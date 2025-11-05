# Shop Natural - E-commerce Platform

## Project Purpose
Shop Natural is a cosmetics and beauty products e-commerce platform built with Laravel 12 and React 19. The shop sells natural beauty products including:
- Shampoos
- Body creams
- Skincare products
- Other natural cosmetics

**Design Inspiration**: The site takes design inspiration from shop-natural.com

**Primary Color Palette**:
- Gold: #d1af7f
- Electric/teal colors for accents
- Focus on natural, elegant aesthetics

## Development Philosophy
**MOBILE FIRST** - All development should prioritize mobile experience first, then scale up to desktop.

## Tech Stack

### Backend
- **Framework**: Laravel 12
- **PHP Version**: ^8.2
- **Key Packages**:
  - Inertia.js Laravel adapter (^2.0) - for SPA-like experience
  - Laravel Fortify (^1.30) - authentication
  - Laravel Wayfinder (^0.1.9) - type-safe routing

### Frontend
- **Framework**: React 19.2.0
- **TypeScript**: ^5.7.2
- **Inertia.js**: ^2.1.4 (React adapter)
- **Styling**: Tailwind CSS 4.0.0
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: lucide-react
- **Build Tool**: Vite 7.0.4
- **State Management**: React 19 features (no external state library)

### Key Frontend Libraries
- @headlessui/react - accessible UI components
- @radix-ui/* - headless UI primitives (avatar, checkbox, dialog, dropdown, navigation-menu, select, etc.)
- class-variance-authority - component variants
- tailwind-merge - utility class merging
- input-otp - OTP input component

### Development Tools
- **Linting**: ESLint 9 with TypeScript support
- **Formatting**: Prettier with plugins for Tailwind and import organization
- **Testing**: Pest (PHP testing framework)
- **Code Quality**: Laravel Pint (PHP code style fixer)
- **Docker**: Full Docker Compose setup with MySQL, nginx, mailpit, phpMyAdmin

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