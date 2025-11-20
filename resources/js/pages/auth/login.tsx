import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AuthLayout from '@/layouts/auth-layout';
import { register, login as loginRoute, passwordEmail } from '@/routes';
import { router, useForm, Head } from '@inertiajs/react';
import { useTranslation } from '@/hooks/use-translation';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const { t } = useTranslation();
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    // Forgot password form
    const { data: forgotData, setData: setForgotData, post, processing: forgotProcessing, errors: forgotPasswordErrors, reset } = useForm({
        email: '',
    });

    // Login form
    const { data: loginData, setData: setLoginData, post: loginPost, processing: loginProcessing, errors: loginErrors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleForgotPasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(passwordEmail(), {
            onSuccess: () => {
                reset();
                setShowForgotPassword(false);
            },
        });
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginPost(loginRoute());
    };

    return (
        <AuthLayout
            title={t('auth.login_title', 'Log in to your account')}
            description={t('auth.login_description', 'Enter your email and password below to log in')}
        >
            <Head title={t('auth.login', 'Log in')} />

            <form
                onSubmit={handleLoginSubmit}
                className="flex flex-col gap-6"
            >
                {(() => {
                    const processing = loginProcessing;
                    const errors = loginErrors;
                    return (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">{t('auth.email', 'Email address')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={loginData.email}
                                    onChange={(e) => setLoginData('email', e.target.value)}
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">{t('auth.password', 'Password')}</Label>
                                    {canResetPassword && (
                                        <button
                                            type="button"
                                            onClick={() => setShowForgotPassword(true)}
                                            className="ml-auto text-sm text-gold hover:underline font-medium cursor-pointer"
                                            tabIndex={5}
                                        >
                                            {t('auth.forgot_password', 'Forgot password?')}
                                        </button>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData('password', e.target.value)}
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder={t('auth.password', 'Password')}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={loginData.remember}
                                    onCheckedChange={(checked) => setLoginData('remember', checked as boolean)}
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">{t('auth.remember_me', 'Remember me')}</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full bg-gold hover:bg-gold/90 text-white font-bold uppercase tracking-wide"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                {t('auth.login', 'Log in')}
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                {t('auth.no_account', "Don't have an account?")}{' '}
                                <TextLink href={register()} tabIndex={5} className="text-gold hover:underline font-medium">
                                    {t('auth.sign_up', 'Sign up')}
                                </TextLink>
                            </div>
                        )}
                    </>
                    );
                })()}
            </form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            {/* Forgot Password Modal */}
            <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gold">
                            {t('auth.forgot_password_title', 'Forgot password')}
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            {t('auth.forgot_password_description', 'Enter your email to receive a password reset link')}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 mt-4">
                        <div className="grid gap-2">
                            <Label htmlFor="forgot-email">{t('auth.email', 'Email address')}</Label>
                            <Input
                                id="forgot-email"
                                type="email"
                                name="email"
                                value={forgotData.email}
                                autoComplete="off"
                                autoFocus
                                placeholder="email@example.com"
                                onChange={(e) => setForgotData('email', e.target.value)}
                            />
                            <InputError message={forgotPasswordErrors.email} />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gold hover:bg-gold/90 text-white font-bold uppercase tracking-wide"
                            disabled={forgotProcessing}
                        >
                            {forgotProcessing && <Spinner />}
                            {t('auth.send_reset_link', 'Email password reset link')}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthLayout>
    );
}
