import { useState } from 'react';
import { Head } from '@inertiajs/react';
import MainHeader from '@/components/main-header';
import HeroSection from '@/components/hero-section';
import PromisesSection from '@/components/promises-section';
import FeaturesSection from '@/components/features-section';
import ProductsSection from '@/components/products-section';
import Footer from '@/components/footer';
import { AuthModal } from '@/components/auth/auth-modal';

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

export default function Home({ products }: HomeProps) {
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

    return (
        <>
            <Head title="Home" />

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
