import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { useGTM } from '@/hooks/use-gtm';

const COOKIE_NAME = 'shop_natural_cookie_consent';
const COOKIE_EXPIRY_DAYS = 365;

function setCookie(name: string, value: string, days: number) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

export default function CookieConsentBanner() {
    const { t, route } = useTranslation();
    const { updateConsent } = useGTM();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if consent already given
        const consent = getCookie(COOKIE_NAME);
        if (consent) return;

        // Show banner after 3 seconds
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleAccept = () => {
        setCookie(COOKIE_NAME, 'accepted', COOKIE_EXPIRY_DAYS);
        setIsVisible(false);
        updateConsent(true);
    };

    const handleDecline = () => {
        setCookie(COOKIE_NAME, 'declined', COOKIE_EXPIRY_DAYS);
        setIsVisible(false);
        updateConsent(false);
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                'fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md',
                'animate-in slide-in-from-bottom-5 fade-in duration-300'
            )}
        >
            <div className="relative rounded-xl border-2 border-border bg-background p-4 shadow-lg">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Close"
                >
                    <X className="size-4" />
                </button>

                {/* Content */}
                <div className="pr-6">
                    <p className="text-sm leading-relaxed text-foreground">
                        {t('cookie_banner.message', 'We use cookies to enhance your experience.')}{' '}
                        <a
                            href={route('privacy-policy')}
                            className="font-medium text-gold underline underline-offset-2 hover:text-gold/80"
                        >
                            {t('cookie_banner.learn_more', 'Privacy Policy')}
                        </a>
                    </p>
                </div>

                {/* Buttons */}
                <div className="mt-3 flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDecline}
                        className="flex-1 text-xs"
                    >
                        {t('cookie_banner.decline', 'Decline')}
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleAccept}
                        className="flex-1 bg-gold text-xs text-white hover:bg-gold/90"
                    >
                        {t('cookie_banner.accept', 'Accept')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
