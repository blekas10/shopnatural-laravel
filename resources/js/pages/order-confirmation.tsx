import Footer from '@/components/footer';
import MainHeader from '@/components/main-header';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';
import type { OrderConfirmationProps } from '@/types/checkout';
import { Link, usePage } from '@inertiajs/react';
import SEO from '@/components/seo';
import { motion } from 'framer-motion';
import {
    Check,
    CheckCircle2,
    Clock,
    Copy,
    Download,
    Mail,
    Package,
    ShoppingBag,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const CHECKOUT_DATA_KEY = 'shop-natural-checkout-data';

export default function OrderConfirmation({ order }: OrderConfirmationProps) {
    const { t, route } = useTranslation();
    const { clearCart } = useCart();
    const { auth } = usePage<SharedData>().props;
    const [copied, setCopied] = useState(false);

    // Clear cart and saved checkout data when order confirmation page loads (after successful payment)
    useEffect(() => {
        // Only clear once per order
        const cleared = sessionStorage.getItem(
            `cart_cleared_${order.orderNumber}`,
        );
        if (!cleared) {
            console.log('Clearing cart for order:', order.orderNumber);
            clearCart();

            // Also clear saved checkout data
            localStorage.removeItem(CHECKOUT_DATA_KEY);
            console.log('Cleared saved checkout data');

            sessionStorage.setItem(`cart_cleared_${order.orderNumber}`, 'true');
        }
    }, [order.orderNumber, clearCart]);

    // Determine icon and colors based on order status
    const getStatusDisplay = () => {
        switch (order.status) {
            case 'pending':
                return {
                    icon: Clock,
                    bgColor: 'bg-yellow-100 dark:bg-yellow-950',
                    iconColor: 'text-yellow-600 dark:text-yellow-400',
                    title: t('order.pending_payment', 'Awaiting Payment'),
                    message: t(
                        'order.pending_message',
                        'Your order will be confirmed once payment is received.',
                    ),
                };
            case 'confirmed':
            case 'processing':
            case 'shipped':
            case 'completed':
                return {
                    icon: CheckCircle2,
                    bgColor: 'bg-teal-100 dark:bg-teal-950',
                    iconColor: 'text-teal-600 dark:text-teal-400',
                    title: t('order.thank_you', 'Thank You For Your Order!'),
                    message: t(
                        'order.confirmation_sent',
                        'A confirmation email has been sent to',
                    ),
                };
            default:
                return {
                    icon: CheckCircle2,
                    bgColor: 'bg-teal-100 dark:bg-teal-950',
                    iconColor: 'text-teal-600 dark:text-teal-400',
                    title: t('order.thank_you', 'Thank You For Your Order!'),
                    message: t(
                        'order.confirmation_sent',
                        'A confirmation email has been sent to',
                    ),
                };
        }
    };

    const statusDisplay = getStatusDisplay();
    const StatusIcon = statusDisplay.icon;

    const copyOrderNumber = () => {
        navigator.clipboard.writeText(order.orderNumber);
        setCopied(true);
        toast.success(t('order.order_number_copied', 'Order number copied!'));
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <SEO
                title={t('order.confirmation_title', 'Order Confirmed')}
                noindex={true}
                nofollow={true}
            />

            <div className="min-h-screen bg-background">
                <MainHeader />

                <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-8">
                    {/* Success Animation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.5,
                            ease: [0.4, 0, 0.2, 1],
                        }}
                        className="mb-8 flex flex-col items-center text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                delay: 0.2,
                                type: 'spring',
                                stiffness: 200,
                                damping: 15,
                            }}
                            className={cn(
                                'mb-6 flex size-24 items-center justify-center rounded-full',
                                statusDisplay.bgColor,
                            )}
                        >
                            <motion.div
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                            >
                                <StatusIcon
                                    className={cn(
                                        'size-14',
                                        statusDisplay.iconColor,
                                    )}
                                />
                            </motion.div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mb-3 text-3xl font-bold tracking-wide uppercase md:text-4xl"
                        >
                            {statusDisplay.title}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mb-8 text-lg text-muted-foreground"
                        >
                            {statusDisplay.message}
                            {order.status !== 'pending' && (
                                <>
                                    {' '}
                                    <span className="font-medium text-foreground">
                                        {order.contact.email}
                                    </span>
                                </>
                            )}
                        </motion.p>

                        {/* Order Number */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="rounded-2xl border-2 border-gold/30 bg-gold/5 p-6"
                        >
                            <p className="mb-2 text-sm font-medium tracking-wide text-muted-foreground uppercase">
                                {t('order.order_number', 'Order Number')}
                            </p>
                            <div className="flex items-center gap-3">
                                <p className="text-2xl font-bold text-gold md:text-3xl">
                                    {order.orderNumber}
                                </p>
                                <button
                                    onClick={copyOrderNumber}
                                    className="rounded-lg p-2 transition-colors hover:bg-gold/10"
                                >
                                    {copied ? (
                                        <Check className="size-5 text-teal-600" />
                                    ) : (
                                        <Copy className="size-5 text-gold" />
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Order Details Grid */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Order Summary */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="rounded-2xl border-2 border-border bg-background p-6"
                            >
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-xl font-bold tracking-wide uppercase">
                                        {t(
                                            'order.order_summary',
                                            'Order Summary',
                                        )}
                                    </h2>
                                    <OrderStatusBadge status={order.status} />
                                </div>

                                <div className="space-y-4">
                                    {order.items.map((item) => {
                                        const price =
                                            item.variant?.price ||
                                            item.product.price;
                                        const lineTotal = price * item.quantity;

                                        return (
                                            <div
                                                key={item.id}
                                                className="flex gap-4 rounded-lg border border-border p-4"
                                            >
                                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                                                    <img
                                                        src={
                                                            item.variant
                                                                ?.image ||
                                                            item.product.image
                                                        }
                                                        alt={item.product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-1 items-start justify-between">
                                                    <div>
                                                        <p className="font-bold tracking-wide text-foreground uppercase">
                                                            {item.product.name}
                                                        </p>
                                                        {item.variant && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    item.variant
                                                                        .size
                                                                }
                                                            </p>
                                                        )}
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {t(
                                                                'order.quantity',
                                                                'Qty',
                                                            )}
                                                            : {item.quantity}
                                                        </p>
                                                    </div>
                                                    <p className="font-bold text-gold">
                                                        €{lineTotal.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Price Breakdown */}
                                <div className="mt-6 space-y-3 border-t border-border pt-6">
                                    {/* Product Price (original before product discount) */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {t('checkout.product_price', 'Product Price')}
                                        </span>
                                        <span className="font-medium">
                                            €{order.originalSubtotal.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Product Discount */}
                                    {order.productDiscount > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-teal-600 dark:text-teal-400">
                                                {t('checkout.product_discount', 'Product Discount')}
                                            </span>
                                            <span className="font-medium text-teal-600 dark:text-teal-400">
                                                -€{order.productDiscount.toFixed(2)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Subtotal (after product discount) */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {t('checkout.subtotal', 'Subtotal')}
                                        </span>
                                        <span className="font-medium">
                                            €{order.subtotal.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Price excl. VAT */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {t('checkout.price_excl_vat', 'Price excl. VAT')}
                                        </span>
                                        <span className="font-medium">
                                            €{order.subtotalExclVat.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* VAT */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {t('checkout.vat', 'VAT')} (21%)
                                        </span>
                                        <span className="font-medium">
                                            €{order.vatAmount.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Promo Code Discount (applied before shipping) */}
                                    {order.promoCodeDiscount > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-teal-600 dark:text-teal-400">
                                                {t('checkout.promo_code_discount', 'Promo Code')}
                                                {order.promoCode && (
                                                    <span className="ml-1 font-mono text-xs">
                                                        ({order.promoCode.code})
                                                    </span>
                                                )}
                                            </span>
                                            <span className="font-medium text-teal-600 dark:text-teal-400">
                                                -€{order.promoCodeDiscount.toFixed(2)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Shipping (added after promo code) */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {t('order.shipping', 'Shipping')}
                                        </span>
                                        <span className="font-medium">
                                            {order.shipping === 0
                                                ? t('order.free', 'Free')
                                                : `€${order.shipping.toFixed(2)}`}
                                        </span>
                                    </div>

                                    {/* Grand Total */}
                                    <div className="flex items-center justify-between border-t border-border pt-3">
                                        <span className="text-lg font-bold">
                                            {t('checkout.grand_total', 'Grand Total')}
                                        </span>
                                        <span className="text-2xl font-bold text-gold">
                                            €{order.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Shipping & Billing */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="grid gap-6 md:grid-cols-2"
                            >
                                {/* Shipping Address */}
                                <div className="rounded-2xl border-2 border-border bg-background p-6">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-wide uppercase">
                                        <Package className="size-5 text-gold" />
                                        {t(
                                            'order.shipping_address',
                                            'Shipping Address',
                                        )}
                                    </h3>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        <p className="font-medium text-foreground">
                                            {order.shippingAddress.fullName}
                                        </p>
                                        <p>
                                            {order.shippingAddress.addressLine1}
                                        </p>
                                        {order.shippingAddress.addressLine2 && (
                                            <p>
                                                {
                                                    order.shippingAddress
                                                        .addressLine2
                                                }
                                            </p>
                                        )}
                                        <p>
                                            {order.shippingAddress.city},{' '}
                                            {order.shippingAddress.postalCode}
                                        </p>
                                        <p>{order.shippingAddress.country}</p>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="rounded-2xl border-2 border-border bg-background p-6">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-wide uppercase">
                                        <Mail className="size-5 text-gold" />
                                        {t(
                                            'order.contact_payment',
                                            'Contact & Payment',
                                        )}
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                                {t('order.email', 'Email')}
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {order.contact.email}
                                            </p>
                                        </div>
                                        {order.contact.phone && (
                                            <div>
                                                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                                    {t('order.phone', 'Phone')}
                                                </p>
                                                <p className="font-medium text-foreground">
                                                    {order.contact.phone}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                                {t(
                                                    'order.payment_method',
                                                    'Payment Method',
                                                )}
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {order.paymentMethod.name}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar Actions */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                                className="sticky top-24 space-y-4"
                            >
                                {/* Estimated Delivery */}
                                {order.estimatedDelivery && (
                                    <div className="rounded-2xl border-2 border-border bg-background p-6">
                                        <h3 className="mb-3 text-sm font-bold tracking-wide uppercase">
                                            {t(
                                                'order.estimated_delivery',
                                                'Estimated Delivery',
                                            )}
                                        </h3>
                                        <p className="text-2xl font-bold text-gold">
                                            {order.estimatedDelivery}
                                        </p>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {t(
                                                'order.shipping_method',
                                                'Shipping Method',
                                            )}
                                            :{' '}
                                            <span className="font-medium text-foreground">
                                                {order.shippingMethod.name}
                                            </span>
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <div>
                                        <a
                                            href={route(
                                                'orders.invoice.download',
                                                {
                                                    orderNumber:
                                                        order.orderNumber,
                                                },
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full"
                                        >
                                            <Button className="w-full bg-gold text-white hover:bg-gold/90">
                                                <Download className="mr-2 size-4" />
                                                {t(
                                                    'order.download_invoice',
                                                    'Download Invoice',
                                                )}
                                            </Button>
                                        </a>
                                    </div>
                                    <div>
                                        <Link
                                            href={
                                                auth?.user
                                                    ? route('orders.index')
                                                    : route('register')
                                            }
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full border-2"
                                            >
                                                <ShoppingBag className="mr-2 size-4" />
                                                {t(
                                                    'order.my_orders',
                                                    'My Orders',
                                                )}
                                            </Button>
                                        </Link>
                                    </div>
                                    <div>
                                        <Link href={route('products.index')}>
                                            <Button
                                                variant="outline"
                                                className="w-full border-2"
                                            >
                                                {t(
                                                    'order.continue_shopping',
                                                    'Continue Shopping',
                                                )}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>

                                {/* Help Section */}
                                <div className="rounded-lg border border-border bg-muted/30 p-4">
                                    <p className="text-sm text-muted-foreground">
                                        {t('order.need_help', 'Need help?')}{' '}
                                        <Link
                                            href="/contact"
                                            className="font-medium text-gold hover:underline"
                                        >
                                            {t(
                                                'order.contact_us',
                                                'Contact us',
                                            )}
                                        </Link>
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}
