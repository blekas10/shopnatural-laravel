import { Head } from '@inertiajs/react';
import MainHeader from '@/components/main-header';
import HeroSection from '@/components/hero-section';
import PromisesSection from '@/components/promises-section';
import FeaturesSection from '@/components/features-section';
import ProductsSection from '@/components/products-section';
import Footer from '@/components/footer';

interface HomeProps {
    canRegister?: boolean;
}

export default function Home({ canRegister }: HomeProps) {
    return (
        <>
            <Head title="Home" />

            <div className="min-h-screen bg-background">
                <MainHeader />
                <HeroSection />
                <FeaturesSection />
                <PromisesSection />
                <ProductsSection />
                <Footer />
            </div>
        </>
    );
}
