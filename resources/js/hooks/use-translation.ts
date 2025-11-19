import { usePage, router } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';
import { route as routeHelper } from '@/lib/route';

interface TranslationHook {
    t: (key: string, fallback?: string) => string;
    locale: string;
    availableLocales: string[];
    switchLocale: (locale: string) => void;
    route: (name: string, params?: Record<string, any>) => string;
}

export function useTranslation(): TranslationHook {
    const { locale, availableLocales, translations } = usePage<{
        locale: string;
        availableLocales: string[];
        translations: Record<string, string>;
    }>().props;

    const t = useCallback(
        (key: string, fallback?: string): string => {
            return translations[key] || fallback || key;
        },
        [translations]
    );

    const switchLocale = useCallback((newLocale: string) => {
        // Get current path
        const currentPath = window.location.pathname;
        const segments = currentPath.split('/').filter(Boolean);

        // Route translations map
        const routeMap: Record<string, Record<string, string>> = {
            'products': { en: 'products', lt: 'produktai' },
            'produktai': { en: 'products', lt: 'produktai' },
            'cart': { en: 'cart', lt: 'krepselis' },
            'krepselis': { en: 'cart', lt: 'krepselis' },
            'checkout': { en: 'checkout', lt: 'apmokejimas' },
            'apmokejimas': { en: 'checkout', lt: 'apmokejimas' },
            'orders': { en: 'orders', lt: 'uzsakymai' },
            'uzsakymai': { en: 'orders', lt: 'uzsakymai' },
            'order': { en: 'order', lt: 'uzsakymas' },
            'uzsakymas': { en: 'order', lt: 'uzsakymas' },
            'confirmation': { en: 'confirmation', lt: 'patvirtinimas' },
            'patvirtinimas': { en: 'confirmation', lt: 'patvirtinimas' },
            'login': { en: 'login', lt: 'prisijungti' },
            'prisijungti': { en: 'login', lt: 'prisijungti' },
            'register': { en: 'register', lt: 'registruotis' },
            'registruotis': { en: 'register', lt: 'registruotis' },
            // Non-translatable routes (stay the same)
            'dashboard': { en: 'dashboard', lt: 'dashboard' },
            'settings': { en: 'settings', lt: 'settings' },
            'admin': { en: 'admin', lt: 'admin' },
        };

        // Remove current locale if present
        if (availableLocales.includes(segments[0])) {
            segments.shift();
        }

        // Translate route segments
        const translatedSegments = segments.map((segment) => {
            // Check if this segment is a translatable route
            if (routeMap[segment]) {
                return routeMap[segment][newLocale];
            }
            return segment; // Keep product slugs and other segments as-is
        });

        // Build new path with locale prefix (skip for default 'en')
        let newPath;
        if (newLocale === 'en') {
            newPath = '/' + translatedSegments.join('/');
        } else {
            newPath = '/' + newLocale + '/' + translatedSegments.join('/');
        }

        // Add query string if present
        if (window.location.search) {
            newPath += window.location.search;
        }

        router.visit(newPath);
    }, [availableLocales]);

    const route = useCallback(
        (name: string, params?: Record<string, any>) => {
            return routeHelper(name, params, locale);
        },
        [locale]
    );

    return useMemo(
        () => ({ t, locale, availableLocales, switchLocale, route }),
        [t, locale, availableLocales, switchLocale, route]
    );
}
