import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import MainHeader from '@/components/main-header';
import HeroSection from '@/components/hero-section';
import PromisesSection from '@/components/promises-section';
import FeaturesSection from '@/components/features-section';
import ProductsSection from '@/components/products-section';
import Footer from '@/components/footer';
import { AuthModal } from '@/components/auth/auth-modal';
import SEO from '@/components/seo';
import { useTranslation } from '@/hooks/use-translation';
import { createOrganizationSchema, createWebsiteSchema } from '@/lib/seo';

interface Product {
    id: number;
    name: string;
    title: string | null;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    image: string;
    isOnSale: boolean;
    salePercentage: number | null;
}

interface HomeProps {
    products: Product[];
}

interface PageProps {
    seo: {
        siteName: string;
        siteUrl: string;
    };
    locale: string;
}

export default function Home({ products }: HomeProps) {
    const { t } = useTranslation();
    const { seo, locale } = usePage<PageProps>().props;

    // Check URL params on initial render only
    const initialAuthState = (() => {
        if (typeof window === 'undefined') return { open: false, view: 'login' as const };
        const urlParams = new URLSearchParams(window.location.search);
        const authParam = urlParams.get('auth');
        if (authParam === 'login' || authParam === 'register') {
            // Clean up URL
            urlParams.delete('auth');
            const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
            window.history.replaceState({}, '', newUrl);
            return { open: true, view: authParam };
        }
        return { open: false, view: 'login' as const };
    })();

    const [authModalOpen, setAuthModalOpen] = useState(initialAuthState.open);
    const [authView] = useState<'login' | 'register'>(initialAuthState.view);

    // SEO data
    const siteUrl = seo?.siteUrl || '';
    const siteName = seo?.siteName || 'Shop Natural';

    // Organization schema for homepage
    const organizationSchema = createOrganizationSchema({
        name: siteName,
        url: siteUrl,
        logo: `${siteUrl}/images/logo.svg`,
        description: t('home.meta_description', 'Shop Natural offers eco-friendly, natural cosmetics and beauty products. Family-run business committed to sustainability.'),
        email: 'info@naturalmente.lt',
        phone: '+37060117017',
        address: {
            streetAddress: 'Vaidoto g. 1',
            addressLocality: 'Kaunas',
            postalCode: '45387',
            addressCountry: 'LT',
        },
    });

    // Website schema with search
    const websiteSchema = createWebsiteSchema(
        siteName,
        siteUrl,
        `${siteUrl}/${locale === 'lt' ? 'lt/produktai' : 'products'}?search={search_term_string}`
    );

    // Alternate URLs for hreflang
    const alternateUrls = [
        { locale: 'en', url: siteUrl },
        { locale: 'lt', url: `${siteUrl}/lt` },
    ];

    return (
        <>
            <SEO
                title={t('home.meta_title', 'Natural & Eco-Friendly Cosmetics')}
                description={t('home.meta_description', 'Shop Natural offers eco-friendly, natural cosmetics and beauty products. Family-run business committed to sustainability.')}
                canonical={locale === 'lt' ? `${siteUrl}/lt` : siteUrl}
                alternateUrls={alternateUrls}
                additionalSchemas={[organizationSchema, websiteSchema]}
            />

            <div className="min-h-screen bg-background">
            <MainHeader />
                <HeroSection />
                <FeaturesSection />
                <PromisesSection />
                <ProductsSection products={products} />
                <Footer />
            </div>

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialView={authView}
            />
        </>
    );
}
