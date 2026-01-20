import { Link, usePage } from '@inertiajs/react';
import MainHeader from '@/components/main-header';
import Footer from '@/components/footer';
import SEO from '@/components/seo';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { type BreadcrumbItem } from '@/lib/seo';

interface BrandChild {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
}

interface Brand {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    children: BrandChild[];
}

interface PageProps {
    seo: {
        siteUrl: string;
    };
    locale: string;
}

interface BrandShowProps {
    brand: Brand;
}

export default function BrandShow({ brand }: BrandShowProps) {
    const { t, route, locale } = useTranslation();
    const { seo } = usePage<PageProps>().props;
    const siteUrl = seo?.siteUrl || '';

    // Dynamic SEO with translations - uses same key, different values per language file
    const metaTitle = t('brands.seo.title', '{brand} Cosmetics').replace(/{brand}/g, brand.name);
    const metaDescription = t('brands.seo.description', 'Shop {brand} natural cosmetics.').replace(/{brand}/g, brand.name);
    const metaKeywords = t('brands.seo.keywords', '{brand} cosmetics').replace(/{brand}/g, brand.name);

    // Canonical and alternate URLs
    const canonicalUrl = locale === 'lt'
        ? `${siteUrl}/lt/prekes-zenklai/${brand.slug}`
        : `${siteUrl}/brands/${brand.slug}`;

    const alternateUrls = [
        { locale: 'en', url: `${siteUrl}/brands/${brand.slug}` },
        { locale: 'lt', url: `${siteUrl}/lt/prekes-zenklai/${brand.slug}` },
    ];

    // Breadcrumbs for structured data
    const breadcrumbs: BreadcrumbItem[] = [
        { name: t('nav.home', 'Home'), url: locale === 'lt' ? `${siteUrl}/lt` : siteUrl },
        { name: brand.name, url: canonicalUrl },
    ];

    return (
        <>
            <SEO
                title={metaTitle}
                description={brand.description || metaDescription}
                canonical={canonicalUrl}
                alternateUrls={alternateUrls}
                breadcrumbs={breadcrumbs}
            />

            <div className="min-h-screen bg-background">
                <MainHeader />

                {/* Breadcrumbs */}
                <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link href={route('home')} className="hover:text-foreground transition-colors">
                                {t('nav.home', 'Home')}
                            </Link>
                            <ChevronRight className="size-4" />
                            <Link href={route('products.index')} className="hover:text-foreground transition-colors">
                                {t('nav.shop', 'Shop')}
                            </Link>
                            <ChevronRight className="size-4" />
                            <span className="text-foreground font-medium">{brand.name}</span>
                        </div>
                    </div>
                </div>

                {/* Full-Screen Hero Section */}
                <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
                    {/* Background Image */}
                    {brand.logo && (
                        <div className="absolute inset-0">
                            <img
                                src={brand.logo}
                                alt=""
                                className="size-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50" />
                        </div>
                    )}

                    {/* Hero Content */}
                    <div className="relative z-10 container mx-auto px-4 py-16 md:px-6 lg:px-8 text-center">
                        <h1 className="mb-6 text-4xl font-bold uppercase tracking-wide text-white md:text-5xl lg:text-6xl drop-shadow-lg">
                            {brand.name}
                        </h1>

                        {brand.description && (
                            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl drop-shadow-md">
                                {brand.description}
                            </p>
                        )}

                        <div className="mt-10">
                            <Button
                                asChild
                                size="lg"
                                className="bg-gold px-10 py-6 text-sm font-bold uppercase tracking-wide text-black transition-all duration-300 hover:bg-white"
                            >
                                <Link href={`${route('products.index')}?brands=${brand.id}`}>
                                    {t('brands.shop_all', 'Shop All {brand}').replace('{brand}', brand.name)}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Collections - Card Grid */}
                {brand.children.length > 0 && (
                    <section className="py-16 md:py-20">
                        <div className="container mx-auto px-4 md:px-6 lg:px-8">
                            {/* 2-column grid of horizontal cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {brand.children.map((child) => (
                                    <div
                                        key={child.id}
                                        className="flex gap-5 p-4 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        {/* Image */}
                                        <div className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40">
                                            <div className="relative size-full overflow-hidden rounded-xl bg-muted">
                                                {child.logo ? (
                                                    <img
                                                        src={child.logo}
                                                        alt={child.name}
                                                        className="size-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-gold/20 to-gold/5">
                                                        <span className="text-3xl font-bold text-gold/40">
                                                            {child.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-col justify-center min-w-0">
                                            <h3 className="mb-2 text-lg font-bold text-foreground md:text-xl">
                                                {child.name}
                                            </h3>

                                            {child.description && (
                                                <p className="mb-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                                                    {child.description}
                                                </p>
                                            )}

                                            <Button
                                                asChild
                                                size="sm"
                                                className="w-fit bg-gold px-4 text-xs font-semibold uppercase tracking-wide text-black transition-all duration-300 hover:bg-gold/90"
                                            >
                                                <Link href={`${route('products.index')}?brands=${child.id}`}>
                                                    <span className="md:hidden">{t('brands.shop', 'Shop')}</span>
                                                    <span className="hidden md:inline">{t('brands.shop_collection_name', 'Shop {name}').replace('{name}', child.name)}</span>
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <Footer />
            </div>
        </>
    );
}
