import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
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
import { adminCategoriesCreate as create, adminCategoriesEdit as edit, adminCategoriesDestroy as destroy } from '@/routes';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parent_id: number | null;
    parent_name: string | null;
    order: number;
    is_active: boolean;
    children_count: number;
    products_count: number;
    level: number;
    children: Category[];
}

interface CategoriesIndexProps {
    categories: Category[];
}

export default function CategoriesIndex({ categories }: CategoriesIndexProps) {
    const { t, route } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('sidebar.dashboard', 'Dashboard'),
            href: route('dashboard'),
        },
        {
            title: t('sidebar.manage_products.categories', 'Categories'),
            href: route('admin.categories.index'),
        },
    ];

    const handleDelete = (categoryId: number, categoryName: string) => {
        if (confirm(t('categories.confirm_delete', `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`))) {
            router.delete(route("admin.categories.destroy", { category: categoryId }), {
                preserveScroll: true,
            });
        }
    };

    const renderCategory = (category: Category) => {
        const indent = '—'.repeat(category.level);

        return (
            <Fragment key={category.id}>
                <TableRow className="hover:bg-gold/5 transition-colors border-gold/10">
                    <TableCell className="font-medium text-gray-900">
                        <span className="text-muted-foreground mr-2">{indent}</span>
                        {category.name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                        {category.slug}
                    </TableCell>
                    <TableCell className="text-center text-gray-600">
                        {category.order}
                    </TableCell>
                    <TableCell className="text-center text-gray-600">
                        {category.children_count}
                    </TableCell>
                    <TableCell className="text-center text-gray-600">
                        {category.products_count}
                    </TableCell>
                    <TableCell className="text-center">
                        <Badge
                            variant={category.is_active ? 'default' : 'secondary'}
                            className={
                                category.is_active
                                    ? 'bg-gold text-white hover:bg-gold/90'
                                    : ''
                            }
                        >
                            {category.is_active
                                ? t('common.active', 'Active')
                                : t('common.inactive', 'Inactive')}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Link href={route('admin.categories.edit', { category: category.id })}>
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
                                onClick={() => handleDelete(category.id, category.name)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
                {category.children.map(child => renderCategory(child))}
            </Fragment>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('sidebar.manage_products.categories', 'Categories')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold uppercase tracking-wide text-gold">
                                    {t('sidebar.manage_products.categories', 'Categories')}
                                </h1>
                                <Link href={route("admin.categories.create")}>
                                    <Button className="bg-gold hover:bg-gold/90 text-white">
                                        <Plus className="w-4 h-4 mr-2" />
                                        {t('categories.add_new', 'Add Category')}
                                    </Button>
                                </Link>
                            </div>

                            {categories.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg mb-4">
                                        {t('categories.no_categories', 'No categories found')}
                                    </p>
                                    <Link href={route("admin.categories.create")}>
                                        <Button className="bg-gold hover:bg-gold/90 text-white">
                                            <Plus className="w-4 h-4 mr-2" />
                                            {t('categories.create_first', 'Create Your First Category')}
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-gold/20">
                                                <TableHead className="font-semibold text-gray-900">
                                                    {t('categories.name', 'Name')}
                                                </TableHead>
                                                <TableHead className="font-semibold text-gray-900">
                                                    {t('categories.slug', 'Slug')}
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-gray-900">
                                                    {t('categories.order', 'Order')}
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-gray-900">
                                                    {t('categories.subcategories', 'Subcategories')}
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-gray-900">
                                                    {t('categories.products', 'Products')}
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-gray-900">
                                                    {t('categories.status', 'Status')}
                                                </TableHead>
                                                <TableHead className="text-right font-semibold text-gray-900">
                                                    {t('common.actions', 'Actions')}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {categories.map(category => renderCategory(category))}
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
