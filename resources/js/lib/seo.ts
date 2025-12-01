/**
 * SEO Utilities for Shop Natural
 * Provides types and helper functions for generating SEO meta tags and structured data
 */

// ============================================================================
// TYPES
// ============================================================================

export interface SEOData {
    title: string;
    description?: string;
    image?: string;
    type?: 'website' | 'article' | 'product';
    canonical?: string;
    noindex?: boolean;
    keywords?: string;
}

export interface ProductSEO {
    name: string;
    description: string;
    image: string;
    images?: string[];
    price: number;
    compareAtPrice?: number | null;
    currency?: string;
    availability: 'InStock' | 'OutOfStock' | 'PreOrder';
    sku?: string;
    brand?: string;
    category?: string;
    url: string;
}

export interface BreadcrumbItem {
    name: string;
    url: string;
}

export interface OrganizationData {
    name: string;
    url: string;
    logo: string;
    description?: string;
    email?: string;
    phone?: string;
    address?: {
        streetAddress?: string;
        addressLocality?: string;
        postalCode?: string;
        addressCountry?: string;
    };
    socialProfiles?: string[];
}

// ============================================================================
// JSON-LD SCHEMA GENERATORS
// ============================================================================

/**
 * Generate Product schema for JSON-LD structured data
 */
export function createProductSchema(product: ProductSEO): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images && product.images.length > 0 ? product.images : product.image,
        sku: product.sku,
        brand: product.brand
            ? {
                  '@type': 'Brand',
                  name: product.brand,
              }
            : undefined,
        category: product.category,
        offers: {
            '@type': 'Offer',
            url: product.url,
            priceCurrency: product.currency || 'EUR',
            price: product.price.toFixed(2),
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            availability: `https://schema.org/${product.availability}`,
            itemCondition: 'https://schema.org/NewCondition',
        },
    };
}

/**
 * Generate BreadcrumbList schema for JSON-LD structured data
 */
export function createBreadcrumbSchema(items: BreadcrumbItem[]): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

/**
 * Generate Organization schema for JSON-LD structured data
 */
export function createOrganizationSchema(org: OrganizationData): object {
    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: org.name,
        url: org.url,
        logo: org.logo,
        description: org.description,
    };

    if (org.email) {
        schema.email = org.email;
    }

    if (org.phone) {
        schema.telephone = org.phone;
    }

    if (org.address) {
        schema.address = {
            '@type': 'PostalAddress',
            ...org.address,
        };
    }

    if (org.socialProfiles && org.socialProfiles.length > 0) {
        schema.sameAs = org.socialProfiles;
    }

    return schema;
}

/**
 * Generate WebSite schema for JSON-LD structured data
 */
export function createWebsiteSchema(
    name: string,
    url: string,
    searchUrl?: string
): object {
    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: name,
        url: url,
    };

    if (searchUrl) {
        schema.potentialAction = {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: searchUrl,
            },
            'query-input': 'required name=search_term_string',
        };
    }

    return schema;
}

/**
 * Generate CollectionPage schema for product listing pages
 */
export function createCollectionSchema(
    name: string,
    description: string,
    url: string,
    items?: { name: string; url: string }[]
): object {
    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: name,
        description: description,
        url: url,
    };

    if (items && items.length > 0) {
        schema.mainEntity = {
            '@type': 'ItemList',
            itemListElement: items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                url: item.url,
            })),
        };
    }

    return schema;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Truncate text to a maximum length for meta descriptions
 */
export function truncateDescription(text: string, maxLength: number = 160): string {
    if (!text) return '';

    // Strip HTML tags
    const strippedText = text.replace(/<[^>]*>/g, '');

    if (strippedText.length <= maxLength) {
        return strippedText;
    }

    // Find the last space before maxLength to avoid cutting words
    const truncated = strippedText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

/**
 * Generate canonical URL from current path
 */
export function generateCanonicalUrl(baseUrl: string, path: string): string {
    // Remove trailing slashes and query parameters for canonical
    const cleanPath = path.split('?')[0].replace(/\/+$/, '');
    return `${baseUrl}${cleanPath}`;
}

/**
 * Generate alternate language URLs for hreflang tags
 */
export function generateAlternateUrls(
    baseUrl: string,
    currentPath: string,
    locales: string[],
    currentLocale: string,
    alternateSlug?: string
): { locale: string; url: string }[] {
    return locales.map((locale) => {
        const path = currentPath;

        // Handle locale prefix in path
        const pathParts = path.split('/').filter(Boolean);

        // Remove current locale prefix if exists
        if (locales.includes(pathParts[0])) {
            pathParts.shift();
        }

        // Handle alternate slug for product pages
        if (alternateSlug && locale !== currentLocale) {
            // Check if this is a product page (has 'products' or 'produktai' segment)
            const productIndex = pathParts.findIndex(p => p === 'products' || p === 'produktai');
            if (productIndex !== -1 && pathParts[productIndex + 1]) {
                pathParts[productIndex + 1] = alternateSlug;
            }
        }

        // Build new path with locale prefix (skip for 'en' if it's the default)
        const newPath = locale === 'en'
            ? '/' + pathParts.join('/')
            : '/' + locale + '/' + pathParts.join('/');

        return {
            locale,
            url: `${baseUrl}${newPath}`,
        };
    });
}
