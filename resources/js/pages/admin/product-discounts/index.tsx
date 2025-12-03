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
import { Plus, Pencil, Trash2, Percent, DollarSign } from 'lucide-react';

interface ProductDiscount {
    id: number;
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    formattedValue: string;
    scope: 'all' | 'categories' | 'brands' | 'products';
    categoryIds: number[];
    brandIds: number[];
    productIds: number[];
    startsAt: string | null;
    endsAt: string | null;
    isActive: boolean;
    priority: number;
    isValid: boolean;
    createdAt: string;
}

interface ProductDiscountsIndexProps {
    discounts: ProductDiscount[];
}

export default function ProductDiscountsIndex({ discounts }: ProductDiscountsIndexProps) {
    const { t, route } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('sidebar.dashboard', 'Dashboard'),
            href: route("dashboard"),
        },
        {
            title: t('sidebar.product_discounts', 'Product Discounts'),
            href: route('admin.product-discounts.index'),
        },
    ];

    const handleDelete = (discountId: number, discountName: string) => {
        if (confirm(t('product_discounts.confirm_delete', `Are you sure you want to delete "${discountName}"? This action cannot be undone.`))) {
            router.delete(route("admin.product-discounts.destroy", { product_discount: discountId }), {
                preserveScroll: true,
            });
        }
    };

    const getScopeLabel = (discount: ProductDiscount) => {
        switch (discount.scope) {
            case 'all':
                return t('product_discounts.scope_all', 'All Products');
            case 'categories':
                return t('product_discounts.scope_categories', `${discount.categoryIds.length} Categories`);
            case 'brands':
                return t('product_discounts.scope_brands', `${discount.brandIds.length} Brands`);
            case 'products':
                return t('product_discounts.scope_products', `${discount.productIds.length} Products`);
            default:
                return discount.scope;
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('sidebar.product_discounts', 'Product Discounts')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold uppercase tracking-wide text-gold">
                                    {t('sidebar.product_discounts', 'Product Discounts')}
                                </h1>
                                <Link href={route("admin.product-discounts.create")}>
                                    <Button className="bg-gold hover:bg-gold/90 text-white">
                                        <Plus className="w-4 h-4 mr-2" />
                                        {t('product_discounts.add', 'Add Discount')}
                                    </Button>
                                </Link>
                            </div>

                            {discounts.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg mb-4">
                                        {t('product_discounts.no_discounts', 'No product discounts found')}
                                    </p>
                                    <Link href={route("admin.product-discounts.create")}>
                                        <Button className="bg-gold hover:bg-gold/90 text-white">
                                            <Plus className="w-4 h-4 mr-2" />
                                            {t('product_discounts.create_first', 'Create Your First Discount')}
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-gold/20">
                                                <TableHead className="font-semibold text-gray-900">
                                                    {t('product_discounts.name', 'Name')}
                                                </TableHead>
                                                <TableHead className="font-semibold text-gray-900">
                                                    {t('product_discounts.discount', 'Discount')}
                                                </TableHead>
                                                <TableHead className="font-semibold text-gray-900">
                                                    {t('product_discounts.scope', 'Scope')}
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-gray-900">
                                                    {t('product_discounts.priority', 'Priority')}
                                                </TableHead>
                                                <TableHead className="font-semibold text-gray-900">
                                                    {t('product_discounts.period', 'Period')}
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-gray-900">
                                                    {t('product_discounts.status', 'Status')}
                                                </TableHead>
                                                <TableHead className="text-right font-semibold text-gray-900">
                                                    {t('common.actions', 'Actions')}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {discounts.map(discount => (
                                                <TableRow key={discount.id} className="hover:bg-gold/5 transition-colors border-gold/10">
                                                    <TableCell className="font-medium text-gray-900">
                                                        {discount.name}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            {discount.type === 'percentage' ? (
                                                                <Percent className="w-4 h-4 text-gold" />
                                                            ) : (
                                                                <DollarSign className="w-4 h-4 text-gold" />
                                                            )}
                                                            {discount.formattedValue}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {getScopeLabel(discount)}
                                                    </TableCell>
                                                    <TableCell className="text-center text-gray-600">
                                                        {discount.priority}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600 text-sm">
                                                        <div>
                                                            {formatDate(discount.startsAt)} - {formatDate(discount.endsAt)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Badge
                                                                variant={discount.isActive ? 'default' : 'secondary'}
                                                                className={
                                                                    discount.isActive
                                                                        ? 'bg-gold text-white hover:bg-gold/90'
                                                                        : ''
                                                                }
                                                            >
                                                                {discount.isActive
                                                                    ? t('common.active', 'Active')
                                                                    : t('common.inactive', 'Inactive')}
                                                            </Badge>
                                                            {discount.isActive && !discount.isValid && (
                                                                <Badge variant="outline" className="text-orange-600 border-orange-300">
                                                                    {t('product_discounts.expired', 'Expired')}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Link href={route("admin.product-discounts.edit", { product_discount: discount.id })}>
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
                                                                onClick={() => handleDelete(discount.id, discount.name)}
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
