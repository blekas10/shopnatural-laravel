import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parent_id: number | null;
    order: number;
    is_active: boolean;
}

interface CategoryOption {
    id: number;
    name: string;
}

interface CategoryFormProps {
    category: Category | null;
    allCategories: CategoryOption[];
}

export default function CategoryForm({ category, allCategories }: CategoryFormProps) {
    const { t, route } = useTranslation();
    const isEditing = category !== null;

    const { data, setData, post, put, processing, errors, transform } = useForm({
        name: category?.name || '',
        slug: category?.slug || '',
        description: category?.description || '',
        parent_id: category?.parent_id?.toString() || '',
        order: category?.order || 0,
        is_active: category?.is_active ?? true,
    });

    // Transform data before sending - convert parent_id to integer or null
    transform((data) => ({
        ...data,
        parent_id: data.parent_id ? parseInt(data.parent_id) : null,
    }));

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEditing && category) {
            put(route('admin.categories.update', { category: category.id }), {
                preserveScroll: true,
            });
        } else {
            post(route('admin.categories.store'), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout>
            <Head title={isEditing ? t('categories.edit', 'Edit Category') : t('categories.create', 'Create Category')} />

            <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8 max-w-3xl">
                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href={route('admin.categories.index')}>
                            <ArrowLeft className="size-4 mr-2" />
                            {t('common.back', 'Back')}
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold uppercase tracking-wide text-foreground">
                        {isEditing ? t('categories.edit', 'Edit Category') : t('categories.create', 'Create Category')}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {isEditing
                            ? t('categories.edit_subtitle', 'Update category information')
                            : t('categories.create_subtitle', 'Add a new category to organize your products')}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border border-border bg-card p-6 space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                {t('categories.name', 'Name')} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={t('categories.name_placeholder', 'e.g., Vitamins, Supplements')}
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <Label htmlFor="slug">
                                {t('categories.slug', 'Slug')}
                                <span className="text-muted-foreground text-xs ml-2">
                                    {t('categories.slug_hint', '(Optional - auto-generated from name)')}
                                </span>
                            </Label>
                            <Input
                                id="slug"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                placeholder={t('categories.slug_placeholder', 'e.g., vitamins-supplements')}
                                className={errors.slug ? 'border-red-500' : ''}
                            />
                            {errors.slug && (
                                <p className="text-sm text-red-500">{errors.slug}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">
                                {t('categories.description', 'Description')}
                            </Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder={t('categories.description_placeholder', 'Brief description of this category...')}
                                rows={4}
                                className={errors.description ? 'border-red-500' : ''}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">{errors.description}</p>
                            )}
                        </div>

                        {/* Parent Category */}
                        <div className="space-y-2">
                            <Label htmlFor="parent_id">
                                {t('categories.parent', 'Parent Category')}
                                <span className="text-muted-foreground text-xs ml-2">
                                    {t('categories.parent_hint', '(Optional - leave empty for top-level category)')}
                                </span>
                            </Label>
                            <Select
                                value={data.parent_id}
                                onValueChange={(value) => setData('parent_id', value)}
                            >
                                <SelectTrigger className={errors.parent_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder={t('categories.select_parent', 'Select parent category...')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">
                                        {t('categories.no_parent', 'No parent (top-level)')}
                                    </SelectItem>
                                    {allCategories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.parent_id && (
                                <p className="text-sm text-red-500">{errors.parent_id}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {t('categories.parent_info', 'Select a parent to create a subcategory. You can nest categories multiple levels deep.')}
                            </p>
                        </div>

                        {/* Order */}
                        <div className="space-y-2">
                            <Label htmlFor="order">
                                {t('categories.order', 'Display Order')}
                            </Label>
                            <Input
                                id="order"
                                type="number"
                                value={data.order}
                                onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className={errors.order ? 'border-red-500' : ''}
                            />
                            {errors.order && (
                                <p className="text-sm text-red-500">{errors.order}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {t('categories.order_info', 'Lower numbers appear first. Use this to control the display order.')}
                            </p>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center justify-between rounded-lg border border-border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    {t('categories.is_active', 'Active')}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('categories.is_active_info', 'Inactive categories are hidden from customers')}
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
                            <Link href={route('admin.categories.index')}>
                                {t('common.cancel', 'Cancel')}
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
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
