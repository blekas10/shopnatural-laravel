import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Plus, Trash2, Upload, Star, Image as ImageIcon } from 'lucide-react';
import { FormEventHandler, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface Variant {
    id?: number;
    sku: string;
    size: number;
    price: number;
    compare_at_price: number | null;
    stock: number;
    low_stock_threshold: number;
    is_default: boolean;
    image_id: number | null;
    image_url?: string | null;
}

interface TranslatableField {
    en: string;
    lt: string;
}

interface ProductImage {
    id: number;
    url: string;
    alt_text: TranslatableField;
    is_primary: boolean;
    order: number;
}

interface Product {
    id: number;
    name: TranslatableField;
    slug: TranslatableField;
    title: TranslatableField;
    short_description: TranslatableField;
    description: TranslatableField;
    additional_information: TranslatableField;
    ingredients: TranslatableField;
    meta_title: TranslatableField;
    meta_description: TranslatableField;
    focus_keyphrase: TranslatableField;
    brand_id: number | null;
    is_active: boolean;
    is_featured: boolean;
    category_ids: number[];
    variants: Variant[];
    images?: ProductImage[];
}

interface Category {
    id: number;
    name: string;
}

interface Brand {
    id: number;
    name: string;
}

interface ProductFormProps {
    product: Product | null;
    categories: Category[];
    brands: Brand[];
}

type Locale = 'en' | 'lt';

const emptyTranslatable = (): TranslatableField => ({ en: '', lt: '' });

export default function ProductForm({ product, categories, brands }: ProductFormProps) {
    const { t, route } = useTranslation();
    const isEditing = product !== null;
    const [activeLocale, setActiveLocale] = useState<Locale>('en');
    const [images, setImages] = useState<ProductImage[]>(product?.images || []);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, put, processing, errors } = useForm({
        name: product?.name || emptyTranslatable(),
        slug: product?.slug || emptyTranslatable(),
        title: product?.title || emptyTranslatable(),
        short_description: product?.short_description || emptyTranslatable(),
        description: product?.description || emptyTranslatable(),
        additional_information: product?.additional_information || emptyTranslatable(),
        ingredients: product?.ingredients || emptyTranslatable(),
        meta_title: product?.meta_title || emptyTranslatable(),
        meta_description: product?.meta_description || emptyTranslatable(),
        focus_keyphrase: product?.focus_keyphrase || emptyTranslatable(),
        brand_id: product?.brand_id?.toString() || 'none',
        is_active: product?.is_active ?? true,
        is_featured: product?.is_featured ?? false,
        category_ids: product?.category_ids || [],
        variants: product?.variants || [
            {
                sku: '',
                size: 500,
                price: 0,
                compare_at_price: null,
                stock: 0,
                low_stock_threshold: 5,
                is_default: true,
            },
        ],
        delete_variant_ids: [] as number[],
    });

    const updateTranslatableField = (field: keyof typeof data, value: string) => {
        const currentValue = data[field] as TranslatableField;
        setData(field, {
            ...currentValue,
            [activeLocale]: value,
        });
    };

    const getTranslatableValue = (field: keyof typeof data): string => {
        const value = data[field] as TranslatableField;
        return value?.[activeLocale] || '';
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        const formData = {
            ...data,
            brand_id: data.brand_id && data.brand_id !== 'none' ? parseInt(data.brand_id) : null,
        };

        if (isEditing && product) {
            put(route('admin.products.update', { product: product.id }), {
                data: formData,
            });
        } else {
            post(route('admin.products.store'), {
                data: formData,
            });
        }
    };

    const addVariant = () => {
        setData('variants', [
            ...data.variants,
            {
                sku: '',
                size: 500,
                price: 0,
                compare_at_price: null,
                stock: 0,
                low_stock_threshold: 5,
                is_default: false,
                image_id: null,
                image_url: null,
            },
        ]);
    };

    const removeVariant = (index: number) => {
        if (data.variants.length <= 1) return;

        const variant = data.variants[index];
        const newVariants = data.variants.filter((_, i) => i !== index);

        if (variant.is_default && newVariants.length > 0) {
            newVariants[0].is_default = true;
        }

        setData('variants', newVariants);

        if (variant.id) {
            setData('delete_variant_ids', [...data.delete_variant_ids, variant.id]);
        }
    };

    const updateVariant = (index: number, field: keyof Variant, value: unknown) => {
        const newVariants = [...data.variants];
        newVariants[index] = { ...newVariants[index], [field]: value };

        if (field === 'is_default' && value === true) {
            newVariants.forEach((v, i) => {
                if (i !== index) v.is_default = false;
            });
        }

        setData('variants', newVariants);
    };

    const toggleCategory = (categoryId: number) => {
        const currentIds = data.category_ids;
        if (currentIds.includes(categoryId)) {
            setData(
                'category_ids',
                currentIds.filter((id) => id !== categoryId)
            );
        } else {
            setData('category_ids', [...currentIds, categoryId]);
        }
    };

    const getTranslationStatus = (locale: Locale): 'complete' | 'partial' | 'empty' => {
        const fields = [
            data.name[locale],
            data.description[locale],
        ];
        const filled = fields.filter((f) => f && f.trim() !== '').length;
        if (filled === 0) return 'empty';
        if (filled === fields.length) return 'complete';
        return 'partial';
    };

    // Image handling functions
    const handleImageUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !product?.id) return;

        setUploading(true);
        const formData = new FormData();

        Array.from(files).forEach((file) => {
            formData.append('images[]', file);
        });

        try {
            const response = await axios.post(`/admin/products/${product.id}/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                setImages((prev) => [...prev, ...response.data.images]);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert(t('admin.products.images.upload_failed', 'Failed to upload images'));
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        if (!product?.id) return;

        if (!confirm(t('admin.products.images.delete_confirm', 'Delete this image?'))) {
            return;
        }

        try {
            await axios.delete(`/admin/products/${product.id}/images/${imageId}`);
            setImages((prev) => prev.filter((img) => img.id !== imageId));
        } catch (error) {
            console.error('Delete failed:', error);
            alert(t('admin.products.images.delete_failed', 'Failed to delete image'));
        }
    };

    const handleSetPrimary = async (imageId: number) => {
        if (!product?.id) return;

        try {
            await axios.post(`/admin/products/${product.id}/images/${imageId}/primary`);
            setImages((prev) =>
                prev.map((img) => ({
                    ...img,
                    is_primary: img.id === imageId,
                }))
            );
        } catch (error) {
            console.error('Set primary failed:', error);
        }
    };

    // Variant image upload
    const handleVariantImageUpload = async (variantIndex: number, file: File) => {
        if (!product?.id) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('images[]', file);

        try {
            const response = await axios.post(`/admin/products/${product.id}/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success && response.data.images.length > 0) {
                const uploadedImage = response.data.images[0];

                // Add to images list
                setImages((prev) => [...prev, uploadedImage]);

                // Update variant with image_id and image_url
                updateVariant(variantIndex, 'image_id', uploadedImage.id);
                updateVariant(variantIndex, 'image_url', uploadedImage.url);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert(t('admin.products.images.upload_failed', 'Failed to upload image'));
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveVariantImage = (variantIndex: number) => {
        updateVariant(variantIndex, 'image_id', null);
        updateVariant(variantIndex, 'image_url', null);
    };

    return (
        <AppLayout>
            <Head
                title={
                    isEditing
                        ? t('admin.products.edit_title', 'Edit Product')
                        : t('admin.products.create_title', 'Create Product')
                }
            />

            <div className="container mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href={route('admin.products.index')}>
                            <ArrowLeft className="mr-2 size-4" />
                            {t('common.back', 'Back')}
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold uppercase tracking-wide text-foreground">
                        {isEditing
                            ? t('admin.products.edit_title', 'Edit Product')
                            : t('admin.products.create_title', 'Create Product')}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {isEditing
                            ? t('admin.products.edit_subtitle', 'Update product information')
                            : t('admin.products.create_subtitle', 'Add a new product to your catalog')}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Language Tabs */}
                    <div className="rounded-lg border border-border bg-card p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold mb-4">
                                {t('admin.products.form.translations', 'Translations')}
                            </h2>
                            <div className="flex gap-2">
                                {(['en', 'lt'] as Locale[]).map((locale) => {
                                    const status = getTranslationStatus(locale);
                                    return (
                                        <button
                                            key={locale}
                                            type="button"
                                            onClick={() => setActiveLocale(locale)}
                                            className={cn(
                                                'relative px-4 py-2 rounded-md font-medium transition-colors',
                                                activeLocale === locale
                                                    ? 'bg-gold text-white'
                                                    : 'bg-muted hover:bg-muted/80'
                                            )}
                                        >
                                            {locale.toUpperCase()}
                                            {status === 'complete' && (
                                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                                            )}
                                            {status === 'partial' && (
                                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full" />
                                            )}
                                            {status === 'empty' && locale !== 'en' && (
                                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t(
                                    'admin.products.form.translation_hint',
                                    'Fill in product content for each language. English is required.'
                                )}
                            </p>
                        </div>

                        {/* Translatable Fields */}
                        <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        {t('admin.products.form.name', 'Product Name')}{' '}
                                        <span className="text-red-500">*</span>
                                        <span className="ml-2 text-xs uppercase text-muted-foreground">
                                            [{activeLocale}]
                                        </span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={getTranslatableValue('name')}
                                        onChange={(e) => updateTranslatableField('name', e.target.value)}
                                        placeholder={t('admin.products.form.name_placeholder', 'Enter product name')}
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">
                                        {t('admin.products.form.slug', 'URL Slug')}
                                        <span className="ml-2 text-xs uppercase text-muted-foreground">
                                            [{activeLocale}]
                                        </span>
                                    </Label>
                                    <Input
                                        id="slug"
                                        value={getTranslatableValue('slug')}
                                        onChange={(e) => updateTranslatableField('slug', e.target.value)}
                                        placeholder="product-url-slug"
                                        className={errors.slug ? 'border-red-500' : ''}
                                    />
                                    {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    {t('admin.products.form.title', 'SEO Title')}
                                    <span className="ml-2 text-xs uppercase text-muted-foreground">
                                        [{activeLocale}]
                                    </span>
                                </Label>
                                <Input
                                    id="title"
                                    value={getTranslatableValue('title')}
                                    onChange={(e) => updateTranslatableField('title', e.target.value)}
                                    placeholder={t('admin.products.form.title_placeholder', 'Optional SEO title')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="short_description">
                                    {t('admin.products.form.short_description', 'Short Description')}
                                    <span className="ml-2 text-xs uppercase text-muted-foreground">
                                        [{activeLocale}]
                                    </span>
                                </Label>
                                <Textarea
                                    id="short_description"
                                    value={getTranslatableValue('short_description')}
                                    onChange={(e) => updateTranslatableField('short_description', e.target.value)}
                                    placeholder={t(
                                        'admin.products.form.short_description_placeholder',
                                        'Brief product summary'
                                    )}
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    {t('admin.products.form.description', 'Full Description')}
                                    <span className="ml-2 text-xs uppercase text-muted-foreground">
                                        [{activeLocale}]
                                    </span>
                                </Label>
                                <Textarea
                                    id="description"
                                    value={getTranslatableValue('description')}
                                    onChange={(e) => updateTranslatableField('description', e.target.value)}
                                    placeholder={t(
                                        'admin.products.form.description_placeholder',
                                        'Detailed product description'
                                    )}
                                    rows={6}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ingredients">
                                    {t('admin.products.form.ingredients', 'Ingredients')}
                                    <span className="ml-2 text-xs uppercase text-muted-foreground">
                                        [{activeLocale}]
                                    </span>
                                </Label>
                                <Textarea
                                    id="ingredients"
                                    value={getTranslatableValue('ingredients')}
                                    onChange={(e) => updateTranslatableField('ingredients', e.target.value)}
                                    placeholder={t('admin.products.form.ingredients_placeholder', 'List of ingredients')}
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="additional_information">
                                    {t('admin.products.form.additional_information', 'Additional Information')}
                                    <span className="ml-2 text-xs uppercase text-muted-foreground">
                                        [{activeLocale}]
                                    </span>
                                </Label>
                                <Textarea
                                    id="additional_information"
                                    value={getTranslatableValue('additional_information')}
                                    onChange={(e) => updateTranslatableField('additional_information', e.target.value)}
                                    placeholder={t(
                                        'admin.products.form.additional_information_placeholder',
                                        'Extra details, usage instructions, etc.'
                                    )}
                                    rows={4}
                                />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="meta_title">
                                        {t('admin.products.form.meta_title', 'Meta Title')}
                                        <span className="ml-2 text-xs uppercase text-muted-foreground">
                                            [{activeLocale}]
                                        </span>
                                    </Label>
                                    <Input
                                        id="meta_title"
                                        value={getTranslatableValue('meta_title')}
                                        onChange={(e) => updateTranslatableField('meta_title', e.target.value)}
                                        placeholder={t('admin.products.form.meta_title_placeholder', 'SEO meta title')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="meta_description">
                                        {t('admin.products.form.meta_description', 'Meta Description')}
                                        <span className="ml-2 text-xs uppercase text-muted-foreground">
                                            [{activeLocale}]
                                        </span>
                                    </Label>
                                    <Textarea
                                        id="meta_description"
                                        value={getTranslatableValue('meta_description')}
                                        onChange={(e) => updateTranslatableField('meta_description', e.target.value)}
                                        placeholder={t(
                                            'admin.products.form.meta_description_placeholder',
                                            'SEO meta description'
                                        )}
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="focus_keyphrase">
                                    {t('admin.products.form.focus_keyphrase', 'Focus Keyphrase')}
                                    <span className="ml-2 text-xs uppercase text-muted-foreground">
                                        [{activeLocale}]
                                    </span>
                                </Label>
                                <Input
                                    id="focus_keyphrase"
                                    value={getTranslatableValue('focus_keyphrase')}
                                    onChange={(e) => updateTranslatableField('focus_keyphrase', e.target.value)}
                                    placeholder={t('admin.products.form.focus_keyphrase_placeholder', 'SEO focus keyphrase')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Categories & Brand */}
                    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
                        <h2 className="text-lg font-semibold">
                            {t('admin.products.form.categories', 'Categories')} &{' '}
                            {t('admin.products.form.brand', 'Brand')}
                        </h2>

                        <div className="space-y-2">
                            <Label>{t('admin.products.form.categories', 'Categories')}</Label>
                            <p className="text-sm text-muted-foreground mb-2">
                                {t('admin.products.form.select_categories', 'Select categories for this product')}
                            </p>
                            <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-border p-3">
                                {categories.map((category) => (
                                    <div key={category.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`cat-${category.id}`}
                                            checked={data.category_ids.includes(category.id)}
                                            onCheckedChange={() => toggleCategory(category.id)}
                                        />
                                        <label htmlFor={`cat-${category.id}`} className="cursor-pointer text-sm">
                                            {category.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="brand_id">{t('admin.products.form.brand', 'Brand')}</Label>
                            <Select value={data.brand_id} onValueChange={(value) => setData('brand_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('admin.products.form.select_brand', 'Select brand')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        {t('admin.products.form.no_brand', 'No brand')}
                                    </SelectItem>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.id} value={brand.id.toString()}>
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Product Images (only for editing) */}
                    {isEditing && (
                        <div className="space-y-6 rounded-lg border border-border bg-card p-6">
                            <h2 className="text-lg font-semibold">
                                {t('admin.products.form.images', 'Product Images')}
                            </h2>

                            {/* Upload Zone */}
                            <div
                                className={cn(
                                    'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                                    uploading ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'
                                )}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e.target.files)}
                                    disabled={uploading}
                                />
                                <Upload className="mx-auto size-12 text-muted-foreground mb-4" />
                                <p className="text-lg font-medium mb-2">
                                    {uploading
                                        ? t('admin.products.images.uploading', 'Uploading...')
                                        : t('admin.products.images.drop_here', 'Drop images here or click to upload')}
                                </p>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {t('admin.products.images.formats', 'JPG, PNG, WebP up to 5MB each')}
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    {t('admin.products.images.select_files', 'Select Files')}
                                </Button>
                            </div>

                            {/* Image Grid */}
                            {images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {images
                                        .sort((a, b) => a.order - b.order)
                                        .map((image) => (
                                            <div
                                                key={image.id}
                                                className={cn(
                                                    'relative group rounded-lg overflow-hidden border-2',
                                                    image.is_primary ? 'border-gold' : 'border-border'
                                                )}
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={image.alt_text.en || 'Product image'}
                                                    className="w-full h-40 object-cover"
                                                />

                                                {/* Primary Badge */}
                                                {image.is_primary && (
                                                    <div className="absolute top-2 left-2 bg-gold text-white text-xs px-2 py-1 rounded">
                                                        {t('admin.products.images.primary', 'Primary')}
                                                    </div>
                                                )}

                                                {/* Actions Overlay */}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    {!image.is_primary && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => handleSetPrimary(image.id)}
                                                            title={t('admin.products.images.set_primary', 'Set as primary')}
                                                        >
                                                            <Star className="size-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDeleteImage(image.id)}
                                                        title={t('admin.products.images.delete', 'Delete')}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}

                            {images.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <ImageIcon className="mx-auto size-12 mb-4 opacity-50" />
                                    <p>{t('admin.products.images.no_images', 'No images uploaded yet')}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Note for Create mode */}
                    {!isEditing && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <p className="text-amber-800 text-sm">
                                <strong>{t('admin.products.images.note', 'Note:')}</strong>{' '}
                                {t(
                                    'admin.products.images.save_first',
                                    'Save the product first, then you can upload images by editing it.'
                                )}
                            </p>
                        </div>
                    )}

                    {/* Variants */}
                    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                {t('admin.products.form.variants', 'Product Variants')}
                            </h2>
                            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                                <Plus className="mr-2 size-4" />
                                {t('admin.products.form.add_variant', 'Add Variant')}
                            </Button>
                        </div>

                        {errors.variants && <p className="text-sm text-red-500">{errors.variants}</p>}

                        <div className="space-y-4">
                            {data.variants.map((variant, index) => (
                                <div key={index} className="rounded-md border border-border bg-background p-4">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="font-medium">
                                            {t('admin.products.form.variant_number', 'Variant #{number}').replace(
                                                '{number}',
                                                String(index + 1)
                                            )}
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`default-${index}`}
                                                    checked={variant.is_default}
                                                    onCheckedChange={(checked) =>
                                                        updateVariant(index, 'is_default', checked)
                                                    }
                                                />
                                                <label htmlFor={`default-${index}`} className="cursor-pointer text-sm">
                                                    {t('admin.products.form.is_default', 'Default variant')}
                                                </label>
                                            </div>
                                            {data.variants.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => removeVariant(index)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label>
                                                {t('admin.products.form.sku', 'SKU')}{' '}
                                                <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                value={variant.sku}
                                                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                placeholder={t('admin.products.form.sku_placeholder', 'Stock keeping unit')}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>
                                                {t('admin.products.form.size', 'Size (ml)')}{' '}
                                                <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="number"
                                                value={variant.size}
                                                onChange={(e) =>
                                                    updateVariant(index, 'size', parseInt(e.target.value) || 0)
                                                }
                                                min={1}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>
                                                {t('admin.products.form.price', 'Price (EUR)')}{' '}
                                                <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={variant.price}
                                                onChange={(e) =>
                                                    updateVariant(index, 'price', parseFloat(e.target.value) || 0)
                                                }
                                                min={0}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>{t('admin.products.form.compare_at_price', 'Compare at Price')}</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={variant.compare_at_price || ''}
                                                onChange={(e) =>
                                                    updateVariant(
                                                        index,
                                                        'compare_at_price',
                                                        e.target.value ? parseFloat(e.target.value) : null
                                                    )
                                                }
                                                min={0}
                                                placeholder={t(
                                                    'admin.products.form.compare_at_price_placeholder',
                                                    'Original price for discounts'
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>
                                                {t('admin.products.form.stock', 'Stock Quantity')}{' '}
                                                <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="number"
                                                value={variant.stock}
                                                onChange={(e) =>
                                                    updateVariant(index, 'stock', parseInt(e.target.value) || 0)
                                                }
                                                min={0}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>{t('admin.products.form.low_stock_threshold', 'Low Stock Alert')}</Label>
                                            <Input
                                                type="number"
                                                value={variant.low_stock_threshold}
                                                onChange={(e) =>
                                                    updateVariant(
                                                        index,
                                                        'low_stock_threshold',
                                                        parseInt(e.target.value) || 0
                                                    )
                                                }
                                                min={0}
                                            />
                                        </div>
                                    </div>

                                    {/* Variant Image */}
                                    {isEditing && (
                                        <div className="mt-4 space-y-2">
                                            <Label>{t('admin.products.form.variant_image', 'Variant Image')}</Label>
                                            {variant.image_url ? (
                                                <div className="relative inline-block">
                                                    <img
                                                        src={variant.image_url}
                                                        alt={`Variant ${variant.size}ml`}
                                                        className="h-24 w-24 rounded-lg border-2 border-border object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveVariantImage(index)}
                                                        className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                                                    >
                                                        <Trash2 className="size-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <input
                                                        type="file"
                                                        id={`variant-image-${index}`}
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                handleVariantImageUpload(index, file);
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            document.getElementById(`variant-image-${index}`)?.click();
                                                        }}
                                                        disabled={uploading}
                                                    >
                                                        <Upload className="mr-2 size-4" />
                                                        {uploading
                                                            ? t('admin.products.form.uploading', 'Uploading...')
                                                            : t('admin.products.form.upload_image', 'Upload Image')}
                                                    </Button>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {t(
                                                            'admin.products.form.variant_image_help',
                                                            'Image specific to this variant size'
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
                        <h2 className="text-lg font-semibold">{t('admin.products.form.status', 'Status')}</h2>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between rounded-lg border border-border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active" className="cursor-pointer">
                                        {t('admin.products.form.is_active', 'Active')}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('admin.products.form.active_info', 'Product will be visible to customers')}
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border border-border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_featured" className="cursor-pointer">
                                        {t('admin.products.form.is_featured', 'Featured')}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t(
                                            'admin.products.form.featured_info',
                                            'Show on homepage and featured sections'
                                        )}
                                    </p>
                                </div>
                                <Switch
                                    id="is_featured"
                                    checked={data.is_featured}
                                    onCheckedChange={(checked) => setData('is_featured', checked)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.products.index')}>{t('common.cancel', 'Cancel')}</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-gold hover:bg-gold/90">
                            <Save className="mr-2 size-4" />
                            {processing
                                ? isEditing
                                    ? t('admin.products.form.updating', 'Updating...')
                                    : t('admin.products.form.creating', 'Creating...')
                                : isEditing
                                  ? t('admin.products.form.update_product', 'Update Product')
                                  : t('admin.products.form.create_product', 'Create Product')}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
