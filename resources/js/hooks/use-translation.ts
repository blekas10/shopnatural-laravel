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

    const switchLocale = (newLocale: string) => {
        // Get current path
        const currentPath = window.location.pathname;
        const segments = currentPath.split('/').filter(Boolean);

        // Route translations map
        const routeMap: Record<string, Record<string, string>> = {
            'products': { en: 'products', lt: 'produktai' },
            'produktai': { en: 'products', lt: 'produktai' },
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
    };

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
