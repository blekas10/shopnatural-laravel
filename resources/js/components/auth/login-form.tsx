import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { useTranslation } from '@/hooks/use-translation';

interface LoginFormProps {
    onSwitchToRegister: () => void;
    onSwitchToForgotPassword?: () => void;
}

export function LoginForm({ onSwitchToRegister, onSwitchToForgotPassword }: LoginFormProps) {
    const { t, route } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => {
                // Let Fortify handle the redirect to dashboard
            }
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4 p-6" noValidate>
            <div className="space-y-2">
                <Label htmlFor="email">{t('checkout.email', 'Email')}</Label>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className={`mt-1 block w-full ${errors.email ? 'border-red-500' : ''}`}
                    autoComplete="username"
                    placeholder="your@email.com"
                    onChange={(e) => {
                        setData('email', e.target.value);
                        if (errors.email) clearErrors('email');
                    }}
                />
                <InputError message={errors.email} className="mt-1" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">{t('checkout.password', 'Password')}</Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={data.password}
                        className={`mt-1 block w-full pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        autoComplete="current-password"
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
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="remember"
                        name="remember"
                        checked={data.remember}
                        onCheckedChange={(checked) => setData('remember', checked === true)}
                    />
                    <Label
                        htmlFor="remember"
                        className="text-sm font-normal cursor-pointer"
                    >
                        {t('auth.remember_me', 'Remember me')}
                    </Label>
                </div>
                {onSwitchToForgotPassword && (
                    <button
                        type="button"
                        onClick={onSwitchToForgotPassword}
                        className="text-sm text-gold hover:text-gold/80"
                    >
                        {t('auth.forgot_password', 'Forgot password?')}
                    </button>
                )}
            </div>

            <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-white"
                disabled={processing}
            >
                {processing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('auth.logging_in', 'Logging in...')}
                    </>
                ) : (
                    t('auth.login', 'Login')
                )}
            </Button>

            <div className="text-center text-sm">
                <span className="text-gray-600">{t('auth.no_account', "Don't have an account?")}</span>{' '}
                <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="text-gold hover:text-gold/80 font-medium"
                >
                    {t('auth.register', 'Register')}
                </button>
            </div>
        </form>
    );
}
