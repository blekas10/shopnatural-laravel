import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import type { BaseProduct } from '@/types/product';

interface ProductCardProps {
    product: BaseProduct;
    href: string;
    index?: number;
    className?: string;
}

export function ProductCard({ product, href, index = 0, className }: ProductCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
                duration: 0.5,
                ease: 'easeOut',
                delay: index * 0.1,
            }}
            className={cn('group cursor-pointer', className)}
        >
            <Link href={href}>
                <div className="overflow-hidden rounded-2xl border-2 border-border bg-background transition-all duration-300 group-hover:border-gold/40 group-hover:shadow-lg group-hover:shadow-gold/10">
                    {/* Product Image */}
                    <div className="relative overflow-hidden p-6">
                        <div className="aspect-square w-full">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-contain"
                                loading="lazy"
                            />
                        </div>

                        {/* Sale Badge */}
                        {product.isOnSale && product.salePercentage && (
                            <div className="absolute right-3 top-3">
                                <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                                    -{product.salePercentage}%
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-1 p-4">
                        <h3 className="text-base font-bold uppercase tracking-wide text-foreground">
                            {product.name}
                        </h3>
                        {product.title && (
                            <p className="text-sm text-muted-foreground">
                                {product.title}
                            </p>
                        )}
                        <div className="flex items-center gap-2">
                            <p className={cn(
                                "text-lg font-bold",
                                product.compareAtPrice ? "text-gold" : "text-foreground"
                            )}>
                                €{product.price.toFixed(2)}
                            </p>
                            {product.compareAtPrice && (
                                <p className="text-sm font-medium text-muted-foreground line-through">
                                    €{product.compareAtPrice.toFixed(2)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
