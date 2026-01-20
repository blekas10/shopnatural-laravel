import { Link, usePage } from '@inertiajs/react';
import MainHeader from '@/components/main-header';
import Footer from '@/components/footer';
import { useTranslation } from '@/hooks/use-translation';
import { ChevronRight, RotateCcw, ShieldCheck, Mail, Package, Truck } from 'lucide-react';
import SEO from '@/components/seo';
import { generateCanonicalUrl, type BreadcrumbItem } from '@/lib/seo';

interface PageProps {
    seo: {
        siteName: string;
        siteUrl: string;
    };
    locale: string;
}

export default function ReturnPolicy() {
    const { t, route } = useTranslation();
    const { seo } = usePage<PageProps>().props;

    const sections = [
        {
            icon: RotateCcw,
            title: t('return_policy.right_to_return_title', 'Right to Return'),
            content: t('return_policy.right_to_return_content', 'Under European Union law, you have the right to return your purchase within 14 days of receiving your order, without needing to provide a reason.')
        },
        {
            icon: ShieldCheck,
            title: t('return_policy.conditions_title', 'Return Conditions'),
            content: t('return_policy.conditions_content', 'To be eligible for a return, the product must be unused, undamaged, and in its original packaging. Please ensure all labels and seals remain intact.')
        },
        {
            icon: Mail,
            title: t('return_policy.process_title', 'Return Process'),
            content: t('return_policy.process_content', 'To initiate a return, please contact us via email at info@naturalmente.lt with your order number and reason for return. We will provide you with return instructions.')
        },
        {
            icon: Package,
            title: t('return_policy.shipping_title', 'Return Shipping'),
            content: t('return_policy.shipping_content', 'Return shipping costs are the responsibility of the customer unless the product is defective or we made an error in your order. Please pack items securely to prevent damage during transit.')
        },
        {
            icon: Truck,
            title: t('return_policy.refund_title', 'Refund Process'),
            content: t('return_policy.refund_content', 'Once we receive and inspect your return, we will process your refund within 5-7 business days. The refund will be issued to your original payment method.')
        }
    ];

    // SEO data
    const siteUrl = seo?.siteUrl || '';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const canonicalUrl = generateCanonicalUrl(siteUrl, currentPath);

    // Breadcrumbs for structured data
    const breadcrumbs: BreadcrumbItem[] = [
        { name: t('nav.home', 'Home'), url: siteUrl },
        { name: t('return_policy.title', 'Return Policy'), url: canonicalUrl },
    ];

    // Alternate URLs for hreflang
    const alternateUrls = [
        { locale: 'en', url: `${siteUrl}/return-policy` },
        { locale: 'lt', url: `${siteUrl}/lt/grazinimo-politika` },
    ];

    return (
        <>
            <SEO
                title={t('return_policy.meta_title', 'Return Policy')}
                description={t('return_policy.meta_description', 'Shop Natural return policy. 14-day return period under EU law. Easy returns and refunds within 5-7 business days.')}
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
                            <span className="text-foreground">{t('return_policy.title', 'Return Policy')}</span>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-8">
                    {/* Page Heading */}
                    <div className="mb-8 md:mb-12">
                        <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl lg:text-4xl">
                            {t('return_policy.heading', 'Return Policy')}
                        </h1>
                        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                            {t('return_policy.intro', 'We want you to be completely satisfied with your purchase. Please review our return policy below.')}
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
                                            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                                                {section.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Contact Information */}
                    <div className="mt-8 md:mt-12">
                        <div className="rounded-2xl border-2 border-gold/30 bg-gold/5 p-6 md:p-8">
                            <h2 className="mb-4 text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl">
                                {t('return_policy.contact_title', 'Questions About Returns?')}
                            </h2>
                            <p className="mb-4 text-base leading-relaxed text-foreground md:text-lg">
                                {t('return_policy.contact_content', 'If you have any questions about our return policy or need assistance with a return, please do not hesitate to contact us.')}
                            </p>
                            <div className="flex items-center gap-2">
                                <Mail className="size-5 text-gold" />
                                <a
                                    href="mailto:info@naturalmente.lt"
                                    className="text-base font-medium text-foreground transition-colors duration-300 hover:text-gold md:text-lg"
                                >
                                    info@naturalmente.lt
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}
