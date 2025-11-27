/**
 * Route helper for locale-aware URL generation
 */

// Route translations map
const routeMap: Record<string, Record<string, string>> = {
    'home': { en: '', lt: '' },
    'products.index': { en: 'products', lt: 'produktai' },
    'products.show': { en: 'products', lt: 'produktai' },
    'cart': { en: 'cart', lt: 'krepselis' },
    'wishlist': { en: 'wishlist', lt: 'pageidavimu-sarasas' },
    'checkout': { en: 'checkout', lt: 'apmokejimas' },
    'checkout.store': { en: 'checkout', lt: 'apmokejimas' },
    'orders.index': { en: 'orders', lt: 'uzsakymai' },
    'orders.show': { en: 'orders', lt: 'uzsakymai' },
    'orders.invoice.download': { en: 'orders', lt: 'uzsakymai' },
    'orders.invoice.view': { en: 'orders', lt: 'uzsakymai' },
    'order.confirmation': { en: 'order/confirmation', lt: 'uzsakymas/patvirtinimas' },
    'about': { en: 'about', lt: 'apie-mus' },
    'contact': { en: 'contact', lt: 'kontaktai' },
    'return-policy': { en: 'return-policy', lt: 'grazinimo-politika' },
    'shipping-policy': { en: 'shipping-policy', lt: 'pristatymo-politika' },
    'privacy-policy': { en: 'privacy-policy', lt: 'privatumo-politika' },
    // Auth routes (not localized)
    'login': { en: 'login', lt: 'login' },
    'register': { en: 'register', lt: 'register' },
    'logout': { en: 'logout', lt: 'logout' },
    'password.email': { en: 'forgot-password', lt: 'forgot-password' },
    'password.update': { en: 'reset-password', lt: 'reset-password' },
    // User Dashboard & Settings
    'dashboard': { en: 'dashboard', lt: 'dashboard' },
    'profile.edit': { en: 'settings/profile', lt: 'settings/profile' },
    'profile.update': { en: 'settings/profile', lt: 'settings/profile' },
    'user-password.update': { en: 'settings/password', lt: 'settings/password' },
    // Admin routes
    'admin.categories.index': { en: 'admin/categories', lt: 'admin/categories' },
    'admin.categories.create': { en: 'admin/categories/create', lt: 'admin/categories/create' },
    'admin.categories.store': { en: 'admin/categories', lt: 'admin/categories' },
    'admin.categories.edit': { en: 'admin/categories', lt: 'admin/categories' },
    'admin.categories.update': { en: 'admin/categories', lt: 'admin/categories' },
    'admin.categories.destroy': { en: 'admin/categories', lt: 'admin/categories' },
    'admin.products.index': { en: 'admin/products', lt: 'admin/products' },
    'admin.products.create': { en: 'admin/products/create', lt: 'admin/products/create' },
    'admin.products.store': { en: 'admin/products', lt: 'admin/products' },
    'admin.products.edit': { en: 'admin/products', lt: 'admin/products' },
    'admin.products.update': { en: 'admin/products', lt: 'admin/products' },
    'admin.products.destroy': { en: 'admin/products', lt: 'admin/products' },
    'admin.brands.index': { en: 'admin/brands', lt: 'admin/brands' },
    'admin.brands.create': { en: 'admin/brands/create', lt: 'admin/brands/create' },
    'admin.brands.store': { en: 'admin/brands', lt: 'admin/brands' },
    'admin.brands.edit': { en: 'admin/brands', lt: 'admin/brands' },
    'admin.brands.update': { en: 'admin/brands', lt: 'admin/brands' },
    'admin.brands.destroy': { en: 'admin/brands', lt: 'admin/brands' },
    'admin.orders.index': { en: 'admin/orders', lt: 'admin/orders' },
    'admin.orders.show': { en: 'admin/orders', lt: 'admin/orders' },
    'admin.orders.update-status': { en: 'admin/orders', lt: 'admin/orders' },
    'admin.orders.update-payment-status': { en: 'admin/orders', lt: 'admin/orders' },
    'admin.orders.invoice.download': { en: 'admin/orders', lt: 'admin/orders' },
    'admin.orders.invoice.view': { en: 'admin/orders', lt: 'admin/orders' },
};

// Non-localized routes (auth routes that don't have locale prefix)
const nonLocalizedRoutes = [
    'login',
    'register',
    'logout',
    'password.email',
    'password.update',
];

/**
 * Generate a locale-aware URL
 *
 * @param name Route name (e.g., 'products.index', 'products.show')
 * @param params Route parameters (e.g., { slug: 'product-slug' })
 * @param locale Current locale
 * @returns Locale-aware URL
 */
export function route(name: string, params: Record<string, string | number | boolean> = {}, locale: string = 'en'): string {
    // Get the translated route segment
    const segment = routeMap[name]?.[locale];

    if (segment === undefined) {
        console.warn(`Route "${name}" not found in route map`);
        return '/';
    }

    // Build the path
    let path = '';

    // Add locale prefix for non-English, but only for localized routes
    if (locale !== 'en' && !nonLocalizedRoutes.includes(name)) {
        path = `/${locale}`;
    }

    // Add the route segment
    if (segment) {
        path += `/${segment}`;
    }

    // Handle route parameters (like {slug}, {orderNumber}, {id}, {category}, {product}, {order})
    if (params.slug) {
        path += `/${params.slug}`;
    } else if (params.orderNumber) {
        path += `/${params.orderNumber}`;
    } else if (params.order) {
        path += `/${params.order}`;
    } else if (params.category) {
        path += `/${params.category}`;
    } else if (params.product) {
        path += `/${params.product}`;
    } else if (params.id) {
        path += `/${params.id}`;
    }

    // Add /edit suffix for edit routes (except profile and password settings)
    if (name.endsWith('.edit') && !name.startsWith('profile') && !name.startsWith('user-password') && !name.startsWith('appearance') && !name.startsWith('two-factor')) {
        path += '/edit';
    }

    // Add /invoice/download suffix for invoice download routes (localized)
    if (name.endsWith('.invoice.download')) {
        path += locale === 'lt' ? '/saskaita/atsisiusti' : '/invoice/download';
    }

    // Add /invoice/view suffix for invoice view routes (localized)
    if (name.endsWith('.invoice.view')) {
        path += locale === 'lt' ? '/saskaita/perziureti' : '/invoice/view';
    }

    // Add /status suffix for status update routes
    if (name.endsWith('.update-status')) {
        path += '/status';
    }

    // Add /payment-status suffix for payment status update routes
    if (name.endsWith('.update-payment-status')) {
        path += '/payment-status';
    }

    // Handle query parameters
    const queryParams = { ...params };
    delete queryParams.slug; // Remove slug as it's already in the path
    delete queryParams.orderNumber; // Remove orderNumber as it's already in the path
    delete queryParams.order; // Remove order as it's already in the path
    delete queryParams.category; // Remove category as it's already in the path
    delete queryParams.product; // Remove product as it's already in the path
    delete queryParams.id; // Remove id as it's already in the path

    const queryString = Object.keys(queryParams)
        .filter(key => queryParams[key] !== undefined && queryParams[key] !== null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
        .join('&');

    if (queryString) {
        path += `?${queryString}`;
    }

    return path || '/';
}
