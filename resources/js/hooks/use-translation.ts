import { usePage, router } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';
import { route as routeHelper } from '@/lib/route';

interface TranslationHook {
    t: (key: string, fallback?: string) => string;
    locale: string;
    availableLocales: string[];
    switchLocale: (locale: string) => void;
    route: (name: string, params?: Record<string, string | number | boolean>) => string;
}

interface PageProps {
    locale: string;
    availableLocales: string[];
    translations: Record<string, string>;
    product?: {
        slug: string;
        alternateSlug?: string;
    };
}

export function useTranslation(): TranslationHook {
    const { locale, availableLocales, translations, product } = usePage<PageProps>().props;

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

        // Remove current locale if present
        if (availableLocales.includes(segments[0])) {
            segments.shift();
        }

        // Check if this is an admin route - admin routes don't translate their segments
        const isAdminRoute = segments[0] === 'admin';

        // Route translations map (only for non-admin public routes)
        const routeMap: Record<string, Record<string, string>> = {
            'products': { en: 'products', lt: 'produktai' },
            'produktai': { en: 'products', lt: 'produktai' },
            'brands': { en: 'brands', lt: 'prekes-zenklai' },
            'prekes-zenklai': { en: 'brands', lt: 'prekes-zenklai' },
            'cart': { en: 'cart', lt: 'krepselis' },
            'krepselis': { en: 'cart', lt: 'krepselis' },
            'wishlist': { en: 'wishlist', lt: 'pageidavimu-sarasas' },
            'pageidavimu-sarasas': { en: 'wishlist', lt: 'pageidavimu-sarasas' },
            'contact': { en: 'contact', lt: 'kontaktai' },
            'kontaktai': { en: 'contact', lt: 'kontaktai' },
            'about': { en: 'about', lt: 'apie-mus' },
            'apie-mus': { en: 'about', lt: 'apie-mus' },
            'return-policy': { en: 'return-policy', lt: 'grazinimo-politika' },
            'grazinimo-politika': { en: 'return-policy', lt: 'grazinimo-politika' },
            'shipping-policy': { en: 'shipping-policy', lt: 'pristatymo-politika' },
            'pristatymo-politika': { en: 'shipping-policy', lt: 'pristatymo-politika' },
            'privacy-policy': { en: 'privacy-policy', lt: 'privatumo-politika' },
            'privatumo-politika': { en: 'privacy-policy', lt: 'privatumo-politika' },
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
        };

        // Check if we're on a product detail page and have an alternate slug
        const isProductPage = segments[0] === 'products' || segments[0] === 'produktai';

        // Translate route segments (but not for admin routes)
        const translatedSegments = isAdminRoute
            ? segments // Keep admin routes as-is
            : segments.map((segment, index) => {
                // Check if this segment is a translatable route
                if (routeMap[segment]) {
                    return routeMap[segment][newLocale];
                }
                // If this is a product slug and we have alternateSlug, use it
                if (isProductPage && index === 1 && product?.alternateSlug) {
                    return product.alternateSlug;
                }
                return segment;
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
    }, [availableLocales, product]);

    const route = useCallback(
        (name: string, params?: Record<string, string | number | boolean>) => {
            return routeHelper(name, params, locale);
        },
        [locale]
    );

    return useMemo(
        () => ({ t, locale, availableLocales, switchLocale, route }),
        [t, locale, availableLocales, switchLocale, route]
    );
}
