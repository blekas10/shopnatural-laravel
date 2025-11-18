'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface Country {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
}

const countries: Country[] = [
    // Europe
    { code: 'LT', name: 'Lithuania', nativeName: 'Lietuva', flag: '🇱🇹' },
    { code: 'LV', name: 'Latvia', nativeName: 'Latvija', flag: '🇱🇻' },
    { code: 'EE', name: 'Estonia', nativeName: 'Eesti', flag: '🇪🇪' },
    { code: 'PL', name: 'Poland', nativeName: 'Polska', flag: '🇵🇱' },
    { code: 'DE', name: 'Germany', nativeName: 'Deutschland', flag: '🇩🇪' },
    { code: 'FR', name: 'France', nativeName: 'France', flag: '🇫🇷' },
    { code: 'ES', name: 'Spain', nativeName: 'España', flag: '🇪🇸' },
    { code: 'IT', name: 'Italy', nativeName: 'Italia', flag: '🇮🇹' },
    { code: 'GB', name: 'United Kingdom', nativeName: 'United Kingdom', flag: '🇬🇧' },
    { code: 'NL', name: 'Netherlands', nativeName: 'Nederland', flag: '🇳🇱' },
    { code: 'BE', name: 'Belgium', nativeName: 'België', flag: '🇧🇪' },
    { code: 'AT', name: 'Austria', nativeName: 'Österreich', flag: '🇦🇹' },
    { code: 'DK', name: 'Denmark', nativeName: 'Danmark', flag: '🇩🇰' },
    { code: 'SE', name: 'Sweden', nativeName: 'Sverige', flag: '🇸🇪' },
    { code: 'NO', name: 'Norway', nativeName: 'Norge', flag: '🇳🇴' },
    { code: 'FI', name: 'Finland', nativeName: 'Suomi', flag: '🇫🇮' },
    { code: 'CZ', name: 'Czech Republic', nativeName: 'Česko', flag: '🇨🇿' },
    { code: 'SK', name: 'Slovakia', nativeName: 'Slovensko', flag: '🇸🇰' },
    { code: 'HU', name: 'Hungary', nativeName: 'Magyarország', flag: '🇭🇺' },
    { code: 'RO', name: 'Romania', nativeName: 'România', flag: '🇷🇴' },
    { code: 'BG', name: 'Bulgaria', nativeName: 'България', flag: '🇧🇬' },
    { code: 'HR', name: 'Croatia', nativeName: 'Hrvatska', flag: '🇭🇷' },
    { code: 'SI', name: 'Slovenia', nativeName: 'Slovenija', flag: '🇸🇮' },
    { code: 'PT', name: 'Portugal', nativeName: 'Portugal', flag: '🇵🇹' },
    { code: 'GR', name: 'Greece', nativeName: 'Ελλάδα', flag: '🇬🇷' },
    { code: 'IE', name: 'Ireland', nativeName: 'Éire', flag: '🇮🇪' },
    { code: 'LU', name: 'Luxembourg', nativeName: 'Luxembourg', flag: '🇱🇺' },
    { code: 'MT', name: 'Malta', nativeName: 'Malta', flag: '🇲🇹' },
    { code: 'CY', name: 'Cyprus', nativeName: 'Κύπρος', flag: '🇨🇾' },
    { code: 'CH', name: 'Switzerland', nativeName: 'Schweiz', flag: '🇨🇭' },
    { code: 'IS', name: 'Iceland', nativeName: 'Ísland', flag: '🇮🇸' },
    { code: 'AL', name: 'Albania', nativeName: 'Shqipëri', flag: '🇦🇱' },
    { code: 'AD', name: 'Andorra', nativeName: 'Andorra', flag: '🇦🇩' },
    { code: 'BY', name: 'Belarus', nativeName: 'Беларусь', flag: '🇧🇾' },
    { code: 'BA', name: 'Bosnia and Herzegovina', nativeName: 'Bosna i Hercegovina', flag: '🇧🇦' },
    { code: 'XK', name: 'Kosovo', nativeName: 'Kosova', flag: '🇽🇰' },
    { code: 'MD', name: 'Moldova', nativeName: 'Moldova', flag: '🇲🇩' },
    { code: 'MC', name: 'Monaco', nativeName: 'Monaco', flag: '🇲🇨' },
    { code: 'ME', name: 'Montenegro', nativeName: 'Crna Gora', flag: '🇲🇪' },
    { code: 'MK', name: 'North Macedonia', nativeName: 'Македонија', flag: '🇲🇰' },
    { code: 'RS', name: 'Serbia', nativeName: 'Србија', flag: '🇷🇸' },
    { code: 'SM', name: 'San Marino', nativeName: 'San Marino', flag: '🇸🇲' },
    { code: 'UA', name: 'Ukraine', nativeName: 'Україна', flag: '🇺🇦' },
    { code: 'VA', name: 'Vatican City', nativeName: 'Città del Vaticano', flag: '🇻🇦' },
    { code: 'RU', name: 'Russia', nativeName: 'Россия', flag: '🇷🇺' },
    { code: 'TR', name: 'Turkey', nativeName: 'Türkiye', flag: '🇹🇷' },

    // Americas
    { code: 'US', name: 'United States', nativeName: 'United States', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', nativeName: 'Canada', flag: '🇨🇦' },
    { code: 'MX', name: 'Mexico', nativeName: 'México', flag: '🇲🇽' },
    { code: 'BR', name: 'Brazil', nativeName: 'Brasil', flag: '🇧🇷' },
    { code: 'AR', name: 'Argentina', nativeName: 'Argentina', flag: '🇦🇷' },
    { code: 'CL', name: 'Chile', nativeName: 'Chile', flag: '🇨🇱' },
    { code: 'CO', name: 'Colombia', nativeName: 'Colombia', flag: '🇨🇴' },
    { code: 'PE', name: 'Peru', nativeName: 'Perú', flag: '🇵🇪' },
    { code: 'VE', name: 'Venezuela', nativeName: 'Venezuela', flag: '🇻🇪' },
    { code: 'EC', name: 'Ecuador', nativeName: 'Ecuador', flag: '🇪🇨' },
    { code: 'BO', name: 'Bolivia', nativeName: 'Bolivia', flag: '🇧🇴' },
    { code: 'PY', name: 'Paraguay', nativeName: 'Paraguay', flag: '🇵🇾' },
    { code: 'UY', name: 'Uruguay', nativeName: 'Uruguay', flag: '🇺🇾' },

    // Asia
    { code: 'CN', name: 'China', nativeName: '中国', flag: '🇨🇳' },
    { code: 'JP', name: 'Japan', nativeName: '日本', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea', nativeName: '대한민국', flag: '🇰🇷' },
    { code: 'IN', name: 'India', nativeName: 'भारत', flag: '🇮🇳' },
    { code: 'ID', name: 'Indonesia', nativeName: 'Indonesia', flag: '🇮🇩' },
    { code: 'TH', name: 'Thailand', nativeName: 'ประเทศไทย', flag: '🇹🇭' },
    { code: 'VN', name: 'Vietnam', nativeName: 'Việt Nam', flag: '🇻🇳' },
    { code: 'MY', name: 'Malaysia', nativeName: 'Malaysia', flag: '🇲🇾' },
    { code: 'SG', name: 'Singapore', nativeName: 'Singapore', flag: '🇸🇬' },
    { code: 'PH', name: 'Philippines', nativeName: 'Pilipinas', flag: '🇵🇭' },
    { code: 'PK', name: 'Pakistan', nativeName: 'پاکستان', flag: '🇵🇰' },
    { code: 'BD', name: 'Bangladesh', nativeName: 'বাংলাদেশ', flag: '🇧🇩' },
    { code: 'IL', name: 'Israel', nativeName: 'ישראל', flag: '🇮🇱' },
    { code: 'AE', name: 'United Arab Emirates', nativeName: 'الإمارات', flag: '🇦🇪' },
    { code: 'SA', name: 'Saudi Arabia', nativeName: 'السعودية', flag: '🇸🇦' },
    { code: 'KW', name: 'Kuwait', nativeName: 'الكويت', flag: '🇰🇼' },
    { code: 'QA', name: 'Qatar', nativeName: 'قطر', flag: '🇶🇦' },
    { code: 'OM', name: 'Oman', nativeName: 'عمان', flag: '🇴🇲' },
    { code: 'JO', name: 'Jordan', nativeName: 'الأردن', flag: '🇯🇴' },
    { code: 'LB', name: 'Lebanon', nativeName: 'لبنان', flag: '🇱🇧' },

    // Oceania
    { code: 'AU', name: 'Australia', nativeName: 'Australia', flag: '🇦🇺' },
    { code: 'NZ', name: 'New Zealand', nativeName: 'New Zealand', flag: '🇳🇿' },

    // Africa
    { code: 'ZA', name: 'South Africa', nativeName: 'South Africa', flag: '🇿🇦' },
    { code: 'EG', name: 'Egypt', nativeName: 'مصر', flag: '🇪🇬' },
    { code: 'NG', name: 'Nigeria', nativeName: 'Nigeria', flag: '🇳🇬' },
    { code: 'KE', name: 'Kenya', nativeName: 'Kenya', flag: '🇰🇪' },
    { code: 'MA', name: 'Morocco', nativeName: 'المغرب', flag: '🇲🇦' },
    { code: 'TN', name: 'Tunisia', nativeName: 'تونس', flag: '🇹🇳' },
    { code: 'GH', name: 'Ghana', nativeName: 'Ghana', flag: '🇬🇭' },
].sort((a, b) => a.nativeName.localeCompare(b.nativeName));

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

    const filteredCountries = countries.filter((country) =>
        country.nativeName.toLowerCase().includes(search.toLowerCase()) ||
        country.name.toLowerCase().includes(search.toLowerCase())
    );

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
                                <span className="text-2xl">{selectedCountry.flag}</span>
                                <span>{selectedCountry.nativeName}</span>
                            </span>
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            placeholder="Search countries..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-11 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                                    <span className="text-2xl">{country.flag}</span>
                                    <span className="flex-1 text-left">
                                        {country.nativeName}
                                        {country.nativeName !== country.name && (
                                            <span className="ml-1.5 text-xs text-muted-foreground">
                                                ({country.name})
                                            </span>
                                        )}
                                    </span>
                                    {value === country.code && (
                                        <Check className="h-4 w-4 text-gold" />
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
