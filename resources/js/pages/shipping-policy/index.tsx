import { Link, usePage } from '@inertiajs/react';
import MainHeader from '@/components/main-header';
import Footer from '@/components/footer';
import { useTranslation } from '@/hooks/use-translation';
import { ChevronRight, Truck, Clock, DollarSign, Globe, AlertCircle, MapPin, Package } from 'lucide-react';
import SEO from '@/components/seo';
import { generateCanonicalUrl, createFAQSchema, type BreadcrumbItem, type FAQItem } from '@/lib/seo';
import { VenipakLogo, FedExLogo } from '@/components/payment-logos';

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

    const shippingRegions = [
        {
            logo: 'venipak',
            region: t('shipping_policy.region_baltic', 'Baltic Countries (Lithuania, Latvia, Estonia)'),
            methods: [
                {
                    name: t('shipping_policy.venipak_courier', 'Venipak Courier'),
                    description: t('shipping_policy.venipak_courier_desc', 'Delivery to your door'),
                    price: '€4',
                    time: t('shipping_policy.time_1_5_days', '1-5 business days'),
                    note: t('shipping_policy.lt_free_shipping', 'Free shipping in Lithuania for orders over €50')
                },
                {
                    name: t('shipping_policy.venipak_pickup', 'Venipak Pickup Location'),
                    description: t('shipping_policy.venipak_pickup_desc', 'Pick up from convenient Venipak location'),
                    price: '€4',
                    time: t('shipping_policy.time_1_5_days', '1-5 business days'),
                    note: t('shipping_policy.lt_free_shipping', 'Free shipping in Lithuania for orders over €50')
                }
            ]
        },
        {
            logo: 'venipak',
            region: t('shipping_policy.region_international', 'International (Poland, Finland)'),
            methods: [
                {
                    name: t('shipping_policy.venipak_courier', 'Venipak Courier'),
                    description: t('shipping_policy.venipak_courier_desc', 'Delivery to your door'),
                    price: '€4',
                    time: t('shipping_policy.time_1_5_days', '1-5 business days'),
                }
            ]
        },
        {
            logo: 'fedex',
            region: t('shipping_policy.region_eu', 'European Union'),
            countries: t('shipping_policy.eu_countries', 'Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, France, Germany, Greece, Hungary, Ireland, Italy, Luxembourg, Malta, Netherlands, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden, United Kingdom, Norway, Switzerland'),
            methods: [
                {
                    name: t('shipping_policy.fedex_international', 'FedEx International'),
                    description: t('shipping_policy.fedex_international_desc', 'International delivery to your door'),
                    price: '€20',
                    time: t('shipping_policy.time_2_10_days', '2-10 business days'),
                }
            ]
        },
        {
            logo: 'fedex',
            region: t('shipping_policy.region_north_america', 'North America (USA, Canada)'),
            methods: [
                {
                    name: t('shipping_policy.fedex_international', 'FedEx International'),
                    description: t('shipping_policy.fedex_international_desc', 'International delivery to your door'),
                    price: '€20',
                    time: t('shipping_policy.time_5_14_days', '5-14 business days'),
                }
            ]
        }
    ];

    const sections = [
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

    // FAQ schema from shipping policy sections
    const shippingFAQs: FAQItem[] = [
        {
            question: t('shipping_policy.faq_q_methods', 'What shipping methods do you offer?'),
            answer: t('shipping_policy.faq_a_methods', 'We offer Venipak Courier and Venipak Pickup Location for Baltic countries (Lithuania, Latvia, Estonia) and Poland/Finland. For the rest of the EU, USA, and Canada, we ship via FedEx International.'),
        },
        {
            question: t('shipping_policy.faq_q_cost', 'How much does shipping cost?'),
            answer: t('shipping_policy.faq_a_cost', 'Shipping to Baltic countries and Poland/Finland is €4 via Venipak. Free shipping in Lithuania for orders over €50. FedEx International shipping to the EU, USA, and Canada is €20.'),
        },
        {
            question: t('shipping_policy.faq_q_time', 'How long does delivery take?'),
            answer: t('shipping_policy.faq_a_time', 'Venipak delivery to Baltic countries takes 1-5 business days. FedEx delivery within the EU takes 2-10 business days. FedEx delivery to North America takes 5-14 business days.'),
        },
        {
            question: t('shipping_policy.faq_q_tracking', 'Can I track my order?'),
            answer: t('shipping_policy.faq_a_tracking', 'Yes! Once your order ships, you will receive a confirmation email with tracking information. You can monitor your delivery status in real-time through your account or the provided tracking link.'),
        },
    ];
    const faqSchema = createFAQSchema(shippingFAQs);

    return (
        <>
            <SEO
                title={t('shipping_policy.meta_title', 'Shipping Policy')}
                description={t('shipping_policy.meta_description', 'Shop Natural shipping information. Fast delivery to Lithuania (1-3 days) and EU (3-10 days). Affordable shipping rates.')}
                canonical={canonicalUrl}
                alternateUrls={alternateUrls}
                breadcrumbs={breadcrumbs}
                additionalSchemas={[faqSchema]}
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

                    {/* Shipping Regions */}
                    <div className="mb-8 md:mb-12">
                        <h2 className="mb-6 text-xl font-bold uppercase tracking-wide text-foreground md:text-2xl">
                            {t('shipping_policy.regions_title', 'Shipping Methods & Rates by Region')}
                        </h2>
                        <div className="space-y-6">
                            {shippingRegions.map((region, index) => (
                                <div
                                    key={index}
                                    className="rounded-2xl border-2 border-border bg-background p-6 md:p-8"
                                >
                                    {/* Region Header with Logo */}
                                    <div className="mb-6 flex items-center gap-4">
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white border-2 border-border">
                                            {region.logo === 'venipak' ? (
                                                <VenipakLogo className="h-5" />
                                            ) : (
                                                <FedExLogo className="h-4" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold uppercase tracking-wide text-foreground md:text-xl">
                                                {region.region}
                                            </h3>
                                            {region.countries && (
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {region.countries}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Shipping Methods */}
                                    <div className="space-y-4">
                                        {region.methods.map((method, methodIndex) => (
                                            <div
                                                key={methodIndex}
                                                className="rounded-xl border-2 border-border bg-muted/30 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Package className="size-5 text-gold" />
                                                            <h4 className="font-bold uppercase tracking-wide text-foreground">
                                                                {method.name}
                                                            </h4>
                                                        </div>
                                                        <p className="mt-2 text-sm text-muted-foreground">
                                                            {method.description}
                                                        </p>
                                                        {method.note && (
                                                            <p className="mt-2 text-sm font-medium text-gold">
                                                                {method.note}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-bold text-gold">
                                                            {method.price}
                                                        </p>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {method.time}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
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
