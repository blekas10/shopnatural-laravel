import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from 'sonner';
import type { BaseProduct, ProductListItem } from '@/types/product';

interface ProductCardProps {
    product: BaseProduct;
    href: string;
    index?: number;
    className?: string;
}

export function ProductCard({ product, href, index = 0, className }: ProductCardProps) {
    const { addItem } = useCart();
    const { t } = useTranslation();
    const [isAdding, setIsAdding] = useState(false);

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsAdding(true);

        // Convert BaseProduct to ProductListItem for cart
        const productListItem: ProductListItem = {
            ...product,
            brandId: null,
            brandName: null,
            categoryIds: [],
        };

        // Add item with default variant (null means no variant selected)
        addItem(productListItem, null, 1);

        toast.success(t('cart.item_added', 'Item added to cart'), {
            description: product.name,
            duration: 2000,
        });

        setTimeout(() => setIsAdding(false), 500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                ease: 'easeOut',
                delay: Math.min(index * 0.08, 0.8), // Cap delay at 0.8s for large lists
            }}
            className={cn('group cursor-pointer h-full', className)}
        >
            <Link href={href} className="h-full block">
                <div className="h-full flex flex-col overflow-hidden rounded-2xl border-2 border-border bg-background transition-all duration-300 group-hover:border-gold/40 group-hover:shadow-lg group-hover:shadow-gold/10">
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
                    <div className="mt-auto space-y-1 p-4">
                        <h3 className="text-base font-bold uppercase tracking-wide text-foreground line-clamp-2">
                            {product.name}
                        </h3>

                        <div className="flex items-center gap-2">
                            {product.minPrice && product.maxPrice ? (
                                // Show price range for variable products
                                <p className="text-lg font-bold text-foreground">
                                    €{product.minPrice.toFixed(2)} - €{product.maxPrice.toFixed(2)}
                                </p>
                            ) : (
                                // Show single price
                                <>
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
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
