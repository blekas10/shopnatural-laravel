import { Head, usePage } from '@inertiajs/react';
import { ProductSEO, createProductSchema, createBreadcrumbSchema, BreadcrumbItem } from '@/lib/seo';

interface SharedSEOData {
    siteName: string;
    siteUrl: string;
    defaultImage: string;
    twitterHandle?: string;
}

interface PageProps {
    seo: SharedSEOData;
    locale: string;
    availableLocales: string[];
}

interface SEOProps {
    // Basic SEO
    title: string;
    description?: string;
    image?: string;

    // Control
    noindex?: boolean;
    nofollow?: boolean;

    // URLs
    canonical?: string;
    alternateUrls?: { locale: string; url: string }[];

    // Open Graph
    ogType?: 'website' | 'article' | 'product';

    // Product-specific (for product pages)
    product?: ProductSEO;

    // Breadcrumbs
    breadcrumbs?: BreadcrumbItem[];

    // Additional JSON-LD schemas
    additionalSchemas?: object[];
}

export default function SEO({
    title,
    description,
    image,
    noindex = false,
    nofollow = false,
    canonical,
    alternateUrls,
    ogType = 'website',
    product,
    breadcrumbs,
    additionalSchemas,
}: SEOProps) {
    const { seo, locale } = usePage<PageProps>().props;

    const siteName = seo?.siteName || 'Shop Natural';
    const siteUrl = seo?.siteUrl || '';
    const defaultImage = seo?.defaultImage || `${siteUrl}/images/og-image.jpg`;
    const twitterHandle = seo?.twitterHandle;

    // Use title as-is - Inertia's title callback in app.tsx adds the site name suffix
    const fullTitle = title;

    // Use provided image or default
    const ogImage = image || defaultImage;

    // Build robots meta content
    const robotsContent = [
        noindex ? 'noindex' : 'index',
        nofollow ? 'nofollow' : 'follow',
    ].join(', ');

    // Determine Open Graph type
    const openGraphType = product ? 'product' : ogType;

    // Build JSON-LD schemas array
    const schemas: object[] = [];

    // Add product schema if product data provided
    if (product) {
        schemas.push(createProductSchema(product));
    }

    // Add breadcrumb schema if breadcrumbs provided
    if (breadcrumbs && breadcrumbs.length > 0) {
        schemas.push(createBreadcrumbSchema(breadcrumbs));
    }

    // Add any additional schemas
    if (additionalSchemas) {
        schemas.push(...additionalSchemas);
    }

    return (
        <Head>
            {/* Primary Title */}
            <title>{fullTitle}</title>

            {/* Basic Meta Tags */}
            {description && <meta name="description" content={description} />}
            <meta name="robots" content={robotsContent} />

            {/* Canonical URL */}
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Language Alternates (hreflang) */}
            {alternateUrls?.map(({ locale: lang, url }) => (
                <link key={lang} rel="alternate" hrefLang={lang} href={url} />
            ))}
            {alternateUrls && alternateUrls.length > 0 && (
                <link rel="alternate" hrefLang="x-default" href={alternateUrls.find(a => a.locale === 'en')?.url || canonical} />
            )}

            {/* Open Graph Tags */}
            <meta property="og:type" content={openGraphType} />
            <meta property="og:title" content={title} />
            {description && <meta property="og:description" content={description} />}
            <meta property="og:image" content={ogImage} />
            {canonical && <meta property="og:url" content={canonical} />}
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content={locale === 'lt' ? 'lt_LT' : 'en_US'} />
            {locale === 'lt' && <meta property="og:locale:alternate" content="en_US" />}
            {locale === 'en' && <meta property="og:locale:alternate" content="lt_LT" />}

            {/* Product-specific Open Graph (for e-commerce) */}
            {product && (
                <>
                    <meta property="product:price:amount" content={product.price.toFixed(2)} />
                    <meta property="product:price:currency" content={product.currency || 'EUR'} />
                    <meta
                        property="product:availability"
                        content={product.availability === 'InStock' ? 'in stock' : 'out of stock'}
                    />
                    {product.brand && <meta property="product:brand" content={product.brand} />}
                </>
            )}

            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            {description && <meta name="twitter:description" content={description} />}
            <meta name="twitter:image" content={ogImage} />
            {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

            {/* JSON-LD Structured Data */}
            {schemas.map((schema, index) => (
                <script key={index} type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            ))}
        </Head>
    );
}
