import { Link, usePage } from '@inertiajs/react';
import MainHeader from '@/components/main-header';
import Footer from '@/components/footer';
import { useTranslation } from '@/hooks/use-translation';
import { ChevronRight, Shield, Database, Cookie, Share2, Clock, UserCheck, Mail } from 'lucide-react';
import SEO from '@/components/seo';
import { generateCanonicalUrl, type BreadcrumbItem } from '@/lib/seo';

interface PageProps {
    seo: {
        siteName: string;
        siteUrl: string;
    };
    locale: string;
}

export default function PrivacyPolicy() {
    const { t, route } = useTranslation();
    const { seo } = usePage<PageProps>().props;

    // SEO data
    const siteUrl = seo?.siteUrl || '';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const canonicalUrl = generateCanonicalUrl(siteUrl, currentPath);

    // Breadcrumbs for structured data
    const breadcrumbs: BreadcrumbItem[] = [
        { name: t('nav.home', 'Home'), url: siteUrl },
        { name: t('privacy_policy.title', 'Privacy Policy'), url: canonicalUrl },
    ];

    // Alternate URLs for hreflang
    const alternateUrls = [
        { locale: 'en', url: `${siteUrl}/privacy-policy` },
        { locale: 'lt', url: `${siteUrl}/lt/privatumo-politika` },
    ];

    return (
        <>
            <SEO
                title={t('privacy_policy.meta_title', 'Privacy Policy')}
                description={t('privacy_policy.meta_description', 'Learn how Shop Natural collects, uses, and protects your personal information. GDPR compliant privacy practices.')}
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
                            <span className="text-foreground">{t('privacy_policy.title', 'Privacy Policy')}</span>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-8">
                    {/* Page Heading */}
                    <div className="mb-8 md:mb-12">
                        <h1 className="text-3xl font-bold uppercase tracking-wide text-foreground md:text-4xl lg:text-5xl">
                            {t('privacy_policy.heading', 'Privacy Policy')}
                        </h1>
                        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                            {t('privacy_policy.intro', 'Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.')}
                        </p>
                    </div>

                    {/* Data Controller Section */}
                    <div className="mb-6">
                        <div className="rounded-2xl border-2 border-border bg-background p-6 md:p-8">
                            <div className="flex items-start gap-4">
                                <div className="shrink-0">
                                    <div className="inline-flex rounded-full bg-gold/10 p-3">
                                        <Shield className="size-6 text-gold" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h2 className="mb-3 text-xl font-bold uppercase tracking-wide text-foreground md:text-2xl">
                                        {t('privacy_policy.controller_title', 'Data Controller')}
                                    </h2>
                                    <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                                        {t('privacy_policy.controller_content', 'UAB "Naturalbeauty DS" is the data controller responsible for processing your personal information in accordance with GDPR and Lithuanian data protection laws.')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* What We Collect Section */}
                    <div className="mb-6">
                        <div className="rounded-2xl border-2 border-border bg-background p-6 md:p-8">
                            <div className="flex items-start gap-4">
                                <div className="shrink-0">
                                    <div className="inline-flex rounded-full bg-gold/10 p-3">
                                        <Database className="size-6 text-gold" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h2 className="mb-3 text-xl font-bold uppercase tracking-wide text-foreground md:text-2xl">
                                        {t('privacy_policy.collect_title', 'What We Collect')}
                                    </h2>
                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="mb-2 text-base font-bold text-foreground md:text-lg">
                                                {t('privacy_policy.personal_info_title', 'Personal Information')}
                                            </h3>
                                            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                                                {t('privacy_policy.personal_info_content', 'Name, email address, phone number, shipping and billing addresses when you place an order or create an account.')}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="mb-2 text-base font-bold text-foreground md:text-lg">
                                                {t('privacy_policy.usage_data_title', 'Usage Data')}
                                            </h3>
                                            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                                                {t('privacy_policy.usage_data_content', 'IP address, browser type, device information, pages visited, and browsing behavior to improve our website experience.')}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="mb-2 text-base font-bold text-foreground md:text-lg">
                                                {t('privacy_policy.third_party_title', 'Third-Party Sources')}
                                            </h3>
                                            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                                                {t('privacy_policy.third_party_content', 'We may supplement data from public databases and commercial data providers to enhance our service.')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Why We Process Data Section */}
                    <div className="mb-6">
                        <div className="rounded-2xl border-2 border-border bg-background p-6 md:p-8">
                            <div className="flex items-start gap-4">
                                <div className="shrink-0">
                                    <div className="inline-flex rounded-full bg-gold/10 p-3">
                                        <UserCheck className="size-6 text-gold" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h2 className="mb-3 text-xl font-bold uppercase tracking-wide text-foreground md:text-2xl">
                                        {t('privacy_policy.process_title', 'Why We Process Data')}
                                    </h2>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-base leading-relaxed text-muted-foreground md:text-lg">
                                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"></span>
                                            <span>{t('privacy_policy.process_1', 'To fulfill and deliver your orders')}</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-base leading-relaxed text-muted-foreground md:text-lg">
                                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"></span>
                                            <span>{t('privacy_policy.process_2', 'To improve our website and customer experience')}</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-base leading-relaxed text-muted-foreground md:text-lg">
                                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"></span>
                                            <span>{t('privacy_policy.process_3', 'To communicate about orders, promotions, and updates')}</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-base leading-relaxed text-muted-foreground md:text-lg">
                                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"></span>
                                            <span>{t('privacy_policy.process_4', 'For direct marketing purposes (only with your consent)')}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cookies Section */}
                    <div className="mb-6">
                        <div className="rounded-2xl border-2 border-border bg-background p-6 md:p-8">
                            <div className="flex items-start gap-4">
                                <div className="shrink-0">
                                    <div className="inline-flex rounded-full bg-gold/10 p-3">
                                        <Cookie className="size-6 text-gold" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h2 className="mb-3 text-xl font-bold uppercase tracking-wide text-foreground md:text-2xl">
                                        {t('privacy_policy.cookies_title', 'Cookies')}
                                    </h2>
                                    <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                                        {t('privacy_policy.cookies_content', 'We use cookies and similar technologies to improve your browsing experience. Cookies are stored on your device only with your consent and can be disabled in your browser settings at any time.')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Sharing Section */}
                    <div className="mb-6">
                        <div className="rounded-2xl border-2 border-border bg-background p-6 md:p-8">
                            <div className="flex items-start gap-4">
                                <div className="shrink-0">
                                    <div className="inline-flex rounded-full bg-gold/10 p-3">
                                        <Share2 className="size-6 text-gold" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h2 className="mb-3 text-xl font-bold uppercase tracking-wide text-foreground md:text-2xl">
                                        {t('privacy_policy.sharing_title', 'Data Sharing')}
                                    </h2>
                                    <p className="mb-3 text-base leading-relaxed text-muted-foreground md:text-lg">
                                        {t('privacy_policy.sharing_intro', 'We may share your data with trusted third parties:')}
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-base leading-relaxed text-muted-foreground md:text-lg">
                                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"></span>
                                            <span>{t('privacy_policy.sharing_1', 'Courier and delivery services to fulfill orders')}</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-base leading-relaxed text-muted-foreground md:text-lg">
                                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"></span>
                                            <span>{t('privacy_policy.sharing_2', 'Payment processors for secure transactions')}</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-base leading-relaxed text-muted-foreground md:text-lg">
                                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"></span>
                                            <span>{t('privacy_policy.sharing_3', 'Marketing agencies for promotional campaigns')}</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-base leading-relaxed text-muted-foreground md:text-lg">
                                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"></span>
                                            <span>{t('privacy_policy.sharing_4', 'Legal authorities when required by law')}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Retention Section */}
                    <div className="mb-6">
                        <div className="rounded-2xl border-2 border-border bg-background p-6 md:p-8">
                            <div className="flex items-start gap-4">
                                <div className="shrink-0">
                                    <div className="inline-flex rounded-full bg-gold/10 p-3">
                                        <Clock className="size-6 text-gold" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h2 className="mb-3 text-xl font-bold uppercase tracking-wide text-foreground md:text-2xl">
                                        {t('privacy_policy.retention_title', 'Data Retention')}
                                    </h2>
                                    <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                                        {t('privacy_policy.retention_content', 'We retain your personal data for a maximum of 5 years from your last interaction with us, unless a longer retention period is required by law (e.g., for accounting or tax purposes).')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Your Rights Section */}
                    <div className="mb-6">
                        <div className="rounded-2xl border-2 border-border bg-background p-6 md:p-8">
                            <h2 className="mb-4 text-xl font-bold uppercase tracking-wide text-foreground md:text-2xl">
                                {t('privacy_policy.rights_title', 'Your Rights')}
                            </h2>
                            <p className="mb-3 text-base leading-relaxed text-muted-foreground md:text-lg">
                                {t('privacy_policy.rights_intro', 'Under GDPR, you have the following rights:')}
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-base leading-relaxed text-muted-foreground md:text-lg">
                                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"></span>
                                    <span>{t('privacy_policy.right_1', 'Access your personal data (free of charge)')}</span>
                                </li>
                                <li className="flex items-start gap-2 text-base leading-relaxed text-muted-foreground md:text-lg">
                                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"></span>
                                    <span>{t('privacy_policy.right_2', 'Request corrections to inaccurate data')}</span>
                                </li>
                                <li className="flex items-start gap-2 text-base leading-relaxed text-muted-foreground md:text-lg">
                                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"></span>
                                    <span>{t('privacy_policy.right_3', 'Request deletion of your data (subject to legal obligations)')}</span>
                                </li>
                                <li className="flex items-start gap-2 text-base leading-relaxed text-muted-foreground md:text-lg">
                                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"></span>
                                    <span>{t('privacy_policy.right_4', 'Object to direct marketing at any time')}</span>
                                </li>
                                <li className="flex items-start gap-2 text-base leading-relaxed text-muted-foreground md:text-lg">
                                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"></span>
                                    <span>{t('privacy_policy.right_5', 'Withdraw consent for data processing')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* GDPR Compliance Section */}
                    <div className="mb-8 md:mb-12">
                        <div className="rounded-2xl border-2 border-gold/30 bg-gold/5 p-6 md:p-8">
                            <h2 className="mb-4 text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl">
                                {t('privacy_policy.gdpr_title', 'GDPR Compliance')}
                            </h2>
                            <p className="text-base leading-relaxed text-foreground md:text-lg">
                                {t('privacy_policy.gdpr_content', 'We are committed to protecting your personal data in full compliance with the General Data Protection Regulation (GDPR) and Lithuanian data protection laws. Your privacy and security are our top priorities.')}
                            </p>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="mb-8 md:mb-12">
                        <div className="rounded-2xl border-2 border-border bg-background p-6 md:p-8">
                            <div className="flex items-start gap-4">
                                <div className="shrink-0">
                                    <div className="inline-flex rounded-full bg-gold/10 p-3">
                                        <Mail className="size-6 text-gold" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h2 className="mb-3 text-xl font-bold uppercase tracking-wide text-foreground md:text-2xl">
                                        {t('privacy_policy.contact_title', 'Contact Us')}
                                    </h2>
                                    <p className="mb-3 text-base leading-relaxed text-muted-foreground md:text-lg">
                                        {t('privacy_policy.contact_content', 'If you have any questions about this privacy policy or wish to exercise your rights, please contact us:')}
                                    </p>
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
                </div>

                <Footer />
            </div>
        </>
    );
}
