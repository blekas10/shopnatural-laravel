import { Head } from '@inertiajs/react';
import MainHeader from '@/components/main-header';
import HeroSection from '@/components/hero-section';
import PromisesSection from '@/components/promises-section';
import FeaturesSection from '@/components/features-section';
import ProductsSection from '@/components/products-section';
import Footer from '@/components/footer';

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
        </>
    );
}
