import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Check, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import InputError from '@/components/input-error';

interface ResetPasswordFormProps {
    token: string;
    email: string;
}

export function ResetPasswordForm({ token, email }: ResetPasswordFormProps) {
    const { t, route, locale } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
        locale: locale, // Include locale for validation messages
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

    const requirements = checkPasswordRequirements(data.password);
    const allRequirementsMet = Object.values(requirements).every(Boolean);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('password.update'), {
            onFinish: () => {
                // Laravel will redirect on success
            }
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4 p-6" noValidate>
            {Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {errors.email || errors.password || t('auth.reset_error', 'Failed to reset password. Please try again.')}
                    </AlertDescription>
                </Alert>
            )}

            <p className="text-sm text-gray-600 mb-4">
                {t('auth.reset_password_instructions', 'Enter your new password below.')}
            </p>

            {/* Email (hidden) */}
            <input type="hidden" name="token" value={data.token} />
            <input type="hidden" name="email" value={data.email} />

            {/* New Password */}
            <div className="space-y-2">
                <Label htmlFor="password">{t('auth.new_password', 'New Password')}</Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={data.password}
                        className={cn("mt-1 block w-full pr-10", errors.password && "border-red-500")}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        onChange={(e) => {
                            setData('password', e.target.value);
                            if (errors.password) clearErrors('password');
                        }}
                    />
                    <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                <InputError message={errors.password} className="mt-1" />

                {/* Password Requirements */}
                {data.password && (
                    <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium text-gray-600">
                            {t('auth.password_requirements', 'Password requirements:')}
                        </p>
                        <div className="space-y-1">
                            <div className={cn(
                                "flex items-center text-xs",
                                requirements.length ? "text-green-600" : "text-gray-500"
                            )}>
                                <Check className={cn("mr-1.5 h-3 w-3", !requirements.length && "opacity-30")} />
                                {t('auth.password_min_length', 'At least 8 characters')}
                            </div>
                            <div className={cn(
                                "flex items-center text-xs",
                                requirements.uppercase ? "text-green-600" : "text-gray-500"
                            )}>
                                <Check className={cn("mr-1.5 h-3 w-3", !requirements.uppercase && "opacity-30")} />
                                {t('auth.password_uppercase', 'At least one uppercase letter')}
                            </div>
                            <div className={cn(
                                "flex items-center text-xs",
                                requirements.number ? "text-green-600" : "text-gray-500"
                            )}>
                                <Check className={cn("mr-1.5 h-3 w-3", !requirements.number && "opacity-30")} />
                                {t('auth.password_number', 'At least one number')}
                            </div>
                            <div className={cn(
                                "flex items-center text-xs",
                                requirements.special ? "text-green-600" : "text-gray-500"
                            )}>
                                <Check className={cn("mr-1.5 h-3 w-3", !requirements.special && "opacity-30")} />
                                {t('auth.password_special', 'At least one special character')}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
                <Label htmlFor="password_confirmation">{t('auth.confirm_password', 'Confirm Password')}</Label>
                <div className="relative">
                    <Input
                        id="password_confirmation"
                        type={showPasswordConfirmation ? "text" : "password"}
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className={cn("mt-1 block w-full pr-10", errors.password_confirmation && "border-red-500")}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        onChange={(e) => {
                            setData('password_confirmation', e.target.value);
                            if (errors.password_confirmation) clearErrors('password_confirmation');
                        }}
                    />
                    <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    >
                        {showPasswordConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                <InputError message={errors.password_confirmation} className="mt-1" />
            </div>

            <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-white"
                disabled={processing || !allRequirementsMet}
            >
                {processing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('auth.resetting', 'Resetting...')}
                    </>
                ) : (
                    t('auth.reset_password', 'Reset Password')
                )}
            </Button>
        </form>
    );
}
