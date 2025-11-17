import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { useTranslation } from '@/hooks/use-translation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Category {
    id: number;
    name: string;
}

interface Brand {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    is_featured: boolean;
    is_active: boolean;
    category: Category | null;
    brand: Brand | null;
    image: string | null;
}

interface AdminProductsProps {
    products: Product[];
}

export default function AdminProducts({ products }: AdminProductsProps) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('sidebar.dashboard', 'Dashboard'),
            href: dashboard().url,
        },
        {
            title: t('sidebar.manage_products.all', 'All Products'),
            href: '/admin/products',
        },
    ];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('sidebar.manage_products.all', 'All Products')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h1 className="text-2xl font-bold uppercase tracking-wide text-gold mb-6">
                                {t('sidebar.manage_products.all', 'All Products')}
                            </h1>

                            {products.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">
                                        {t('admin.products.no_products', 'No products found')}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-gold/20">
                                                <TableHead className="w-20 font-semibold text-gray-900">
                                                    {t('admin.products.table.image', 'Image')}
                                                </TableHead>
                                                <TableHead className="font-semibold text-gray-900">
                                                    {t('admin.products.table.name', 'Name')}
                                                </TableHead>
                                                <TableHead className="font-semibold text-gray-900">
                                                    {t('admin.products.table.category', 'Category')}
                                                </TableHead>
                                                <TableHead className="font-semibold text-gray-900">
                                                    {t('admin.products.table.brand', 'Brand')}
                                                </TableHead>
                                                <TableHead className="text-right font-semibold text-gray-900">
                                                    {t('admin.products.table.price', 'Price')}
                                                </TableHead>
                                                <TableHead className="text-right font-semibold text-gray-900">
                                                    {t('admin.products.table.stock', 'Stock')}
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-gray-900">
                                                    {t('admin.products.table.status', 'Status')}
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-gray-900">
                                                    {t('admin.products.table.featured', 'Featured')}
                                                </TableHead>
                                                <TableHead className="text-right font-semibold text-gray-900">
                                                    {t('admin.products.table.actions', 'Actions')}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {products.map((product) => (
                                                <TableRow
                                                    key={product.id}
                                                    className="hover:bg-gold/5 transition-colors border-gold/10"
                                                >
                                                    <TableCell>
                                                        {product.image ? (
                                                            <img
                                                                src={product.image}
                                                                alt={product.name}
                                                                className="w-12 h-12 object-cover rounded-md border border-gold/20"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gray-100 rounded-md border border-gold/20 flex items-center justify-center">
                                                                <span className="text-xs text-gray-400">N/A</span>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-gray-900">
                                                        {product.name}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {product.category?.name || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {product.brand?.name || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-gray-900">
                                                        {formatPrice(product.price)}
                                                    </TableCell>
                                                    <TableCell className="text-right text-gray-600">
                                                        <span
                                                            className={
                                                                product.stock < 10
                                                                    ? 'text-red-600 font-semibold'
                                                                    : ''
                                                            }
                                                        >
                                                            {product.stock}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge
                                                            variant={product.is_active ? 'default' : 'secondary'}
                                                            className={
                                                                product.is_active
                                                                    ? 'bg-gold text-white hover:bg-gold/90'
                                                                    : ''
                                                            }
                                                        >
                                                            {product.is_active
                                                                ? t('admin.products.status.active', 'Active')
                                                                : t('admin.products.status.inactive', 'Inactive')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center text-gray-600">
                                                        {product.is_featured
                                                            ? t('admin.products.featured.yes', 'Yes')
                                                            : t('admin.products.featured.no', 'No')}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {/* Actions placeholder */}
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
