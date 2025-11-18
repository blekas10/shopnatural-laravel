'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type User } from '@/types';
import type { Order } from '@/types/checkout';
import { Head, Link, router } from '@inertiajs/react';
import { Package, Clock, CheckCircle2, ShoppingBag, ArrowRight, Mail, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { useState } from 'react';

interface DashboardProps {
    auth: {
        user: User;
    };
    stats: {
        totalOrders: number;
        pendingOrders: number;
        completedOrders: number;
    };
    recentOrders: Order[];
    emailVerified?: boolean;
    status?: string;
}

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.4,
            ease: 'easeOut' as const,
        },
    }),
};

export default function Dashboard({ auth, stats, recentOrders, emailVerified = true, status }: DashboardProps) {
    const { t } = useTranslation();
    const [resending, setResending] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('dashboard.title', 'Dashboard'),
            href: dashboard().url,
        },
    ];

    const handleResendVerification = () => {
        setResending(true);
        router.post('/email/verification-notification', {}, {
            preserveScroll: true,
            onFinish: () => setResending(false),
        });
    };

    const statCards = [
        {
            title: t('dashboard.total_orders', 'Total Orders'),
            value: stats?.totalOrders || 0,
            icon: ShoppingBag,
            iconColor: 'text-gold',
            bgColor: 'bg-gold/10',
        },
        {
            title: t('dashboard.pending_orders', 'Pending Orders'),
            value: stats?.pendingOrders || 0,
            icon: Clock,
            iconColor: 'text-gray-600',
            bgColor: 'bg-gray-100',
        },
        {
            title: t('dashboard.completed', 'Completed'),
            value: stats?.completedOrders || 0,
            icon: CheckCircle2,
            iconColor: 'text-teal-600',
            bgColor: 'bg-teal-100',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dashboard.title', 'Dashboard')} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6 lg:p-8">
                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-2"
                >
                    <h1 className="text-2xl font-bold uppercase tracking-wide md:text-3xl">
                        {t('dashboard.welcome_back', 'Welcome back, {name}').replace('{name}', auth.user.name)}
                    </h1>
                    <p className="text-sm text-muted-foreground md:text-base">
                        {t('dashboard.whats_happening', "Here's what's happening with your orders")}
                    </p>
                </motion.div>

                {/* Status Messages */}
                {status === 'email-verified' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Alert className="border-green-200 bg-green-50">
                            <Check className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                {t('dashboard.email_verified_success', 'Your email has been verified successfully!')}
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}

                {status === 'verification-link-sent' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Alert className="border-blue-200 bg-blue-50">
                            <Mail className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800">
                                {t('dashboard.verification_link_sent', 'A new verification link has been sent to your email address.')}
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}

                {/* Email Verification Banner */}
                {!emailVerified && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Alert className="border-amber-200 bg-amber-50">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="flex flex-col gap-3 text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-semibold">
                                        {t('dashboard.verify_email_title', 'Please verify your email address')}
                                    </p>
                                    <p className="text-sm">
                                        {t('dashboard.verify_email_description', 'Check your inbox for the verification link we sent you.')}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleResendVerification}
                                    disabled={resending}
                                    variant="outline"
                                    size="sm"
                                    className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100 whitespace-nowrap"
                                >
                                    {resending ? (
                                        <>
                                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                                            {t('dashboard.resending', 'Resending...')}
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="mr-2 h-4 w-4" />
                                            {t('dashboard.resend_verification', 'Resend Email')}
                                        </>
                                    )}
                                </Button>
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            variants={cardVariants}
                            className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                        {stat.title}
                                    </p>
                                    <p className="text-3xl font-bold">{stat.value}</p>
                                </div>
                                <div className={cn('rounded-full p-3', stat.bgColor)}>
                                    <stat.icon className={cn('size-6', stat.iconColor)} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Orders Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold uppercase tracking-wide">{t('dashboard.recent_orders', 'Recent Orders')}</h2>
                        <Link href="/orders">
                            <Button
                                variant="ghost"
                                className="group text-gold hover:text-gold/90"
                            >
                                {t('dashboard.view_all_orders', 'View All Orders')}
                                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </div>

                    {recentOrders && recentOrders.length > 0 ? (
                        <div className="space-y-3">
                            {recentOrders.slice(0, 5).map((order, index) => (
                                <motion.div
                                    key={order.id}
                                    custom={index + 3}
                                    initial="hidden"
                                    animate="visible"
                                    variants={cardVariants}
                                    className="group rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md md:p-6"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="rounded-lg bg-gold/10 p-3">
                                                <Package className="size-5 text-gold" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                                    <p className="font-bold uppercase tracking-wide">
                                                        {order.orderNumber}
                                                    </p>
                                                    <OrderStatusBadge status={order.status} />
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-lg font-bold">
                                                    ${order.total.toFixed(2)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                                </p>
                                            </div>
                                            <Link href={`/orders/${order.id}`}>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-gold text-gold hover:bg-gold hover:text-white"
                                                >
                                                    View
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center"
                        >
                            <Package className="mb-4 size-12 text-muted-foreground/50" />
                            <h3 className="mb-2 text-lg font-bold">{t('dashboard.no_orders', 'No orders yet')}</h3>
                            <p className="mb-6 text-sm text-muted-foreground">
                                {t('dashboard.no_orders_description', 'Start shopping to see your orders here')}
                            </p>
                            <Link href="/products">
                                <Button className="bg-gold hover:bg-gold/90 text-white font-bold uppercase tracking-wide">
                                    {t('dashboard.start_shopping', 'Start Shopping')}
                                </Button>
                            </Link>
                        </motion.div>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="space-y-4"
                >
                    <h2 className="text-xl font-bold uppercase tracking-wide">{t('dashboard.quick_actions', 'Quick Actions')}</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Link href="/orders">
                            <Button
                                variant="outline"
                                className="h-auto w-full flex-col items-start gap-2 p-6 text-left hover:border-gold hover:bg-gold/5"
                            >
                                <Package className="size-6 text-gold" />
                                <span className="font-bold uppercase tracking-wide">{t('dashboard.quick_actions.view_all_orders', 'View All Orders')}</span>
                                <span className="text-xs text-muted-foreground">
                                    {t('dashboard.quick_actions.view_all_orders_desc', 'Track and manage your orders')}
                                </span>
                            </Button>
                        </Link>
                        <Link href="/profile">
                            <Button
                                variant="outline"
                                className="h-auto w-full flex-col items-start gap-2 p-6 text-left hover:border-gold hover:bg-gold/5"
                            >
                                <CheckCircle2 className="size-6 text-gold" />
                                <span className="font-bold uppercase tracking-wide">{t('dashboard.quick_actions.edit_profile', 'Edit Profile')}</span>
                                <span className="text-xs text-muted-foreground">
                                    {t('dashboard.quick_actions.edit_profile_desc', 'Update your account information')}
                                </span>
                            </Button>
                        </Link>
                        <Link href="/products">
                            <Button
                                variant="outline"
                                className="h-auto w-full flex-col items-start gap-2 p-6 text-left hover:border-gold hover:bg-gold/5"
                            >
                                <ShoppingBag className="size-6 text-gold" />
                                <span className="font-bold uppercase tracking-wide">{t('dashboard.quick_actions.shop_products', 'Shop Products')}</span>
                                <span className="text-xs text-muted-foreground">
                                    {t('dashboard.quick_actions.shop_products_desc', 'Browse our natural beauty collection')}
                                </span>
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}
