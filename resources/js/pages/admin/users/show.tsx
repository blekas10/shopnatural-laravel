import { Head, Link } from '@inertiajs/react';
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
    User,
    Mail,
    Phone,
    MapPin,
    ShoppingBag,
    CreditCard,
    Calendar,
    CheckCircle,
    XCircle,
    Eye,
} from 'lucide-react';

interface UserOrder {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total: number;
    items_count: number;
    created_at: string;
}

interface UserStats {
    total_orders: number;
    total_spent: number;
    average_order: number;
    completed_orders: number;
    pending_orders: number;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    email_verified: boolean;
    email_verified_at: string | null;
    roles: string[];
    created_at: string;
    updated_at: string;
    billing_address: string | null;
    billing_city: string | null;
    billing_state: string | null;
    billing_postal_code: string | null;
    billing_country: string | null;
    shipping_address: string | null;
    shipping_city: string | null;
    shipping_state: string | null;
    shipping_postal_code: string | null;
    shipping_country: string | null;
}

interface UserShowProps {
    user: UserData;
    stats: UserStats;
    orders: UserOrder[];
    statuses: Record<string, string>;
    paymentStatuses: Record<string, string>;
}

export default function UserShow({
    user,
    stats,
    orders,
    statuses,
    paymentStatuses,
}: UserShowProps) {
    const { t, route } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('sidebar.dashboard', 'Dashboard'),
            href: route('dashboard'),
        },
        {
            title: t('sidebar.manage_users', 'Manage Users'),
            href: route('admin.users.index'),
        },
        {
            title: user.name,
            href: route('admin.users.show', { user: user.id }),
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

    const getPaymentStatusBadgeColor = (paymentStatus: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-500 text-white hover:bg-yellow-600',
            paid: 'bg-green-500 text-white hover:bg-green-600',
            failed: 'bg-red-500 text-white hover:bg-red-600',
            refunded: 'bg-gray-500 text-white hover:bg-gray-600',
        };
        return colors[paymentStatus] || 'bg-gray-500 text-white hover:bg-gray-600';
    };

    const isAdmin = user.roles.includes('admin');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('users.user', 'User')} - ${user.name}`} />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-6 sm:mb-8">
                        <Link href={route('admin.users.index')}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mb-4 text-gray-600 hover:bg-gold/10"
                            >
                                <ArrowLeft className="mr-2 size-4" />
                                {t('users.back_to_users', 'Back to Users')}
                            </Button>
                        </Link>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold uppercase tracking-wide text-gold sm:text-3xl">
                                    {user.name}
                                </h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    {t('users.member_since', 'Member since')}{' '}
                                    {formatDate(user.created_at)}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {user.email_verified ? (
                                    <Badge className="bg-green-500 text-white hover:bg-green-600">
                                        <CheckCircle className="mr-1 size-3" />
                                        {t('users.verified', 'Verified')}
                                    </Badge>
                                ) : (
                                    <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
                                        <XCircle className="mr-1 size-3" />
                                        {t('users.pending', 'Pending')}
                                    </Badge>
                                )}
                                {isAdmin ? (
                                    <Badge className="bg-purple-500 text-white hover:bg-purple-600">
                                        <Shield className="mr-1 size-3" />
                                        {t('users.admin', 'Admin')}
                                    </Badge>
                                ) : (
                                    <Badge className="bg-gray-500 text-white hover:bg-gray-600">
                                        {t('users.customer', 'Customer')}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left Column - Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Statistics */}
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="text-2xl font-bold text-gold">
                                            {stats.total_orders}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {t('users.total_orders', 'Total Orders')}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="text-2xl font-bold text-green-600">
                                            {formatPrice(stats.total_spent)}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {t('users.total_spent', 'Total Spent')}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {formatPrice(stats.average_order)}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {t('users.average_order', 'Avg. Order')}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {stats.completed_orders}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {t('users.completed', 'Completed')}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recent Orders */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gold">
                                        <ShoppingBag className="size-5" />
                                        {t('users.recent_orders', 'Recent Orders')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t(
                                            'users.recent_orders_description',
                                            'Last 10 orders from this customer'
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {orders.length === 0 ? (
                                        <div className="py-8 text-center text-gray-500">
                                            {t('users.no_orders', 'No orders yet')}
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
                                                            {t('orders.status', 'Status')}
                                                        </TableHead>
                                                        <TableHead className="font-semibold text-gray-900">
                                                            {t('orders.payment', 'Payment')}
                                                        </TableHead>
                                                        <TableHead className="text-center font-semibold text-gray-900">
                                                            {t('orders.items', 'Items')}
                                                        </TableHead>
                                                        <TableHead className="text-right font-semibold text-gray-900">
                                                            {t('orders.total', 'Total')}
                                                        </TableHead>
                                                        <TableHead className="font-semibold text-gray-900">
                                                            {t('orders.date', 'Date')}
                                                        </TableHead>
                                                        <TableHead className="text-right font-semibold text-gray-900">
                                                            {t('common.actions', 'Actions')}
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {orders.map((order) => (
                                                        <TableRow
                                                            key={order.id}
                                                            className="border-gold/10 transition-colors hover:bg-gold/5"
                                                        >
                                                            <TableCell className="font-medium text-gray-900">
                                                                {order.order_number}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    className={getStatusBadgeColor(
                                                                        order.status
                                                                    )}
                                                                >
                                                                    {statuses[order.status] ||
                                                                        order.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    className={getPaymentStatusBadgeColor(
                                                                        order.payment_status
                                                                    )}
                                                                >
                                                                    {paymentStatuses[
                                                                        order.payment_status
                                                                    ] || order.payment_status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {order.items_count}
                                                            </TableCell>
                                                            <TableCell className="text-right font-semibold text-gray-900">
                                                                {formatPrice(order.total)}
                                                            </TableCell>
                                                            <TableCell className="text-sm text-gray-600">
                                                                {order.created_at}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Link
                                                                    href={route(
                                                                        'admin.orders.show',
                                                                        { order: order.id }
                                                                    )}
                                                                >
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

                        {/* Right Column - Sidebar */}
                        <div className="space-y-6">
                            {/* User Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gold">
                                        <User className="size-5" />
                                        {t('users.user_information', 'User Information')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-xs font-medium uppercase text-gray-500">
                                            <Mail className="mr-1 inline size-3" />
                                            {t('users.email', 'Email')}
                                        </Label>
                                        <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                                    </div>
                                    {user.phone && (
                                        <div>
                                            <Label className="text-xs font-medium uppercase text-gray-500">
                                                <Phone className="mr-1 inline size-3" />
                                                {t('users.phone', 'Phone')}
                                            </Label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {user.phone}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <Label className="text-xs font-medium uppercase text-gray-500">
                                            <Calendar className="mr-1 inline size-3" />
                                            {t('users.registered', 'Registered')}
                                        </Label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {formatDate(user.created_at)}
                                        </p>
                                    </div>
                                    {user.email_verified_at && (
                                        <div>
                                            <Label className="text-xs font-medium uppercase text-gray-500">
                                                <CheckCircle className="mr-1 inline size-3" />
                                                {t('users.verified_at', 'Verified At')}
                                            </Label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {formatDate(user.email_verified_at)}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Addresses */}
                            {(user.shipping_address || user.billing_address) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gold">
                                            <MapPin className="size-5" />
                                            {t('users.addresses', 'Addresses')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {user.billing_address && (
                                            <div>
                                                <Label className="mb-2 block text-sm font-semibold text-gray-900">
                                                    <CreditCard className="mr-1 inline size-3" />
                                                    {t('users.billing_address', 'Billing Address')}
                                                </Label>
                                                <div className="space-y-1 text-sm text-gray-600">
                                                    <p>{user.billing_address}</p>
                                                    <p>
                                                        {user.billing_city},{' '}
                                                        {user.billing_postal_code}
                                                    </p>
                                                    {user.billing_state && (
                                                        <p>{user.billing_state}</p>
                                                    )}
                                                    <p>{user.billing_country}</p>
                                                </div>
                                            </div>
                                        )}

                                        {user.shipping_address && (
                                            <div
                                                className={
                                                    user.billing_address
                                                        ? 'border-t border-gold/10 pt-4'
                                                        : ''
                                                }
                                            >
                                                <Label className="mb-2 block text-sm font-semibold text-gray-900">
                                                    <MapPin className="mr-1 inline size-3" />
                                                    {t(
                                                        'users.shipping_address',
                                                        'Shipping Address'
                                                    )}
                                                </Label>
                                                <div className="space-y-1 text-sm text-gray-600">
                                                    <p>{user.shipping_address}</p>
                                                    <p>
                                                        {user.shipping_city},{' '}
                                                        {user.shipping_postal_code}
                                                    </p>
                                                    {user.shipping_state && (
                                                        <p>{user.shipping_state}</p>
                                                    )}
                                                    <p>{user.shipping_country}</p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
