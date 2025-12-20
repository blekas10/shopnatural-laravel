import React, { forwardRef, useState, useMemo } from 'react';
import PhoneInput, { getCountryCallingCode } from 'react-phone-number-input';
import type { Country } from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import 'react-phone-number-input/style.css';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown, Search, Check } from 'lucide-react';

// Country data with native names (same as country-selector)
const countryData: Record<string, { name: string; nativeName: string }> = {
    // Europe
    'LT': { name: 'Lithuania', nativeName: 'Lietuva' },
    'LV': { name: 'Latvia', nativeName: 'Latvija' },
    'EE': { name: 'Estonia', nativeName: 'Eesti' },
    'PL': { name: 'Poland', nativeName: 'Polska' },
    'DE': { name: 'Germany', nativeName: 'Deutschland' },
    'FR': { name: 'France', nativeName: 'France' },
    'ES': { name: 'Spain', nativeName: 'España' },
    'IT': { name: 'Italy', nativeName: 'Italia' },
    'GB': { name: 'United Kingdom', nativeName: 'United Kingdom' },
    'NL': { name: 'Netherlands', nativeName: 'Nederland' },
    'BE': { name: 'Belgium', nativeName: 'België' },
    'AT': { name: 'Austria', nativeName: 'Österreich' },
    'DK': { name: 'Denmark', nativeName: 'Danmark' },
    'SE': { name: 'Sweden', nativeName: 'Sverige' },
    'NO': { name: 'Norway', nativeName: 'Norge' },
    'FI': { name: 'Finland', nativeName: 'Suomi' },
    'CZ': { name: 'Czech Republic', nativeName: 'Česko' },
    'SK': { name: 'Slovakia', nativeName: 'Slovensko' },
    'HU': { name: 'Hungary', nativeName: 'Magyarország' },
    'RO': { name: 'Romania', nativeName: 'România' },
    'BG': { name: 'Bulgaria', nativeName: 'България' },
    'HR': { name: 'Croatia', nativeName: 'Hrvatska' },
    'SI': { name: 'Slovenia', nativeName: 'Slovenija' },
    'PT': { name: 'Portugal', nativeName: 'Portugal' },
    'GR': { name: 'Greece', nativeName: 'Ελλάδα' },
    'IE': { name: 'Ireland', nativeName: 'Éire' },
    'LU': { name: 'Luxembourg', nativeName: 'Luxembourg' },
    'MT': { name: 'Malta', nativeName: 'Malta' },
    'CY': { name: 'Cyprus', nativeName: 'Κύπρος' },
    'CH': { name: 'Switzerland', nativeName: 'Schweiz' },
    'IS': { name: 'Iceland', nativeName: 'Ísland' },
    'AL': { name: 'Albania', nativeName: 'Shqipëri' },
    'AD': { name: 'Andorra', nativeName: 'Andorra' },
    'BY': { name: 'Belarus', nativeName: 'Беларусь' },
    'BA': { name: 'Bosnia and Herzegovina', nativeName: 'Bosna i Hercegovina' },
    'XK': { name: 'Kosovo', nativeName: 'Kosova' },
    'MD': { name: 'Moldova', nativeName: 'Moldova' },
    'MC': { name: 'Monaco', nativeName: 'Monaco' },
    'ME': { name: 'Montenegro', nativeName: 'Crna Gora' },
    'MK': { name: 'North Macedonia', nativeName: 'Македонија' },
    'RS': { name: 'Serbia', nativeName: 'Србија' },
    'SM': { name: 'San Marino', nativeName: 'San Marino' },
    'UA': { name: 'Ukraine', nativeName: 'Україна' },
    'VA': { name: 'Vatican City', nativeName: 'Città del Vaticano' },
    'RU': { name: 'Russia', nativeName: 'Россия' },
    'TR': { name: 'Turkey', nativeName: 'Türkiye' },
    // Americas
    'US': { name: 'United States', nativeName: 'United States' },
    'CA': { name: 'Canada', nativeName: 'Canada' },
    'MX': { name: 'Mexico', nativeName: 'México' },
    'BR': { name: 'Brazil', nativeName: 'Brasil' },
    'AR': { name: 'Argentina', nativeName: 'Argentina' },
    'CL': { name: 'Chile', nativeName: 'Chile' },
    'CO': { name: 'Colombia', nativeName: 'Colombia' },
    'PE': { name: 'Peru', nativeName: 'Perú' },
    'VE': { name: 'Venezuela', nativeName: 'Venezuela' },
    'EC': { name: 'Ecuador', nativeName: 'Ecuador' },
    'BO': { name: 'Bolivia', nativeName: 'Bolivia' },
    'PY': { name: 'Paraguay', nativeName: 'Paraguay' },
    'UY': { name: 'Uruguay', nativeName: 'Uruguay' },
    // Asia
    'CN': { name: 'China', nativeName: '中国' },
    'JP': { name: 'Japan', nativeName: '日本' },
    'KR': { name: 'South Korea', nativeName: '대한민국' },
    'IN': { name: 'India', nativeName: 'भारत' },
    'ID': { name: 'Indonesia', nativeName: 'Indonesia' },
    'TH': { name: 'Thailand', nativeName: 'ประเทศไทย' },
    'VN': { name: 'Vietnam', nativeName: 'Việt Nam' },
    'MY': { name: 'Malaysia', nativeName: 'Malaysia' },
    'SG': { name: 'Singapore', nativeName: 'Singapore' },
    'PH': { name: 'Philippines', nativeName: 'Pilipinas' },
    'PK': { name: 'Pakistan', nativeName: 'پاکستان' },
    'BD': { name: 'Bangladesh', nativeName: 'বাংলাদেশ' },
    'IL': { name: 'Israel', nativeName: 'ישראל' },
    'AE': { name: 'United Arab Emirates', nativeName: 'الإمارات' },
    'SA': { name: 'Saudi Arabia', nativeName: 'السعودية' },
    'KW': { name: 'Kuwait', nativeName: 'الكويت' },
    'QA': { name: 'Qatar', nativeName: 'قطر' },
    'OM': { name: 'Oman', nativeName: 'عمان' },
    'JO': { name: 'Jordan', nativeName: 'الأردن' },
    'LB': { name: 'Lebanon', nativeName: 'لبنان' },
    // Oceania
    'AU': { name: 'Australia', nativeName: 'Australia' },
    'NZ': { name: 'New Zealand', nativeName: 'New Zealand' },
    // Africa
    'ZA': { name: 'South Africa', nativeName: 'South Africa' },
    'EG': { name: 'Egypt', nativeName: 'مصر' },
    'NG': { name: 'Nigeria', nativeName: 'Nigeria' },
    'KE': { name: 'Kenya', nativeName: 'Kenya' },
    'MA': { name: 'Morocco', nativeName: 'المغرب' },
    'TN': { name: 'Tunisia', nativeName: 'تونس' },
    'GH': { name: 'Ghana', nativeName: 'Ghana' },
};

