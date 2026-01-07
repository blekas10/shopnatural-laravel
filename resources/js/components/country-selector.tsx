'use client';

import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import flags from 'react-phone-number-input/flags';

interface Country {
    code: string;
    name: string;
    nativeName: string;
}

const countries: Country[] = [
    // Europe
    { code: 'LT', name: 'Lithuania', nativeName: 'Lietuva' },
    { code: 'LV', name: 'Latvia', nativeName: 'Latvija' },
    { code: 'EE', name: 'Estonia', nativeName: 'Eesti' },
    { code: 'PL', name: 'Poland', nativeName: 'Polska' },
    { code: 'DE', name: 'Germany', nativeName: 'Deutschland' },
    { code: 'FR', name: 'France', nativeName: 'France' },
    { code: 'ES', name: 'Spain', nativeName: 'España' },
    { code: 'IT', name: 'Italy', nativeName: 'Italia' },
    { code: 'GB', name: 'United Kingdom', nativeName: 'United Kingdom' },
    { code: 'NL', name: 'Netherlands', nativeName: 'Nederland' },
    { code: 'BE', name: 'Belgium', nativeName: 'België' },
    { code: 'AT', name: 'Austria', nativeName: 'Österreich' },
    { code: 'DK', name: 'Denmark', nativeName: 'Danmark' },
    { code: 'SE', name: 'Sweden', nativeName: 'Sverige' },
    { code: 'NO', name: 'Norway', nativeName: 'Norge' },
    { code: 'FI', name: 'Finland', nativeName: 'Suomi' },
    { code: 'CZ', name: 'Czech Republic', nativeName: 'Česko' },
    { code: 'SK', name: 'Slovakia', nativeName: 'Slovensko' },
    { code: 'HU', name: 'Hungary', nativeName: 'Magyarország' },
    { code: 'RO', name: 'Romania', nativeName: 'România' },
    { code: 'BG', name: 'Bulgaria', nativeName: 'България' },
    { code: 'HR', name: 'Croatia', nativeName: 'Hrvatska' },
    { code: 'SI', name: 'Slovenia', nativeName: 'Slovenija' },
    { code: 'PT', name: 'Portugal', nativeName: 'Portugal' },
    { code: 'GR', name: 'Greece', nativeName: 'Ελλάδα' },
    { code: 'IE', name: 'Ireland', nativeName: 'Éire' },
    { code: 'LU', name: 'Luxembourg', nativeName: 'Luxembourg' },
    { code: 'MT', name: 'Malta', nativeName: 'Malta' },
    { code: 'CY', name: 'Cyprus', nativeName: 'Κύπρος' },
    { code: 'CH', name: 'Switzerland', nativeName: 'Schweiz' },
    { code: 'IS', name: 'Iceland', nativeName: 'Ísland' },
    { code: 'AL', name: 'Albania', nativeName: 'Shqipëri' },
    { code: 'AD', name: 'Andorra', nativeName: 'Andorra' },
    { code: 'BY', name: 'Belarus', nativeName: 'Беларусь' },
    { code: 'BA', name: 'Bosnia and Herzegovina', nativeName: 'Bosna i Hercegovina' },
    { code: 'XK', name: 'Kosovo', nativeName: 'Kosova' },
    { code: 'MD', name: 'Moldova', nativeName: 'Moldova' },
    { code: 'MC', name: 'Monaco', nativeName: 'Monaco' },
    { code: 'ME', name: 'Montenegro', nativeName: 'Crna Gora' },
    { code: 'MK', name: 'North Macedonia', nativeName: 'Македонија' },
    { code: 'RS', name: 'Serbia', nativeName: 'Србија' },
    { code: 'SM', name: 'San Marino', nativeName: 'San Marino' },
    { code: 'UA', name: 'Ukraine', nativeName: 'Україна' },
    { code: 'VA', name: 'Vatican City', nativeName: 'Città del Vaticano' },
    { code: 'RU', name: 'Russia', nativeName: 'Россия' },
    { code: 'TR', name: 'Turkey', nativeName: 'Türkiye' },

    // Americas
    { code: 'US', name: 'United States', nativeName: 'United States' },
    { code: 'CA', name: 'Canada', nativeName: 'Canada' },
    { code: 'MX', name: 'Mexico', nativeName: 'México' },
    { code: 'BR', name: 'Brazil', nativeName: 'Brasil' },
    { code: 'AR', name: 'Argentina', nativeName: 'Argentina' },
    { code: 'CL', name: 'Chile', nativeName: 'Chile' },
    { code: 'CO', name: 'Colombia', nativeName: 'Colombia' },
    { code: 'PE', name: 'Peru', nativeName: 'Perú' },
    { code: 'VE', name: 'Venezuela', nativeName: 'Venezuela' },
    { code: 'EC', name: 'Ecuador', nativeName: 'Ecuador' },
    { code: 'BO', name: 'Bolivia', nativeName: 'Bolivia' },
    { code: 'PY', name: 'Paraguay', nativeName: 'Paraguay' },
    { code: 'UY', name: 'Uruguay', nativeName: 'Uruguay' },

    // Asia
    { code: 'CN', name: 'China', nativeName: '中国' },
    { code: 'JP', name: 'Japan', nativeName: '日本' },
    { code: 'KR', name: 'South Korea', nativeName: '대한민국' },
    { code: 'IN', name: 'India', nativeName: 'भारत' },
    { code: 'ID', name: 'Indonesia', nativeName: 'Indonesia' },
    { code: 'TH', name: 'Thailand', nativeName: 'ประเทศไทย' },
    { code: 'VN', name: 'Vietnam', nativeName: 'Việt Nam' },
    { code: 'MY', name: 'Malaysia', nativeName: 'Malaysia' },
    { code: 'SG', name: 'Singapore', nativeName: 'Singapore' },
    { code: 'PH', name: 'Philippines', nativeName: 'Pilipinas' },
    { code: 'PK', name: 'Pakistan', nativeName: 'پاکستان' },
    { code: 'BD', name: 'Bangladesh', nativeName: 'বাংলাদেশ' },
    { code: 'IL', name: 'Israel', nativeName: 'ישראל' },
    { code: 'AE', name: 'United Arab Emirates', nativeName: 'الإمارات' },
    { code: 'SA', name: 'Saudi Arabia', nativeName: 'السعودية' },
    { code: 'KW', name: 'Kuwait', nativeName: 'الكويت' },
    { code: 'QA', name: 'Qatar', nativeName: 'قطر' },
    { code: 'OM', name: 'Oman', nativeName: 'عمان' },
    { code: 'JO', name: 'Jordan', nativeName: 'الأردن' },
    { code: 'LB', name: 'Lebanon', nativeName: 'لبنان' },

    // Oceania
    { code: 'AU', name: 'Australia', nativeName: 'Australia' },
    { code: 'NZ', name: 'New Zealand', nativeName: 'New Zealand' },

    // Africa
    { code: 'ZA', name: 'South Africa', nativeName: 'South Africa' },
    { code: 'EG', name: 'Egypt', nativeName: 'مصر' },
    { code: 'NG', name: 'Nigeria', nativeName: 'Nigeria' },
    { code: 'KE', name: 'Kenya', nativeName: 'Kenya' },
    { code: 'MA', name: 'Morocco', nativeName: 'المغرب' },
    { code: 'TN', name: 'Tunisia', nativeName: 'تونس' },
    { code: 'GH', name: 'Ghana', nativeName: 'Ghana' },
].sort((a, b) => a.nativeName.localeCompare(b.nativeName));

