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

export interface ProductVariantSEO {
    sku: string;
    name: string;
    price: number;
    availability: 'InStock' | 'OutOfStock';
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
    image?: string;
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
 * Generate Product schema with AggregateOffer for products with multiple variants
 * Uses individual Offer entries per variant with lowPrice/highPrice range
 */
export function createProductSchemaWithVariants(
    product: ProductSEO,
    variants: ProductVariantSEO[]
): object {
    const prices = variants.map(v => v.price);
    const lowPrice = Math.min(...prices);
    const highPrice = Math.max(...prices);
    const hasStock = variants.some(v => v.availability === 'InStock');

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
            '@type': 'AggregateOffer',
            url: product.url,
            priceCurrency: product.currency || 'EUR',
            lowPrice: lowPrice.toFixed(2),
            highPrice: highPrice.toFixed(2),
            offerCount: variants.length,
            availability: `https://schema.org/${hasStock ? 'InStock' : 'OutOfStock'}`,
            offers: variants.map(variant => ({
                '@type': 'Offer',
                url: product.url,
                priceCurrency: product.currency || 'EUR',
                price: variant.price.toFixed(2),
                priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                availability: `https://schema.org/${variant.availability}`,
                itemCondition: 'https://schema.org/NewCondition',
                sku: variant.sku,
                name: variant.name,
            })),
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
        image: org.image || org.logo,
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
 * Generate LocalBusiness schema for JSON-LD structured data
 */
export function createLocalBusinessSchema(business: {
    name: string;
    url: string;
    logo: string;
    image?: string;
    description?: string;
    email?: string;
    phone?: string;
    address?: {
        streetAddress?: string;
        addressLocality?: string;
        postalCode?: string;
        addressCountry?: string;
    };
    geo?: {
        latitude: number;
        longitude: number;
    };
    openingHours?: string[];
    priceRange?: string;
}): object {
    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${business.url}#localbusiness`,
        name: business.name,
        url: business.url,
        logo: business.logo,
        image: business.image || business.logo,
        description: business.description,
        telephone: business.phone,
        email: business.email,
    };

    if (business.address) {
        schema.address = {
            '@type': 'PostalAddress',
            ...business.address,
        };
    }

    if (business.geo) {
        schema.geo = {
            '@type': 'GeoCoordinates',
            latitude: business.geo.latitude,
            longitude: business.geo.longitude,
        };
    }

    if (business.openingHours && business.openingHours.length > 0) {
        schema.openingHoursSpecification = business.openingHours.map(hours => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: hours.split(' ')[0],
            opens: hours.split(' ')[1],
            closes: hours.split(' ')[2],
        }));
    }

    if (business.priceRange) {
        schema.priceRange = business.priceRange;
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
    items?: { name: string; url: string; image?: string; price?: number; currency?: string }[]
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
            itemListElement: items.map((item, index) => {
                const listItem: Record<string, unknown> = {
                    '@type': 'ListItem',
                    position: index + 1,
                    name: item.name,
                    url: item.url,
                };
                if (item.image || item.price) {
                    listItem.item = {
                        '@type': 'Product',
                        name: item.name,
                        url: item.url,
                        ...(item.image && { image: item.image }),
                        ...(item.price && {
                            offers: {
                                '@type': 'Offer',
                                priceCurrency: item.currency || 'EUR',
                                price: item.price.toFixed(2),
                                availability: 'https://schema.org/InStock',
                            },
                        }),
                    };
                }
                return listItem;
            }),
        };
    }

    return schema;
}

/**
 * Generate Brand schema for brand pages
 */
export function createBrandSchema(brand: {
    name: string;
    url: string;
    logo?: string | null;
    description?: string | null;
    children?: { name: string; url: string; logo?: string | null; description?: string | null }[];
}): object {
    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Brand',
        name: brand.name,
        url: brand.url,
    };

    if (brand.logo) {
        schema.logo = brand.logo;
    }

    if (brand.description) {
        schema.description = brand.description;
    }

    if (brand.children && brand.children.length > 0) {
        schema.subOrganization = brand.children.map(child => ({
            '@type': 'Brand',
            name: child.name,
            url: child.url,
            ...(child.logo && { logo: child.logo }),
            ...(child.description && { description: child.description }),
        }));
    }

    return schema;
}

// ============================================================================
// GEO/AEO SCHEMA GENERATORS (AI Search Optimization)
// ============================================================================

export interface FAQItem {
    question: string;
    answer: string;
}

export interface HowToStep {
    name: string;
    text: string;
    image?: string;
}

/**
 * Generate FAQPage schema for JSON-LD structured data
 * Critical for GEO - AI systems love FAQ structured data
 */
export function createFAQSchema(faqs: FAQItem[]): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

