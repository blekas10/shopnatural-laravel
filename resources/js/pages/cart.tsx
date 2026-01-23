import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useOptimistic, useState } from 'react';
import MainHeader from '@/components/main-header';
import Footer from '@/components/footer';
import { useCart } from '@/hooks/use-cart';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { OrderSummary } from '@/components/order-summary';
import type { CartItem as CartItemType } from '@/types';
import { toast } from 'sonner';
import SEO from '@/components/seo';

export default function Cart() {
    const { items, totalPrice, removeItem, updateQuantity } = useCart();
    const { t, route } = useTranslation();
    const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

    // Optimistic updates for quantity changes
    const [optimisticItems, addOptimisticUpdate] = useOptimistic(
        items,
        (state: CartItemType[], { itemId, quantity }: { itemId: string; quantity: number }) => {
            return state
                .map(item => item.id === itemId ? { ...item, quantity } : item)
                .filter(item => item.quantity > 0);
        }
    );

    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        // Optimistic update
        addOptimisticUpdate({ itemId, quantity: newQuantity });
        // Actual update
        updateQuantity(itemId, newQuantity);
    };

    const handleRemove = (itemId: string, productName: string) => {
        setRemovingItems(prev => new Set(prev).add(itemId));

        setTimeout(() => {
            // Optimistic update
            addOptimisticUpdate({ itemId, quantity: 0 });
            // Actual update
            removeItem(itemId);
            setRemovingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });

            toast.success(t('cart.item_removed', 'Item removed'), {
                description: productName,
            });
        }, 300);
    };

    // VAT rate (21%)
    const VAT_RATE = 0.21;

    // Calculate original subtotal (sum of original prices before product discount)
    // All prices include VAT
    const originalSubtotal = optimisticItems.reduce((sum, item) => {
        const price = item.variant?.price || item.product.price;
        const compareAtPrice = item.variant?.compareAtPrice || item.product.compareAtPrice;
        const originalPrice = compareAtPrice || price;
        return sum + (originalPrice * item.quantity);
    }, 0);

    // Subtotal = sum of current prices (after product discount, with VAT)
    const subtotal = totalPrice;

    // Product discount = difference between original and current prices
    const productDiscount = originalSubtotal - subtotal;

    // Calculate VAT breakdown from subtotal (prices include VAT)
    const subtotalExclVat = subtotal / (1 + VAT_RATE);
    const vatAmount = subtotal - subtotalExclVat;

    // Cart page: no shipping, no promo code
    const shipping = 0;
    const promoCodeDiscount = 0;

    // Total = subtotal (no shipping or promo code on cart page)
    const total = subtotal;

    const orderSummaryData = {
        items: optimisticItems,
        originalSubtotal: originalSubtotal,
        productDiscount: productDiscount,
        subtotal: subtotal,
        subtotalExclVat: subtotalExclVat,
        vatAmount: vatAmount,
        shipping: shipping,
        promoCodeDiscount: promoCodeDiscount,
        total: total,
    };

    return (
        <>
            <SEO
                title={t('cart.title', 'Shopping Cart')}
                noindex={true}
                nofollow={true}
            />

            <div className="min-h-screen bg-background">
                <MainHeader />

                {/* Breadcrumb */}
                <div className="border-b border-border">
                    <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link href={route('home')} className="hover:text-foreground transition-colors">
                                {t('nav.home', 'Home')}
                            </Link>
                            <ChevronRight className="size-4" />
                            <span className="text-foreground">{t('cart.title', 'Shopping Cart')}</span>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-8">
                    {optimisticItems.length === 0 ? (
                        /* Empty Cart State */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-16 text-center"
                        >
                            <ShoppingBag className="mb-6 size-24 text-muted-foreground/30" />
                            <h1 className="mb-3 text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl">
                                {t('cart.empty', 'Your cart is empty')}
                            </h1>
                            <p className="mb-8 text-lg text-muted-foreground">
                                {t('cart.empty_message', 'Add some products to get started')}
                            </p>
                            <Link href={route('products.index')}>
                                <Button className="bg-gold px-8 text-white hover:bg-gold/90">
                                    <ArrowLeft className="mr-2 size-4" />
                                    {t('cart.continue_shopping', 'Continue Shopping')}
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        /* Cart with Items */
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Cart Items - 2/3 width */}
                            <div className="lg:col-span-2">
                                <h1 className="mb-6 text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl">
                                    {t('cart.title', 'Shopping Cart')}
                                </h1>

                                <div className="space-y-4">
                                    <AnimatePresence mode="popLayout">
                                        {optimisticItems.map((item) => {
                                            const price = item.variant?.price || item.product.price;
                                            const compareAtPrice = item.variant?.compareAtPrice || item.product.compareAtPrice;
                                            const lineTotal = price * item.quantity;
                                            const compareLineTotal = compareAtPrice ? compareAtPrice * item.quantity : null;

                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{
                                                        opacity: removingItems.has(item.id) ? 0.5 : 1,
                                                        y: 0,
                                                        scale: removingItems.has(item.id) ? 0.95 : 1,
                                                    }}
                                                    exit={{ opacity: 0, x: -100, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden rounded-xl border border-border bg-background"
                                                >
                                                    <div className="flex gap-4 p-4">
                                                        {/* Product Image */}
                                                        <Link
                                                            href={route('products.show', { slug: item.product.slug })}
                                                            className="shrink-0"
                                                        >
                                                            <div className="h-24 w-24 overflow-hidden rounded-lg">
                                                                <img
                                                                    src={item.variant?.image || item.product.image}
                                                                    alt={item.product.name}
                                                                    className="h-full w-full object-contain"
                                                                />
                                                            </div>
                                                        </Link>

                                                        {/* Product Details */}
                                                        <div className="flex flex-1 flex-col gap-3">
                                                            {/* Title and Price Row */}
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="flex-1">
                                                                    <Link
                                                                        href={route('products.show', { slug: item.product.slug })}
                                                                        className="text-sm font-bold uppercase tracking-wide text-foreground hover:text-gold line-clamp-2 sm:text-base"
                                                                    >
                                                                        {item.product.name}
                                                                    </Link>
                                                                    {item.variant && (
                                                                        <p className="mt-1 text-xs uppercase text-muted-foreground">
                                                                            {t('product.size', 'Size')}: {item.variant.size}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleRemove(item.id, item.product.name)}
                                                                    disabled={removingItems.has(item.id)}
                                                                    className="text-muted-foreground transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    title={t('cart.remove', 'Remove')}
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </button>
                                                            </div>

                                                            {/* Quantity and Price Row */}
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                                        className="flex size-8 items-center justify-center rounded-md border border-border bg-background transition-colors hover:border-gold hover:text-gold"
                                                                    >
                                                                        <Minus className="size-3.5" />
                                                                    </button>
                                                                    <span className="min-w-[2.5rem] text-center text-sm font-bold">
                                                                        {item.quantity}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                                        className="flex size-8 items-center justify-center rounded-md border border-border bg-background transition-colors hover:border-gold hover:text-gold"
                                                                    >
                                                                        <Plus className="size-3.5" />
                                                                    </button>
                                                                </div>
                                                                <div className="flex flex-col items-end">
                                                                    <p className="text-lg font-bold text-gold">
                                                                        €{lineTotal.toFixed(2)}
                                                                    </p>
                                                                    {compareLineTotal && compareLineTotal > lineTotal && (
                                                                        <p className="text-xs font-medium text-muted-foreground line-through">
                                                                            €{compareLineTotal.toFixed(2)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>

                                {/* Continue Shopping Link */}
                                <div className="mt-6">
                                    <Link
                                        href={route('products.index')}
                                        className="inline-flex items-center gap-2 text-sm font-medium text-gold hover:underline"
                                    >
                                        <ChevronRight className="size-4 rotate-180" />
                                        {t('cart.continue_shopping', 'Continue Shopping')}
                                    </Link>
                                </div>
                            </div>

                            {/* Order Summary - 1/3 width */}
                            <div className="lg:col-span-1">
                                <div className="lg:sticky lg:top-24 space-y-4">
                                    <OrderSummary
                                        data={orderSummaryData}
                                        sticky={false}
                                        showItems={false}
                                    />

                                    {/* Checkout Button */}
                                    <Link href={route('checkout')} className="block">
                                        <Button className="h-14 w-full rounded-lg bg-gold text-base font-bold uppercase tracking-wide text-white transition-all hover:bg-gold/90">
                                            {t('cart.proceed_to_checkout', 'Proceed to Checkout')}
                                            <ChevronRight className="ml-2 size-5" />
                                        </Button>
                                    </Link>

                                    <p className="text-center text-xs text-muted-foreground">
                                        {t('cart.shipping_at_checkout', 'Shipping prices will be shown at checkout')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <Footer />
            </div>
        </>
    );
}
