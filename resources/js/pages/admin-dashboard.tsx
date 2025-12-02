import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Package,
    ShoppingBag,
    Users,
    Eye,
    TrendingUp,
    Clock,
    CheckCircle,
    Truck,
    BoxIcon,
    ArrowRight,
} from 'lucide-react';

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    status: string;
    payment_status: string;
    total: number;
    items_count: number;
    created_at: string;
}

interface Stats {
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    processingOrders: number;
    shippedOrders: number;
    completedOrders: number;
    todayOrders: number;
    todayRevenue: number;
}

interface AdminDashboardProps {
    auth: {
        user: User;
    };
    stats: Stats;
    recentOrders: Order[];
    statuses: Record<string, string>;
    paymentStatuses: Record<string, string>;
}

export default function AdminDashboard({
    auth,
    stats,
    recentOrders,
    statuses,
    paymentStatuses: _paymentStatuses,
}: AdminDashboardProps) {
    // Note: paymentStatuses available for future use
    void _paymentStatuses;
    const { t, route } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('dashboard.title', 'Dashboard'),
            href: route('dashboard'),
        },
    ];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    const getStatusBadgeColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-500 text-white hover:bg-yellow-600',
            confirmed: 'bg-blue-500 text-white hover:bg-blue-600',
            processing: 'bg-indigo-500 text-white hover:bg-indigo-600',
            shipped: 'bg-purple-500 text-white hover:bg-purple-600',
            completed: 'bg-green-500 text-white hover:bg-green-600',
            cancelled: 'bg-red-500 text-white hover:bg-red-600',
        };
        return colors[status] || 'bg-gray-500 text-white hover:bg-gray-600';
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getPaymentStatusBadgeColor = (paymentStatus: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-500 text-white hover:bg-yellow-600',
            paid: 'bg-green-500 text-white hover:bg-green-600',
            failed: 'bg-red-500 text-white hover:bg-red-600',
            refunded: 'bg-gray-500 text-white hover:bg-gray-600',
        };
        return colors[paymentStatus] || 'bg-gray-500 text-white hover:bg-gray-600';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dashboard.title', 'Dashboard')} />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold uppercase tracking-wide text-gold sm:text-3xl">
                            {t('dashboard.admin.hello', 'Hello, {name}!').replace('{name}', auth.user.name)}
                        </h1>
                        <p className="mt-2 text-gray-600">
                            {t('dashboard.admin.welcome', 'Welcome to your admin dashboard.')}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <Card className="border-gold/20">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-100 p-2">
                                        <Clock className="size-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {stats.confirmedOrders}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {t('dashboard.admin.confirmed', 'Confirmed')}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gold/20">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-indigo-100 p-2">
                                        <Package className="size-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-indigo-600">
                                            {stats.processingOrders}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {t('dashboard.admin.processing', 'Processing')}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gold/20">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-purple-100 p-2">
                                        <Truck className="size-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-purple-600">
                                            {stats.shippedOrders}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {t('dashboard.admin.shipped', 'Shipped')}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gold/20">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-green-100 p-2">
                                        <CheckCircle className="size-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">
                                            {stats.completedOrders}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {t('dashboard.admin.completed', 'Completed')}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Today Stats */}
                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Card className="border-gold/20 bg-gradient-to-br from-gold/5 to-gold/10">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            {t('dashboard.admin.today_orders', "Today's Orders")}
                                        </p>
                                        <p className="mt-1 text-3xl font-bold text-gold">
                                            {stats.todayOrders}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-gold/20 p-3">
                                        <ShoppingBag className="size-6 text-gold" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gold/20 bg-gradient-to-br from-green-50 to-green-100">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            {t('dashboard.admin.today_revenue', "Today's Revenue")}
                                        </p>
                                        <p className="mt-1 text-3xl font-bold text-green-600">
                                            {formatPrice(stats.todayRevenue)}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-green-200 p-3">
                                        <TrendingUp className="size-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Recent Orders */}
                        <div className="lg:col-span-2">
                            <Card className="border-gold/20">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gold">
                                                <Package className="size-5" />
                                                {t('dashboard.admin.orders_to_process', 'Orders to Process')}
                                            </CardTitle>
                                            <CardDescription>
                                                {t('dashboard.admin.orders_description', 'Confirmed, processing, and shipped orders')}
                                            </CardDescription>
                                        </div>
                                        <Link href={route('admin.orders.index')}>
                                            <Button variant="outline" size="sm" className="border-gold/20 text-gold hover:bg-gold/5">
                                                {t('dashboard.admin.view_all', 'View All')}
                                                <ArrowRight className="ml-2 size-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {recentOrders.length === 0 ? (
                                        <div className="py-8 text-center text-gray-500">
                                            {t('dashboard.admin.no_orders', 'No orders to process')}
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-gold/20">
                                                        <TableHead className="font-semibold text-gray-900">
                                                            {t('orders.order', 'Order')}
                                                        </TableHead>
                                                        <TableHead className="font-semibold text-gray-900">
                                                            {t('orders.customer', 'Customer')}
                                                        </TableHead>
                                                        <TableHead className="font-semibold text-gray-900">
                                                            {t('orders.status', 'Status')}
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
                                                    {recentOrders.map((order) => (
                                                        <TableRow
                                                            key={order.id}
                                                            className="border-gold/10 transition-colors hover:bg-gold/5"
                                                        >
                                                            <TableCell>
                                                                <div className="font-medium text-gray-900">
                                                                    {order.order_number}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {order.created_at}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="text-sm text-gray-900">
                                                                    {order.customer_name}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {order.customer_email}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={getStatusBadgeColor(order.status)}>
                                                                    {statuses[order.status] || order.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right font-semibold text-gray-900">
                                                                {formatPrice(order.total)}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Link href={route('admin.orders.show', { order: order.id })}>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="border-gold/20 text-gold hover:bg-gold/5"
                                                                    >
                                                                        <Eye className="size-4" />
                                                                    </Button>
                                                                </Link>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-6">
                            <Card className="border-gold/20">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gold">
                                        {t('dashboard.quick_actions', 'Quick Actions')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Link href={route('admin.orders.index')} className="block">
                                        <div className="flex items-center gap-3 rounded-lg border border-gold/20 p-3 transition-colors hover:bg-gold/5">
                                            <div className="rounded-lg bg-gold/10 p-2">
                                                <Package className="size-5 text-gold" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {t('dashboard.admin.manage_orders', 'Manage Orders')}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {t('dashboard.admin.manage_orders_desc', 'View and process all orders')}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>

                                    <Link href={route('admin.products.index')} className="block">
                                        <div className="flex items-center gap-3 rounded-lg border border-gold/20 p-3 transition-colors hover:bg-gold/5">
                                            <div className="rounded-lg bg-gold/10 p-2">
                                                <BoxIcon className="size-5 text-gold" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {t('dashboard.admin.manage_products', 'Manage Products')}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {t('dashboard.admin.manage_products_desc', 'Add, edit, or remove products')}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>

                                    <Link href={route('admin.users.index')} className="block">
                                        <div className="flex items-center gap-3 rounded-lg border border-gold/20 p-3 transition-colors hover:bg-gold/5">
                                            <div className="rounded-lg bg-gold/10 p-2">
                                                <Users className="size-5 text-gold" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {t('dashboard.admin.manage_users', 'Manage Users')}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {t('dashboard.admin.manage_users_desc', 'View customer accounts')}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </CardContent>
                            </Card>

                            {/* Order Stats Summary */}
                            <Card className="border-gold/20">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gold">
                                        {t('dashboard.admin.order_summary', 'Order Summary')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">
                                            {t('dashboard.admin.total_orders', 'Total Orders')}
                                        </span>
                                        <span className="font-semibold text-gray-900">{stats.totalOrders}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">
                                            {t('dashboard.admin.pending_payment', 'Pending Payment')}
                                        </span>
                                        <span className="font-semibold text-yellow-600">{stats.pendingOrders}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">
                                            {t('dashboard.admin.needs_processing', 'Needs Processing')}
                                        </span>
                                        <span className="font-semibold text-blue-600">
                                            {stats.confirmedOrders + stats.processingOrders}
                                        </span>
                                    </div>
                                    <div className="border-t border-gold/10 pt-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-900">
                                                {t('dashboard.admin.completed_total', 'Completed')}
                                            </span>
                                            <span className="font-bold text-green-600">{stats.completedOrders}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
