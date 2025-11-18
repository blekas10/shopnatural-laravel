import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import MainHeader from '@/components/main-header';
import Footer from '@/components/footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { useTranslation } from '@/hooks/use-translation';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { t } = useTranslation();
    const [modalOpen, setModalOpen] = useState(true);

    // If modal is closed, redirect to home
    const handleClose = () => {
        setModalOpen(false);
        window.location.href = '/';
    };

    return (
        <>
            <Head title={t('auth.reset_password', 'Reset Password')} />

            <div className="min-h-screen bg-background">
                <MainHeader />

                <div className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-3xl font-bold text-gold mb-4">
                        {t('auth.reset_password', 'Reset Password')}
                    </h1>
                    <p className="text-gray-600">
                        {t('auth.reset_password_page_message', 'Please complete the password reset form in the modal.')}
                    </p>
                </div>

                <Footer />
            </div>

            {/* Reset Password Modal */}
            <Dialog open={modalOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[480px] p-0">
                    <DialogHeader className="px-6 pt-6">
                        <DialogTitle className="text-2xl font-bold uppercase tracking-wide text-center">
                            {t('auth.reset_password', 'Reset Password')}
                        </DialogTitle>
                    </DialogHeader>
                    <ResetPasswordForm token={token} email={email} />
                </DialogContent>
            </Dialog>
        </>
    );
}
