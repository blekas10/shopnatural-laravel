import { useTranslation } from '@/hooks/use-translation';
import { Flag } from '@/components/country-selector';

// Show flag for the OTHER language (what you'll switch to)
const localeFlagCodes: Record<string, string> = {
    en: 'LT', // When on English, show Lithuanian flag to switch to LT
    lt: 'GB', // When on Lithuanian, show British flag to switch to EN
};

export default function LocaleSwitcher() {
    const { locale, availableLocales, switchLocale } = useTranslation();

    const handleToggle = () => {
        const currentIndex = availableLocales.indexOf(locale);
        const nextIndex = (currentIndex + 1) % availableLocales.length;
        switchLocale(availableLocales[nextIndex]);
    };

    const flagCode = localeFlagCodes[locale] || 'GB';

    return (
        <button
            onClick={handleToggle}
            className="flex items-center justify-center rounded-md p-2 transition-all hover:bg-muted"
            aria-label="Switch language"
        >
            <Flag code={flagCode} className="w-6 h-4" />
        </button>
    );
}
