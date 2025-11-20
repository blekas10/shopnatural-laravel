import { Head, Link } from '@inertiajs/react';
import MainHeader from '@/components/main-header';
import Footer from '@/components/footer';
import { useTranslation } from '@/hooks/use-translation';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/contexts/wishlist-context';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ShoppingCart, Trash2, Heart, Package, Check, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ProductListItem } from '@/types/product';

interface WishlistItemData {
    id: number;
    productId: number;
    productSlug: string;
    productName: string;
    productTitle: string | null;
    variantId: number | null;
    variantSize: string | null;
    variantSku: string;
    image: string;
    price: number;
    compareAtPrice: number | null;
    isOnSale: boolean;
    salePercentage: number | null;
    inStock: boolean;
    stock: number;
    addedAt: string;
}

interface WishlistPageProps {
    wishlistItems: WishlistItemData[];
}

export default function WishlistIndex({ wishlistItems: initialWishlistItems }: WishlistPageProps) {
    const { t, route } = useTranslation();
    const { addItem } = useCart();
    const { removeItem } = useWishlist();
    const [displayedItems, setDisplayedItems] = useState<WishlistItemData[]>(initialWishlistItems);
    const [removingItems, setRemovingItems] = useState<Set<number>>(new Set());
    const [addingToCart, setAddingToCart] = useState<Set<number>>(new Set());

    const handleRemoveItem = async (productId: number, variantId: number | null) => {
        const itemKey = variantId || productId;
        setRemovingItems(prev => new Set(prev).add(itemKey));

        // Wait for animation to complete before removing from list
        setTimeout(() => {
            setDisplayedItems(prev =>
                prev.filter(item => {
                    const currentItemKey = item.variantId || item.productId;
                    return currentItemKey !== itemKey;
                })
            );
            setRemovingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemKey);
                return newSet;
            });
        }, 300);

        // Remove from backend/context
        await removeItem(productId, variantId);
    };

    const handleAddToCart = (item: WishlistItemData) => {
        const itemKey = item.variantId || item.productId;
        setAddingToCart(prev => new Set(prev).add(itemKey));

        // Convert to ProductListItem format
        const productListItem: ProductListItem = {
            id: item.productId,
            name: item.productName,
            title: item.productTitle,
            slug: item.productSlug,
            price: item.price,
            compareAtPrice: item.compareAtPrice,
            minPrice: null,
            maxPrice: null,
            image: item.image,
            isOnSale: item.isOnSale,
            salePercentage: item.salePercentage,
            brandId: null,
            brandName: null,
            categoryIds: [],
        };

        const variant = item.variantId ? {
            id: item.variantId,
            sku: item.variantSku,
            size: item.variantSize || '',
            price: item.price,
            compareAtPrice: item.compareAtPrice,
            stock: item.stock,
            inStock: item.inStock,
            isDefault: false,
            image: null,
        } : null;

        addItem(productListItem, variant, 1);

        // Dispatch custom event to open cart drawer
        window.dispatchEvent(new CustomEvent('openCart'));

        setTimeout(() => {
            setAddingToCart(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemKey);
                return newSet;
            });
        }, 500);
    };

    const isRemoving = (productId: number, variantId: number | null) => {
        const itemKey = variantId || productId;
        return removingItems.has(itemKey);
    };

    const isAddingToCart = (productId: number, variantId: number | null) => {
        const itemKey = variantId || productId;
        return addingToCart.has(itemKey);
    };

    return (
        <>
            <Head title={t('wishlist.title', 'Wishlist')} />

            <div className="min-h-screen bg-background pb-[calc(73px+env(safe-area-inset-bottom))] lg:pb-0">
                <MainHeader />

                {/* Breadcrumb */}
                <div className="border-b border-border">
                    <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link href={route('home')} className="hover:text-foreground transition-colors">
                                {t('nav.home', 'Home')}
                            </Link>
                            <ChevronRight className="size-4" />
                            <span className="text-foreground">{t('wishlist.title', 'Wishlist')}</span>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold uppercase tracking-wide text-foreground md:text-4xl flex items-center gap-3">
                            <Heart className="size-8 md:size-10 text-gold fill-gold" />
                            {t('wishlist.title', 'My Wishlist')}
                        </h1>
                        {displayedItems.length > 0 && (
                            <p className="mt-2 text-base text-muted-foreground">
                                {displayedItems.length} {displayedItems.length === 1 ? t('wishlist.item', 'item') : t('wishlist.items', 'items')}
                            </p>
                        )}
                    </div>

                    {/* Empty State */}
                    {displayedItems.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-16 md:py-24"
                        >
                            <div className="rounded-full bg-muted p-6 mb-6">
                                <Heart className="size-16 text-muted-foreground" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                {t('wishlist.empty_title', 'Your wishlist is empty')}
                            </h2>
                            <p className="text-base text-muted-foreground mb-8 text-center max-w-md">
                                {t('wishlist.empty_description', 'Start adding products you love to your wishlist')}
                            </p>
                            <Link href={route('products.index')}>
                                <Button
                                    size="lg"
                                    className="h-12 rounded-lg border-2 border-gold bg-gold px-8 text-base font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-transparent hover:text-gold"
                                >
                                    <Package className="mr-2 size-5" />
                                    {t('wishlist.browse_products', 'Browse Products')}
                                </Button>
                            </Link>
                        </motion.div>
                    )}

                    {/* Wishlist Grid */}
                    {displayedItems.length > 0 && (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            <AnimatePresence mode="popLayout">
                                {displayedItems.map((item) => {
                                    const itemKey = item.variantId || item.productId;
                                    const removing = isRemoving(item.productId, item.variantId);
                                    const addingCart = isAddingToCart(item.productId, item.variantId);

                                    return (
                                        <motion.div
                                            key={itemKey}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                            className={cn(
                                                "group relative overflow-hidden rounded-2xl border-2 border-border bg-background transition-all duration-300",
                                                !removing && "hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10"
                                            )}
                                        >
                                            {/* Product Image */}
                                            <Link
                                                href={route('products.show', { slug: item.productSlug })}
                                                className="block relative overflow-hidden p-6"
                                            >
                                                <div className="aspect-square w-full">
                                                    <img
                                                        src={item.image}
                                                        alt={item.productName}
                                                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                </div>

                                                {/* Sale Badge */}
                                                {item.isOnSale && item.salePercentage && (
                                                    <div className="absolute right-3 top-3">
                                                        <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md shadow-gold/20">
                                                            -{item.salePercentage}%
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Remove Button - Top Left */}
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleRemoveItem(item.productId, item.variantId);
                                                    }}
                                                    disabled={removing}
                                                    className="absolute left-3 top-3 z-10 flex size-9 items-center justify-center rounded-full border-2 border-border bg-background/95 backdrop-blur-sm transition-all duration-300 hover:border-red-500 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                                                    aria-label="Remove from wishlist"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </Link>

                                            {/* Product Info */}
                                            <div className="space-y-3 p-4 border-t border-border">
                                                <Link
                                                    href={route('products.show', { slug: item.productSlug })}
                                                    className="block"
                                                >
                                                    <h3 className="text-base font-bold uppercase tracking-wide text-foreground line-clamp-2 hover:text-gold transition-colors">
                                                        {item.productName}
                                                    </h3>
                                                    {item.productTitle && (
                                                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                                            {item.productTitle}
                                                        </p>
                                                    )}
                                                </Link>

                                                {/* Variant Size */}
                                                {item.variantSize && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground uppercase">
                                                            {t('product.size', 'Size')}:
                                                        </span>
                                                        <span className="text-xs font-bold text-foreground bg-muted px-2 py-1 rounded">
                                                            {item.variantSize}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Price */}
                                                <div className="flex items-center gap-2">
                                                    <p className={cn(
                                                        "text-lg font-bold",
                                                        item.isOnSale ? "text-gold" : "text-foreground"
                                                    )}>
                                                        €{Number(item.price).toFixed(2)}
                                                    </p>
                                                    {item.compareAtPrice && (
                                                        <p className="text-sm font-medium text-muted-foreground line-through">
                                                            €{Number(item.compareAtPrice).toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Stock Status */}
                                                <div className="flex items-center gap-2 text-xs">
                                                    {item.inStock ? (
                                                        <>
                                                            <div className="rounded-full bg-teal-500/10 p-1">
                                                                <Check className="size-3.5 text-teal-500" />
                                                            </div>
                                                            <span className="font-medium text-teal-500">
                                                                {t('product.in_stock', 'In Stock')}
                                                                {item.stock > 0 && ` (${item.stock})`}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="rounded-full bg-red-500/10 p-1">
                                                                <X className="size-3.5 text-red-500" />
                                                            </div>
                                                            <span className="font-medium text-red-500">
                                                                {t('product.out_of_stock', 'Out of Stock')}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Add to Cart Button */}
                                                <Button
                                                    onClick={() => handleAddToCart(item)}
                                                    disabled={!item.inStock || addingCart}
                                                    className="w-full h-11 rounded-lg border-2 border-gold bg-gold text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-transparent hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <ShoppingCart className="mr-2 size-4" />
                                                    {addingCart
                                                        ? t('shop.adding', 'Adding...')
                                                        : t('shop.add_to_cart', 'Add to Cart')
                                                    }
                                                </Button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Continue Shopping Link */}
                    {displayedItems.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mt-12 flex justify-center"
                        >
                            <Link href={route('products.index')}>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-12 rounded-lg border-2 px-8 text-base font-bold uppercase tracking-wide transition-all duration-300 hover:border-gold hover:text-gold"
                                >
                                    <Package className="mr-2 size-5" />
                                    {t('wishlist.continue_shopping', 'Continue Shopping')}
                                </Button>
                            </Link>
                        </motion.div>
                    )}
                </div>

                <Footer />
            </div>
        </>
    );
}
