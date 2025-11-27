import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { useTranslation } from '@/hooks/use-translation';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'login' | 'register' | 'forgot-password';
}

export function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
    const { t } = useTranslation();
    // Use initialView directly when modal opens, track internal changes with view state
    const [internalView, setInternalView] = useState<'login' | 'register' | 'forgot-password' | null>(null);

    // When modal closes, reset internal view. When open, use internal view if set, otherwise initial.
    const view = useMemo(() => {
        if (!isOpen) return initialView;
        return internalView ?? initialView;
    }, [isOpen, internalView, initialView]);

    const setView = (newView: 'login' | 'register' | 'forgot-password') => {
        setInternalView(newView);
    };

    const handleClose = () => {
        setInternalView(null);
        onClose();
    };

    const handleSwitchToRegister = () => setView('register');
    const handleSwitchToLogin = () => setView('login');
    const handleSwitchToForgotPassword = () => setView('forgot-password');

    const getTitle = () => {
        switch (view) {
            case 'login':
                return t('auth.login', 'Login');
            case 'register':
                return t('auth.create_account', 'Create Account');
            case 'forgot-password':
                return t('auth.forgot_password_title', 'Forgot Password');
            default:
                return '';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px] p-0">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="text-2xl font-bold uppercase tracking-wide text-center">
                        {getTitle()}
                    </DialogTitle>
                </DialogHeader>
                {view === 'login' ? (
                    <LoginForm
                        onSwitchToRegister={handleSwitchToRegister}
                        onSwitchToForgotPassword={handleSwitchToForgotPassword}
                    />
                ) : view === 'register' ? (
                    <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
                ) : (
                    <ForgotPasswordForm onSwitchToLogin={handleSwitchToLogin} />
                )}
            </DialogContent>
        </Dialog>
    );
}
