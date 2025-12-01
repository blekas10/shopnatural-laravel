import { useTranslation } from '@/hooks/use-translation';

const flagEmojis: Record<string, string> = {
    en: '🇱🇹',
    lt: '🇬🇧',
};

export default function LocaleSwitcher() {
    const { locale, availableLocales, switchLocale } = useTranslation();

    const handleToggle = () => {
        const currentIndex = availableLocales.indexOf(locale);
        const nextIndex = (currentIndex + 1) % availableLocales.length;
        switchLocale(availableLocales[nextIndex]);
    };

    return (
        <button
            onClick={handleToggle}
            className="flex items-center justify-center rounded-md p-2 text-2xl transition-all hover:bg-muted"
            aria-label="Switch language"
        >
            {flagEmojis[locale] || '🌐'}
        </button>
    );
}
