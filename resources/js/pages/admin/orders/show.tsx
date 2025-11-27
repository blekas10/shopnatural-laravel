import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    Download,
    ExternalLink,
    Package,
    MapPin,
    User,
    FileText,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface OrderItem {
    id: number;
    product_name: string;
    product_sku: string;
    variant_size: string;
    unit_price: string;
    quantity: number;
    total: string;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    customer_email: string;
    customer_phone: string;
    customer_notes: string | null;
    billing_first_name: string;
    billing_last_name: string;
    billing_address: string;
    billing_city: string;
    billing_state: string | null;
    billing_postal_code: string;
    billing_country: string;
    shipping_first_name: string;
    shipping_last_name: string;
    shipping_address: string;
    shipping_city: string;
    shipping_state: string | null;
    shipping_postal_code: string;
    shipping_country: string;
    shipping_method: string | null;
    venipak_pickup_point: { id: string; name: string; address: string; city: string } | null;
    tracking_number: string | null;
    subtotal: string;
    tax: string;
    shipping_cost: string;
    discount: string;
    total: string;
    currency: string;
    created_at: string;
    updated_at: string;
    shipped_at: string | null;
    delivered_at: string | null;
    items: OrderItem[];
}

interface OrderShowProps {
    order: Order;
    statuses: Record<string, string>;
    paymentStatuses: Record<string, string>;
}

