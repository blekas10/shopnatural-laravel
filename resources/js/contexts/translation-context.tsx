import { usePage, router } from '@inertiajs/react';

interface TranslationHook {
    t: (key: string, fallback?: string) => string;
    locale: string;
    availableLocales: string[];
    switchLocale: (locale: string) => void;
}

export function useTranslation(): TranslationHook {
    const { locale, availableLocales, translations } = usePage<{
        locale: string;
        availableLocales: string[];
        translations: Record<string, string>;
    }>().props;

    const t = (key: string, fallback?: string): string => {
        return translations[key] || fallback || key;
    };

    const switchLocale = (newLocale: string) => {
        router.post(
            '/locale',
            {
                locale: newLocale,
                current_path: window.location.pathname,
            },
            {
                preserveScroll: true,
            }
        );
    };

    return { t, locale, availableLocales, switchLocale };
}
