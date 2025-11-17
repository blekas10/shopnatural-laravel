import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
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
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

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
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        if (confirm(t('categories.confirm_delete', 'Are you sure you want to delete this category?'))) {
            setDeletingId(id);
            router.delete(route('admin.categories.destroy', { category: id }), {
                onFinish: () => setDeletingId(null),
            });
        }
    };

    const renderCategory = (category: Category) => {
        const indent = '—'.repeat(category.level);

        return (
            <>
                <TableRow key={category.id}>
                    <TableCell className="font-medium">
                        <span className="text-muted-foreground mr-2">{indent}</span>
                        {category.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                        {category.slug}
                    </TableCell>
                    <TableCell className="text-center">
                        {category.order}
                    </TableCell>
                    <TableCell className="text-center">
                        {category.children_count}
                    </TableCell>
                    <TableCell className="text-center">
                        {category.products_count}
                    </TableCell>
                    <TableCell>
                        {category.is_active ? (
                            <Badge variant="default" className="bg-teal-500 hover:bg-teal-600">
                                {t('categories.active', 'Active')}
                            </Badge>
                        ) : (
                            <Badge variant="secondary">
                                {t('categories.inactive', 'Inactive')}
                            </Badge>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                asChild
                            >
                                <Link href={route('admin.categories.edit', { category: category.id })}>
                                    <Edit className="size-4 mr-1" />
                                    {t('common.edit', 'Edit')}
                                </Link>
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(category.id)}
                                disabled={deletingId === category.id}
                            >
                                <Trash2 className="size-4 mr-1" />
                                {t('common.delete', 'Delete')}
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
                {category.children.map(child => renderCategory(child))}
            </>
        );
    };

    return (
        <AppLayout>
            <Head title={t('categories.manage', 'Manage Categories')} />

            <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold uppercase tracking-wide text-foreground">
                            {t('categories.manage', 'Manage Categories')}
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            {t('categories.subtitle', 'Organize your products into categories and subcategories')}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.categories.create')}>
                            <Plus className="size-4 mr-2" />
                            {t('categories.add_new', 'Add Category')}
                        </Link>
                    </Button>
                </div>

                {/* Categories Table */}
                <div className="rounded-lg border border-border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('categories.name', 'Name')}</TableHead>
                                <TableHead>{t('categories.slug', 'Slug')}</TableHead>
                                <TableHead className="text-center">{t('categories.order', 'Order')}</TableHead>
                                <TableHead className="text-center">{t('categories.subcategories', 'Subcategories')}</TableHead>
                                <TableHead className="text-center">{t('categories.products', 'Products')}</TableHead>
                                <TableHead>{t('categories.status', 'Status')}</TableHead>
                                <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        {t('categories.no_categories', 'No categories found. Create your first category to get started.')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map(category => renderCategory(category))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