interface PhoneInputFieldProps {
    value: string;
    onChange: (value: string | undefined) => void;
    defaultCountry?: Country;
    placeholder?: string;
    className?: string;
    error?: string;
    disabled?: boolean;
}

// Custom input component that matches our Input styling
const CustomInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    'flex-1 h-full border-none bg-transparent px-3 text-base outline-none',
                    'placeholder:text-muted-foreground',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                {...props}
            />
        );
    }
);
CustomInput.displayName = 'CustomInput';

// Flag component wrapper for consistent styling
function Flag({ code, className }: { code: string; className?: string }) {
    const FlagComponent = flags[code as keyof typeof flags];
    if (!FlagComponent) {
        return <span className={cn("inline-block bg-muted rounded", className)} />;
    }
    return (
        <span className={cn("inline-block overflow-hidden rounded-sm", className)}>
            <FlagComponent title={code} />
        </span>
    );
}

// Option type from react-phone-number-input
interface CountryOption {
    value?: Country;
    label: string;
}

// Searchable country select component (matching CountrySelector design)
interface CountrySelectProps {
    value?: Country;
    onChange: (country: Country | undefined) => void;
    options: CountryOption[];
    disabled?: boolean;
    readOnly?: boolean;
}

function CountrySelect({ value, onChange, options, disabled, readOnly }: CountrySelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    // Sort options by native name
    const sortedOptions = useMemo(() => {
        return [...options].sort((a, b) => {
            const aNative = a.value ? (countryData[a.value]?.nativeName || a.label) : a.label;
            const bNative = b.value ? (countryData[b.value]?.nativeName || b.label) : b.label;
            return aNative.localeCompare(bNative);
        });
    }, [options]);

    const filteredOptions = useMemo(() => {
        if (!search.trim()) return sortedOptions;
        const searchLower = search.toLowerCase();
        return sortedOptions.filter((option) => {
            const data = option.value ? countryData[option.value] : null;
            const nativeName = data?.nativeName?.toLowerCase() || '';
            const englishName = data?.name?.toLowerCase() || option.label.toLowerCase();
            const code = option.value?.toLowerCase() || '';
            let callingCode = '';
            if (option.value) {
                try {
                    callingCode = getCountryCallingCode(option.value);
                } catch {
                    // Ignore invalid countries
                }
            }
            return (
                nativeName.includes(searchLower) ||
                englishName.includes(searchLower) ||
                code.includes(searchLower) ||
                callingCode.includes(search)
            );
        });
    }, [sortedOptions, search]);

    const selectedData = value ? countryData[value] : null;

    if (readOnly) {
        return (
            <div className="flex items-center gap-2 h-full px-3">
                {value && <Flag code={value} className="w-5 h-3.5" />}
            </div>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild disabled={disabled}>
                <button
                    type="button"
                    className={cn(
                        'flex items-center gap-1.5 h-full px-3 outline-none',
                        'hover:bg-muted/50 transition-colors',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'rounded-l-md'
                    )}
                >
                    {value && <Flag code={value} className="w-5 h-3.5" />}
                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-72 p-0"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <div className="flex items-center border-b px-3 py-2">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                        type="text"
                        placeholder="Search countries..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        autoFocus
                    />
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                    {filteredOptions.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            No country found
                        </div>
                    ) : (
                        filteredOptions.map((option, index) => {
                            const data = option.value ? countryData[option.value] : null;
                            const nativeName = data?.nativeName || option.label;
                            const englishName = data?.name || option.label;
                            const isSelected = value === option.value;
                            let callingCode = '';
                            if (option.value) {
                                try {
                                    callingCode = getCountryCallingCode(option.value);
                                } catch {
                                    // Ignore
                                }
                            }
                            return (
                                <button
                                    key={option.value || `int-${index}`}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                        setSearch('');
                                    }}
                                    className={cn(
                                        'relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-gold/10',
                                        isSelected && 'bg-gold/20 text-gold font-medium'
                                    )}
                                >
                                    {option.value ? (
                                        <Flag code={option.value} className="w-5 h-3.5 flex-shrink-0" />
                                    ) : (
                                        <span className="w-5 h-3.5 flex-shrink-0" />
                                    )}
                                    <span className="flex-1 text-left truncate">
                                        {nativeName}
                                        {nativeName !== englishName && (
                                            <span className="ml-1.5 text-xs text-muted-foreground">
                                                ({englishName})
                                            </span>
                                        )}
                                    </span>
                                    {callingCode && (
                                        <span className="text-muted-foreground text-xs flex-shrink-0">
                                            +{callingCode}
                                        </span>
                                    )}
                                    {isSelected && (
                                        <Check className="h-4 w-4 text-gold flex-shrink-0" />
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function PhoneInputField({
    value,
    onChange,
    defaultCountry = 'LT',
    placeholder = '+370 612 34567',
    className,
    error,
    disabled = false,
}: PhoneInputFieldProps) {
    return (
        <div className={cn('relative', className)}>
            <PhoneInput
                international
                defaultCountry={defaultCountry}
                value={value}
                onChange={(val) => onChange(val || '')}
                placeholder={placeholder}
                disabled={disabled}
                flags={flags}
                inputComponent={CustomInput}
                countrySelectComponent={CountrySelect}
                className={cn(
                    // Match Input component styling exactly
                    'flex h-11 w-full min-w-0 rounded-lg border-2 bg-transparent shadow-xs',
                    'transition-[color,box-shadow] outline-none',
                    'border-input',
                    'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
                    error && 'border-red-500 dark:border-red-600 focus-within:border-red-500 focus-within:ring-red-500/20'
                )}
            />
        </div>
    );
}

export { isValidPhoneNumber, parsePhoneNumber, formatPhoneNumber } from 'react-phone-number-input';
