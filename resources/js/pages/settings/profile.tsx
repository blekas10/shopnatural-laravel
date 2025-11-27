'use client';

import { Head, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Lock, Check, Info, Eye, EyeOff, CheckCircle, MapPin, Phone } from 'lucide-react';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { CountrySelector } from '@/components/country-selector';

interface ProfileProps {
    mustVerifyEmail: boolean;
    status?: string;
}

export default function Profile({ mustVerifyEmail, status }: ProfileProps) {
    const { t, route } = useTranslation();
    const { auth } = usePage<SharedData>().props;

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);

    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('sidebar.dashboard', 'Dashboard'),
            href: route('dashboard'),
        },
        {
            title: t('settings.page_title', 'Settings'),
            href: route('profile.edit'),
        },
    ];

    // Profile form
    const profileForm = useForm({
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone || '',
        billing_address: auth.user.billing_address || '',
        billing_city: auth.user.billing_city || '',
        billing_state: auth.user.billing_state || '',
        billing_postal_code: auth.user.billing_postal_code || '',
        billing_country: auth.user.billing_country || '',
        shipping_address: auth.user.shipping_address || '',
        shipping_city: auth.user.shipping_city || '',
        shipping_state: auth.user.shipping_state || '',
        shipping_postal_code: auth.user.shipping_postal_code || '',
        shipping_country: auth.user.shipping_country || '',
    });

    // Password form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Password requirements checker
    const checkPasswordRequirements = (password: string) => {
        return {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
        };
    };

    const requirements = checkPasswordRequirements(passwordForm.data.password);

    const submitProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put(route('user-password.update'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
            onError: (errors) => {
                if (errors.password) {
                    passwordForm.reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    passwordForm.reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.page_title', 'Settings')} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold uppercase tracking-wide md:text-3xl">
                        {t('settings.page_title', 'Settings')}
                    </h1>
                    <p className="text-sm text-muted-foreground md:text-base">
                        {t('settings.description', 'Manage your account settings and preferences')}
                    </p>
                </div>

                {/* Success Messages */}
                {status === 'profile-updated' && Object.keys(profileForm.errors).length === 0 && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-900">
                            {t('settings.profile_updated', 'Your profile has been updated successfully!')}
                        </AlertDescription>
                    </Alert>
                )}

                {status === 'password-updated' && Object.keys(passwordForm.errors).length === 0 && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-900">
                            {t('settings.password_updated', 'Your password has been updated successfully!')}
                        </AlertDescription>
                    </Alert>
                )}

                {status === 'verification-link-sent' && (
                    <Alert className="border-blue-200 bg-blue-50">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-900">
                            {t('settings.verification_link_sent', 'A new verification link has been sent to your email address.')}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Single Form for Profile + Addresses */}
                <form onSubmit={submitProfile} noValidate className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 max-w-6xl">
                        {/* Profile Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-gold" />
                                    {t('settings.profile_info', 'Profile Information')}
                                </CardTitle>
                                <CardDescription>
                                    {t('settings.profile_info_description', 'Update your name and email address')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('auth.full_name', 'Full Name')}</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={profileForm.data.name}
                                        className={cn("mt-1 block w-full", profileForm.errors.name && "border-red-500")}
                                        autoComplete="name"
                                        placeholder={t('checkout.full_name_placeholder', 'John Doe')}
                                        onChange={(e) => profileForm.setData('name', e.target.value)}
                                        aria-invalid={!!profileForm.errors.name}
                                    />
                                    {profileForm.errors.name && (
                                        <p className="text-sm text-red-600">
                                            {profileForm.errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">{t('checkout.email', 'Email')}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={profileForm.data.email}
                                        className={cn("mt-1 block w-full", profileForm.errors.email && "border-red-500")}
                                        autoComplete="username"
                                        placeholder="your@email.com"
                                        onChange={(e) => profileForm.setData('email', e.target.value)}
                                        aria-invalid={!!profileForm.errors.email}
                                    />
                                    {profileForm.errors.email && (
                                        <p className="text-sm text-red-600">
                                            {profileForm.errors.email}
                                        </p>
                                    )}

                                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                                        <div className="flex items-center gap-3">
                                            <p className="text-sm text-amber-600">
                                                {t('settings.email_unverified', 'Your email address is unverified.')}
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    router.post('/email/verification-notification', {}, {
                                                        preserveScroll: true,
                                                    });
                                                }}
                                                disabled={profileForm.processing}
                                            >
                                                {t('settings.resend_verification', 'Resend verification email')}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">
                                        <Phone className="inline h-4 w-4 mr-1" />
                                        {t('orders.phone', 'Phone')}
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        value={profileForm.data.phone}
                                        className={cn("mt-1 block w-full", profileForm.errors.phone && "border-red-500")}
                                        autoComplete="tel"
                                        placeholder="+370 600 12345"
                                        pattern="[0-9+\-\s()]+"
                                        onChange={(e) => {
                                            // Only allow numbers, +, -, spaces, and parentheses
                                            const value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
                                            profileForm.setData('phone', value);
                                        }}
                                        aria-invalid={!!profileForm.errors.phone}
                                    />
                                    {profileForm.errors.phone && (
                                        <p className="text-sm text-red-600">
                                            {profileForm.errors.phone}
                                        </p>
                                    )}
                                </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Address Cards Grid */}
                        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                            {/* Billing Address Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-gold" />
                                {t('settings.billing_address', 'Billing Address')}
                            </CardTitle>
                            <CardDescription>
                                {t('settings.billing_address_description', 'Your default billing address for orders')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="billing_address">{t('checkout.address', 'Address')}</Label>
                                    <Input
                                        id="billing_address"
                                        type="text"
                                        name="billing_address"
                                        value={profileForm.data.billing_address}
                                        className={cn("mt-1 block w-full", profileForm.errors.billing_address && "border-red-500")}
                                        placeholder={t('checkout.address_placeholder', 'Street address')}
                                        onChange={(e) => profileForm.setData('billing_address', e.target.value)}
                                        aria-invalid={!!profileForm.errors.billing_address}
                                    />
                                    {profileForm.errors.billing_address && (
                                        <p className="text-sm text-red-600">
                                            {profileForm.errors.billing_address}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="billing_city">{t('checkout.city', 'City')}</Label>
                                    <Input
                                        id="billing_city"
                                        type="text"
                                        name="billing_city"
                                        value={profileForm.data.billing_city}
                                        className={cn("mt-1 block w-full", profileForm.errors.billing_city && "border-red-500")}
                                        placeholder={t('checkout.city_placeholder', 'City')}
                                        onChange={(e) => profileForm.setData('billing_city', e.target.value)}
                                        aria-invalid={!!profileForm.errors.billing_city}
                                    />
                                    {profileForm.errors.billing_city && (
                                        <p className="text-sm text-red-600">
                                            {profileForm.errors.billing_city}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="billing_postal_code">{t('checkout.postal_code', 'Postal Code')}</Label>
                                    <Input
                                        id="billing_postal_code"
                                        type="text"
                                        name="billing_postal_code"
                                        value={profileForm.data.billing_postal_code}
                                        className={cn("mt-1 block w-full", profileForm.errors.billing_postal_code && "border-red-500")}
                                        placeholder={t('checkout.postal_code_placeholder', 'Postal code')}
                                        onChange={(e) => profileForm.setData('billing_postal_code', e.target.value)}
                                        aria-invalid={!!profileForm.errors.billing_postal_code}
                                    />
                                    {profileForm.errors.billing_postal_code && (
                                        <p className="text-sm text-red-600">
                                            {profileForm.errors.billing_postal_code}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="billing_state">{t('checkout.state', 'State/Province')}</Label>
                                    <Input
                                        id="billing_state"
                                        type="text"
                                        name="billing_state"
                                        value={profileForm.data.billing_state}
                                        className={cn("mt-1 block w-full", profileForm.errors.billing_state && "border-red-500")}
                                        placeholder={t('checkout.state_placeholder', 'State/Province (optional)')}
                                        onChange={(e) => profileForm.setData('billing_state', e.target.value)}
                                        aria-invalid={!!profileForm.errors.billing_state}
                                    />
                                    {profileForm.errors.billing_state && (
                                        <p className="text-sm text-red-600">
                                            {profileForm.errors.billing_state}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <CountrySelector
                                        value={profileForm.data.billing_country}
                                        onChange={(value) => profileForm.setData('billing_country', value)}
                                        label={t('checkout.country', 'Country')}
                                        placeholder={t('checkout.select_country', 'Select country...')}
                                    />
                                    {profileForm.errors.billing_country && (
                                        <p className="text-sm text-red-600">
                                            {profileForm.errors.billing_country}
                                        </p>
                                    )}
                                </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping Address Card */}
                        <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-gold" />
                                {t('settings.shipping_address', 'Shipping Address')}
                            </CardTitle>
                            <CardDescription>
                                {t('settings.shipping_address_description', 'Your default shipping address for orders')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="shipping_address">{t('checkout.address', 'Address')}</Label>
                                    <Input
                                        id="shipping_address"
                                        type="text"
                                        name="shipping_address"
                                        value={profileForm.data.shipping_address}
                                        className={cn("mt-1 block w-full", profileForm.errors.shipping_address && "border-red-500")}
                                        placeholder={t('checkout.address_placeholder', 'Street address')}
                                        onChange={(e) => profileForm.setData('shipping_address', e.target.value)}
                                        aria-invalid={!!profileForm.errors.shipping_address}
                                    />
                                    {profileForm.errors.shipping_address && (
                                        <p className="text-sm text-red-600">
                                            {profileForm.errors.shipping_address}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="shipping_city">{t('checkout.city', 'City')}</Label>
                                    <Input
                                        id="shipping_city"
                                        type="text"
                                        name="shipping_city"
                                        value={profileForm.data.shipping_city}
                                        className={cn("mt-1 block w-full", profileForm.errors.shipping_city && "border-red-500")}
                                        placeholder={t('checkout.city_placeholder', 'City')}
                                        onChange={(e) => profileForm.setData('shipping_city', e.target.value)}
                                        aria-invalid={!!profileForm.errors.shipping_city}
                                    />
                                    {profileForm.errors.shipping_city && (
                                        <p className="text-sm text-red-600">
                                            {profileForm.errors.shipping_city}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="shipping_postal_code">{t('checkout.postal_code', 'Postal Code')}</Label>
                                    <Input
                                        id="shipping_postal_code"
                                        type="text"
                                        name="shipping_postal_code"
                                        value={profileForm.data.shipping_postal_code}
                                        className={cn("mt-1 block w-full", profileForm.errors.shipping_postal_code && "border-red-500")}
                                        placeholder={t('checkout.postal_code_placeholder', 'Postal code')}
                                        onChange={(e) => profileForm.setData('shipping_postal_code', e.target.value)}
                                        aria-invalid={!!profileForm.errors.shipping_postal_code}
                                    />
                                    {profileForm.errors.shipping_postal_code && (
                                        <p className="text-sm text-red-600">
                                            {profileForm.errors.shipping_postal_code}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="shipping_state">{t('checkout.state', 'State/Province')}</Label>
                                    <Input
                                        id="shipping_state"
                                        type="text"
                                        name="shipping_state"
                                        value={profileForm.data.shipping_state}
                                        className={cn("mt-1 block w-full", profileForm.errors.shipping_state && "border-red-500")}
                                        placeholder={t('checkout.state_placeholder', 'State/Province (optional)')}
                                        onChange={(e) => profileForm.setData('shipping_state', e.target.value)}
                                        aria-invalid={!!profileForm.errors.shipping_state}
                                    />
                                    {profileForm.errors.shipping_state && (
                                        <p className="text-sm text-red-600">
                                            {profileForm.errors.shipping_state}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <CountrySelector
                                        value={profileForm.data.shipping_country}
                                        onChange={(value) => profileForm.setData('shipping_country', value)}
                                        label={t('checkout.country', 'Country')}
                                        placeholder={t('checkout.select_country', 'Select country...')}
                                    />
                                    {profileForm.errors.shipping_country && (
                                        <p className="text-sm text-red-600">
                                            {profileForm.errors.shipping_country}
                                        </p>
                                    )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        </div>
                    </div>

                    {/* Save Button for Profile + Addresses */}
                    <div className="flex items-center gap-4 max-w-6xl">
                        <Button
                            type="submit"
                            className="bg-gold hover:bg-gold/90 text-white"
                            disabled={profileForm.processing}
                        >
                            {profileForm.processing
                                ? t('settings.saving', 'Saving...')
                                : t('settings.save_changes', 'Save Changes')}
                        </Button>

                        {profileForm.recentlySuccessful && (
                            <p className="text-sm text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                {t('settings.saved', 'Saved')}
                            </p>
                        )}
                    </div>
                </form>

                {/* Password Card - Separate Form */}
                <div className="max-w-6xl">
                    {/* Password Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-gold" />
                                {t('settings.change_password', 'Change Password')}
                            </CardTitle>
                            <CardDescription>
                                {t('settings.password_description', 'Ensure your account is using a long, random password to stay secure')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitPassword} noValidate className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current_password">
                                        {t('settings.current_password', 'Current Password')}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            type={showCurrentPassword ? "text" : "password"}
                                            name="current_password"
                                            value={passwordForm.data.current_password}
                                            className={cn("mt-1 block w-full pr-10", passwordForm.errors.current_password && "border-red-500")}
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                            aria-invalid={!!passwordForm.errors.current_password}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {passwordForm.errors.current_password && (
                                        <p className="text-sm text-red-600">
                                            {passwordForm.errors.current_password}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        {t('settings.new_password', 'New Password')}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            ref={passwordInput}
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={passwordForm.data.password}
                                            className={cn("mt-1 block w-full pr-10", passwordForm.errors.password && "border-red-500")}
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                                            aria-invalid={!!passwordForm.errors.password}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {passwordForm.errors.password && (
                                        <p className="text-sm text-red-600">
                                            {passwordForm.errors.password}
                                        </p>
                                    )}

                                    {/* Password Requirements */}
                                    {passwordForm.data.password && (
                                        <div className="mt-3 p-3 bg-gold/10 rounded-lg border border-gold/20">
                                            <div className="flex">
                                                <Info className="w-5 h-5 text-gold mr-2 mt-0.5 flex-shrink-0" />
                                                <div className="text-sm text-gray-700">
                                                    <p className="font-medium mb-1 text-gray-900">
                                                        {t('auth.password_requirements', 'Password requirements:')}
                                                    </p>
                                                    <ul className="text-xs space-y-1">
                                                        <li className="flex items-center">
                                                            {requirements.length ? (
                                                                <Check className="w-4 h-4 text-green-600 mr-2" />
                                                            ) : (
                                                                <span className="w-4 h-4 mr-2 flex items-center justify-center text-gray-400">
                                                                    •
                                                                </span>
                                                            )}
                                                            <span
                                                                className={
                                                                    requirements.length
                                                                        ? 'text-green-700 font-medium'
                                                                        : 'text-gray-600'
                                                                }
                                                            >
                                                                {t('auth.password_min_length', 'At least 8 characters')}
                                                            </span>
                                                        </li>
                                                        <li className="flex items-center">
                                                            {requirements.uppercase ? (
                                                                <Check className="w-4 h-4 text-green-600 mr-2" />
                                                            ) : (
                                                                <span className="w-4 h-4 mr-2 flex items-center justify-center text-gray-400">
                                                                    •
                                                                </span>
                                                            )}
                                                            <span
                                                                className={
                                                                    requirements.uppercase
                                                                        ? 'text-green-700 font-medium'
                                                                        : 'text-gray-600'
                                                                }
                                                            >
                                                                {t('auth.password_uppercase', 'At least one uppercase letter')}
                                                            </span>
                                                        </li>
                                                        <li className="flex items-center">
                                                            {requirements.number ? (
                                                                <Check className="w-4 h-4 text-green-600 mr-2" />
                                                            ) : (
                                                                <span className="w-4 h-4 mr-2 flex items-center justify-center text-gray-400">
                                                                    •
                                                                </span>
                                                            )}
                                                            <span
                                                                className={
                                                                    requirements.number
                                                                        ? 'text-green-700 font-medium'
                                                                        : 'text-gray-600'
                                                                }
                                                            >
                                                                {t('auth.password_number', 'At least one number')}
                                                            </span>
                                                        </li>
                                                        <li className="flex items-center">
                                                            {requirements.special ? (
                                                                <Check className="w-4 h-4 text-green-600 mr-2" />
                                                            ) : (
                                                                <span className="w-4 h-4 mr-2 flex items-center justify-center text-gray-400">
                                                                    •
                                                                </span>
                                                            )}
                                                            <span
                                                                className={
                                                                    requirements.special
                                                                        ? 'text-green-700 font-medium'
                                                                        : 'text-gray-600'
                                                                }
                                                            >
                                                                {t('auth.password_special', 'At least one special character')}
                                                            </span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        {t('auth.confirm_password', 'Confirm Password')}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            type={showPasswordConfirmation ? "text" : "password"}
                                            name="password_confirmation"
                                            value={passwordForm.data.password_confirmation}
                                            className={cn(
                                                "mt-1 block w-full pr-10",
                                                passwordForm.errors.password_confirmation && "border-red-500"
                                            )}
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                            onChange={(e) =>
                                                passwordForm.setData('password_confirmation', e.target.value)
                                            }
                                            aria-invalid={!!passwordForm.errors.password_confirmation}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        >
                                            {showPasswordConfirmation ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {passwordForm.errors.password_confirmation && (
                                        <p className="text-sm text-red-600">
                                            {passwordForm.errors.password_confirmation}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 pt-2">
                                    <Button
                                        type="submit"
                                        className="bg-gold hover:bg-gold/90 text-white"
                                        disabled={passwordForm.processing}
                                    >
                                        {passwordForm.processing
                                            ? t('settings.updating', 'Updating...')
                                            : t('settings.update_password', 'Update Password')}
                                    </Button>

                                    {passwordForm.recentlySuccessful && (
                                        <p className="text-sm text-green-600 flex items-center gap-1">
                                            <CheckCircle className="h-4 w-4" />
                                            {t('settings.saved', 'Saved')}
                                        </p>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
