import { Head, Link, router } from '@inertiajs/react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, Package, ExternalLink } from 'lucide-react';
import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import axios from 'axios';

interface Category {
    id: number;
    name: string | { en: string; lt: string };
    level?: number;
    children?: Category[];
}

interface Brand {
    id: number;
    name: string | { en: string; lt: string };
    level?: number;
    children?: Brand[];
}

interface Variant {
    id: number;
    sku: string;
    size: string;
    price: number;
    compare_at_price: number | null;
    stock: number;
    is_default: boolean;
    is_active: boolean;
}

interface Product {
    id: number;
    name: string | { en: string; lt: string };
    slug: { en: string; lt: string };
    description: string | { en: string; lt: string };
    price: number;
    stock: number;
    is_featured: boolean;
    is_active: boolean;
    variant_status: 'active' | 'inactive' | 'mixed';
    active_variants_count: number;
    total_variants_count: number;
    category: Category | null;
    brand: Brand | null;
    image: string | null;
    variants: Variant[];
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Filters {
    search: string;
    category_id: string;
    brand_id: string;
    status: string;
}

interface AdminProductsProps {
    products: PaginatedProducts;
    categories: Category[];
    brands: Brand[];
    filters: Filters;
}

export default function AdminProducts({ products, categories, brands, filters }: AdminProductsProps) {
    const { t, route, locale } = useTranslation();
    const [searchValue, setSearchValue] = useState(filters.search);
    const [quickEditOpen, setQuickEditOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [editingVariants, setEditingVariants] = useState<Variant[]>([]);
    const [saving, setSaving] = useState(false);

    // Helper to get translatable field value
    const getTranslatable = (field: string | { en: string; lt: string } | undefined): string => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        return field[locale as 'en' | 'lt'] || field.en || '';
    };

    // Flatten hierarchical categories for dropdown display
    const flattenCategories = (categories: Category[]): Array<{ id: number; name: string; displayName: string }> => {
        const result: Array<{ id: number; name: string; displayName: string }> = [];

        const flatten = (items: Category[], level: number = 0) => {
            items.forEach((category) => {
                const indent = '—'.repeat(level);
                const name = getTranslatable(category.name);
                result.push({
                    id: category.id,
                    name: name,
                    displayName: level > 0 ? `${indent} ${name}` : name,
                });
                if (category.children && category.children.length > 0) {
                    flatten(category.children, level + 1);
                }
            });
        };

        flatten(categories);
        return result;
    };

    // Flatten hierarchical brands for dropdown display
    const flattenBrands = (brands: Brand[]): Array<{ id: number; name: string; displayName: string }> => {
        const result: Array<{ id: number; name: string; displayName: string }> = [];

        const flatten = (items: Brand[], level: number = 0) => {
            items.forEach((brand) => {
                const indent = '—'.repeat(level);
                const name = getTranslatable(brand.name);
                result.push({
                    id: brand.id,
                    name: name,
                    displayName: level > 0 ? `${indent} ${name}` : name,
                });
                if (brand.children && brand.children.length > 0) {
                    flatten(brand.children, level + 1);
                }
            });
        };

        flatten(brands);
        return result;
    };

    const flatCategories = flattenCategories(categories);
    const flatBrands = flattenBrands(brands);

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

    const handleDelete = (productId: number, productName: string) => {
        if (confirm(t('admin.products.delete_confirm', `Are you sure you want to delete "${productName}"? This action cannot be undone.`))) {
            router.delete(`/admin/products/${productId}`, {
                preserveScroll: true,
            });
        }
    };

    const applyFilters = useCallback((newFilters: Partial<Filters>) => {
        const params = {
            search: filters.search,
            category_id: filters.category_id,
            brand_id: filters.brand_id,
            status: filters.status,
            ...newFilters,
            page: 1, // Reset to first page when filtering
        };

        // Remove empty values
        Object.keys(params).forEach(key => {
            if (params[key as keyof typeof params] === '' || params[key as keyof typeof params] === null) {
                delete params[key as keyof typeof params];
            }
        });

        router.get(route('admin.products.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [filters, route]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            const params: Record<string, string | number | null> = {
                search: value,
                category_id: filters.category_id,
                brand_id: filters.brand_id,
                status: filters.status,
                page: 1,
            };

            // Remove empty values
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) {
                    delete params[key];
                }
            });

            router.get(route('admin.products.index'), params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300),
        [filters, route]
    );

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        debouncedSearch(value);
    };

    const clearFilters = () => {
        setSearchValue('');
        router.get(route('admin.products.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = filters.search || filters.category_id || filters.brand_id || filters.status;

    const openQuickEdit = (product: Product) => {
        setCurrentProduct(product);
        setEditingVariants(JSON.parse(JSON.stringify(product.variants))); // Deep copy
        setQuickEditOpen(true);
    };

    const updateVariantField = (variantId: number, field: keyof Variant, value: string | number) => {
        setEditingVariants(prev =>
            prev.map(v => v.id === variantId ? { ...v, [field]: value } : v)
        );
    };

    const saveQuickEdit = async () => {
        if (!currentProduct) return;

        setSaving(true);
        try {
            // Save each changed variant
            const promises = editingVariants.map(async (variant) => {
                const original = currentProduct.variants.find(v => v.id === variant.id);
                if (!original) return;

                // Check if any field changed
                const hasChanges = original.sku !== variant.sku ||
                    original.price !== variant.price ||
                    original.stock !== variant.stock ||
                    original.is_active !== variant.is_active;

                if (hasChanges) {
                    await axios.patch(
                        `/admin/products/${currentProduct.id}/variants/${variant.id}/quick-update`,
                        {
                            sku: variant.sku,
                            price: variant.price,
                            stock: variant.stock,
                            is_active: variant.is_active,
                        }
                    );
                }
            });

            await Promise.all(promises);

            // Reload the page to show updated data
            router.reload({ only: ['products'] });

            setQuickEditOpen(false);
        } catch (error) {
            console.error('Error saving variant:', error);
            alert('Error saving changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('sidebar.manage_products.all', 'All Products')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold uppercase tracking-wide text-gold">
                                    {t('sidebar.manage_products.all', 'All Products')}
                                </h1>
                                <Link href={route('admin.products.create')}>
                                    <Button className="bg-gold hover:bg-gold/90 text-white">
                                        <Plus className="w-4 h-4 mr-2" />
                                        {t('admin.products.create', 'Create Product')}
                                    </Button>
                                </Link>
                            </div>

                            {/* Filters */}
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div className="lg:col-span-2 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder={t('admin.products.search_placeholder', 'Search by name...')}
                                        value={searchValue}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select
                                    value={filters.category_id || 'all'}
                                    onValueChange={(value) => applyFilters({ category_id: value === 'all' ? '' : value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('admin.products.filter_category', 'All Categories')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('admin.products.all_categories', 'All Categories')}</SelectItem>
                                        {flatCategories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.displayName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.brand_id || 'all'}
                                    onValueChange={(value) => applyFilters({ brand_id: value === 'all' ? '' : value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('admin.products.filter_brand', 'All Brands')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('admin.products.all_brands', 'All Brands')}</SelectItem>
                                        {flatBrands.map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id.toString()}>
                                                {brand.displayName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(value) => applyFilters({ status: value === 'all' ? '' : value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('admin.products.filter_status', 'All Status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('admin.products.all_status', 'All Status')}</SelectItem>
                                        <SelectItem value="active">{t('common.active', 'Active')}</SelectItem>
                                        <SelectItem value="inactive">{t('common.inactive', 'Inactive')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {hasActiveFilters && (
                                <div className="mb-4 flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                        {t('products.showing', 'Showing')} {products.from}-{products.to} {t('products.of', 'of')} {products.total} {t('products.products', 'products')}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        {t('admin.products.clear_filters', 'Clear Filters')}
                                    </Button>
                                </div>
                            )}

                            {products.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg mb-4">
                                        {t('admin.products.no_products', 'No products found')}
                                    </p>
                                    <Link href={route('admin.products.create')}>
                                        <Button className="bg-gold hover:bg-gold/90 text-white">
                                            <Plus className="w-4 h-4 mr-2" />
                                            {t('admin.products.create_first', 'Create Your First Product')}
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-gold/20">
                                                <TableHead className="w-16 font-semibold text-gray-900">
                                                    {t('admin.products.table.image', 'Image')}
                                                </TableHead>
                                                <TableHead className="font-semibold text-gray-900">
                                                    {t('admin.products.table.name', 'Name')}
                                                </TableHead>
                                                <TableHead className="font-semibold text-gray-900">
                                                    SKU / Stock
                                                </TableHead>
                                                <TableHead className="font-semibold text-gray-900">
                                                    {t('admin.products.table.category', 'Category')}
                                                </TableHead>
                                                <TableHead className="text-right font-semibold text-gray-900">
                                                    {t('admin.products.table.price', 'Price')}
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-gray-900">
                                                    {t('admin.products.table.status', 'Status')}
                                                </TableHead>
                                                <TableHead className="text-right font-semibold text-gray-900">
                                                    {t('common.actions', 'Actions')}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {products.data.map((product) => (
                                                <TableRow
                                                    key={product.id}
                                                    className="hover:bg-gold/5 transition-colors border-gold/10"
                                                >
                                                    <TableCell>
                                                        {product.image ? (
                                                            <img
                                                                src={product.image}
                                                                alt={getTranslatable(product.name)}
                                                                className="w-12 h-12 object-cover rounded-md border border-gold/20"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gray-100 rounded-md border border-gold/20 flex items-center justify-center">
                                                                <span className="text-xs text-gray-400">N/A</span>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-gray-900">
                                                        <div>
                                                            {getTranslatable(product.name)}
                                                            {product.is_featured && (
                                                                <span className="ml-2 text-xs bg-gold/20 text-gold px-2 py-0.5 rounded">
                                                                    Featured
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {product.brand ? getTranslatable(product.brand.name) : '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openQuickEdit(product)}
                                                            className="h-auto py-1 px-2 hover:bg-gold/10 text-left flex flex-col items-start gap-1"
                                                        >
                                                            {product.variants.length === 1 ? (
                                                                <>
                                                                    <div className="text-xs font-mono text-gray-700">
                                                                        {product.variants[0].sku}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {product.variants[0].stock === 0 ? 'Unlimited' : `Stock: ${product.variants[0].stock}`}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="flex items-center gap-1 text-xs text-gold font-semibold">
                                                                    <Package className="w-3 h-3" />
                                                                    {product.variants.length} variants
                                                                </div>
                                                            )}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {product.category ? getTranslatable(product.category.name) : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-gray-900">
                                                        {product.variants.length === 1 ? (
                                                            formatPrice(product.price)
                                                        ) : (
                                                            <div className="text-sm">
                                                                {formatPrice(Math.min(...product.variants.map(v => v.price)))} - {formatPrice(Math.max(...product.variants.map(v => v.price)))}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {product.variant_status === 'mixed' ? (
                                                            <Badge
                                                                className="cursor-pointer bg-gradient-to-r from-gold to-gray-400 text-white hover:opacity-90"
                                                                onClick={() => openQuickEdit(product)}
                                                            >
                                                                Partial ({product.active_variants_count}/{product.total_variants_count})
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant={product.variant_status === 'active' ? 'default' : 'secondary'}
                                                                className={
                                                                    product.variant_status === 'active'
                                                                        ? 'bg-gold text-white hover:bg-gold/90 cursor-pointer'
                                                                        : 'bg-gray-400 text-white cursor-pointer'
                                                                }
                                                                onClick={() => openQuickEdit(product)}
                                                            >
                                                                {product.variant_status === 'active'
                                                                    ? t('common.active', 'Active')
                                                                    : t('common.inactive', 'Inactive')}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {(() => {
                                                                const slug = typeof product.slug === 'string'
                                                                    ? product.slug
                                                                    : (product.slug[locale as 'en' | 'lt'] || product.slug.en);
                                                                return (
                                                                    <Link
                                                                        href={route('products.show', { slug })}
                                                                        target="_blank" rel="noopener noreferrer"
                                                                    >
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="border-blue-300 hover:bg-blue-50 text-blue-600"
                                                                        >
                                                                            <ExternalLink className="w-4 h-4" />
                                                                        </Button>
                                                                    </Link>
                                                                );
                                                            })()}
                                                            <Link href={route('admin.products.edit', { product: product.id })}>
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
                                                                onClick={() => handleDelete(product.id, getTranslatable(product.name))}
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

                            {/* Pagination */}
                            {products.last_page > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        {t('admin.products.showing_page', `Page ${products.current_page} of ${products.last_page}`)} •{' '}
                                        {t('admin.products.total_products', `${products.total} total products`)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={products.current_page === 1}
                                            onClick={() => router.get(route('admin.products.index'), { ...filters, page: products.current_page - 1 }, { preserveState: true })}
                                            className="border-gold/30 hover:bg-gold/10"
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-1" />
                                            {t('common.previous', 'Previous')}
                                        </Button>

                                        {/* Page numbers */}
                                        <div className="flex items-center gap-1">
                                            {products.links.slice(1, -1).map((link, index) => {
                                                const pageNum = index + 1;
                                                // Show first, last, current, and nearby pages
                                                const showPage = pageNum === 1 ||
                                                    pageNum === products.last_page ||
                                                    Math.abs(pageNum - products.current_page) <= 1;
                                                const showEllipsis = !showPage &&
                                                    (pageNum === 2 || pageNum === products.last_page - 1);

                                                if (!showPage && !showEllipsis) return null;

                                                if (showEllipsis) {
                                                    return <span key={`ellipsis-${pageNum}`} className="px-2 text-gray-400">...</span>;
                                                }

                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={link.active ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => router.get(route('admin.products.index'), { ...filters, page: pageNum }, { preserveState: true })}
                                                        className={link.active ? 'bg-gold hover:bg-gold/90 text-white' : 'border-gold/30 hover:bg-gold/10'}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={products.current_page === products.last_page}
                                            onClick={() => router.get(route('admin.products.index'), { ...filters, page: products.current_page + 1 }, { preserveState: true })}
                                            className="border-gold/30 hover:bg-gold/10"
                                        >
                                            {t('common.next', 'Next')}
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Edit Dialog */}
            <Dialog open={quickEditOpen} onOpenChange={setQuickEditOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gold">
                            {t('admin.products.quick_edit', 'Quick Edit')}: {currentProduct ? getTranslatable(currentProduct.name) : ''}
                        </DialogTitle>
                        <DialogDescription>
                            {t('admin.products.quick_edit_description', 'Update SKU, price, stock (0 = unlimited), and active status for variants')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {editingVariants.map((variant) => (
                            <div
                                key={variant.id}
                                className="grid grid-cols-4 gap-4 p-4 border border-gold/20 rounded-lg bg-gray-50"
                            >
                                <div className="col-span-4 flex items-center justify-between mb-2">
                                    <div className="text-sm font-semibold text-gray-700">
                                        {t('admin.products.variant', 'Variant')}: {variant.size}
                                        {variant.is_default && (
                                            <span className="ml-2 text-xs bg-gold/20 text-gold px-2 py-0.5 rounded">
                                                {t('admin.products.default', 'Default')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`active-${variant.id}`} className="text-xs font-medium text-gray-700">
                                            {variant.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                                        </Label>
                                        <Switch
                                            id={`active-${variant.id}`}
                                            checked={variant.is_active}
                                            onCheckedChange={(checked) =>
                                                updateVariantField(variant.id, 'is_active', checked)
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-medium text-gray-700 block mb-1">
                                        {t('admin.products.sku', 'SKU')}
                                    </label>
                                    <Input
                                        type="text"
                                        value={variant.sku}
                                        onChange={(e) =>
                                            updateVariantField(variant.id, 'sku', e.target.value)
                                        }
                                        className="font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-1">
                                        {t('admin.products.price_eur', 'Price (€)')}
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={variant.price}
                                        onChange={(e) =>
                                            updateVariantField(
                                                variant.id,
                                                'price',
                                                parseFloat(e.target.value)
                                            )
                                        }
                                        className="text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-1">
                                        {t('admin.products.compare_at_price', 'Regular Price (€)')}
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={variant.compare_at_price || ''}
                                        onChange={(e) =>
                                            updateVariantField(
                                                variant.id,
                                                'compare_at_price',
                                                e.target.value ? parseFloat(e.target.value) : null
                                            )
                                        }
                                        className="text-sm"
                                        placeholder={t('admin.products.optional', 'Optional')}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-1">
                                        {t('admin.products.stock', 'Stock')} <span className="text-gray-400">({t('admin.products.zero_unlimited', '0 = Unlimited')})</span>
                                    </label>
                                    <Input
                                        type="number"
                                        value={variant.stock}
                                        onChange={(e) =>
                                            updateVariantField(
                                                variant.id,
                                                'stock',
                                                parseInt(e.target.value) || 0
                                            )
                                        }
                                        className="text-sm"
                                        placeholder={t('admin.products.zero_unlimited', '0 = Unlimited')}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setQuickEditOpen(false)}
                            disabled={saving}
                        >
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                            onClick={saveQuickEdit}
                            disabled={saving}
                            className="bg-gold hover:bg-gold/90 text-white"
                        >
                            {saving ? t('common.saving', 'Saving...') : t('common.save_changes', 'Save Changes')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
