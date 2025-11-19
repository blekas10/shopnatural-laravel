'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/order-status-badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { Order, OrderStatus } from '@/types/checkout';
import { Head, Link } from '@inertiajs/react';
import { Package, Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';

interface OrdersIndexProps {
    orders: Order[] | { data: Order[] };
}

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.05,
            duration: 0.4,
            ease: 'easeOut' as const,
        },
    }),
};

export default function OrdersIndex({ orders: ordersData }: OrdersIndexProps) {
    const { t, route } = useTranslation();
    const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
    const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

    // Normalize orders data - handle both array and ResourceCollection format
    const orders = Array.isArray(ordersData) ? ordersData : (ordersData as { data: Order[] }).data;

    const toggleOrder = (orderId: number) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
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
    ];

    const statusFilters: { label: string; value: OrderStatus | 'all' }[] = [
        { label: t('orders.filter.all', 'All Orders'), value: 'all' },
        { label: t('orders.status.confirmed', 'Confirmed'), value: 'confirmed' },
        { label: t('orders.status.processing', 'Processing'), value: 'processing' },
        { label: t('orders.status.shipped', 'Shipped'), value: 'shipped' },
        { label: t('orders.status.completed', 'Completed'), value: 'completed' },
        { label: t('orders.status.cancelled', 'Cancelled'), value: 'cancelled' },
    ];

    const filteredOrders =
        activeFilter === 'all'
            ? orders
            : orders.filter((order) => order.status === activeFilter);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('orders.page_title', 'My Orders')} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6 lg:p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-2"
                >
                    <h1 className="text-2xl font-bold uppercase tracking-wide md:text-3xl">
                        {t('orders.my_orders', 'My Orders')}
                    </h1>
                    <p className="text-sm text-muted-foreground md:text-base">
                        {t('orders.description', 'View and track all your orders')}
                    </p>
                </motion.div>

                {/* Status Filter Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="relative"
                >
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        <Filter className="size-5 text-muted-foreground" />
                        <div className="flex gap-2">
                            {statusFilters.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => setActiveFilter(filter.value)}
                                    className={cn(
                                        'relative whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all',
                                        activeFilter === filter.value
                                            ? 'bg-gold text-white shadow-md'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    )}
                                >
                                    {filter.label}
                                    {activeFilter === filter.value && (
                                        <motion.div
                                            layoutId="activeFilter"
                                            className="absolute inset-0 rounded-lg bg-gold"
                                            style={{ zIndex: -1 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 500,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Orders List */}
                {filteredOrders && filteredOrders.length > 0 ? (
                    <div className="space-y-4 md:space-y-6">
                        {filteredOrders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                custom={index}
                                initial="hidden"
                                animate="visible"
                                variants={cardVariants}
                                className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md"
                            >
                                {/* Order Header */}
                                <div className="flex flex-col gap-4 border-b border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-gold/10 p-2.5 md:p-3">
                                            <Package className="size-5 text-gold md:size-6" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                                <p className="text-base font-bold uppercase tracking-wide md:text-lg">
                                                    {order.orderNumber}
                                                </p>
                                                <OrderStatusBadge status={order.status} />
                                            </div>
                                            <p className="text-xs text-muted-foreground md:text-sm">
                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right sm:text-left md:text-right">
                                        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                            {t('orders.total', 'Total')}
                                        </p>
                                        <p className="text-xl font-bold text-gold md:text-2xl">
                                            €{order.total.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Items Grid */}
                                <div className="p-4 md:p-6">
                                    {/* Toggle Products Button */}
                                    <button
                                        onClick={() => toggleOrder(order.id)}
                                        className="mb-4 flex w-full items-center justify-between rounded-lg border border-border bg-muted/20 p-3 transition-colors hover:bg-muted/40"
                                    >
                                        <span className="text-sm font-bold uppercase tracking-wide">
                                            {t('orders.items', 'Items')} ({order.items.length})
                                        </span>
                                        <ChevronDown
                                            className={cn(
                                                "size-5 transition-transform",
                                                expandedOrders.has(order.id) && "rotate-180"
                                            )}
                                        />
                                    </button>

                                    {/* Collapsible Items List */}
                                    {expandedOrders.has(order.id) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-3"
                                        >
                                            {order.items.map((item) => {
                                                const price = item.unitPrice;
                                                const lineTotal = price * item.quantity;

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="flex gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/30 md:gap-4"
                                                >
                                                    {/* Product Image */}
                                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg md:h-20 md:w-20">
                                                        <img
                                                            src={item.product.image || '/placeholder.png'}
                                                            alt={item.product.name}
                                                            className="h-full w-full object-contain"
                                                        />
                                                    </div>

                                                    {/* Product Details */}
                                                    <div className="flex flex-1 flex-col justify-between gap-2 md:flex-row md:items-center">
                                                        <div className="flex-1 space-y-1">
                                                            <p className="text-sm font-bold uppercase tracking-wide text-foreground line-clamp-1 md:text-base">
                                                                {item.product.name}
                                                            </p>
                                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                                {item.variant && (
                                                                    <span className="uppercase">
                                                                        {t('product.size', 'Size')}: {item.variant.size}
                                                                    </span>
                                                                )}
                                                                <span className="hidden md:inline">•</span>
                                                                <span className="font-bold text-gold">
                                                                    {item.quantity}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:justify-center">
                                                            <p className="text-sm font-bold text-gold md:text-lg">
                                                                €{lineTotal.toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        </motion.div>
                                    )}

                                    {/* Tracking Info */}
                                    {order.trackingNumber && (
                                        <div className="mt-4 rounded-lg border border-gold/20 bg-gold/5 p-3 md:p-4">
                                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                                        {t('orders.tracking_number', 'Tracking Number')}
                                                    </p>
                                                    <p className="mt-1 font-mono text-sm font-bold text-gold md:text-base">
                                                        {order.trackingNumber}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Order Actions */}
                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end md:mt-6">
                                        <Link
                                            href={route('orders.show', { orderNumber: order.orderNumber })}
                                            className="w-full sm:w-auto"
                                        >
                                            <Button
                                                variant="default"
                                                className="h-11 w-full bg-gold font-bold uppercase tracking-wide text-white hover:bg-gold/90 sm:w-auto md:px-8"
                                            >
                                                {t('orders.view_order', 'View Order')}
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
                        transition={{ delay: 0.3 }}
                        className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center"
                    >
                        <Package className="mb-4 size-16 text-muted-foreground/50" />
                        <h3 className="mb-2 text-xl font-bold">
                            {activeFilter === 'all'
                                ? t('orders.no_orders', 'No orders yet')
                                : t('orders.no_filtered_orders', `No ${activeFilter} orders`).replace(
                                    '{status}',
                                    t(`orders.status.${activeFilter}`, activeFilter).toLowerCase()
                                )}
                        </h3>
                        <p className="mb-6 text-sm text-muted-foreground">
                            {activeFilter === 'all'
                                ? t('orders.start_shopping', 'Start shopping to see your orders here')
                                : t('orders.no_filtered_orders_desc', `You don't have any ${activeFilter} orders at the moment`).replace(
                                    '{status}',
                                    t(`orders.status.${activeFilter}`, activeFilter).toLowerCase()
                                )}
                        </p>
                        {activeFilter === 'all' ? (
                            <Link href={route('products.index')}>
                                <Button className="bg-gold hover:bg-gold/90 text-white font-bold uppercase tracking-wide">
                                    {t('orders.browse_products', 'Browse Products')}
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                onClick={() => setActiveFilter('all')}
                                variant="outline"
                                className="border-gold text-gold hover:bg-gold hover:text-white font-bold uppercase tracking-wide"
                            >
                                {t('orders.view_all_orders', 'View All Orders')}
                            </Button>
                        )}
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
}
