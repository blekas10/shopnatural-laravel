'use client';

import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useTranslation } from '@/hooks/use-translation';
import type { CartItem } from '@/types';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useEffect, useOptimistic } from 'react';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, totalPrice, removeItem, updateQuantity } = useCart();
    const { t, route } = useTranslation();

    // Body scroll lock when drawer is open
    useEffect(() => {
        if (isOpen) {
            const scrollbarWidth =
                window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [isOpen]);

    // Optimistic updates for quantity changes
    const [optimisticItems, addOptimisticUpdate] = useOptimistic(
        items,
        (
            state: CartItem[],
            { itemId, quantity }: { itemId: string; quantity: number },
        ) => {
            return state
                .map((item) =>
                    item.id === itemId ? { ...item, quantity } : item,
                )
                .filter((item) => item.quantity > 0);
        },
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

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{
                            type: 'tween',
                            duration: 0.3,
                            ease: 'easeInOut',
                        }}
                        drag={false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0}
                        className="fixed top-0 right-0 z-[110] h-screen w-full touch-none overflow-hidden bg-background shadow-2xl sm:w-[400px] md:w-[480px]"
                        style={{ touchAction: 'none' }}
                    >
                        <div className="flex h-full flex-col overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-border px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="size-5 text-gold" />
                                    <h2 className="text-lg font-bold tracking-wide uppercase">
                                        {t('cart.title', 'Shopping Cart')}
                                    </h2>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="hover:bg-muted"
                                >
                                    <X className="size-5" />
                                </Button>
                            </div>

                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
                                {optimisticItems.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center text-center">
                                        <ShoppingBag className="mb-4 size-16 text-muted-foreground/50" />
                                        <p className="mb-2 text-lg font-bold text-foreground">
                                            {t(
                                                'cart.empty',
                                                'Your cart is empty',
                                            )}
                                        </p>
                                        <p className="mb-6 text-sm text-muted-foreground">
                                            {t(
                                                'cart.empty_message',
                                                'Add some products to get started',
                                            )}
                                        </p>
                                        <Button
                                            onClick={onClose}
                                            className="bg-gold text-white hover:bg-gold/90"
                                        >
                                            {t(
                                                'cart.continue_shopping',
                                                'Continue Shopping',
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <AnimatePresence mode="popLayout">
                                            {optimisticItems.map((item) => {
                                                const price =
                                                    item.variant?.price ||
                                                    item.product.price;
                                                const compareAtPrice =
                                                    item.variant?.compareAtPrice ||
                                                    item.product.compareAtPrice;
                                                const lineTotal =
                                                    price * item.quantity;
                                                const compareLineTotal =
                                                    compareAtPrice ? compareAtPrice * item.quantity : null;

                                                return (
                                                    <motion.div
                                                        key={item.id}
                                                        layout
                                                        initial={{
                                                            opacity: 0,
                                                            height: 0,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            height: 'auto',
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            height: 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.2,
                                                        }}
                                                        className="flex gap-4 rounded-lg border border-border bg-background p-3"
                                                    >
                                                        {/* Product Image */}
                                                        <Link
                                                            href={route(
                                                                'products.show',
                                                                {
                                                                    slug: item
                                                                        .product
                                                                        .slug,
                                                                },
                                                            )}
                                                            onClick={onClose}
                                                            className="shrink-0"
                                                        >
                                                            <div className="h-20 w-20 overflow-hidden rounded-lg">
                                                                <img
                                                                    src={
                                                                        item.variant?.image ||
                                                                        item.product.image
                                                                    }
                                                                    alt={
                                                                        item
                                                                            .product
                                                                            .name
                                                                    }
                                                                    className="h-full w-full object-contain"
                                                                />
                                                            </div>
                                                        </Link>

                                                        {/* Product Info */}
                                                        <div className="flex flex-1 flex-col justify-between">
                                                            <div>
                                                                <Link
                                                                    href={route(
                                                                        'products.show',
                                                                        {
                                                                            slug: item
                                                                                .product
                                                                                .slug,
                                                                        },
                                                                    )}
                                                                    onClick={
                                                                        onClose
                                                                    }
                                                                    className="line-clamp-2 text-sm font-bold tracking-wide text-foreground uppercase hover:text-gold"
                                                                >
                                                                    {
                                                                        item
                                                                            .product
                                                                            .name
                                                                    }
                                                                </Link>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    {item.variant && (
                                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                                            {
                                                                                item
                                                                                    .variant
                                                                                    .size
                                                                            }
                                                                        </p>
                                                                    )}
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="mt-1 text-sm font-bold text-gold">
                                                                            €{lineTotal.toFixed(2)}
                                                                        </p>
                                                                        {compareLineTotal && compareLineTotal > lineTotal && (
                                                                            <p className="mt-1 text-xs font-medium text-muted-foreground line-through">
                                                                                €{compareLineTotal.toFixed(2)}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Quantity Controls */}
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() =>
                                                                            handleQuantityChange(
                                                                                item.id,
                                                                                item.quantity -
                                                                                    1,
                                                                            )
                                                                        }
                                                                        className="flex size-7 items-center justify-center rounded-md border border-border bg-muted transition-colors hover:border-gold hover:text-gold"
                                                                    >
                                                                        <Minus className="size-3" />
                                                                    </button>
                                                                    <span className="min-w-[2rem] text-center text-sm font-bold">
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </span>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleQuantityChange(
                                                                                item.id,
                                                                                item.quantity +
                                                                                    1,
                                                                            )
                                                                        }
                                                                        className="flex size-7 items-center justify-center rounded-md border border-border bg-muted transition-colors hover:border-gold hover:text-gold"
                                                                    >
                                                                        <Plus className="size-3" />
                                                                    </button>
                                                                </div>

                                                                <button
                                                                    onClick={() =>
                                                                        handleRemove(
                                                                            item.id,
                                                                        )
                                                                    }
                                                                    className="text-muted-foreground transition-colors hover:text-red-500"
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {optimisticItems.length > 0 && (
                                <div className="border-t border-border px-6 py-6">
                                    <div className="mb-6 flex items-center justify-between">
                                        <span className="text-lg font-medium text-muted-foreground">
                                            {t('cart.subtotal', 'Subtotal')}
                                        </span>
                                        <span className="text-2xl font-bold text-foreground">
                                            €{totalPrice.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <Link href={route('cart')}>
                                            <Button
                                                onClick={onClose}
                                                className="h-12 w-full rounded-lg border-2 border-gold bg-gold text-base font-bold uppercase tracking-wide text-white transition-all hover:bg-gold/90"
                                            >
                                                {t(
                                                    'cart.view_cart',
                                                    'View Cart',
                                                )}
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            onClick={onClose}
                                            className="h-12 w-full rounded-lg border-2 text-base font-medium transition-all hover:border-gold hover:text-gold"
                                        >
                                            {t(
                                                'cart.continue_shopping',
                                                'Continue Shopping',
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