/**
 * Generate HowTo schema for product usage instructions
 * Critical for GEO - helps AI understand how to use products
 */
export function createHowToSchema(
    name: string,
    description: string,
    steps: HowToStep[],
    totalTime?: string,
    image?: string
): object {
    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: name,
        description: description,
        step: steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.name,
            text: step.text,
            ...(step.image && { image: step.image }),
        })),
    };

    if (totalTime) {
        schema.totalTime = totalTime;
    }

    if (image) {
        schema.image = image;
    }

    return schema;
}

/**
 * Parse product description to extract FAQ-style content
 * Converts H5 sections like "Features and Benefits", "Suitable For" into FAQ format
 */
export function parseProductDescriptionForFAQ(
    description: string,
    productName: string,
    locale: 'en' | 'lt' = 'en'
): FAQItem[] {
    const faqs: FAQItem[] = [];

    // Define section mappings to FAQ questions
    const sectionMappings: Record<string, { en: string; lt: string }> = {
        'features and benefits': {
            en: `What are the benefits of ${productName}?`,
            lt: `Kokie yra ${productName} privalumai?`,
        },
        'savybės ir privalumai': {
            en: `What are the benefits of ${productName}?`,
            lt: `Kokie yra ${productName} privalumai?`,
        },
        'suitable for': {
            en: `Who is ${productName} suitable for?`,
            lt: `Kam tinka ${productName}?`,
        },
        'tinka': {
            en: `Who is ${productName} suitable for?`,
            lt: `Kam tinka ${productName}?`,
        },
        'application': {
            en: `How do I use ${productName}?`,
            lt: `Kaip naudoti ${productName}?`,
        },
        'naudojimas': {
            en: `How do I use ${productName}?`,
            lt: `Kaip naudoti ${productName}?`,
        },
    };

    // Extract H5 sections and their content
    const h5Regex = /<h5>([^<]+)<\/h5>\s*(<p>[\s\S]*?)(?=<h5>|$)/gi;
    let match;

    while ((match = h5Regex.exec(description)) !== null) {
        const sectionTitle = match[1].toLowerCase().trim();
        const content = match[2]
            .replace(/<\/?p>/gi, '')
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/<[^>]*>/g, '')
            .trim();

        // Find matching question
        for (const [key, questions] of Object.entries(sectionMappings)) {
            if (sectionTitle.includes(key) || key.includes(sectionTitle)) {
                faqs.push({
                    question: questions[locale],
                    answer: content,
                });
                break;
            }
        }
    }

    return faqs;
}

/**
 * Parse product description to extract HowTo steps from Application section
 */
export function parseProductDescriptionForHowTo(
    description: string,
    productName: string,
    locale: 'en' | 'lt' = 'en'
): { name: string; description: string; steps: HowToStep[] } | null {
    // Find Application/Naudojimas section
    const applicationRegex = /<h5>(Application|Naudojimas)<\/h5>\s*(<p>[\s\S]*?)(?=<h5>|$)/i;
    const match = applicationRegex.exec(description);

    if (!match) return null;

    const content = match[2]
        .replace(/<\/?p>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .trim();

    // Split into sentences for steps
    const sentences = content
        .split(/(?<=[.!])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);

    if (sentences.length === 0) return null;

    const steps: HowToStep[] = sentences.map((sentence, index) => ({
        name: locale === 'en' ? `Step ${index + 1}` : `${index + 1} žingsnis`,
        text: sentence,
    }));

    return {
        name: locale === 'en' ? `How to use ${productName}` : `Kaip naudoti ${productName}`,
        description: locale === 'en'
            ? `Step-by-step guide for applying ${productName}`
            : `Žingsnis po žingsnio vadovas, kaip naudoti ${productName}`,
        steps,
    };
}

/**
 * Generate enhanced Product schema with ingredients as additionalProperty
 * Critical for GEO - provides detailed product information for AI
 */
export function createEnhancedProductSchema(
    product: ProductSEO & {
        ingredients?: string;
        weight?: string;
        volume?: string;
    }
): object {
    const baseSchema = createProductSchema(product);

    const additionalProperties: object[] = [];

    // Add ingredients as structured data
    if (product.ingredients) {
        additionalProperties.push({
            '@type': 'PropertyValue',
            name: 'Ingredients',
            value: product.ingredients,
        });
    }

    // Add weight/volume
    if (product.weight) {
        additionalProperties.push({
            '@type': 'PropertyValue',
            name: 'Weight',
            value: product.weight,
        });
    }

    if (product.volume) {
        additionalProperties.push({
            '@type': 'PropertyValue',
            name: 'Volume',
            value: product.volume,
        });
    }

    if (additionalProperties.length > 0) {
        (baseSchema as Record<string, unknown>).additionalProperty = additionalProperties;
    }

    return baseSchema;
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
