import { Link, usePage } from '@inertiajs/react';
import MainHeader from '@/components/main-header';
import Footer from '@/components/footer';
import { useTranslation } from '@/hooks/use-translation';
import { ChevronRight, Truck, Clock, DollarSign, Globe, AlertCircle } from 'lucide-react';
import SEO from '@/components/seo';
import { generateCanonicalUrl, type BreadcrumbItem } from '@/lib/seo';

interface PageProps {
    seo: {
        siteName: string;
        siteUrl: string;
    };
    locale: string;
}

export default function ShippingPolicy() {
    const { t, route } = useTranslation();
    const { seo } = usePage<PageProps>().props;

    const sections = [
        {
            icon: Truck,
            title: t('shipping_policy.methods_title', 'Delivery Methods'),
            content: t('shipping_policy.methods_content', 'We offer convenient delivery through trusted courier services and parcel locker networks. Choose the option that works best for you at checkout.')
        },
        {
            icon: Clock,
            title: t('shipping_policy.times_title', 'Delivery Times'),
            items: [
                t('shipping_policy.times_lithuania', 'Lithuania: 1-3 business days'),
                t('shipping_policy.times_europe', 'European Union: 3-10 business days')
            ]
        },
        {
            icon: DollarSign,
            title: t('shipping_policy.costs_title', 'Shipping Costs'),
            content: t('shipping_policy.costs_content', 'Shipping costs are calculated at checkout based on your location, package size, and delivery method. We strive to keep shipping fees as low as possible.')
        },
        {
            icon: Globe,
            title: t('shipping_policy.international_title', 'International Shipping'),
            content: t('shipping_policy.international_content', 'We ship to all European Union countries. Please note that international orders may be subject to customs duties and import taxes, which are the responsibility of the customer.')
        },
        {
            icon: AlertCircle,
            title: t('shipping_policy.issues_title', 'Delivery Issues'),
            content: t('shipping_policy.issues_content', 'If your package is delayed, damaged, or lost during shipping, please contact us immediately at info@naturalmente.lt. We will work with you and our shipping partners to resolve the issue as quickly as possible.')
        }
    ];

    // SEO data
    const siteUrl = seo?.siteUrl || '';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const canonicalUrl = generateCanonicalUrl(siteUrl, currentPath);

    // Breadcrumbs for structured data
    const breadcrumbs: BreadcrumbItem[] = [
        { name: t('nav.home', 'Home'), url: siteUrl },
        { name: t('shipping_policy.title', 'Shipping Policy'), url: canonicalUrl },
    ];

    // Alternate URLs for hreflang
    const alternateUrls = [
        { locale: 'en', url: `${siteUrl}/shipping-policy` },
        { locale: 'lt', url: `${siteUrl}/lt/pristatymo-politika` },
    ];

    return (
        <>
            <SEO
                title={t('shipping_policy.meta_title', 'Shipping Policy')}
                description={t('shipping_policy.meta_description', 'Shop Natural shipping information. Fast delivery to Lithuania (1-3 days) and EU (3-10 days). Affordable shipping rates.')}
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
                            <span className="text-foreground">{t('shipping_policy.title', 'Shipping Policy')}</span>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-8">
                    {/* Page Heading */}
                    <div className="mb-8 md:mb-12">
                        <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl lg:text-4xl">
                            {t('shipping_policy.heading', 'Shipping Policy')}
                        </h1>
                        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                            {t('shipping_policy.intro', 'We are committed to delivering your natural products quickly and safely. Please review our shipping information below.')}
                        </p>
                    </div>

                    {/* Policy Sections */}
                    <div className="space-y-6">
                        {sections.map((section, index) => {
                            const Icon = section.icon;
                            return (
                                <div
                                    key={index}
                                    className="rounded-2xl border-2 border-border bg-background p-6 md:p-8 transition-all duration-300 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="shrink-0">
                                            <div className="inline-flex rounded-full bg-gold/10 p-3">
                                                <Icon className="size-6 text-gold" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="mb-3 text-xl font-bold uppercase tracking-wide text-foreground md:text-2xl">
                                                {section.title}
                                            </h2>
                                            {section.content ? (
                                                <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                                                    {section.content}
                                                </p>
                                            ) : section.items ? (
                                                <ul className="space-y-2">
                                                    {section.items.map((item, itemIndex) => (
                                                        <li
                                                            key={itemIndex}
                                                            className="flex items-start gap-2 text-base leading-relaxed text-muted-foreground md:text-lg"
                                                        >
                                                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"></span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Additional Information */}
                    <div className="mt-8 md:mt-12">
                        <div className="rounded-2xl border-2 border-gold/30 bg-gold/5 p-6 md:p-8">
                            <h2 className="mb-4 text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl">
                                {t('shipping_policy.tracking_title', 'Order Tracking')}
                            </h2>
                            <p className="text-base leading-relaxed text-foreground md:text-lg">
                                {t('shipping_policy.tracking_content', 'Once your order ships, you will receive a confirmation email with tracking information. You can monitor your delivery status in real-time through your account or the provided tracking link.')}
                            </p>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}
