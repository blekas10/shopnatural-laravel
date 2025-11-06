'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/order-status-badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { Order, OrderStatus } from '@/types/checkout';
import { Head, Link } from '@inertiajs/react';
import { Package, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Orders',
        href: '/orders',
    },
];

interface OrdersIndexProps {
    orders: Order[];
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

const statusFilters: { label: string; value: OrderStatus | 'all' }[] = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
];

export default function OrdersIndex({ orders }: OrdersIndexProps) {
    const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');

    const filteredOrders =
        activeFilter === 'all'
            ? orders
            : orders.filter((order) => order.status === activeFilter);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Orders" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6 lg:p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-2"
                >
                    <h1 className="text-2xl font-bold uppercase tracking-wide md:text-3xl">
                        My Orders
                    </h1>
                    <p className="text-sm text-muted-foreground md:text-base">
                        View and track all your orders
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
                    <div className="space-y-4">
                        {filteredOrders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                custom={index}
                                initial="hidden"
                                animate="visible"
                                variants={cardVariants}
                                className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="flex flex-col gap-4 p-4 md:p-6">
                                    {/* Order Header */}
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="rounded-lg bg-gold/10 p-3">
                                                <Package className="size-6 text-gold" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                                    <p className="text-lg font-bold uppercase tracking-wide">
                                                        {order.orderNumber}
                                                    </p>
                                                    <OrderStatusBadge status={order.status} />
                                                </div>
                                                <div className="space-y-1 text-sm text-muted-foreground">
                                                    <p>
                                                        Ordered on{' '}
                                                        {new Date(order.createdAt).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            }
                                                        )}
                                                    </p>
                                                    <p>
                                                        {order.items.reduce(
                                                            (sum, item) => sum + item.quantity,
                                                            0
                                                        )}{' '}
                                                        items • ${order.total.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <Link href={`/orders/${order.id}`}>
                                            <Button
                                                variant="outline"
                                                className="w-full border-gold text-gold hover:bg-gold hover:text-white sm:w-auto"
                                            >
                                                View Order
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Order Items Preview */}
                                    <div className="flex gap-3 overflow-x-auto">
                                        {order.items.slice(0, 4).map((item) => (
                                            <div
                                                key={item.id}
                                                className="relative flex-shrink-0"
                                            >
                                                <img
                                                    src={item.product.image || '/placeholder.png'}
                                                    alt={item.product.name}
                                                    className="size-16 rounded-lg border object-cover"
                                                />
                                                {item.quantity > 1 && (
                                                    <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-white">
                                                        {item.quantity}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                        {order.items.length > 4 && (
                                            <div className="flex size-16 flex-shrink-0 items-center justify-center rounded-lg border bg-muted text-xs font-bold text-muted-foreground">
                                                +{order.items.length - 4}
                                            </div>
                                        )}
                                    </div>

                                    {/* Tracking Info */}
                                    {order.trackingNumber && (
                                        <div className="rounded-lg border border-gold/20 bg-gold/5 p-3">
                                            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                                Tracking Number
                                            </p>
                                            <p className="mt-1 font-mono text-sm font-bold text-gold">
                                                {order.trackingNumber}
                                            </p>
                                        </div>
                                    )}
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
                                ? 'No orders yet'
                                : `No ${activeFilter} orders`}
                        </h3>
                        <p className="mb-6 text-sm text-muted-foreground">
                            {activeFilter === 'all'
                                ? 'Start shopping to see your orders here'
                                : `You don't have any ${activeFilter} orders at the moment`}
                        </p>
                        {activeFilter === 'all' ? (
                            <Link href="/products">
                                <Button className="bg-gold hover:bg-gold/90 text-white font-bold uppercase tracking-wide">
                                    Browse Products
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                onClick={() => setActiveFilter('all')}
                                variant="outline"
                                className="border-gold text-gold hover:bg-gold hover:text-white font-bold uppercase tracking-wide"
                            >
                                View All Orders
                            </Button>
                        )}
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
}
