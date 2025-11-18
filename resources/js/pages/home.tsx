import { useState, useEffect } from 'react';
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
    canRegister?: boolean;
    products: Product[];
}

export default function Home({ canRegister, products }: HomeProps) {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authView, setAuthView] = useState<'login' | 'register'>('login');

    useEffect(() => {
        // Check for auth query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const authParam = urlParams.get('auth');

        if (authParam === 'login' || authParam === 'register') {
            setAuthView(authParam);
            setAuthModalOpen(true);

            // Clean up URL by removing the query parameter
            urlParams.delete('auth');
            const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
            window.history.replaceState({}, '', newUrl);
        }
    }, []);

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
