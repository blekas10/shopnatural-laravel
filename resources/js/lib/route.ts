/**
 * Route helper for locale-aware URL generation
 */

// Route translations map
const routeMap: Record<string, Record<string, string>> = {
    'home': { en: '', lt: '' },
    'products.index': { en: 'products', lt: 'produktai' },
    'products.show': { en: 'products', lt: 'produktai' },
    'about': { en: 'about', lt: 'apie-mus' },
    'contact': { en: 'contact', lt: 'kontaktai' },
};

/**
 * Generate a locale-aware URL
 *
 * @param name Route name (e.g., 'products.index', 'products.show')
 * @param params Route parameters (e.g., { slug: 'product-slug' })
 * @param locale Current locale
 * @returns Locale-aware URL
 */
export function route(name: string, params: Record<string, any> = {}, locale: string = 'en'): string {
    // Get the translated route segment
    const segment = routeMap[name]?.[locale];

    if (segment === undefined) {
        console.warn(`Route "${name}" not found in route map`);
        return '/';
    }

    // Build the path
    let path = '';

    // Add locale prefix for non-English
    if (locale !== 'en') {
        path = `/${locale}`;
    }

    // Add the route segment
    if (segment) {
        path += `/${segment}`;
    }

    // Handle route parameters (like {slug})
    if (params.slug) {
        path += `/${params.slug}`;
    }

    // Handle query parameters
    const queryParams = { ...params };
    delete queryParams.slug; // Remove slug as it's already in the path

    const queryString = Object.keys(queryParams)
        .filter(key => queryParams[key] !== undefined && queryParams[key] !== null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
        .join('&');

    if (queryString) {
        path += `?${queryString}`;
    }

    return path || '/';
}
