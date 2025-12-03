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
import { ArrowLeft, Save, Percent, DollarSign, Ticket } from 'lucide-react';
import { FormEventHandler } from 'react';

interface PromoCode {
    id: number;
    code: string;
    description: string | null;
    type: 'percentage' | 'fixed';
    value: number;
    min_order_amount: number | null;
    max_discount_amount: number | null;
    usage_limit: number | null;
    per_user_limit: number | null;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
}

interface PromoCodeFormProps {
    promoCode: PromoCode | null;
}

export default function PromoCodeForm({ promoCode }: PromoCodeFormProps) {
    const { t, route } = useTranslation();
    const isEditing = promoCode !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        code: promoCode?.code || '',
        description: promoCode?.description || '',
        type: promoCode?.type || 'percentage',
        value: promoCode?.value || 0,
        min_order_amount: promoCode?.min_order_amount || '',
        max_discount_amount: promoCode?.max_discount_amount || '',
        usage_limit: promoCode?.usage_limit || '',
        per_user_limit: promoCode?.per_user_limit || '',
        starts_at: promoCode?.starts_at || '',
        ends_at: promoCode?.ends_at || '',
        is_active: promoCode?.is_active ?? true,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEditing && promoCode) {
            put(route('admin.promo-codes.update', { promo_code: promoCode.id }), {
                preserveScroll: true,
            });
        } else {
            post(route('admin.promo-codes.store'), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout>
            <Head title={isEditing ? t('promo_codes.edit', 'Edit Promo Code') : t('promo_codes.create', 'Create Promo Code')} />

            <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8 max-w-3xl">
                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href={route('admin.promo-codes.index')}>
                            <ArrowLeft className="size-4 mr-2" />
                            {t('common.back', 'Back')}
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold uppercase tracking-wide text-foreground">
                        {isEditing ? t('promo_codes.edit', 'Edit Promo Code') : t('promo_codes.create', 'Create Promo Code')}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {isEditing
                            ? t('promo_codes.edit_subtitle', 'Update promo code settings')
                            : t('promo_codes.create_subtitle', 'Create a new promo code for checkout')}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="rounded-lg border border-border bg-card p-6 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Ticket className="size-5 text-muted-foreground" />
                            <h2 className="text-lg font-semibold">{t('promo_codes.basic_info', 'Basic Information')}</h2>
                        </div>

                        {/* Code */}
                        <div className="space-y-2">
                            <Label htmlFor="code">
                                {t('promo_codes.code', 'Code')} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                placeholder={t('promo_codes.code_placeholder', 'e.g., SUMMER20, WELCOME10')}
                                className={`uppercase ${errors.code ? 'border-red-500' : ''}`}
                                maxLength={50}
                            />
                            {errors.code && (
                                <p className="text-sm text-red-500">{errors.code}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {t('promo_codes.code_info', 'Customers will enter this code at checkout')}
                            </p>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">
                                {t('promo_codes.description', 'Description')}
                            </Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder={t('promo_codes.description_placeholder', 'Internal note about this promo code')}
                                className={errors.description ? 'border-red-500' : ''}
                                rows={2}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">{errors.description}</p>
                            )}
                        </div>

                        {/* Type & Value */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">
                                    {t('promo_codes.type', 'Discount Type')} <span className="text-red-500">*</span>
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
                                                {t('promo_codes.type_percentage', 'Percentage')}
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="fixed">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="size-4" />
                                                {t('promo_codes.type_fixed', 'Fixed Amount')}
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
                                    {t('promo_codes.value', 'Value')} <span className="text-red-500">*</span>
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
                    </div>

                    {/* Restrictions */}
                    <div className="rounded-lg border border-border bg-card p-6 space-y-6">
                        <h2 className="text-lg font-semibold">{t('promo_codes.restrictions', 'Restrictions')}</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="min_order_amount">
                                    {t('promo_codes.min_order_amount', 'Minimum Order Amount')}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="min_order_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.min_order_amount}
                                        onChange={(e) => setData('min_order_amount', e.target.value)}
                                        placeholder="0.00"
                                        className={`pr-10 ${errors.min_order_amount ? 'border-red-500' : ''}`}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                                </div>
                                {errors.min_order_amount && (
                                    <p className="text-sm text-red-500">{errors.min_order_amount}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="max_discount_amount">
                                    {t('promo_codes.max_discount_amount', 'Maximum Discount Amount')}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="max_discount_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.max_discount_amount}
                                        onChange={(e) => setData('max_discount_amount', e.target.value)}
                                        placeholder={t('promo_codes.unlimited', 'Unlimited')}
                                        className={`pr-10 ${errors.max_discount_amount ? 'border-red-500' : ''}`}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                                </div>
                                {errors.max_discount_amount && (
                                    <p className="text-sm text-red-500">{errors.max_discount_amount}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    {t('promo_codes.max_discount_info', 'Caps the discount (useful for percentage discounts)')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="usage_limit">
                                    {t('promo_codes.usage_limit', 'Total Usage Limit')}
                                </Label>
                                <Input
                                    id="usage_limit"
                                    type="number"
                                    min="1"
                                    value={data.usage_limit}
                                    onChange={(e) => setData('usage_limit', e.target.value)}
                                    placeholder={t('promo_codes.unlimited', 'Unlimited')}
                                    className={errors.usage_limit ? 'border-red-500' : ''}
                                />
                                {errors.usage_limit && (
                                    <p className="text-sm text-red-500">{errors.usage_limit}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="per_user_limit">
                                    {t('promo_codes.per_user_limit', 'Per User Limit')}
                                </Label>
                                <Input
                                    id="per_user_limit"
                                    type="number"
                                    min="1"
                                    value={data.per_user_limit}
                                    onChange={(e) => setData('per_user_limit', e.target.value)}
                                    placeholder={t('promo_codes.unlimited', 'Unlimited')}
                                    className={errors.per_user_limit ? 'border-red-500' : ''}
                                />
                                {errors.per_user_limit && (
                                    <p className="text-sm text-red-500">{errors.per_user_limit}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="rounded-lg border border-border bg-card p-6 space-y-6">
                        <h2 className="text-lg font-semibold">{t('promo_codes.schedule', 'Schedule')}</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="starts_at">
                                    {t('promo_codes.starts_at', 'Start Date')}
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
                                    {t('promo_codes.ends_at', 'End Date')}
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
                            {t('promo_codes.schedule_info', 'Leave empty for no time restrictions')}
                        </p>
                    </div>

                    {/* Status */}
                    <div className="rounded-lg border border-border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    {t('promo_codes.is_active', 'Active')}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('promo_codes.is_active_info', 'Inactive codes cannot be used at checkout')}
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
                            <Link href={route('admin.promo-codes.index')}>
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
