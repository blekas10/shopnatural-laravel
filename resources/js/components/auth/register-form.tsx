import { useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Check, Info, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { GoogleLoginButton, SocialAuthDivider } from './google-login-button';

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
    const { t, route, locale } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
        locale: locale,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

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

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => {
                // Let Fortify handle the redirect to dashboard
            }
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4 p-6">
            {Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {errors.name || errors.email || errors.password || t('auth.registration_error', 'An error occurred during registration')}
                    </AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">{t('auth.full_name', 'Full Name')}</Label>
                <Input
                    id="name"
                    type="text"
                    name="name"
                    value={data.name}
                    className={cn("mt-1 block w-full", errors.name && "border-red-500")}
                    autoComplete="name"
                    placeholder={t('checkout.full_name_placeholder', 'John Doe')}
                    onChange={(e) => setData('name', e.target.value)}
                    aria-invalid={!!errors.name}
                />
                {errors.name && (
                    <p className="text-sm text-red-600">
                        {errors.name}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="register_email">{t('checkout.email', 'Email')}</Label>
                <Input
                    id="register_email"
                    type="email"
                    name="email"
                    value={data.email}
                    className={cn("mt-1 block w-full", errors.email && "border-red-500")}
                    autoComplete="username"
                    placeholder="your@email.com"
                    onChange={(e) => setData('email', e.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                    <p className="text-sm text-red-600" id="email-error">
                        {errors.email}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="register_password">{t('auth.password', 'Password')}</Label>
                <div className="relative">
                    <Input
                        id="register_password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={data.password}
                        className={cn("mt-1 block w-full pr-10", errors.password && "border-red-500")}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
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
                {errors.password && (
                    <p className="text-sm text-red-600" id="password-error">
                        {errors.password}
                    </p>
                )}

                {/* Password Requirements */}
                {data.password && (
                    <div className="mt-3 p-3 bg-gold/10 rounded-lg border border-gold/20">
                        <div className="flex">
                            <Info className="w-5 h-5 text-gold mr-2 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-gray-700">
                                <p className="font-medium mb-1 text-gray-900">{t('auth.password_requirements', 'Password requirements:')}</p>
                                <ul className="text-xs space-y-1">
                                    <li className="flex items-center">
                                        {requirements.length ? (
                                            <Check className="w-4 h-4 text-green-600 mr-2" />
                                        ) : (
                                            <span className="w-4 h-4 mr-2 flex items-center justify-center text-gray-400">•</span>
                                        )}
                                        <span className={requirements.length ? "text-green-700 font-medium" : "text-gray-600"}>
                                            {t('auth.password_min_length', 'At least 8 characters')}
                                        </span>
                                    </li>
                                    <li className="flex items-center">
                                        {requirements.uppercase ? (
                                            <Check className="w-4 h-4 text-green-600 mr-2" />
                                        ) : (
                                            <span className="w-4 h-4 mr-2 flex items-center justify-center text-gray-400">•</span>
                                        )}
                                        <span className={requirements.uppercase ? "text-green-700 font-medium" : "text-gray-600"}>
                                            {t('auth.password_uppercase', 'At least one uppercase letter')}
                                        </span>
                                    </li>
                                    <li className="flex items-center">
                                        {requirements.number ? (
                                            <Check className="w-4 h-4 text-green-600 mr-2" />
                                        ) : (
                                            <span className="w-4 h-4 mr-2 flex items-center justify-center text-gray-400">•</span>
                                        )}
                                        <span className={requirements.number ? "text-green-700 font-medium" : "text-gray-600"}>
                                            {t('auth.password_number', 'At least one number')}
                                        </span>
                                    </li>
                                    <li className="flex items-center">
                                        {requirements.special ? (
                                            <Check className="w-4 h-4 text-green-600 mr-2" />
                                        ) : (
                                            <span className="w-4 h-4 mr-2 flex items-center justify-center text-gray-400">•</span>
                                        )}
                                        <span className={requirements.special ? "text-green-700 font-medium" : "text-gray-600"}>
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
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        aria-invalid={!!errors.password_confirmation}
                        aria-describedby={errors.password_confirmation ? "password-confirmation-error" : undefined}
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
                {errors.password_confirmation && (
                    <p className="text-sm text-red-600" id="password-confirmation-error">
                        {errors.password_confirmation}
                    </p>
                )}
            </div>

            <div className="flex items-start space-x-2">
                <Checkbox
                    id="terms"
                    name="terms"
                    checked={data.terms}
                    onCheckedChange={(checked) => setData('terms', !!checked)}
                    className="mt-1"
                />
                <Label
                    htmlFor="terms"
                    className="text-sm font-normal cursor-pointer leading-relaxed"
                >
                    {t('checkout.agree_to_terms_prefix', 'I agree to the')}{' '}
                    <Link href={route('return-policy')} className="text-gold hover:text-gold/80 underline" target="_blank" rel="noopener noreferrer">
                        {t('checkout.terms_and_conditions', 'Terms and Conditions')}
                    </Link>{' '}
                    {t('checkout.and', 'and')}{' '}
                    <Link href={route('privacy-policy')} className="text-gold hover:text-gold/80 underline" target="_blank" rel="noopener noreferrer">
                        {t('checkout.privacy_policy', 'Privacy Policy')}
                    </Link>
                </Label>
            </div>

            <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-white"
                disabled={processing || !data.terms}
            >
                {processing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('auth.registering', 'Registering...')}
                    </>
                ) : (
                    t('auth.register', 'Register')
                )}
            </Button>

            <SocialAuthDivider />

            <GoogleLoginButton />

            <div className="text-center text-sm">
                <span className="text-gray-600">{t('auth.already_have_account', 'Already have an account?')}</span>{' '}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-gold hover:text-gold/80 font-medium"
                >
                    {t('auth.login', 'Login')}
                </button>
            </div>
        </form>
    );
}