export default function OrderShow({ order, statuses, paymentStatuses }: OrderShowProps) {
    const { t, route } = useTranslation();
    const [selectedStatus, setSelectedStatus] = useState(order.status);
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(order.payment_status);
    const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
    const [saving, setSaving] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('sidebar.dashboard', 'Dashboard'),
            href: route('dashboard'),
        },
        {
            title: t('sidebar.orders', 'Orders'),
            href: route('admin.orders.index'),
        },
        {
            title: order.order_number,
            href: route('admin.orders.show', { order: order.id }),
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

    const formatPrice = (price: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: order.currency || 'EUR',
        }).format(parseFloat(price));
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

    const getPaymentStatusBadgeColor = (paymentStatus: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-500 text-white hover:bg-yellow-600',
            paid: 'bg-green-500 text-white hover:bg-green-600',
            failed: 'bg-red-500 text-white hover:bg-red-600',
            refunded: 'bg-gray-500 text-white hover:bg-gray-600',
        };
        return colors[paymentStatus] || 'bg-gray-500 text-white hover:bg-gray-600';
    };

    const handleStatusUpdate = () => {
        if (saving) return;

        setSaving(true);
        router.patch(
            route('admin.orders.update-status', { order: order.id }),
            {
                status: selectedStatus,
                tracking_number: selectedStatus === 'shipped' ? trackingNumber : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('orders.status_updated', 'Order status updated successfully'));
                },
                onError: (errors) => {
                    toast.error(errors.status || t('orders.status_update_failed', 'Failed to update order status'));
                },
                onFinish: () => {
                    setSaving(false);
                },
            }
        );
    };

    const handlePaymentStatusUpdate = () => {
        if (saving) return;

        setSaving(true);
        router.patch(
            route('admin.orders.update-payment-status', { order: order.id }),
            {
                payment_status: selectedPaymentStatus,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('orders.payment_status_updated', 'Payment status updated successfully'));
                },
                onError: (errors) => {
                    toast.error(errors.payment_status || t('orders.payment_status_update_failed', 'Failed to update payment status'));
                },
                onFinish: () => {
                    setSaving(false);
                },
            }
        );
    };

    const handleViewInvoice = () => {
        window.open(route('admin.orders.invoice.view', { order: order.id }), '_blank');
    };

    const handleDownloadInvoice = () => {
        window.location.href = route('admin.orders.invoice.download', { order: order.id });
        toast.success(t('orders.invoice_downloading', 'Invoice download started'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('orders.order', 'Order')} ${order.order_number}`} />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-6 sm:mb-8">
                        <Link href={route('admin.orders.index')}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mb-4 hover:bg-gold/10 text-gray-600"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t('orders.back_to_orders', 'Back to Orders')}
                            </Button>
                        </Link>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide text-gold">
                                    {t('orders.order', 'Order')} {order.order_number}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {t('orders.placed_on', 'Placed on')} {formatDate(order.created_at)}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Badge className={getStatusBadgeColor(order.status)}>
                                    {statuses[order.status] || order.status}
                                </Badge>
                                <Badge className={getPaymentStatusBadgeColor(order.payment_status)}>
                                    {paymentStatuses[order.payment_status] || order.payment_status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Status Update Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gold flex items-center gap-2">
                                        <Package className="w-5 h-5" />
                                        {t('orders.update_status', 'Update Status')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('orders.update_status_description', 'Change order and payment status')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="order-status">
                                                {t('orders.order_status', 'Order Status')}
                                            </Label>
                                            <Select
                                                value={selectedStatus}
                                                onValueChange={setSelectedStatus}
                                            >
                                                <SelectTrigger id="order-status">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(statuses).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="payment-status">
                                                {t('orders.payment_status', 'Payment Status')}
                                            </Label>
                                            <Select
                                                value={selectedPaymentStatus}
                                                onValueChange={setSelectedPaymentStatus}
                                            >
                                                <SelectTrigger id="payment-status">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(paymentStatuses).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {selectedStatus === 'shipped' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="tracking-number">
                                                {t('orders.tracking_number', 'Tracking Number')}
                                            </Label>
                                            <Input
                                                id="tracking-number"
                                                value={trackingNumber}
                                                onChange={(e) => setTrackingNumber(e.target.value)}
                                                placeholder={t('orders.enter_tracking', 'Enter tracking number')}
                                            />
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            onClick={handleStatusUpdate}
                                            disabled={saving || selectedStatus === order.status}
                                            className="bg-gold hover:bg-gold/90 text-white"
                                        >
                                            {saving ? t('common.saving', 'Saving...') : t('orders.update_order_status', 'Update Order Status')}
                                        </Button>
                                        <Button
                                            onClick={handlePaymentStatusUpdate}
                                            disabled={saving || selectedPaymentStatus === order.payment_status}
                                            variant="outline"
                                            className="border-gold/30 hover:bg-gold/10"
                                        >
                                            {t('orders.update_payment_status', 'Update Payment Status')}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Order Items */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gold">
                                        {t('orders.order_items', 'Order Items')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-gold/20">
                                                    <TableHead className="font-semibold text-gray-900">
                                                        {t('orders.product', 'Product')}
                                                    </TableHead>
                                                    <TableHead className="font-semibold text-gray-900">
                                                        {t('orders.sku', 'SKU')}
                                                    </TableHead>
                                                    <TableHead className="font-semibold text-gray-900">
                                                        {t('orders.size', 'Size')}
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold text-gray-900">
                                                        {t('orders.unit_price', 'Unit Price')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-semibold text-gray-900">
                                                        {t('orders.quantity', 'Quantity')}
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold text-gray-900">
                                                        {t('orders.total', 'Total')}
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {order.items.map((item) => (
                                                    <TableRow
                                                        key={item.id}
                                                        className="hover:bg-gold/5 transition-colors border-gold/10"
                                                    >
                                                        <TableCell className="font-medium text-gray-900">
                                                            {item.product_name}
                                                        </TableCell>
                                                        <TableCell className="font-mono text-sm text-gray-600">
                                                            {item.product_sku}
                                                        </TableCell>
                                                        <TableCell className="text-gray-600">
                                                            {item.variant_size}
                                                        </TableCell>
                                                        <TableCell className="text-right text-gray-900">
                                                            {formatPrice(item.unit_price)}
                                                        </TableCell>
                                                        <TableCell className="text-center text-gray-900">
                                                            {item.quantity}
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium text-gray-900">
                                                            {formatPrice(item.total)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Customer Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gold flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        {t('orders.customer_information', 'Customer Information')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs font-medium text-gray-500 uppercase">
                                                {t('orders.email', 'Email')}
                                            </Label>
                                            <p className="mt-1 text-sm text-gray-900">{order.customer_email}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-medium text-gray-500 uppercase">
                                                {t('orders.phone', 'Phone')}
                                            </Label>
                                            <p className="mt-1 text-sm text-gray-900">{order.customer_phone}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                                        <div>
                                            <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                                                {t('orders.billing_address', 'Billing Address')}
                                            </Label>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p className="font-medium text-gray-900">
                                                    {order.billing_first_name} {order.billing_last_name}
                                                </p>
                                                <p>{order.billing_address}</p>
                                                <p>
                                                    {order.billing_city}, {order.billing_postal_code}
                                                </p>
                                                {order.billing_state && <p>{order.billing_state}</p>}
                                                <p>{order.billing_country}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                                                {t('orders.shipping_address', 'Shipping Address')}
                                            </Label>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p className="font-medium text-gray-900">
                                                    {order.shipping_first_name} {order.shipping_last_name}
                                                </p>
                                                <p>{order.shipping_address}</p>
                                                <p>
                                                    {order.shipping_city}, {order.shipping_postal_code}
                                                </p>
                                                {order.shipping_state && <p>{order.shipping_state}</p>}
                                                <p>{order.shipping_country}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {order.customer_notes && (
                                        <div className="pt-4 border-t border-gold/10">
                                            <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                                                {t('orders.customer_notes', 'Customer Notes')}
                                            </Label>
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                                {order.customer_notes}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gold">
                                        {t('orders.order_summary', 'Order Summary')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{t('orders.subtotal', 'Subtotal')}</span>
                                        <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{t('orders.shipping', 'Shipping')}</span>
                                        <span className="text-gray-900">{formatPrice(order.shipping_cost)}</span>
                                    </div>
                                    {parseFloat(order.discount) > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">{t('orders.discount', 'Discount')}</span>
                                            <span className="text-red-600">-{formatPrice(order.discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{t('orders.tax', 'Tax')}</span>
                                        <span className="text-gray-900">{formatPrice(order.tax)}</span>
                                    </div>
                                    <div className="border-t border-gold/20 pt-3 flex justify-between">
                                        <span className="text-lg font-bold text-gray-900">
                                            {t('orders.total', 'Total')}
                                        </span>
                                        <span className="text-xl font-bold text-gold">
                                            {formatPrice(order.total)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Shipping Details */}
                            {(order.shipping_method || order.tracking_number || order.venipak_pickup_point) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg font-semibold text-gold flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            {t('orders.shipping_details', 'Shipping Details')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {order.shipping_method && (
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 uppercase">
                                                    {t('orders.shipping_method', 'Shipping Method')}
                                                </Label>
                                                <p className="mt-1 text-sm text-gray-900 font-medium">
                                                    {order.shipping_method}
                                                </p>
                                            </div>
                                        )}

                                        {order.tracking_number && (
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 uppercase">
                                                    {t('orders.tracking_number', 'Tracking Number')}
                                                </Label>
                                                <p className="mt-1 text-sm text-gray-900 font-mono">
                                                    {order.tracking_number}
                                                </p>
                                            </div>
                                        )}

                                        {order.venipak_pickup_point && (
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 uppercase">
                                                    {t('orders.pickup_point', 'Pickup Point')}
                                                </Label>
                                                <div className="mt-1 text-sm text-gray-900 space-y-1">
                                                    <p className="font-medium">{order.venipak_pickup_point.name}</p>
                                                    <p className="text-gray-600">{order.venipak_pickup_point.address}</p>
                                                    <p className="text-gray-600">
                                                        {order.venipak_pickup_point.city}, {order.venipak_pickup_point.zip}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {order.shipped_at && (
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 uppercase">
                                                    {t('orders.shipped_at', 'Shipped At')}
                                                </Label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {formatDate(order.shipped_at)}
                                                </p>
                                            </div>
                                        )}

                                        {order.delivered_at && (
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 uppercase">
                                                    {t('orders.delivered_at', 'Delivered At')}
                                                </Label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {formatDate(order.delivered_at)}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gold flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        {t('orders.actions', 'Actions')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        onClick={handleViewInvoice}
                                        variant="outline"
                                        className="w-full border-gold/30 hover:bg-gold/10"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        {t('orders.view_invoice', 'View Invoice')}
                                    </Button>
                                    <Button
                                        onClick={handleDownloadInvoice}
                                        variant="outline"
                                        className="w-full border-gold/30 hover:bg-gold/10"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        {t('orders.download_invoice', 'Download Invoice')}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
