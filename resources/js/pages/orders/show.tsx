import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SEO from '@/components/seo';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/hooks/use-translation';
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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OrderItem {
    id: number;
    productName: string;
    productSku: string;
    variantSize: string;
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
    subtotal: number;
    tax: number;
    shippingCost: number;
    discount: number;
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

    // Normalize order data - handle both direct Order and ResourceCollection format
    const order = 'data' in orderData ? orderData.data : orderData;

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
        return new Date(dateString).toLocaleDateString('en-US', {
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
                                                    <span className="text-muted-foreground">
                                                        {formatPrice(item.unitPrice)} x
                                                    </span>
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
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('orders.subtotal', 'Subtotal')}</span>
                                    <span className="font-medium">{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('orders.shipping', 'Shipping')}</span>
                                    <span className="font-medium">{formatPrice(order.shippingCost)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('orders.tax', 'Tax')}</span>
                                    <span className="font-medium">{formatPrice(order.tax)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span className="font-medium">{t('orders.discount', 'Discount')}</span>
                                        <span className="font-bold">-{formatPrice(order.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-border pt-2.5 text-base font-bold md:text-lg">
                                    <span className="uppercase tracking-wide">{t('orders.total', 'Total')}</span>
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
                        {order.trackingNumber && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                        <Truck className="h-5 w-5 text-gold" />
                                        {t('orders.tracking', 'Tracking')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 md:p-6">
                                    <div className="rounded-lg border border-gold/20 bg-gold/5 p-4">
                                        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                                            {t('orders.tracking_number', 'Tracking Number')}
                                        </p>
                                        <p className="font-mono text-sm font-bold text-gold break-all md:text-base">
                                            {order.trackingNumber}
                                        </p>
                                    </div>
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
