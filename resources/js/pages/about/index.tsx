import { Link, usePage } from '@inertiajs/react';
import MainHeader from '@/components/main-header';
import Footer from '@/components/footer';
import { useTranslation } from '@/hooks/use-translation';
import { ChevronRight, Leaf, Package, Heart, Sprout, Droplet, Trees, Sparkles } from 'lucide-react';
import SEO from '@/components/seo';
import { generateCanonicalUrl, type BreadcrumbItem } from '@/lib/seo';

interface PageProps {
    seo: {
        siteName: string;
        siteUrl: string;
    };
    locale: string;
}

export default function About() {
    const { t, route } = useTranslation();
    const { seo } = usePage<PageProps>().props;

    const commitments = [
        {
            icon: Package,
            title: t('about.commitment_1_title', 'Recyclable & Biodegradable Packaging'),
            description: t('about.commitment_1_desc', 'All our packaging materials are designed to minimize environmental impact.')
        },
        {
            icon: Leaf,
            title: t('about.commitment_2_title', 'Sustainable Suppliers Only'),
            description: t('about.commitment_2_desc', 'We partner exclusively with suppliers who share our environmental values.')
        },
        {
            icon: Heart,
            title: t('about.commitment_3_title', 'No Animal Testing'),
            description: t('about.commitment_3_desc', 'We are proud to be cruelty-free and never test on animals.')
        }
    ];

    const whyChooseUs = [
        {
            icon: Sprout,
            title: t('about.why_1_title', 'Family-Operated'),
            description: t('about.why_1_desc', 'As a family business, we prioritize customer relationships and personalized service.')
        },
        {
            icon: Droplet,
            title: t('about.why_2_title', 'Transparent Ingredients'),
            description: t('about.why_2_desc', 'No hidden chemicals or harmful additives - just pure, natural ingredients.')
        },
        {
            icon: Trees,
            title: t('about.why_3_title', 'Eco-Friendly Supply Chain'),
            description: t('about.why_3_desc', 'From sourcing to delivery, we minimize waste at every step.')
        }
    ];

    // SEO data
    const siteUrl = seo?.siteUrl || '';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const canonicalUrl = generateCanonicalUrl(siteUrl, currentPath);

    // Breadcrumbs for structured data
    const breadcrumbs: BreadcrumbItem[] = [
        { name: t('nav.home', 'Home'), url: siteUrl },
        { name: t('about.title', 'About Us'), url: canonicalUrl },
    ];

    // Alternate URLs for hreflang
    const alternateUrls = [
        { locale: 'en', url: `${siteUrl}/about` },
        { locale: 'lt', url: `${siteUrl}/lt/apie-mus` },
    ];

    return (
        <>
            <SEO
                title={t('about.meta_title', 'About Us')}
                description={t('about.meta_description', 'Learn about Shop Natural - a family-run business dedicated to eco-friendly, natural products. Committed to sustainability and cruelty-free practices.')}
                canonical={canonicalUrl}
                alternateUrls={alternateUrls}
                breadcrumbs={breadcrumbs}
            />

            <div className="min-h-screen bg-background">
                <MainHeader />

                {/* Breadcrumb */}
                <div className="border-b border-border">
                    <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link href={route('home')} className="hover:text-foreground transition-colors">
                                {t('nav.home', 'Home')}
                            </Link>
                            <ChevronRight className="size-4" />
                            <span className="text-foreground">{t('about.title', 'About Us')}</span>
                        </div>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-gold/5 via-background to-teal/5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(194,163,99,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(77,141,123,0.08),transparent_50%)]" />
                    <div className="container relative mx-auto px-4 py-16 md:px-6 md:py-24 lg:px-8 lg:py-32">
                        <div className="mx-auto max-w-4xl text-center">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-gold/30 bg-gold/10 px-4 py-2">
                                <Sparkles className="size-4 text-gold" />
                                <span className="text-sm font-bold uppercase tracking-wider text-gold">
                                    {t('about.hero_badge', 'Family-Run Since Day One')}
                                </span>
                            </div>
                            <h1 className="mb-6 text-4xl font-bold uppercase tracking-wide text-foreground md:text-5xl lg:text-6xl">
                                {t('about.heading', 'About Us')}
                            </h1>
                            <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
                                {t('about.hero_subtitle', 'A family business dedicated to eco-friendly, natural products that enhance your everyday life')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12 md:px-6 md:py-16 lg:px-8 lg:py-20">
                    {/* Our Roots Section - Split Layout */}
                    <div className="mb-16 md:mb-24">
                        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                            <div className="flex flex-col justify-center">
                                <h2 className="mb-6 text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl lg:text-4xl">
                                    {t('about.roots_title', 'Our Roots')}
                                </h2>
                                <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                                    {t('about.roots_content', 'Shop Natural is a family-run business dedicated to offering eco-friendly, natural products that enhance your everyday life. We believe in the power of nature and sustainability, which is why every item in our shop has been carefully curated to meet the highest environmental standards.')}
                                </p>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-2xl border-2 border-gold/30 bg-gold/5 p-8 text-center">
                                        <Leaf className="mx-auto mb-2 size-8 text-gold" />
                                        <div className="text-3xl font-bold text-gold">100%</div>
                                        <div className="text-sm text-muted-foreground">{t('about.stat_natural', 'Natural')}</div>
                                    </div>
                                    <div className="mt-8 rounded-2xl border-2 border-teal/30 bg-teal/5 p-8 text-center">
                                        <Heart className="mx-auto mb-2 size-8 text-teal" />
                                        <div className="text-3xl font-bold text-teal">0</div>
                                        <div className="text-sm text-muted-foreground">{t('about.stat_testing', 'Animal Testing')}</div>
                                    </div>
                                    <div className="rounded-2xl border-2 border-teal/30 bg-teal/5 p-8 text-center">
                                        <Package className="mx-auto mb-2 size-8 text-teal" />
                                        <div className="text-3xl font-bold text-teal">100%</div>
                                        <div className="text-sm text-muted-foreground">{t('about.stat_recyclable', 'Recyclable')}</div>
                                    </div>
                                    <div className="mt-8 rounded-2xl border-2 border-gold/30 bg-gold/5 p-8 text-center">
                                        <Trees className="mx-auto mb-2 size-8 text-gold" />
                                        <div className="text-3xl font-bold text-gold">♾️</div>
                                        <div className="text-sm text-muted-foreground">{t('about.stat_sustainable', 'Sustainable')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Our Commitments Section - Staggered Layout */}
                    <div className="mb-16 md:mb-24">
                        <div className="mb-8 text-center">
                            <h2 className="mb-3 text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl lg:text-4xl">
                                {t('about.commitments_title', 'Our Commitments')}
                            </h2>
                            <p className="text-base text-muted-foreground md:text-lg">
                                {t('about.commitments_subtitle', 'What drives us every single day')}
                            </p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-3">
                            {commitments.map((commitment, index) => {
                                const Icon = commitment.icon;
                                return (
                                    <div
                                        key={index}
                                        className={`group relative rounded-2xl border-2 border-border bg-background p-6 transition-all duration-300 hover:border-gold/40 hover:shadow-xl hover:shadow-gold/10 md:p-8 ${
                                            index === 1 ? 'md:mt-8' : ''
                                        }`}
                                    >
                                        <div className="absolute right-6 top-6 text-6xl font-bold text-border transition-colors group-hover:text-gold/20">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </div>
                                        <div className="relative">
                                            <div className="mb-4 inline-flex rounded-full bg-gold/10 p-4 transition-transform group-hover:scale-110">
                                                <Icon className="size-7 text-gold" />
                                            </div>
                                            <h3 className="mb-3 text-lg font-bold uppercase tracking-wide text-foreground">
                                                {commitment.title}
                                            </h3>
                                            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                                                {commitment.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Why Choose Us Section - Large Cards */}
                    <div className="mb-16 md:mb-24">
                        <div className="mb-8 text-center">
                            <h2 className="mb-3 text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl lg:text-4xl">
                                {t('about.why_choose_title', 'Why Choose Shop Natural')}
                            </h2>
                        </div>
                        <div className="space-y-6">
                            {whyChooseUs.map((reason, index) => {
                                const Icon = reason.icon;
                                const isEven = index % 2 === 0;
                                return (
                                    <div
                                        key={index}
                                        className={`flex flex-col gap-6 rounded-2xl border-2 border-border bg-gradient-to-br p-6 transition-all duration-300 hover:border-gold/40 hover:shadow-xl hover:shadow-gold/10 md:p-8 lg:flex-row lg:items-center lg:gap-12 ${
                                            isEven ? 'from-gold/5 to-background' : 'from-teal/5 to-background'
                                        }`}
                                    >
                                        <div className={`flex-shrink-0 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                                            <div className={`inline-flex rounded-2xl p-6 ${isEven ? 'bg-gold/15' : 'bg-teal/15'}`}>
                                                <Icon className={`size-12 ${isEven ? 'text-gold' : 'text-teal'}`} />
                                            </div>
                                        </div>
                                        <div className={`flex-1 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                                            <h3 className="mb-3 text-xl font-bold uppercase tracking-wide text-foreground md:text-2xl">
                                                {reason.title}
                                            </h3>
                                            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                                                {reason.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Our Vision Section - Statement Block */}
                    <div className="mb-16 md:mb-24">
                        <div className="relative overflow-hidden rounded-3xl border-2 border-border bg-gradient-to-br from-background via-gold/5 to-teal/5 p-8 md:p-12 lg:p-16">
                            <div className="absolute right-0 top-0 size-64 bg-gold/10 blur-3xl" />
                            <div className="absolute bottom-0 left-0 size-64 bg-teal/10 blur-3xl" />
                            <div className="relative mx-auto max-w-3xl text-center">
                                <h2 className="mb-6 text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl lg:text-4xl">
                                    {t('about.vision_title', 'Our Vision')}
                                </h2>
                                <p className="mb-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
                                    {t('about.vision_content_1', 'Looking ahead, we are committed to reducing our carbon footprint even further by introducing refillable options and exploring innovative packaging solutions.')}
                                </p>
                                <p className="text-lg leading-relaxed text-foreground md:text-xl">
                                    {t('about.vision_content_2', 'We want to be more than just a shop - we want to be a community of like-minded individuals who care about the planet and the future we leave behind.')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Environmental Impact Section - Call to Action Style */}
                    <div className="mb-8 md:mb-12">
                        <div className="relative overflow-hidden rounded-3xl border-2 border-gold bg-gradient-to-br from-gold/20 via-gold/10 to-gold/20 p-8 md:p-12">
                            <div className="absolute -right-8 -top-8 size-48 rounded-full bg-gold/30 blur-2xl" />
                            <div className="absolute -bottom-8 -left-8 size-48 rounded-full bg-gold/20 blur-2xl" />
                            <div className="relative mx-auto max-w-3xl text-center">
                                <div className="mb-4 inline-flex rounded-full bg-gold/30 p-4">
                                    <Trees className="size-8 text-foreground" />
                                </div>
                                <h2 className="mb-4 text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl lg:text-4xl">
                                    {t('about.impact_title', 'Environmental Impact')}
                                </h2>
                                <p className="text-lg leading-relaxed text-foreground md:text-xl">
                                    {t('about.impact_content', 'A portion of our profits goes directly to reforestation projects and environmental conservation efforts. When you shop with us, you are not just buying a product - you are supporting a healthier planet.')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}
