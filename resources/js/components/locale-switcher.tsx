import { useTranslation } from '@/hooks/use-translation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

const localeNames: Record<string, string> = {
    en: 'English',
    lt: 'Lietuvių',
};

export default function LocaleSwitcher() {
    const { locale, availableLocales, switchLocale } = useTranslation();

    return (
        <Select value={locale} onValueChange={switchLocale}>
            <SelectTrigger className="w-[140px]">
                <div className="flex items-center gap-2">
                    <Globe className="size-4" />
                    <SelectValue />
                </div>
            </SelectTrigger>
            <SelectContent>
                {availableLocales.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                        {localeNames[loc] || loc.toUpperCase()}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
