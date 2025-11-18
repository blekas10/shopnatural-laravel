import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, FileDown, Search, X } from 'lucide-react';
import { useState } from 'react';

interface Order {
    id: number;
    order_number: string;
    customer_email: string;
    customer_name: string;
    status: string;
    payment_status: string;
    total: string;
    currency: string;
    items_count: number;
    created_at: string;
    shipping_method: string | null;
}

interface Pagination {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface OrdersIndexProps {
    orders: Pagination;
    filters: {
        status?: string;
        payment_status?: string;
        search?: string;
        date_from?: string;
        date_to?: string;
    };
    statuses: Record<string, string>;
    paymentStatuses: Record<string, string>;
}

export default function OrdersIndex({ orders, filters, statuses, paymentStatuses }: OrdersIndexProps) {
    const { t, route } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('sidebar.dashboard', 'Dashboard'),
            href: route('dashboard'),
        },
        {
            title: t('sidebar.orders', 'Orders'),
            href: route('admin.orders.index'),
        },
    ];

    const handleFilter = () => {
        router.get(route('admin.orders.index'), {
            search,
            status,
            payment_status: paymentStatus,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatus('');
        setPaymentStatus('');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.orders.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500 text-white hover:bg-yellow-600';
            case 'processing':
                return 'bg-blue-500 text-white hover:bg-blue-600';
            case 'shipped':
                return 'bg-purple-500 text-white hover:bg-purple-600';
            case 'delivered':
                return 'bg-green-500 text-white hover:bg-green-600';
            case 'cancelled':
                return 'bg-red-500 text-white hover:bg-red-600';
            default:
                return 'bg-gray-500 text-white hover:bg-gray-600';
        }
    };

    const getPaymentBadgeVariant = (paymentStatus: string) => {
        switch (paymentStatus) {
            case 'paid':
                return 'bg-green-500 text-white hover:bg-green-600';
            case 'pending':
                return 'bg-yellow-500 text-white hover:bg-yellow-600';
            case 'failed':
                return 'bg-red-500 text-white hover:bg-red-600';
            case 'refunded':
                return 'bg-orange-500 text-white hover:bg-orange-600';
            default:
                return 'bg-gray-500 text-white hover:bg-gray-600';
        }
    };

    const hasActiveFilters = search || status || paymentStatus || dateFrom || dateTo;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('sidebar.orders', 'Orders')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Header */}
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold uppercase tracking-wide text-gold">
                                    {t('orders.title', 'Orders')}
                                </h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    {t('orders.subtitle', 'Manage customer orders and update their status')}
                                </p>
                            </div>

                            {/* Filters */}
                            <div className="mb-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <div className="space-y-2">
                            <Label htmlFor="search">{t('common.search', 'Search')}</Label>
                            <div className="relative">
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder={t('orders.search_placeholder', 'Order #, email, name...')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    className="border-gold/20 pr-10 focus:border-gold focus:ring-gold"
                                />
                                <Search className="absolute right-3 top-2.5 size-5 text-gray-400" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">{t('orders.status', 'Status')}</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger id="status" className="border-gold/20 focus:border-gold focus:ring-gold">
                                    <SelectValue placeholder={t('common.all', 'All')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                                    {Object.entries(statuses).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payment_status">{t('orders.payment_status', 'Payment Status')}</Label>
                            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                                <SelectTrigger id="payment_status" className="border-gold/20 focus:border-gold focus:ring-gold">
                                    <SelectValue placeholder={t('common.all', 'All')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                                    {Object.entries(paymentStatuses).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date_from">{t('orders.date_from', 'From Date')}</Label>
                            <Input
                                id="date_from"
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="border-gold/20 focus:border-gold focus:ring-gold"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date_to">{t('orders.date_to', 'To Date')}</Label>
                            <Input
                                id="date_to"
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="border-gold/20 focus:border-gold focus:ring-gold"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <Button
                            onClick={handleFilter}
                            className="bg-gold text-white hover:bg-gold/90"
                        >
                            <Search className="mr-2 size-4" />
                            {t('common.filter', 'Filter')}
                        </Button>
                        {hasActiveFilters && (
                            <Button
                                onClick={handleClearFilters}
                                variant="outline"
                                className="border-gold/20 text-gold hover:bg-gold/5"
                            >
                                <X className="mr-2 size-4" />
                                {t('common.clear', 'Clear')}
                            </Button>
                        )}
                    </div>
                            </div>

                            {/* Orders Table */}
                            <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gold/10 hover:bg-gold/5">
                                <TableHead className="font-semibold text-gray-900">
                                    {t('orders.order_number', 'Order #')}
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900">
                                    {t('orders.customer', 'Customer')}
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900">
                                    {t('orders.date', 'Date')}
                                </TableHead>
                                <TableHead className="text-center font-semibold text-gray-900">
                                    {t('orders.items', 'Items')}
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900">
                                    {t('orders.status', 'Status')}
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900">
                                    {t('orders.payment', 'Payment')}
                                </TableHead>
                                <TableHead className="text-right font-semibold text-gray-900">
                                    {t('orders.total', 'Total')}
                                </TableHead>
                                <TableHead className="text-right font-semibold text-gray-900">
                                    {t('common.actions', 'Actions')}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-gray-500 py-12">
                                        {t('orders.no_orders', 'No orders found')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.data.map((order) => (
                                    <TableRow
                                        key={order.id}
                                        className="hover:bg-gold/5 transition-colors border-gold/10"
                                    >
                                        <TableCell className="font-medium text-gold">
                                            {order.order_number}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {order.customer_name}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {order.customer_email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                            {order.created_at}
                                        </TableCell>
                                        <TableCell className="text-center text-gray-600">
                                            {order.items_count}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusBadgeVariant(order.status)}>
                                                {statuses[order.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getPaymentBadgeVariant(order.payment_status)}>
                                                {paymentStatuses[order.payment_status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-gray-900">
                                            €{parseFloat(order.total).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('admin.orders.show', { order: order.id })}>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-gold/20 text-gold hover:bg-gold/5"
                                                    >
                                                        <Eye className="size-4" />
                                                    </Button>
                                                </Link>
                                                <a
                                                    href={route('admin.orders.invoice.download', { order: order.id })}
                                                    download
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-teal/20 text-teal hover:bg-teal/5"
                                                    >
                                                        <FileDown className="size-4" />
                                                    </Button>
                                                </a>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {orders.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gold/10 p-4">
                            <div className="text-sm text-gray-600">
                                {t('common.showing', 'Showing')} {orders.data.length} {t('common.of', 'of')} {orders.total} {t('common.results', 'results')}
                            </div>
                            <div className="flex gap-1">
                                {orders.links.map((link, index) => {
                                    if (!link.url) return null;

                                    return (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            preserveState
                                            preserveScroll
                                        >
                                            <Button
                                                size="sm"
                                                variant={link.active ? 'default' : 'outline'}
                                                className={link.active ? 'bg-gold text-white hover:bg-gold/90' : 'border-gold/20 hover:bg-gold/5'}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
