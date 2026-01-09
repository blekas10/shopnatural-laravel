import { useTranslation } from '@/hooks/use-translation';
import { Flag } from '@/components/country-selector';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Flag codes for each locale - showing CURRENT language flag
const localeFlagCodes: Record<string, string> = {
    en: 'GB', // English - British flag
    lt: 'LT', // Lithuanian - Lithuanian flag
};

// Language display names
const localeNames: Record<string, { native: string; english: string }> = {
    en: { native: 'English', english: 'English' },
    lt: { native: 'Lietuvių', english: 'Lithuanian' },
};

interface LocaleSwitcherProps {
    variant?: 'default' | 'compact' | 'full';
    showLabel?: boolean;
    className?: string;
}

export default function LocaleSwitcher({
    variant = 'default',
    showLabel = false,
    className,
}: LocaleSwitcherProps) {
    const { locale, availableLocales, switchLocale } = useTranslation();

    const currentFlagCode = localeFlagCodes[locale] || 'GB';
    const currentLocaleName = localeNames[locale]?.native || locale.toUpperCase();

    // Compact variant - just flag, click to toggle
    if (variant === 'compact') {
        const handleToggle = () => {
            const currentIndex = availableLocales.indexOf(locale);
            const nextIndex = (currentIndex + 1) % availableLocales.length;
            switchLocale(availableLocales[nextIndex]);
        };

        return (
            <button
                onClick={handleToggle}
                className={cn(
                    'flex items-center justify-center rounded-md p-2 transition-all hover:bg-muted',
                    className
                )}
                aria-label="Switch language"
                title={`Current: ${currentLocaleName}. Click to switch.`}
            >
                <Flag code={currentFlagCode} className="h-4 w-6" />
            </button>
        );
    }

    // Full variant - flag with label and dropdown
    if (variant === 'full') {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className={cn(
                            'flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-all hover:bg-muted',
                            className
                        )}
                        aria-label="Select language"
                    >
                        <Flag code={currentFlagCode} className="h-4 w-6" />
                        <span>{currentLocaleName}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    {availableLocales.map((loc) => {
                        const flagCode = localeFlagCodes[loc] || 'GB';
                        const name = localeNames[loc]?.native || loc.toUpperCase();
                        const isActive = loc === locale;

                        return (
                            <DropdownMenuItem
                                key={loc}
                                onClick={() => switchLocale(loc)}
                                className={cn(
                                    'flex items-center gap-2 cursor-pointer',
                                    isActive && 'bg-muted'
                                )}
                            >
                                <Flag code={flagCode} className="h-4 w-6" />
                                <span className="flex-1">{name}</span>
                                {isActive && <Check className="h-4 w-4 text-gold" />}
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // Default variant - flag with dropdown
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        'flex items-center justify-center gap-1 rounded-md p-2 transition-all hover:bg-muted',
                        className
                    )}
                    aria-label="Switch language"
                >
                    <Flag code={currentFlagCode} className="h-4 w-6" />
                    {showLabel && (
                        <span className="text-sm font-medium">{locale.toUpperCase()}</span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                {availableLocales.map((loc) => {
                    const flagCode = localeFlagCodes[loc] || 'GB';
                    const name = localeNames[loc]?.native || loc.toUpperCase();
                    const isActive = loc === locale;

                    return (
                        <DropdownMenuItem
                            key={loc}
                            onClick={() => switchLocale(loc)}
                            className={cn(
                                'flex items-center gap-2 cursor-pointer',
                                isActive && 'bg-muted'
                            )}
                        >
                            <Flag code={flagCode} className="h-4 w-6" />
                            <span className="flex-1">{name}</span>
                            {isActive && <Check className="h-4 w-4 text-gold" />}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
