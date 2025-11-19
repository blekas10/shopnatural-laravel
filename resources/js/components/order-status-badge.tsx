import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import type { OrderStatus } from '@/types/checkout';
import {
    Package,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    PackageCheck,
} from 'lucide-react';

interface OrderStatusBadgeProps {
    status: OrderStatus;
    className?: string;
}

const statusConfig = {
    confirmed: {
        icon: CheckCircle2,
        className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200',
    },
    processing: {
        icon: Package,
        className: 'bg-gold/10 text-gold border-gold/30',
    },
    shipped: {
        icon: Truck,
        className: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-200',
    },
    completed: {
        icon: PackageCheck,
        className: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-200',
    },
    cancelled: {
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200',
    },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
    const { t } = useTranslation();
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide',
                config.className,
                className,
            )}
        >
            <Icon className="size-3.5" />
            {t(`orders.status.${status}`, status)}
        </span>
    );
}
