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
import { Eye, Search, X, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    email_verified: boolean;
    email_verified_at: string | null;
    roles: string[];
    orders_count: number;
    total_spent: number;
    created_at: string;
    last_order_at: string | null;
}

interface Pagination {
    data: User[];
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

interface UsersIndexProps {
    users: Pagination;
    filters: {
        search?: string;
        role?: string;
        verified?: string;
        date_from?: string;
        date_to?: string;
    };
    roles: Record<string, string>;
}

export default function UsersIndex({ users, filters, roles }: UsersIndexProps) {
    const { t, route } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [verified, setVerified] = useState(filters.verified || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('sidebar.dashboard', 'Dashboard'),
            href: route('dashboard'),
        },
        {
            title: t('sidebar.manage_users', 'Manage Users'),
            href: route('admin.users.index'),
        },
    ];

    const handleFilter = () => {
        router.get(route('admin.users.index'), {
            search,
            role,
            verified,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setRole('');
        setVerified('');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.users.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = search || role || verified || dateFrom || dateTo;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('users.title', 'Users')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Header */}
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold uppercase tracking-wide text-gold">
                                    {t('users.title', 'Users')}
                                </h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    {t('users.subtitle', 'Manage registered customers and view their order history')}
                                </p>
                            </div>

                            {/* Stats Summary */}
                            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
                                <div className="rounded-lg border border-gold/20 bg-gold/5 p-4">
                                    <div className="text-2xl font-bold text-gold">{users.total}</div>
                                    <div className="text-sm text-gray-600">{t('users.total_users', 'Total Users')}</div>
                                </div>
                                <div className="rounded-lg border border-green-500/20 bg-green-50 p-4">
                                    <div className="text-2xl font-bold text-green-600">
                                        {users.data.filter(u => u.email_verified).length}
                                    </div>
                                    <div className="text-sm text-gray-600">{t('users.verified', 'Verified')}</div>
                                </div>
                                <div className="rounded-lg border border-blue-500/20 bg-blue-50 p-4">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {users.data.filter(u => u.orders_count > 0).length}
                                    </div>
                                    <div className="text-sm text-gray-600">{t('users.with_orders', 'With Orders')}</div>
                                </div>
                                <div className="rounded-lg border border-purple-500/20 bg-purple-50 p-4">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {users.data.filter(u => u.roles.includes('admin')).length}
                                    </div>
                                    <div className="text-sm text-gray-600">{t('users.admins', 'Admins')}</div>
                                </div>
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
                                                placeholder={t('users.search_placeholder', 'Name, email, phone...')}
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                                className="border-gold/20 pr-10 focus:border-gold focus:ring-gold"
                                            />
                                            <Search className="absolute right-3 top-2.5 size-5 text-gray-400" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="role">{t('users.role', 'Role')}</Label>
                                        <Select value={role} onValueChange={setRole}>
                                            <SelectTrigger id="role" className="border-gold/20 focus:border-gold focus:ring-gold">
                                                <SelectValue placeholder={t('common.all', 'All')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                                                {Object.entries(roles).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="verified">{t('users.email_status', 'Email Status')}</Label>
                                        <Select value={verified} onValueChange={setVerified}>
                                            <SelectTrigger id="verified" className="border-gold/20 focus:border-gold focus:ring-gold">
                                                <SelectValue placeholder={t('common.all', 'All')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                                                <SelectItem value="yes">{t('users.verified', 'Verified')}</SelectItem>
                                                <SelectItem value="no">{t('users.not_verified', 'Not Verified')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date_from">{t('users.registered_from', 'From Date')}</Label>
                                        <Input
                                            id="date_from"
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            className="border-gold/20 focus:border-gold focus:ring-gold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date_to">{t('users.registered_to', 'To Date')}</Label>
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

                            {/* Users Table */}
                            <div className="rounded-lg border border-gray-200 overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-gold/10 hover:bg-gold/5">
                                            <TableHead className="font-semibold text-gray-900">
                                                {t('users.user', 'User')}
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-900">
                                                {t('users.contact', 'Contact')}
                                            </TableHead>
                                            <TableHead className="text-center font-semibold text-gray-900">
                                                {t('users.status', 'Status')}
                                            </TableHead>
                                            <TableHead className="text-center font-semibold text-gray-900">
                                                {t('users.role', 'Role')}
                                            </TableHead>
                                            <TableHead className="text-center font-semibold text-gray-900">
                                                {t('users.orders', 'Orders')}
                                            </TableHead>
                                            <TableHead className="text-right font-semibold text-gray-900">
                                                {t('users.total_spent', 'Total Spent')}
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-900">
                                                {t('users.registered', 'Registered')}
                                            </TableHead>
                                            <TableHead className="text-right font-semibold text-gray-900">
                                                {t('common.actions', 'Actions')}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center text-gray-500 py-12">
                                                    {t('users.no_users', 'No users found')}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            users.data.map((user) => (
                                                <TableRow
                                                    key={user.id}
                                                    className="hover:bg-gold/5 transition-colors border-gold/10"
                                                >
                                                    <TableCell>
                                                        <div className="font-medium text-gray-900">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            ID: {user.id}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm text-gray-900">
                                                            {user.email}
                                                        </div>
                                                        {user.phone && (
                                                            <div className="text-xs text-gray-500">
                                                                {user.phone}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
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
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {user.roles.includes('admin') ? (
                                                            <Badge className="bg-purple-500 text-white hover:bg-purple-600">
                                                                {t('users.admin', 'Admin')}
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-gray-500 text-white hover:bg-gray-600">
                                                                {t('users.customer', 'Customer')}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <ShoppingBag className="size-4 text-gray-400" />
                                                            <span className="font-medium">{user.orders_count}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold text-gray-900">
                                                        {user.total_spent.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600 text-sm">
                                                        {user.created_at}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Link href={route('admin.users.show', { user: user.id })}>
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
                                            ))
                                        )}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {users.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t border-gold/10 p-4">
                                        <div className="text-sm text-gray-600">
                                            {t('common.showing', 'Showing')} {users.data.length} {t('common.of', 'of')} {users.total} {t('common.results', 'results')}
                                        </div>
                                        <div className="flex gap-1">
                                            {users.links.map((link, index) => {
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
