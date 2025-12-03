import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Percent, DollarSign, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface PromoCode {
    id: number;
    code: string;
    description: string | null;
    type: 'percentage' | 'fixed';
    value: number;
    formattedValue: string;
    minOrderAmount: number | null;
    maxDiscountAmount: number | null;
    usageLimit: number | null;
    perUserLimit: number | null;
    timesUsed: number;
    startsAt: string | null;
    endsAt: string | null;
    isActive: boolean;
    isValid: boolean;
    isAvailable: boolean;
    createdAt: string;
}

interface PromoCodesIndexProps {
    promoCodes: PromoCode[];
}

export default function PromoCodesIndex({ promoCodes }: PromoCodesIndexProps) {
    const { t, route } = useTranslation();
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('sidebar.dashboard', 'Dashboard'),
            href: route("dashboard"),
        },
        {
            title: t('sidebar.promo_codes', 'Promo Codes'),
            href: route('admin.promo-codes.index'),
        },
    ];

    const handleDelete = (codeId: number, code: string) => {
        if (confirm(t('promo_codes.confirm_delete', `Are you sure you want to delete "${code}"? This action cannot be undone.`))) {
            router.delete(route("admin.promo-codes.destroy", { promo_code: codeId }), {
                preserveScroll: true,
            });
        }
    };

    const copyCode = async (code: string, id: number) => {
        await navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const getUsageDisplay = (code: PromoCode) => {
        if (code.usageLimit) {
            return `${code.timesUsed} / ${code.usageLimit}`;
        }
        return code.timesUsed.toString();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('sidebar.promo_codes', 'Promo Codes')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold uppercase tracking-wide text-gold">
                                    {t('sidebar.promo_codes', 'Promo Codes')}
                                </h1>
                                <Link href={route("admin.promo-codes.create")}>
                                    <Button className="bg-gold hover:bg-gold/90 text-white">
                                        <Plus className="w-4 h-4 mr-2" />
                                        {t('promo_codes.add', 'Add Promo Code')}
                                    </Button>
                                </Link>
                            </div>

                            {promoCodes.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg mb-4">
                                        {t('promo_codes.no_codes', 'No promo codes found')}
                                    </p>
                                    <Link href={route("admin.promo-codes.create")}>
                                        <Button className="bg-gold hover:bg-gold/90 text-white">
                                            <Plus className="w-4 h-4 mr-2" />
                                            {t('promo_codes.create_first', 'Create Your First Promo Code')}
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-gold/20">
                                                <TableHead className="font-semibold text-gray-900">
                                                    {t('promo_codes.code', 'Code')}
                                                </TableHead>
                                                <TableHead className="font-semibold text-gray-900">
                                                    {t('promo_codes.discount', 'Discount')}
                                                </TableHead>
                                                <TableHead className="font-semibold text-gray-900">
                                                    {t('promo_codes.min_order', 'Min. Order')}
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-gray-900">
                                                    {t('promo_codes.usage', 'Usage')}
                                                </TableHead>
                                                <TableHead className="font-semibold text-gray-900">
                                                    {t('promo_codes.period', 'Period')}
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-gray-900">
                                                    {t('promo_codes.status', 'Status')}
                                                </TableHead>
                                                <TableHead className="text-right font-semibold text-gray-900">
                                                    {t('common.actions', 'Actions')}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {promoCodes.map(code => (
                                                <TableRow key={code.id} className="hover:bg-gold/5 transition-colors border-gold/10">
                                                    <TableCell className="font-medium text-gray-900">
                                                        <div className="flex items-center gap-2">
                                                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                                                {code.code}
                                                            </code>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => copyCode(code.code, code.id)}
                                                            >
                                                                {copiedId === code.id ? (
                                                                    <Check className="w-3 h-3 text-green-600" />
                                                                ) : (
                                                                    <Copy className="w-3 h-3" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                        {code.description && (
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {code.description}
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            {code.type === 'percentage' ? (
                                                                <Percent className="w-4 h-4 text-gold" />
                                                            ) : (
                                                                <DollarSign className="w-4 h-4 text-gold" />
                                                            )}
                                                            {code.formattedValue}
                                                        </div>
                                                        {code.maxDiscountAmount && (
                                                            <p className="text-xs text-muted-foreground">
                                                                Max: €{code.maxDiscountAmount.toFixed(2)}
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {code.minOrderAmount
                                                            ? `€${code.minOrderAmount.toFixed(2)}`
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-center text-gray-600">
                                                        {getUsageDisplay(code)}
                                                        {code.perUserLimit && (
                                                            <p className="text-xs text-muted-foreground">
                                                                ({code.perUserLimit}/user)
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600 text-sm">
                                                        <div>
                                                            {formatDate(code.startsAt)} - {formatDate(code.endsAt)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Badge
                                                                variant={code.isActive ? 'default' : 'secondary'}
                                                                className={
                                                                    code.isActive
                                                                        ? 'bg-gold text-white hover:bg-gold/90'
                                                                        : ''
                                                                }
                                                            >
                                                                {code.isActive
                                                                    ? t('common.active', 'Active')
                                                                    : t('common.inactive', 'Inactive')}
                                                            </Badge>
                                                            {code.isActive && !code.isValid && (
                                                                <Badge variant="outline" className="text-orange-600 border-orange-300">
                                                                    {t('promo_codes.expired', 'Expired')}
                                                                </Badge>
                                                            )}
                                                            {code.isActive && !code.isAvailable && code.isValid && (
                                                                <Badge variant="outline" className="text-red-600 border-red-300">
                                                                    {t('promo_codes.limit_reached', 'Limit Reached')}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Link href={route("admin.promo-codes.edit", { promo_code: code.id })}>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-gold/30 hover:bg-gold/10"
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-red-300 hover:bg-red-50 text-red-600"
                                                                onClick={() => handleDelete(code.id, code.code)}
                                                                disabled={code.timesUsed > 0}
                                                                title={code.timesUsed > 0 ? t('promo_codes.cannot_delete_used', 'Cannot delete used code') : ''}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
