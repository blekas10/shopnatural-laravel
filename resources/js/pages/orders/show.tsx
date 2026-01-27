import { Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SEO from '@/components/seo';
import { type BreadcrumbItem, type CartItem } from '@/types';
import { useTranslation } from '@/hooks/use-translation';
import { useCartContext } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ArrowLeft,
    Package,
    MapPin,
    User,
    Mail,
    Phone,
    Truck,
    Calendar,
    CreditCard,
    FileDown,
    ShoppingCart,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

// Map Venipak statuses to translation keys
const VENIPAK_STATUS_KEYS: Record<string, string> = {
    'Shipment created': 'venipak.status.shipment_created',
    'On route to terminal': 'venipak.status.on_route_to_terminal',
    'At terminal': 'venipak.status.at_terminal',
    'Out for delivery': 'venipak.status.out_for_delivery',
    'At weighting': 'venipak.status.at_weighting',
    'At pickup waiting for courier': 'venipak.status.at_pickup_waiting_courier',
    'At pickup waiting for receiver': 'venipak.status.at_pickup_waiting_receiver',
    'At pickup point waiting for receiver': 'venipak.status.at_pickup_waiting_receiver',
    'In transit': 'venipak.status.in_transit',
    'Delivered': 'venipak.status.delivered',
    'Returned': 'venipak.status.returned',
    'Forwarding': 'venipak.status.forwarding',
    'LDG created': 'venipak.status.ldg_created',
    'Receiver not found': 'venipak.status.receiver_not_found',
    'Tare package created': 'venipak.status.tare_package_created',
    'At sender': 'venipak.status.at_sender',
    'Picked up': 'venipak.status.picked_up',
    'On route to receiver': 'venipak.status.on_route_to_receiver',
};

interface PageProps {
    locale: string;
}

interface OrderItem {
    id: number;
    productName: string;
    productSku: string;
    variantSize: string;
    originalUnitPrice: number | null;
    unitPrice: number;
    quantity: number;
    total: number;
    product?: {
        id: number;
        name: string;
        slug: string;
        image: string;
    };
    variant?: {
        id: number;
        size: string;
        currentPrice: number;
        inStock: boolean;
    };
}

interface Address {
    fullName: string;
    firstName: string;
    lastName: string;
    company: string | null;
    streetAddress: string;
    apartment: string | null;
    city: string;
    state: string | null;
    postalCode: string;
    country: string;
    phone: string | null;
}

interface Order {
    id: number;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    customerEmail: string;
    customerNotes: string | null;
    billingAddress: Address;
    shippingAddress: Address;
    shippingMethod: string | null;
    venipakPickupPoint: {
        id: number;
        name: string;
        address: string;
        city: string;
        zip: string;
    } | null;
    trackingNumber: string | null;
    // Venipak tracking
    venipakPackNo: string | null;
    venipakTrackingUrl: string | null;
    venipakShipmentCreatedAt: string | null;
    venipakStatus: string | null;
    venipakStatusUpdatedAt: string | null;
    // Secondary carrier (for global shipments)
    venipakCarrierCode: string | null;
    venipakCarrierTracking: string | null;
    venipakShipmentId: string | null;
    // Price breakdown
    originalSubtotal: number;
    productDiscount: number;
    subtotal: number;
    subtotalExclVat: number;
    vatAmount: number;
    shippingCost: number;
    promoCode?: {
        code: string;
        value: string;
    };
    promoCodeDiscount: number;
    total: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
    canBeCancelled: boolean;
    isPaid: boolean;
}

interface OrderShowProps {
    order: Order | { data: Order };
}

export default function OrderShow({ order: orderData }: OrderShowProps) {
    const { t, route } = useTranslation();
    const { locale } = usePage<PageProps>().props;
    const { restoreCart } = useCartContext();
    const [isRestoring, setIsRestoring] = useState(false);

    // Normalize order data - handle both direct Order and ResourceCollection format
    const order = 'data' in orderData ? orderData.data : orderData;

    // Check if this order can be continued (draft or pending payment)
    const canContinueOrder = order.status === 'draft' || order.status === 'pending';

    const handleContinueOrder = async () => {
        setIsRestoring(true);
        try {
            const response = await axios.post('/cart/restore-from-order', {
                order_id: order.id,
            });

            if (response.data.success) {
                const cartItems: CartItem[] = response.data.items.map((item: {
                    id: string;
                    productId: number;
                    variantId: number | null;
                    quantity: number;
                    product: { id: number; name: string; slug: string; price: number; image: string | null } | null;
                    variant: { id: number; size: string; price: number; sku: string } | null;
                }) => ({
                    id: item.id,
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    product: item.product,
                    variant: item.variant,
                }));

                restoreCart(cartItems);
                toast.success(t('orders.cart_restored', 'Cart restored successfully'));
                router.visit(route('checkout'));
            }
        } catch (error) {
            console.error('Failed to restore cart from order:', error);
            toast.error(t('orders.restore_failed', 'Failed to restore cart'));
        } finally {
            setIsRestoring(false);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('sidebar.dashboard', 'Dashboard'),
            href: route('dashboard'),
        },
        {
            title: t('sidebar.my_orders', 'My Orders'),
            href: route('orders.index'),
        },
        {
            title: order.orderNumber,
            href: route('orders.show', { orderNumber: order.orderNumber }),
        },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(locale === 'lt' ? 'lt-LT' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: order.currency || 'EUR',
        }).format(price);
    };

    // Translate Venipak status using translation keys
    const translateVenipakStatus = (status: string | null): string => {
        if (!status) return '';
        const translationKey = VENIPAK_STATUS_KEYS[status];
        if (translationKey) {
            return t(translationKey, status);
        }
        return status;
    };

    const getStatusBadgeColor = (status: string) => {
        const colors: Record<string, string> = {
            confirmed: 'bg-blue-500 text-white hover:bg-blue-600',
            processing: 'bg-yellow-500 text-white hover:bg-yellow-600',
            shipped: 'bg-purple-500 text-white hover:bg-purple-600',
            completed: 'bg-green-500 text-white hover:bg-green-600',
            cancelled: 'bg-red-500 text-white hover:bg-red-600',
        };
        return colors[status] || 'bg-gray-500 text-white hover:bg-gray-600';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SEO
                title={`${t('orders.order', 'Order')} ${order.orderNumber}`}
                noindex={true}
                nofollow={true}
            />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 lg:p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link href={route('orders.index')}>
                        <Button variant="ghost" size="sm" className="mb-3 -ml-2">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('orders.back_to_orders', 'Back to Orders')}
                        </Button>
                    </Link>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold uppercase tracking-wide md:text-3xl">
                                {t('orders.order', 'Order')} {order.orderNumber}
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(order.createdAt)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Badge className={cn("text-sm px-3 py-1", getStatusBadgeColor(order.status))}>
                                {t(`orders.status.${order.status}`, order.status)}
                            </Badge>
                            {canContinueOrder && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="w-full bg-gold font-bold uppercase tracking-wide text-white hover:bg-gold/90 sm:w-auto"
                                    onClick={handleContinueOrder}
                                    disabled={isRestoring}
                                >
                                    {isRestoring ? (
                                        <>
                                            <span className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            {t('orders.restoring', 'Restoring...')}
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            {t('orders.continue_order', 'Continue Order')}
                                        </>
                                    )}
                                </Button>
                            )}
                            <a
                                href={route('orders.invoice.download', { orderNumber: order.orderNumber })}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-gold/30 hover:bg-gold/10 hover:text-gold sm:w-auto"
                                >
                                    <FileDown className="mr-2 h-4 w-4" />
                                    {t('orders.download_invoice', 'Download Invoice')}
                                </Button>
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* Order Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                >
                    <Card className="border-gold/20 bg-gradient-to-br from-gold/5 to-transparent">
                        <CardContent className="p-4 md:p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                        {t('orders.order_total', 'Order Total')}
                                    </p>
                                    <p className="text-3xl font-bold text-gold md:text-4xl">
                                        {formatPrice(order.total)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg bg-background/50 px-3 py-2">
                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('orders.payment_status', 'Payment')}
                                        </p>
                                        <p className="text-sm font-bold uppercase">
                                            {t(`orders.payment.${order.paymentStatus}`, order.paymentStatus)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Order Items */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                                <Package className="h-5 w-5 text-gold" />
                                {t('orders.order_items', 'Order Items')} ({order.items.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 p-4 md:p-6">
                            {order.items.map((item, index) => {
                                const lineTotal = item.unitPrice * item.quantity;

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + index * 0.05, duration: 0.4 }}
                                        className="flex gap-3 rounded-lg border border-border bg-muted/20 p-3 transition-colors hover:bg-muted/30 md:gap-4 md:p-4"
                                    >
                                        {/* Product Image */}
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted md:h-20 md:w-20">
                                            <img
                                                src={item.product?.image || '/placeholder.png'}
                                                alt={item.productName}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex flex-1 flex-col justify-between gap-2">
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold uppercase tracking-wide line-clamp-1 md:text-base">
                                                    {item.productName}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                    {item.variantSize && (
                                                        <>
                                                            <span className="uppercase">
                                                                {t('orders.size', 'Size')}: {item.variantSize}
                                                            </span>
                                                            <span className="hidden sm:inline">•</span>
                                                        </>
                                                    )}
                                                    <span className="font-mono text-muted-foreground/80">
                                                        SKU: {item.productSku}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    {item.originalUnitPrice ? (
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="text-muted-foreground/60 line-through text-xs">
                                                                {formatPrice(item.originalUnitPrice)}
                                                            </span>
                                                            <span className="text-green-600 dark:text-green-400 font-medium">
                                                                {formatPrice(item.unitPrice)}
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            {formatPrice(item.unitPrice)}
                                                        </span>
                                                    )}
                                                    <span className="text-muted-foreground">x</span>
                                                    <span className="rounded-md bg-gold/10 px-2 py-1 font-bold text-gold">
                                                        {item.quantity}
                                                    </span>
                                                </div>
                                                <p className="text-base font-bold text-gold md:text-lg">
                                                    {formatPrice(lineTotal)}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {/* Order Totals */}
                            <div className="mt-4 space-y-2.5 rounded-lg border border-border bg-background p-4">
                                {/* Product Price (original before product discount) */}
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('checkout.product_price', 'Product Price')}</span>
                                    <span className="font-medium">{formatPrice(order.originalSubtotal)}</span>
                                </div>

                                {/* Product Discount */}
                                {order.productDiscount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                        <span className="font-medium">{t('checkout.product_discount', 'Product Discount')}</span>
                                        <span className="font-bold">-{formatPrice(order.productDiscount)}</span>
                                    </div>
                                )}

                                {/* Subtotal (after product discount) */}
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('checkout.subtotal', 'Subtotal')}</span>
                                    <span className="font-medium">{formatPrice(order.subtotal)}</span>
                                </div>

                                {/* Price excl. VAT */}
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('checkout.price_excl_vat', 'Price excl. VAT')}</span>
                                    <span className="font-medium">{formatPrice(order.subtotalExclVat)}</span>
                                </div>

                                {/* VAT */}
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('checkout.vat', 'VAT')} (21%)</span>
                                    <span className="font-medium">{formatPrice(order.vatAmount)}</span>
                                </div>

                                {/* Promo Code Discount (applied before shipping) */}
                                {order.promoCodeDiscount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                        <span className="font-medium">
                                            {t('checkout.promo_code_discount', 'Promo Code')}
                                            {order.promoCode && (
                                                <span className="ml-1 font-mono text-xs">({order.promoCode.code})</span>
                                            )}
                                        </span>
                                        <span className="font-bold">-{formatPrice(order.promoCodeDiscount)}</span>
                                    </div>
                                )}

                                {/* Shipping (added after promo code) */}
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('orders.shipping', 'Shipping')}</span>
                                    <span className="font-medium">{formatPrice(order.shippingCost)}</span>
                                </div>

                                {/* Grand Total */}
                                <div className="flex justify-between border-t border-border pt-2.5 text-base font-bold md:text-lg">
                                    <span className="uppercase tracking-wide">{t('checkout.grand_total', 'Grand Total')}</span>
                                    <span className="text-gold">{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Customer & Shipping Info Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <Card className="h-full">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                    <User className="h-5 w-5 text-gold" />
                                    {t('orders.customer_info', 'Customer Information')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 p-4 md:p-6">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-gold/10 p-2">
                                        <Mail className="h-4 w-4 text-gold" />
                                    </div>
                                    <div className="flex-1 space-y-0.5">
                                        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                            {t('orders.email', 'Email')}
                                        </p>
                                        <p className="text-sm font-medium break-words">{order.customerEmail}</p>
                                    </div>
                                </div>
                                {order.shippingAddress.phone && (
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-gold/10 p-2">
                                            <Phone className="h-4 w-4 text-gold" />
                                        </div>
                                        <div className="flex-1 space-y-0.5">
                                            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                                {t('orders.phone', 'Phone')}
                                            </p>
                                            <p className="text-sm font-medium">{order.shippingAddress.phone}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Shipping Address */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.5 }}
                        className="md:col-span-1 lg:col-span-1"
                    >
                        <Card className="h-full">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                    <MapPin className="h-5 w-5 text-gold" />
                                    {t('orders.shipping_address', 'Shipping Address')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 p-4 md:p-6">
                                <div className="rounded-lg bg-muted/40 p-3">
                                    <p className="font-bold text-sm mb-1">
                                        {order.shippingAddress.fullName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{order.shippingAddress.streetAddress}</p>
                                    {order.shippingAddress.apartment && (
                                        <p className="text-sm text-muted-foreground">{order.shippingAddress.apartment}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                                    </p>
                                    {order.shippingAddress.state && (
                                        <p className="text-sm text-muted-foreground">{order.shippingAddress.state}</p>
                                    )}
                                    <p className="text-sm font-medium mt-1">{order.shippingAddress.country}</p>
                                </div>

                                {/* Delivery Method */}
                                {order.shippingMethod && (
                                    <div className="rounded-lg border border-border bg-background p-3">
                                        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                            {t('orders.delivery_method', 'Delivery Method')}
                                        </p>
                                        <p className="mt-1 text-sm font-bold capitalize">
                                            {order.shippingMethod.replace(/-/g, ' ')}
                                        </p>
                                    </div>
                                )}

                                {/* Venipak Pickup Point */}
                                {order.venipakPickupPoint && (
                                    <div className="rounded-lg border border-gold/20 bg-gold/5 p-3">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 shrink-0 text-gold mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                                    {t('orders.pickup_point', 'Pickup Point')}
                                                </p>
                                                <p className="mt-1 text-sm font-bold">{order.venipakPickupPoint.name}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {order.venipakPickupPoint.address}, {order.venipakPickupPoint.city}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Tracking & Notes */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="md:col-span-2 lg:col-span-1 space-y-4"
                    >
                        {/* Tracking Information */}
                        {(order.trackingNumber || order.venipakPackNo) && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                        <Truck className="h-5 w-5 text-gold" />
                                        {t('orders.tracking', 'Tracking')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 md:p-6 space-y-4">
                                    <div className="rounded-lg border border-gold/20 bg-gold/5 p-4">
                                        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                                            {t('orders.tracking_number', 'Tracking Number')}
                                        </p>
                                        <p className="font-mono text-sm font-bold text-gold break-all md:text-base">
                                            {order.venipakPackNo || order.trackingNumber}
                                        </p>
                                    </div>

                                    {/* Secondary carrier tracking (for global shipments) */}
                                    {order.venipakCarrierTracking && (
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 p-4">
                                            <p className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300 mb-2">
                                                {t('orders.carrier_tracking', 'Carrier Tracking')}
                                                {order.venipakCarrierCode && (
                                                    <span className="ml-2 text-blue-500 dark:text-blue-400 normal-case font-normal">
                                                        ({order.venipakCarrierCode})
                                                    </span>
                                                )}
                                            </p>
                                            <p className="font-mono text-sm font-bold text-blue-900 dark:text-blue-100 break-all md:text-base">
                                                {order.venipakCarrierTracking}
                                            </p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                                {t('orders.carrier_tracking_note', 'Use this number to track with the delivery carrier')}
                                            </p>
                                        </div>
                                    )}

                                    {/* Venipak tracking status */}
                                    {order.venipakStatus && (
                                        <div className="rounded-lg border border-gold/20 bg-gold/5 p-4">
                                            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                                                {t('orders.tracking_status', 'Tracking Status')}
                                            </p>
                                            <p className="text-base font-bold text-foreground">
                                                {translateVenipakStatus(order.venipakStatus)}
                                            </p>
                                            {order.venipakStatusUpdatedAt && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {t('orders.last_updated', 'Last updated')}: {formatDate(order.venipakStatusUpdatedAt)}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Tracking links */}
                                    {order.venipakTrackingUrl && (
                                        <a
                                            href={order.venipakTrackingUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sm text-gold hover:underline"
                                        >
                                            {t('orders.view_full_tracking', 'View full tracking page')}
                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Customer Notes */}
                        {order.customerNotes && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base md:text-lg">
                                        {t('orders.notes', 'Notes')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 md:p-6">
                                    <div className="rounded-lg bg-muted/40 p-3">
                                        <p className="text-sm text-foreground">
                                            {order.customerNotes}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
