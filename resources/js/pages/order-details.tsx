import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Download,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    MapPin,
    XCircle,
    AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import MainHeader from '@/components/main-header';
import Footer from '@/components/footer';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/order-status-badge';
import type { OrderDetailsProps, OrderStatus } from '@/types/checkout';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PageProps {
    locale: string;
}

const statusIcons: Record<OrderStatus, React.ElementType> = {
    confirmed: CheckCircle2,
    processing: Package,
    shipped: Truck,
    completed: CheckCircle2,
    cancelled: CheckCircle2,
};

export default function OrderDetails({ order }: OrderDetailsProps) {
    const { t, route } = useTranslation();
    const { locale } = usePage<PageProps>().props;
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(locale === 'lt' ? 'lt-LT' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const canCancelOrder = () => {
        return ['confirmed', 'processing'].includes(order.status);
    };

    const handleCancelOrder = () => {
        setIsCancelling(true);

        router.post(
            route('orders.cancel', { id: order.id }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('order.cancelled_successfully', 'Order cancelled successfully'));
                    setShowCancelDialog(false);
                },
                onError: (errors) => {
                    const error = Object.values(errors)[0];
                    toast.error(error as string || t('order.cancel_failed', 'Failed to cancel order'));
                },
                onFinish: () => {
                    setIsCancelling(false);
                },
            }
        );
    };

    const handleDownloadInvoice = () => {
        toast.success(t('order.invoice_downloading', 'Invoice will be downloaded shortly'));
        // router.get(route('orders.invoice', { id: order.id }));
    };

    const handleTrackShipment = () => {
        if (order.trackingNumber) {
            toast.success(t('order.opening_tracking', 'Opening tracking page...'));
            // In production, redirect to carrier tracking page
            // window.open(`https://track.carrier.com/${order.trackingNumber}`, '_blank');
        }
    };

    return (
        <>
            <Head
                title={t('order.order_details', 'Order #{number}', {
                    number: order.orderNumber,
                })}
            />

            <div className="min-h-screen bg-background">
                <MainHeader />

                <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route('dashboard')}
                            className="group mb-4 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-gold"
                        >
                            <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-1" />
                            {t('order.back_to_orders', 'Back to Orders')}
                        </Link>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold uppercase tracking-wide md:text-3xl lg:text-4xl">
                                    {t('order.order', 'Order')} #{order.orderNumber}
                                </h1>
                                <p className="mt-2 text-muted-foreground">
                                    {t('order.placed_on', 'Placed on')}{' '}
                                    {formatDate(order.createdAt)}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <OrderStatusBadge status={order.status} />
                                <Button
                                    onClick={handleDownloadInvoice}
                                    variant="outline"
                                    className="border-2"
                                >
                                    <Download className="mr-2 size-4" />
                                    {t('order.invoice', 'Invoice')}
                                </Button>
                                {canCancelOrder() && (
                                    <Button
                                        onClick={() => setShowCancelDialog(true)}
                                        variant="outline"
                                        className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                    >
                                        <XCircle className="mr-2 size-4" />
                                        {t('order.cancel_order', 'Cancel Order')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Order Timeline */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl border-2 border-border bg-background p-6"
                            >
                                <h2 className="mb-6 text-xl font-bold uppercase tracking-wide">
                                    {t('order.order_timeline', 'Order Timeline')}
                                </h2>

                                <div className="relative space-y-6">
                                    {order.timeline.map((event, index) => {
                                        const Icon = statusIcons[event.status];
                                        const isLast = index === order.timeline.length - 1;
                                        const isCurrent = event.status === order.status;

                                        return (
                                            <div key={index} className="relative flex gap-4">
                                                {/* Connector Line */}
                                                {!isLast && (
                                                    <div className="absolute left-5 top-12 h-full w-0.5 bg-border" />
                                                )}

                                                {/* Icon */}
                                                <div
                                                    className={cn(
                                                        'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2',
                                                        isCurrent
                                                            ? 'border-gold bg-gold text-white'
                                                            : 'border-border bg-background text-muted-foreground',
                                                    )}
                                                >
                                                    <Icon className="size-5" />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 pb-2">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p
                                                                className={cn(
                                                                    'font-bold uppercase tracking-wide',
                                                                    isCurrent
                                                                        ? 'text-foreground'
                                                                        : 'text-muted-foreground',
                                                                )}
                                                            >
                                                                {event.description}
                                                            </p>
                                                            <p className="mt-1 text-sm text-muted-foreground">
                                                                {formatDate(event.timestamp)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Tracking Information */}
                            {order.trackingNumber && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="rounded-2xl border-2 border-gold/30 bg-gold/5 p-6"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-lg bg-gold/10 p-3">
                                            <Truck className="size-6 text-gold" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="mb-2 font-bold uppercase tracking-wide">
                                                {t('order.tracking_number', 'Tracking Number')}
                                            </h3>
                                            <p className="mb-3 text-lg font-bold text-gold">
                                                {order.trackingNumber}
                                            </p>
                                            <Button
                                                onClick={handleTrackShipment}
                                                variant="outline"
                                                className="border-2 border-gold bg-background hover:bg-gold hover:text-white"
                                            >
                                                <MapPin className="mr-2 size-4" />
                                                {t('order.track_shipment', 'Track Shipment')}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Order Items */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="rounded-2xl border-2 border-border bg-background p-6"
                            >
                                <h2 className="mb-6 text-xl font-bold uppercase tracking-wide">
                                    {t('order.items', 'Items')} ({order.items.length})
                                </h2>

                                <div className="space-y-4">
                                    {order.items.map((item) => {
                                        const price =
                                            item.variant?.price || item.product.price;
                                        const lineTotal = price * item.quantity;

                                        return (
                                            <div
                                                key={item.id}
                                                className="flex gap-4 rounded-lg border border-border p-4 transition-all hover:border-gold/40"
                                            >
                                                <Link
                                                    href={route('products.show', {
                                                        slug: item.product.slug,
                                                    })}
                                                    className="shrink-0"
                                                >
                                                    <div className="h-20 w-20 overflow-hidden rounded-lg border border-border bg-muted transition-transform hover:scale-105">
                                                        <img
                                                            src={item.product.image}
                                                            alt={item.product.name}
                                                            className="h-full w-full object-contain p-2"
                                                        />
                                                    </div>
                                                </Link>
                                                <div className="flex flex-1 items-start justify-between gap-4">
                                                    <div>
                                                        <Link
                                                            href={route('products.show', {
                                                                slug: item.product.slug,
                                                            })}
                                                            className="font-bold uppercase tracking-wide text-foreground transition-colors hover:text-gold"
                                                        >
                                                            {item.product.name}
                                                        </Link>
                                                        {item.variant && (
                                                            <p className="mt-1 text-sm text-muted-foreground">
                                                                {t('order.size', 'Size')}:{' '}
                                                                {item.variant.size}
                                                            </p>
                                                        )}
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {t('order.quantity', 'Qty')}: {item.quantity}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-gold">
                                                            €{lineTotal.toFixed(2)}
                                                        </p>
                                                        {item.quantity > 1 && (
                                                            <p className="mt-1 text-sm text-muted-foreground">
                                                                €{price.toFixed(2)} {t('order.each', 'each')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Price Summary */}
                                <div className="mt-6 space-y-3 border-t border-border pt-6">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {t('order.subtotal', 'Subtotal')}
                                        </span>
                                        <span className="font-medium">
                                            €{order.subtotal.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {t('order.shipping', 'Shipping')} (
                                            {order.shippingMethod.name})
                                        </span>
                                        <span className="font-medium">
                                            {order.shipping === 0
                                                ? t('order.free', 'Free')
                                                : `€${order.shipping.toFixed(2)}`}
                                        </span>
                                    </div>
                                    {order.tax > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {t('order.tax', 'Tax')}
                                            </span>
                                            <span className="font-medium">
                                                €{order.tax.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                    {order.discount > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-teal-600 dark:text-teal-400">
                                                {t('order.discount', 'Discount')}
                                            </span>
                                            <span className="font-medium text-teal-600 dark:text-teal-400">
                                                -€{order.discount.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between border-t border-border pt-3">
                                        <span className="text-lg font-bold">
                                            {t('order.total', 'Total')}
                                        </span>
                                        <span className="text-2xl font-bold text-gold">
                                            €{order.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                {/* Shipping Address */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="rounded-2xl border-2 border-border bg-background p-6"
                                >
                                    <h3 className="mb-4 text-lg font-bold uppercase tracking-wide">
                                        {t('order.shipping_address', 'Shipping Address')}
                                    </h3>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        <p className="font-medium text-foreground">
                                            {order.shippingAddress.fullName}
                                        </p>
                                        <p>{order.shippingAddress.addressLine1}</p>
                                        {order.shippingAddress.addressLine2 && (
                                            <p>{order.shippingAddress.addressLine2}</p>
                                        )}
                                        <p>
                                            {order.shippingAddress.city},{' '}
                                            {order.shippingAddress.postalCode}
                                        </p>
                                        <p>{order.shippingAddress.country}</p>
                                    </div>
                                </motion.div>

                                {/* Contact Information */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="rounded-2xl border-2 border-border bg-background p-6"
                                >
                                    <h3 className="mb-4 text-lg font-bold uppercase tracking-wide">
                                        {t('order.contact_information', 'Contact Information')}
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                {t('order.email', 'Email')}
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {order.contact.email}
                                            </p>
                                        </div>
                                        {order.contact.phone && (
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    {t('order.phone', 'Phone')}
                                                </p>
                                                <p className="font-medium text-foreground">
                                                    {order.contact.phone}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Payment Method */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="rounded-2xl border-2 border-border bg-background p-6"
                                >
                                    <h3 className="mb-4 text-lg font-bold uppercase tracking-wide">
                                        {t('order.payment_method', 'Payment Method')}
                                    </h3>
                                    <p className="text-sm font-medium text-foreground">
                                        {order.paymentMethod.name}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {order.paymentMethod.description}
                                    </p>
                                </motion.div>

                                {/* Help */}
                                <div className="rounded-lg border border-border bg-muted/30 p-4">
                                    <p className="text-sm text-muted-foreground">
                                        {t('order.need_help', 'Need help?')}{' '}
                                        <Link
                                            href="/contact"
                                            className="font-medium text-gold hover:underline"
                                        >
                                            {t('order.contact_support', 'Contact support')}
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cancel Order Dialog */}
                <AnimatePresence>
                    {showCancelDialog && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                            onClick={() => !isCancelling && setShowCancelDialog(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md rounded-2xl border-2 border-border bg-background p-6 shadow-xl"
                            >
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="rounded-full bg-red-100 p-3 dark:bg-red-950">
                                        <AlertTriangle className="size-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <h2 className="text-xl font-bold uppercase tracking-wide">
                                        {t('order.cancel_order', 'Cancel Order')}
                                    </h2>
                                </div>

                                <p className="mb-6 text-muted-foreground">
                                    {t('order.cancel_confirmation', 'Are you sure you want to cancel order #{orderNumber}? This action cannot be undone.', {
                                        orderNumber: order.orderNumber
                                    })}
                                </p>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => setShowCancelDialog(false)}
                                        disabled={isCancelling}
                                        variant="outline"
                                        className="flex-1 border-2"
                                    >
                                        {t('common.cancel', 'Cancel')}
                                    </Button>
                                    <Button
                                        onClick={handleCancelOrder}
                                        disabled={isCancelling}
                                        className="flex-1 bg-red-600 text-white hover:bg-red-700"
                                    >
                                        {isCancelling ? (
                                            <>
                                                <Clock className="mr-2 size-4 animate-spin" />
                                                {t('order.cancelling', 'Cancelling...')}
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="mr-2 size-4" />
                                                {t('order.confirm_cancel', 'Yes, Cancel Order')}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Footer />
            </div>
        </>
    );
}