// Flag component wrapper for consistent styling
function Flag({ code, className }: { code: string; className?: string }) {
    const FlagComponent = flags[code as keyof typeof flags];
    if (!FlagComponent) {
        return <span className={cn("inline-block bg-muted", className)} />;
    }
    return (
        <span className={cn("inline-block overflow-hidden", className)}>
            <FlagComponent title={code} />
        </span>
    );
}

interface CountrySelectorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
}

export function CountrySelector({
    value,
    onChange,
    label = 'Country',
    placeholder = 'Select country...',
}: CountrySelectorProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const selectedCountry = countries.find((country) => country.code === value);

    const filteredCountries = useMemo(() => {
        if (!search.trim()) return countries;
        const searchLower = search.toLowerCase();
        return countries.filter((country) =>
            country.nativeName.toLowerCase().includes(searchLower) ||
            country.name.toLowerCase().includes(searchLower) ||
            country.code.toLowerCase().includes(searchLower)
        );
    }, [search]);

    return (
        <div className="space-y-2">
            {label && (
                <label className="text-sm font-bold uppercase tracking-wide">
                    {label} <span className="text-red-500">*</span>
                </label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-11 font-normal"
                    >
                        {selectedCountry ? (
                            <span className="flex items-center gap-2">
                                <Flag code={selectedCountry.code} className="w-5 h-3.5" />
                                <span>{selectedCountry.nativeName}</span>
                            </span>
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
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
                        {filteredCountries.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                No country found
                            </div>
                        ) : (
                            filteredCountries.map((country) => (
                                <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => {
                                        onChange(country.code);
                                        setOpen(false);
                                        setSearch('');
                                    }}
                                    className={cn(
                                        'relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-gold/10',
                                        value === country.code && 'bg-gold/20 text-gold font-medium'
                                    )}
                                >
                                    <Flag code={country.code} className="w-5 h-3.5 flex-shrink-0" />
                                    <span className="flex-1 text-left">
                                        {country.nativeName}
                                        {country.nativeName !== country.name && (
                                            <span className="ml-1.5 text-xs text-muted-foreground">
                                                ({country.name})
                                            </span>
                                        )}
                                    </span>
                                    {value === country.code && (
                                        <Check className="h-4 w-4 text-gold flex-shrink-0" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

// Export Flag component for reuse
export { Flag, countries };
