import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const COOKIE_NAME = 'shop_natural_cookie_consent';
const COOKIE_EXPIRY_DAYS = 365;

const translations = {
    en: {
        message: 'We use cookies to enhance your experience.',
        accept: 'Accept',
        decline: 'Decline',
        learnMore: 'Privacy Policy',
        privacyLink: '/privacy-policy',
    },
    lt: {
        message: 'Naudojame slapukus jūsų patirčiai gerinti.',
        accept: 'Sutinku',
        decline: 'Nesutinku',
        learnMore: 'Privatumo politika',
        privacyLink: '/lt/privatumo-politika',
    },
};

function setCookie(name: string, value: string, days: number) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

export default function CookieConsentBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [locale, setLocale] = useState('en');

    useEffect(() => {
        // Check if consent already given
        const consent = getCookie(COOKIE_NAME);
        if (consent) return;

        // Detect locale from URL
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            setLocale(path.startsWith('/lt') ? 'lt' : 'en');
        }

        // Show banner after 3 seconds
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleAccept = () => {
        setCookie(COOKIE_NAME, 'accepted', COOKIE_EXPIRY_DAYS);
        setIsVisible(false);

        // Enable analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                analytics_storage: 'granted',
            });
        }
    };

    const handleDecline = () => {
        setCookie(COOKIE_NAME, 'declined', COOKIE_EXPIRY_DAYS);
        setIsVisible(false);

        // Disable analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                analytics_storage: 'denied',
            });
        }
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    const t = translations[locale as keyof typeof translations] || translations.en;

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
                        {t.message}{' '}
                        <a
                            href={t.privacyLink}
                            className="font-medium text-gold underline underline-offset-2 hover:text-gold/80"
                        >
                            {t.learnMore}
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
                        {t.decline}
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleAccept}
                        className="flex-1 bg-gold text-xs text-white hover:bg-gold/90"
                    >
                        {t.accept}
                    </Button>
                </div>
            </div>
        </div>
    );
}
