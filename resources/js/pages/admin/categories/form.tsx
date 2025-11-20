import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Globe } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { adminCategoriesIndex as index, adminCategoriesStore as store, adminCategoriesUpdate as update } from '@/routes';

interface TranslatableField {
    en: string;
    lt: string;
}

interface Category {
    id: number;
    name: TranslatableField;
    slug: string;
    description: TranslatableField;
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
    const { t } = useTranslation();
    const isEditing = category !== null;
    const [activeTab, setActiveTab] = useState('en');

    const { data, setData, post, put, processing, errors, transform } = useForm({
        name: category?.name || { en: '', lt: '' },
        slug: category?.slug || '',
        description: category?.description || { en: '', lt: '' },
        parent_id: category?.parent_id?.toString() || 'none',
        order: category?.order || 0,
        is_active: category?.is_active ?? true,
    });

    // Transform data before sending - convert parent_id to integer or null
    transform((data) => ({
        ...data,
        parent_id: data.parent_id && data.parent_id !== 'none' ? parseInt(data.parent_id) : null,
    }));

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEditing && category) {
            put(update.url(category.id), {
                preserveScroll: true,
            });
        } else {
            post(store.url(), {
                preserveScroll: true,
            });
        }
    };

    const updateTranslatableField = (field: 'name' | 'description', lang: 'en' | 'lt', value: string) => {
        setData(field, {
            ...data[field],
            [lang]: value,
        });
    };

    return (
        <AppLayout>
            <Head title={isEditing ? t('categories.edit', 'Edit Category') : t('categories.create', 'Create Category')} />

            <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8 max-w-3xl">
                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href={index.url()}>
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
                    {/* Translatable Fields */}
                    <div className="rounded-lg border border-border bg-card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Globe className="size-5 text-muted-foreground" />
                            <h2 className="text-lg font-semibold">{t('admin.products.translations', 'Translations')}</h2>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="en" className="flex items-center gap-2">
                                    🇬🇧 English
                                </TabsTrigger>
                                <TabsTrigger value="lt" className="flex items-center gap-2">
                                    🇱🇹 Lietuvių
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="en" className="space-y-4">
                                {/* English Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name_en">
                                        {t('categories.name', 'Name')} <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name_en"
                                        value={data.name.en}
                                        onChange={(e) => updateTranslatableField('name', 'en', e.target.value)}
                                        placeholder={t('categories.name_placeholder', 'e.g., Hair Care, Body Care')}
                                        className={errors['name.en'] ? 'border-red-500' : ''}
                                    />
                                    {errors['name.en'] && (
                                        <p className="text-sm text-red-500">{errors['name.en']}</p>
                                    )}
                                </div>

                                {/* English Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description_en">
                                        {t('categories.description', 'Description')}
                                    </Label>
                                    <Textarea
                                        id="description_en"
                                        value={data.description.en}
                                        onChange={(e) => updateTranslatableField('description', 'en', e.target.value)}
                                        placeholder={t('categories.description_placeholder', 'Brief description of this category...')}
                                        rows={4}
                                        className={errors['description.en'] ? 'border-red-500' : ''}
                                    />
                                    {errors['description.en'] && (
                                        <p className="text-sm text-red-500">{errors['description.en']}</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="lt" className="space-y-4">
                                {/* Lithuanian Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name_lt">
                                        {t('categories.name', 'Name')}
                                    </Label>
                                    <Input
                                        id="name_lt"
                                        value={data.name.lt}
                                        onChange={(e) => updateTranslatableField('name', 'lt', e.target.value)}
                                        placeholder={t('categories.name_placeholder_lt', 'pvz., Plaukų priežiūra, Kūno priežiūra')}
                                        className={errors['name.lt'] ? 'border-red-500' : ''}
                                    />
                                    {errors['name.lt'] && (
                                        <p className="text-sm text-red-500">{errors['name.lt']}</p>
                                    )}
                                </div>

                                {/* Lithuanian Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description_lt">
                                        {t('categories.description', 'Description')}
                                    </Label>
                                    <Textarea
                                        id="description_lt"
                                        value={data.description.lt}
                                        onChange={(e) => updateTranslatableField('description', 'lt', e.target.value)}
                                        placeholder={t('categories.description_placeholder_lt', 'Trumpas kategorijos aprašymas...')}
                                        rows={4}
                                        className={errors['description.lt'] ? 'border-red-500' : ''}
                                    />
                                    {errors['description.lt'] && (
                                        <p className="text-sm text-red-500">{errors['description.lt']}</p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Non-translatable Fields */}
                    <div className="rounded-lg border border-border bg-card p-6 space-y-6">
                        <h2 className="text-lg font-semibold mb-4">{t('categories.settings', 'Category Settings')}</h2>

                        {/* Slug */}
                        <div className="space-y-2">
                            <Label htmlFor="slug">
                                {t('categories.slug', 'Slug')}
                                <span className="text-muted-foreground text-xs ml-2">
                                    {t('categories.slug_hint', '(Optional - auto-generated from English name)')}
                                </span>
                            </Label>
                            <Input
                                id="slug"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                placeholder={t('categories.slug_placeholder', 'e.g., hair-care')}
                                className={errors.slug ? 'border-red-500' : ''}
                            />
                            {errors.slug && (
                                <p className="text-sm text-red-500">{errors.slug}</p>
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
                                    <SelectItem value="none">
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
                            <Link href={index.url()}>
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
