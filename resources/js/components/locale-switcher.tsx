import { useTranslation } from '@/hooks/use-translation';

// SVG flags with fixed dimensions for consistent rendering
const FlagLT = () => (
    <svg width="24" height="18" viewBox="0 0 24 18" className="shrink-0">
        <rect width="24" height="6" fill="#FFB81C" />
        <rect y="6" width="24" height="6" fill="#046A38" />
        <rect y="12" width="24" height="6" fill="#BE3A34" />
    </svg>
);

const FlagGB = () => (
    <svg width="24" height="18" viewBox="0 0 60 30" className="shrink-0">
        <clipPath id="gb">
            <path d="M0,0 v30 h60 v-30 z" />
        </clipPath>
        <clipPath id="gb-diag">
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
        </clipPath>
        <g clipPath="url(#gb)">
            <rect width="60" height="30" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
            <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#gb-diag)" stroke="#C8102E" strokeWidth="4" />
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
        </g>
    </svg>
);

export default function LocaleSwitcher() {
    const { locale, availableLocales, switchLocale } = useTranslation();

    const handleToggle = () => {
        const currentIndex = availableLocales.indexOf(locale);
        const nextIndex = (currentIndex + 1) % availableLocales.length;
        switchLocale(availableLocales[nextIndex]);
    };

    // Show flag of the language to switch TO (not current)
    const nextLocale = availableLocales[(availableLocales.indexOf(locale) + 1) % availableLocales.length];

    return (
        <button
            onClick={handleToggle}
            className="flex size-10 items-center justify-center rounded-md transition-all hover:bg-muted"
            aria-label="Switch language"
        >
            {nextLocale === 'lt' ? <FlagLT /> : <FlagGB />}
        </button>
    );
}
