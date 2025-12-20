// Components
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { useForm } from '@inertiajs/react';
import SEO from '@/components/seo';
import { useTranslation } from '@/hooks/use-translation';

export default function VerifyEmail({ status }: { status?: string }) {
    const { locale } = useTranslation();
    const { post, processing } = useForm({ locale });

    const handleResend = (e: React.FormEvent) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    return (
        <AuthLayout
            title="Verify email"
            description="Please verify your email address by clicking on the link we just emailed to you."
        >
            <SEO
                title="Email verification"
                noindex={true}
                nofollow={true}
            />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <form onSubmit={handleResend} className="space-y-6 text-center">
                <Button type="submit" disabled={processing} variant="secondary">
                    {processing && <Spinner />}
                    Resend verification email
                </Button>

                <TextLink
                    href={logout()}
                    className="mx-auto block text-sm"
                >
                    Log out
                </TextLink>
            </form>
        </AuthLayout>
    );
}
