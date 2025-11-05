import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useOptimistic } from 'react';
import MainHeader from '@/components/main-header';
import Footer from '@/components/footer';
import { useCart } from '@/hooks/use-cart';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import type { CartItem as CartItemType } from '@/types';

export default function Cart() {
    const { items, totalPrice, removeItem, updateQuantity } = useCart();
    const { t, route } = useTranslation();

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
        // Optimistic update
        addOptimisticUpdate({ itemId, quantity: newQuantity });
        // Actual update
        updateQuantity(itemId, newQuantity);
    };

    const handleRemove = (itemId: string) => {
        // Optimistic update
        addOptimisticUpdate({ itemId, quantity: 0 });
        // Actual update
        removeItem(itemId);
    };

    const estimatedShipping: number = 0; // Placeholder
    const total = totalPrice + estimatedShipping;

    return (
        <>
            <Head title={t('cart.title', 'Shopping Cart')} />

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
                            <h1 className="mb-3 text-3xl font-bold uppercase tracking-wide text-foreground">
                                {t('cart.empty', 'Your cart is empty')}
                            </h1>
                            <p className="mb-8 text-lg text-muted-foreground">
                                {t('cart.empty_message', 'Add some products to get started')}
                            </p>
                            <Link href={route('products.index')}>
                                <Button className="bg-gold px-8 text-white hover:bg-gold/90">
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
                                            const lineTotal = price * item.quantity;

                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden rounded-2xl border-2 border-border bg-background"
                                                >
                                                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-6">
                                                        {/* Product Image */}
                                                        <Link
                                                            href={route('products.show', { slug: item.product.slug })}
                                                            className="shrink-0"
                                                        >
                                                            <div className="h-32 w-32 overflow-hidden rounded-xl border border-border bg-muted">
                                                                <img
                                                                    src={item.product.image}
                                                                    alt={item.product.name}
                                                                    className="h-full w-full object-contain p-3"
                                                                />
                                                            </div>
                                                        </Link>

                                                        {/* Product Details */}
                                                        <div className="flex flex-1 flex-col justify-between gap-4">
                                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                                <div>
                                                                    <Link
                                                                        href={route('products.show', { slug: item.product.slug })}
                                                                        className="text-lg font-bold uppercase tracking-wide text-foreground hover:text-gold"
                                                                    >
                                                                        {item.product.name}
                                                                    </Link>
                                                                    {item.product.brandName && (
                                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                                            {item.product.brandName}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <p className="text-2xl font-bold text-gold">
                                                                    €{lineTotal.toFixed(2)}
                                                                </p>
                                                            </div>

                                                            {/* Variant Selection */}
                                                            {item.variant && (
                                                                <div className="space-y-2">
                                                                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                                                        {t('product.size', 'Size')}
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {/* In a real implementation, you'd fetch all variants for this product */}
                                                                        <button
                                                                            className="rounded-lg border-2 border-gold bg-gold/10 px-4 py-2 text-sm font-bold uppercase tracking-wide text-foreground ring-2 ring-gold/20"
                                                                        >
                                                                            {item.variant.size}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Quantity and Remove */}
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <p className="text-sm font-medium text-muted-foreground">
                                                                        {t('cart.quantity', 'Quantity')}:
                                                                    </p>
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                                            className="flex size-9 items-center justify-center rounded-md border-2 border-border bg-muted transition-all hover:border-gold hover:text-gold"
                                                                        >
                                                                            <Minus className="size-4" />
                                                                        </button>
                                                                        <span className="min-w-[3rem] text-center text-lg font-bold">
                                                                            {item.quantity}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                                            className="flex size-9 items-center justify-center rounded-md border-2 border-border bg-muted transition-all hover:border-gold hover:text-gold"
                                                                        >
                                                                            <Plus className="size-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    onClick={() => handleRemove(item.id)}
                                                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                    <span className="hidden sm:inline">
                                                                        {t('cart.remove', 'Remove')}
                                                                    </span>
                                                                </button>
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
                                <div className="sticky top-24 rounded-2xl border-2 border-border bg-background p-6">
                                    <h2 className="mb-6 text-xl font-bold uppercase tracking-wide text-foreground">
                                        {t('cart.order_summary', 'Order Summary')}
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                {t('cart.subtotal', 'Subtotal')}
                                            </span>
                                            <span className="text-lg font-bold text-foreground">
                                                €{totalPrice.toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                {t('cart.shipping', 'Shipping')}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {estimatedShipping === 0
                                                    ? t('cart.free', 'Free')
                                                    : `€${estimatedShipping.toFixed(2)}`}
                                            </span>
                                        </div>

                                        <div className="border-t border-border pt-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-base font-bold uppercase tracking-wide text-foreground">
                                                    {t('cart.total', 'Total')}
                                                </span>
                                                <span className="text-3xl font-bold text-gold">
                                                    €{total.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full bg-gold py-6 text-base font-bold uppercase tracking-wide text-white hover:bg-gold/90"
                                        >
                                            {t('cart.checkout', 'Proceed to Checkout')}
                                        </Button>

                                        <p className="text-center text-xs text-muted-foreground">
                                            {t('cart.secure_checkout', 'Secure checkout with SSL encryption')}
                                        </p>
                                    </div>
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
