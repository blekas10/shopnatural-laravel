import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Percent, DollarSign, Tag } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface ProductDiscount {
    id: number;
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    scope: 'all' | 'categories' | 'brands' | 'products';
    category_ids: number[];
    brand_ids: number[];
    product_ids: number[];
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
    priority: number;
}

interface Option {
    id: number;
    name: string;
}

interface ProductDiscountFormProps {
    discount: ProductDiscount | null;
    categories: Option[];
    brands: Option[];
    products: Option[];
}

export default function ProductDiscountForm({ discount, categories, brands, products }: ProductDiscountFormProps) {
    const { t, route } = useTranslation();
    const isEditing = discount !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        name: discount?.name || '',
        type: discount?.type || 'percentage',
        value: discount?.value || 0,
        scope: discount?.scope || 'all',
        category_ids: discount?.category_ids || [],
        brand_ids: discount?.brand_ids || [],
        product_ids: discount?.product_ids || [],
        starts_at: discount?.starts_at || '',
        ends_at: discount?.ends_at || '',
        is_active: discount?.is_active ?? true,
        priority: discount?.priority || 0,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEditing && discount) {
            put(route('admin.product-discounts.update', { product_discount: discount.id }), {
                preserveScroll: true,
            });
        } else {
            post(route('admin.product-discounts.store'), {
                preserveScroll: true,
            });
        }
    };

    const toggleArrayItem = (field: 'category_ids' | 'brand_ids' | 'product_ids', id: number) => {
        const current = data[field];
        const newValue = current.includes(id)
            ? current.filter((item: number) => item !== id)
            : [...current, id];
        setData(field, newValue);
    };

    return (
        <AppLayout>
            <Head title={isEditing ? t('product_discounts.edit', 'Edit Discount') : t('product_discounts.create', 'Create Discount')} />

            <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8 max-w-3xl">
                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href={route('admin.product-discounts.index')}>
                            <ArrowLeft className="size-4 mr-2" />
                            {t('common.back', 'Back')}
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold uppercase tracking-wide text-foreground">
                        {isEditing ? t('product_discounts.edit', 'Edit Discount') : t('product_discounts.create', 'Create Discount')}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {isEditing
                            ? t('product_discounts.edit_subtitle', 'Update discount settings')
                            : t('product_discounts.create_subtitle', 'Create a new product discount')}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="rounded-lg border border-border bg-card p-6 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Tag className="size-5 text-muted-foreground" />
                            <h2 className="text-lg font-semibold">{t('product_discounts.basic_info', 'Basic Information')}</h2>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                {t('product_discounts.name', 'Name')} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={t('product_discounts.name_placeholder', 'e.g., Summer Sale, Black Friday')}
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        {/* Type & Value */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">
                                    {t('product_discounts.type', 'Discount Type')} <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(value: 'percentage' | 'fixed') => setData('type', value)}
                                >
                                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">
                                            <div className="flex items-center gap-2">
                                                <Percent className="size-4" />
                                                {t('product_discounts.type_percentage', 'Percentage')}
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="fixed">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="size-4" />
                                                {t('product_discounts.type_fixed', 'Fixed Amount')}
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && (
                                    <p className="text-sm text-red-500">{errors.type}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="value">
                                    {t('product_discounts.value', 'Value')} <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="value"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={data.type === 'percentage' ? 100 : undefined}
                                        value={data.value}
                                        onChange={(e) => setData('value', parseFloat(e.target.value) || 0)}
                                        className={`pr-10 ${errors.value ? 'border-red-500' : ''}`}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        {data.type === 'percentage' ? '%' : '€'}
                                    </span>
                                </div>
                                {errors.value && (
                                    <p className="text-sm text-red-500">{errors.value}</p>
                                )}
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <Label htmlFor="priority">
                                {t('product_discounts.priority', 'Priority')}
                            </Label>
                            <Input
                                id="priority"
                                type="number"
                                min="0"
                                value={data.priority}
                                onChange={(e) => setData('priority', parseInt(e.target.value) || 0)}
                                className={errors.priority ? 'border-red-500' : ''}
                            />
                            {errors.priority && (
                                <p className="text-sm text-red-500">{errors.priority}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {t('product_discounts.priority_info', 'Higher priority discounts are applied first')}
                            </p>
                        </div>
                    </div>

                    {/* Scope */}
                    <div className="rounded-lg border border-border bg-card p-6 space-y-6">
                        <h2 className="text-lg font-semibold">{t('product_discounts.scope_title', 'Discount Scope')}</h2>

                        {/* Scope Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="scope">
                                {t('product_discounts.applies_to', 'Applies To')} <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.scope}
                                onValueChange={(value: 'all' | 'categories' | 'brands' | 'products') => setData('scope', value)}
                            >
                                <SelectTrigger className={errors.scope ? 'border-red-500' : ''}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('product_discounts.scope_all', 'All Products')}</SelectItem>
                                    <SelectItem value="categories">{t('product_discounts.scope_categories', 'Specific Categories')}</SelectItem>
                                    <SelectItem value="brands">{t('product_discounts.scope_brands', 'Specific Brands')}</SelectItem>
                                    <SelectItem value="products">{t('product_discounts.scope_products', 'Specific Products')}</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.scope && (
                                <p className="text-sm text-red-500">{errors.scope}</p>
                            )}
                        </div>

                        {/* Category Selection */}
                        {data.scope === 'categories' && (
                            <div className="space-y-2">
                                <Label>{t('product_discounts.select_categories', 'Select Categories')}</Label>
                                <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                                    {categories.map((category) => (
                                        <div key={category.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`category-${category.id}`}
                                                checked={data.category_ids.includes(category.id)}
                                                onCheckedChange={() => toggleArrayItem('category_ids', category.id)}
                                            />
                                            <label
                                                htmlFor={`category-${category.id}`}
                                                className="text-sm cursor-pointer"
                                            >
                                                {category.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {errors.category_ids && (
                                    <p className="text-sm text-red-500">{errors.category_ids}</p>
                                )}
                            </div>
                        )}

                        {/* Brand Selection */}
                        {data.scope === 'brands' && (
                            <div className="space-y-2">
                                <Label>{t('product_discounts.select_brands', 'Select Brands')}</Label>
                                <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                                    {brands.map((brand) => (
                                        <div key={brand.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`brand-${brand.id}`}
                                                checked={data.brand_ids.includes(brand.id)}
                                                onCheckedChange={() => toggleArrayItem('brand_ids', brand.id)}
                                            />
                                            <label
                                                htmlFor={`brand-${brand.id}`}
                                                className="text-sm cursor-pointer"
                                            >
                                                {brand.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {errors.brand_ids && (
                                    <p className="text-sm text-red-500">{errors.brand_ids}</p>
                                )}
                            </div>
                        )}

                        {/* Product Selection */}
                        {data.scope === 'products' && (
                            <div className="space-y-2">
                                <Label>{t('product_discounts.select_products', 'Select Products')}</Label>
                                <div className="max-h-64 overflow-y-auto border rounded-md p-3 space-y-2">
                                    {products.map((product) => (
                                        <div key={product.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`product-${product.id}`}
                                                checked={data.product_ids.includes(product.id)}
                                                onCheckedChange={() => toggleArrayItem('product_ids', product.id)}
                                            />
                                            <label
                                                htmlFor={`product-${product.id}`}
                                                className="text-sm cursor-pointer"
                                            >
                                                {product.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {errors.product_ids && (
                                    <p className="text-sm text-red-500">{errors.product_ids}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Schedule */}
                    <div className="rounded-lg border border-border bg-card p-6 space-y-6">
                        <h2 className="text-lg font-semibold">{t('product_discounts.schedule', 'Schedule')}</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="starts_at">
                                    {t('product_discounts.starts_at', 'Start Date')}
                                </Label>
                                <Input
                                    id="starts_at"
                                    type="datetime-local"
                                    value={data.starts_at}
                                    onChange={(e) => setData('starts_at', e.target.value)}
                                    className={errors.starts_at ? 'border-red-500' : ''}
                                />
                                {errors.starts_at && (
                                    <p className="text-sm text-red-500">{errors.starts_at}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ends_at">
                                    {t('product_discounts.ends_at', 'End Date')}
                                </Label>
                                <Input
                                    id="ends_at"
                                    type="datetime-local"
                                    value={data.ends_at}
                                    onChange={(e) => setData('ends_at', e.target.value)}
                                    className={errors.ends_at ? 'border-red-500' : ''}
                                />
                                {errors.ends_at && (
                                    <p className="text-sm text-red-500">{errors.ends_at}</p>
                                )}
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            {t('product_discounts.schedule_info', 'Leave empty for no time restrictions')}
                        </p>
                    </div>

                    {/* Status */}
                    <div className="rounded-lg border border-border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    {t('product_discounts.is_active', 'Active')}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('product_discounts.is_active_info', 'Inactive discounts will not be applied to products')}
                                </p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', checked)}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.product-discounts.index')}>
                                {t('common.cancel', 'Cancel')}
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-gold hover:bg-gold/90">
                            <Save className="size-4 mr-2" />
                            {processing
                                ? t('common.saving', 'Saving...')
                                : isEditing
                                ? t('common.update', 'Update')
                                : t('common.create', 'Create')}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
