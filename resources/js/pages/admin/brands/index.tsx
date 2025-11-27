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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Fragment } from 'react';

interface Brand {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    parent_id: number | null;
    parent_name: string | null;
    order: number;
    is_active: boolean;
    children_count: number;
    products_count: number;
    level: number;
    children: Brand[];
}

interface BrandsIndexProps {
    brands: Brand[];
}

export default function BrandsIndex({ brands }: BrandsIndexProps) {
    const { t, route } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('sidebar.dashboard', 'Dashboard'),
            href: route("dashboard"),
        },
        {
            title: t('sidebar.manage_products.brands', 'Brands'),
            href: route('admin.brands.index'),
        },
    ];

    const handleDelete = (brandId: number, brandName: string) => {
        if (confirm(t('brands.confirm_delete', `Are you sure you want to delete "${brandName}"? This action cannot be undone.`))) {
            router.delete(route("admin.brands.destroy", { brand: brandId }), {
                preserveScroll: true,
            });
        }
    };

    const renderBrand = (brand: Brand) => {
        const indent = '—'.repeat(brand.level);

        return (
            <Fragment key={brand.id}>
                <TableRow className="hover:bg-gold/5 transition-colors border-gold/10">
                    <TableCell className="font-medium text-gray-900">
                        <span className="text-muted-foreground mr-2">{indent}</span>
                        {brand.name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                        {brand.slug}
                    </TableCell>
                    <TableCell className="text-center text-gray-600">
                        {brand.order}
                    </TableCell>
                    <TableCell className="text-center text-gray-600">
                        {brand.children_count}
                    </TableCell>
                    <TableCell className="text-center text-gray-600">
                        {brand.products_count}
                    </TableCell>
                    <TableCell className="text-center">
                        <Badge
                            variant={brand.is_active ? 'default' : 'secondary'}
                            className={
                                brand.is_active
                                    ? 'bg-gold text-white hover:bg-gold/90'
                                    : ''
                            }
                        >
                            {brand.is_active
                                ? t('common.active', 'Active')
                                : t('common.inactive', 'Inactive')}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Link href={route("admin.brands.edit", { brand: brand.id })}>
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
                                onClick={() => handleDelete(brand.id, brand.name)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
                {brand.children.map(child => renderBrand(child))}
            </Fragment>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('sidebar.manage_products.brands', 'Brands')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold uppercase tracking-wide text-gold">
                                    {t('sidebar.manage_products.brands', 'Brands')}
                                </h1>
                                <Link href={route("admin.brands.create")}>
                                    <Button className="bg-gold hover:bg-gold/90 text-white">
                                        <Plus className="w-4 h-4 mr-2" />
                                        {t('brands.add', 'Add Brand')}
                                    </Button>
                                </Link>
                            </div>

                            {brands.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg mb-4">
                                        {t('brands.no_brands', 'No brands found')}
                                    </p>
                                    <Link href={route("admin.brands.create")}>
                                        <Button className="bg-gold hover:bg-gold/90 text-white">
                                            <Plus className="w-4 h-4 mr-2" />
                                            {t('brands.create_first', 'Create Your First Brand')}
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-gold/20">
                                                <TableHead className="font-semibold text-gray-900">
                                                    {t('brands.name', 'Name')}
                                                </TableHead>
                                                <TableHead className="font-semibold text-gray-900">
                                                    {t('brands.slug', 'Slug')}
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-gray-900">
                                                    {t('brands.order', 'Order')}
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-gray-900">
                                                    {t('brands.sub_brands', 'Sub-brands')}
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-gray-900">
                                                    {t('brands.products', 'Products')}
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-gray-900">
                                                    {t('brands.status', 'Status')}
                                                </TableHead>
                                                <TableHead className="text-right font-semibold text-gray-900">
                                                    {t('common.actions', 'Actions')}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {brands.map(brand => renderBrand(brand))}
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
