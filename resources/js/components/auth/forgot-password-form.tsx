import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { useTranslation } from '@/hooks/use-translation';

interface ForgotPasswordFormProps {
    onSwitchToLogin: () => void;
}

export function ForgotPasswordForm({ onSwitchToLogin }: ForgotPasswordFormProps) {
    const { t, route } = useTranslation();
    const [status, setStatus] = useState<string | null>(null);

    // Get current locale from URL
    const currentLocale = window.location.pathname.startsWith('/lt') ? 'lt' : 'en';

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        email: '',
        locale: currentLocale, // Include locale in form data
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('password.email'), {
            onSuccess: () => {
                setStatus(t('auth.reset_link_sent', 'A password reset link has been sent to your email address.'));
                reset('email');
            }
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4 p-6" noValidate>
            <p className="text-sm text-gray-600 mb-4">
                {t('auth.forgot_password_description', 'Enter your email address and we will send you a link to reset your password.')}
            </p>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-md">
                    {status}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email">{t('checkout.email', 'Email')}</Label>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className={`mt-1 block w-full ${errors.email ? 'border-red-500' : ''}`}
                    autoComplete="email"
                    placeholder={t('auth.email_placeholder', 'your@email.com')}
                    autoFocus
                    onChange={(e) => {
                        setData('email', e.target.value);
                        if (errors.email) clearErrors('email');
                    }}
                />
                <InputError message={errors.email} className="mt-1" />
            </div>

            <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-white"
                disabled={processing}
            >
                {processing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('auth.sending', 'Sending...')}
                    </>
                ) : (
                    t('auth.send_reset_link', 'Send Reset Link')
                )}
            </Button>

            <div className="text-center text-sm">
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-gold hover:text-gold/80 font-medium"
                >
                    {t('auth.back_to_login', 'Back to login')}
                </button>
            </div>
        </form>
    );
}
