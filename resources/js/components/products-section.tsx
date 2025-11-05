import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { useTranslation } from '@/hooks/use-translation';
import { ProductCard } from '@/components/product-card';
import type { BaseProduct } from '@/types/product';

interface ProductsSectionProps {
    className?: string;
    products?: BaseProduct[];
}

export default function ProductsSection({ className, products = [] }: ProductsSectionProps) {
    const { t, route } = useTranslation();

    return (
        <section className={cn('w-full bg-background py-16 md:py-24', className)}>
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                {/* Section Badge */}
                <div className="mb-12 flex justify-center lg:justify-start">
                    <div className="relative inline-block px-8 py-4">
                        <h2 className="relative z-10 text-2xl font-medium uppercase tracking-wide text-foreground md:text-3xl">
                            {t('products.title')}
                        </h2>

                        {/* Left bottom corner border */}
                        <div className="absolute bottom-0 left-0 h-12 w-12 border-b-2 border-l-2 border-gold/50 rounded-bl-md"/>

                        {/* Right top corner border */}
                        <div className="absolute right-0 top-0 h-12 w-12 border-r-2 border-t-2 border-teal/50 rounded-tr-md" />
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((product, index) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            href={route('products.show', { slug: product.slug })}
                            index={index}
                        />
                    ))}
                </div>

                {/* See All Button */}
                <div className="mt-12 flex justify-center">
                    <Link
                        href={route('products.index')}
                        className="relative inline-flex items-center justify-center rounded-md border-2 border-gold px-8 py-3 text-base font-bold uppercase tracking-wide text-gold transition-all duration-300 ease-in-out hover:bg-gold hover:text-foreground hover:shadow-lg hover:shadow-gold/50"
                    >
                        {t('products.see_all')}
                    </Link>
                </div>
            </div>
        </section>
    );
}
