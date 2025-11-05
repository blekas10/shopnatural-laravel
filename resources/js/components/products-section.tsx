import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';

interface ProductsSectionProps {
    className?: string;
}

const products = [
    {
        id: 1,
        name: 'Natural Face Serum',
        price: '€34.99',
        image: '/images/Aloe-and-Sandalwood-Shampoo-1000-ml-768x768.jpg',
        category: 'Face Care',
    },
    {
        id: 2,
        name: 'Organic Body Lotion',
        price: '€24.99',
        image: '/images/Aloe-and-Sandalwood-Shampoo-1000-ml-768x768.jpg',
        category: 'Body Care',
    },
    {
        id: 3,
        name: 'Herbal Shampoo',
        price: '€18.99',
        image: '/images/Aloe-and-Sandalwood-Shampoo-1000-ml-768x768.jpg',
        category: 'Hair Care',
    },
    {
        id: 4,
        name: 'Natural Moisturizer',
        price: '€29.99',
        image: '/images/Aloe-and-Sandalwood-Shampoo-1000-ml-768x768.jpg',
        category: 'Face Care',
    },
    {
        id: 5,
        name: 'Natural Face Serum',
        price: '€34.99',
        image: '/images/Aloe-and-Sandalwood-Shampoo-1000-ml-768x768.jpg',
        category: 'Face Care',
    },
    {
        id: 6,
        name: 'Organic Body Lotion',
        price: '€24.99',
        image: '/images/Aloe-and-Sandalwood-Shampoo-1000-ml-768x768.jpg',
        category: 'Body Care',
    },
    {
        id: 7,
        name: 'Herbal Shampoo',
        price: '€18.99',
        image: '/images/Aloe-and-Sandalwood-Shampoo-1000-ml-768x768.jpg',
        category: 'Hair Care',
    },
    {
        id: 8,
        name: 'Natural Moisturizer',
        price: '€29.99',
        image: '/images/Aloe-and-Sandalwood-Shampoo-1000-ml-768x768.jpg',
        category: 'Face Care',
    },
    
];

export default function ProductsSection({ className }: ProductsSectionProps) {
    return (
        <section className={cn('w-full bg-background py-16 md:py-24', className)}>
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                {/* Section Badge */}
                <div className="mb-12 flex justify-center lg:justify-start">
                    <div className="relative inline-block px-8 py-4">
                        <h2 className="relative z-10 text-2xl font-medium uppercase tracking-wide text-foreground md:text-3xl">
                            Shop
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
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{
                                duration: 0.5,
                                ease: 'easeOut',
                                delay: index * 0.1,
                            }}
                            className="group cursor-pointer"
                        >
                            <div className="overflow-hidden rounded-2xl border-2 border-border bg-background transition-all duration-300 group-hover:border-gold/40 group-hover:shadow-lg group-hover:shadow-gold/10">
                                {/* Product Image */}
                                <div className="relative overflow-hidden p-6">
                                    <div className="aspect-square w-full">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>

                                    {/* Category Badge */}
                                    <div className="absolute left-3 top-3">
                                        <span className="rounded-full border border-muted-foreground/30 bg-background/95 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gold/70 text-foreground/70 backdrop-blur-sm">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="space-y-1 p-4">
                                    <h3 className="text-base font-bold uppercase tracking-wide text-foreground">
                                        {product.name}
                                    </h3>
                                    <p className="text-lg font-bold text-foreground">
                                        {product.price}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* See All Button */}
                <div className="mt-12 flex justify-center">
                    <Link
                        href="/products"
                        className="relative inline-flex items-center justify-center rounded-md border-2 border-gold px-8 py-3 text-base font-bold uppercase tracking-wide text-gold transition-all duration-300 ease-in-out hover:bg-gold hover:text-foreground hover:shadow-lg hover:shadow-gold/50"
                    >
                        See All
                    </Link>
                </div>
            </div>
        </section>
    );
}
