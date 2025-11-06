import { Input } from './ui/input';
import { Label } from './ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import type { ShippingAddress } from '@/types/checkout';
import { useTranslation } from '@/hooks/use-translation';

interface AddressFormProps {
    values: ShippingAddress;
    errors?: Partial<Record<keyof ShippingAddress, string>>;
    onChange: (field: keyof ShippingAddress, value: string) => void;
    prefix?: string;
}

const COUNTRIES = [
    { code: 'LT', nameKey: 'countries.lithuania', postalPattern: /^\d{5}$/, format: '12345' },
    { code: 'LV', nameKey: 'countries.latvia', postalPattern: /^LV-\d{4}$/, format: 'LV-1234' },
    { code: 'EE', nameKey: 'countries.estonia', postalPattern: /^\d{5}$/, format: '12345' },
    { code: 'PL', nameKey: 'countries.poland', postalPattern: /^\d{2}-\d{3}$/, format: '12-345' },
    { code: 'DE', nameKey: 'countries.germany', postalPattern: /^\d{5}$/, format: '12345' },
    { code: 'FR', nameKey: 'countries.france', postalPattern: /^\d{5}$/, format: '12345' },
    { code: 'ES', nameKey: 'countries.spain', postalPattern: /^\d{5}$/, format: '12345' },
    { code: 'IT', nameKey: 'countries.italy', postalPattern: /^\d{5}$/, format: '12345' },
    { code: 'NL', nameKey: 'countries.netherlands', postalPattern: /^\d{4}\s?[A-Z]{2}$/, format: '1234 AB' },
    { code: 'BE', nameKey: 'countries.belgium', postalPattern: /^\d{4}$/, format: '1234' },
];

export function AddressForm({
    values,
    errors = {},
    onChange,
    prefix = '',
}: AddressFormProps) {
    const { t } = useTranslation();

    const fieldId = (field: string) => (prefix ? `${prefix}-${field}` : field);

    const selectedCountry = COUNTRIES.find(c => c.code === values.country);
    const postalPlaceholder = selectedCountry?.format || '12345';

    return (
        <div className="space-y-4">
            {/* Address Line 1 */}
            <div>
                <Label htmlFor={fieldId('addressLine1')} className="text-sm font-bold uppercase tracking-wide">
                    {t('checkout.address_line_1', 'Address Line 1')} *
                </Label>
                <Input
                    id={fieldId('addressLine1')}
                    value={values.addressLine1}
                    onChange={(e) => onChange('addressLine1', e.target.value)}
                    placeholder={t('checkout.address_line_1_placeholder', 'Street address')}
                    className="mt-1.5"
                    error={errors.addressLine1}
                />
                {errors.addressLine1 && (
                    <p className="mt-1 text-sm text-red-600">{errors.addressLine1}</p>
                )}
            </div>

            {/* Address Line 2 (Optional) */}
            <div>
                <Label htmlFor={fieldId('addressLine2')} className="text-sm font-bold uppercase tracking-wide">
                    {t('checkout.address_line_2', 'Address Line 2')}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                        ({t('checkout.optional', 'Optional')})
                    </span>
                </Label>
                <Input
                    id={fieldId('addressLine2')}
                    value={values.addressLine2 || ''}
                    onChange={(e) => onChange('addressLine2', e.target.value)}
                    placeholder={t('checkout.address_line_2_placeholder', 'Apartment, suite, etc.')}
                    className="mt-1.5"
                />
            </div>

            {/* City and Postal Code */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <Label htmlFor={fieldId('city')} className="text-sm font-bold uppercase tracking-wide">
                        {t('checkout.city', 'City')} *
                    </Label>
                    <Input
                        id={fieldId('city')}
                        value={values.city}
                        onChange={(e) => onChange('city', e.target.value)}
                        placeholder={t('checkout.city_placeholder', 'Vilnius')}
                        className="mt-1.5"
                        error={errors.city}
                    />
                    {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor={fieldId('postalCode')} className="text-sm font-bold uppercase tracking-wide">
                        {t('checkout.postal_code', 'Postal Code')} *
                    </Label>
                    <Input
                        id={fieldId('postalCode')}
                        value={values.postalCode}
                        onChange={(e) => onChange('postalCode', e.target.value.toUpperCase())}
                        placeholder={postalPlaceholder}
                        className="mt-1.5"
                        error={errors.postalCode}
                    />
                    {errors.postalCode ? (
                        <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                    ) : selectedCountry && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {t('checkout.postal_code_format', 'Format')}: {selectedCountry.format}
                        </p>
                    )}
                </div>
            </div>

            {/* Country */}
            <div>
                <Label htmlFor={fieldId('country')} className="text-sm font-bold uppercase tracking-wide">
                    {t('checkout.country', 'Country')} *
                </Label>
                <Select
                    value={values.country}
                    onValueChange={(value) => onChange('country', value)}
                >
                    <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder={t('checkout.select_country', 'Select country')} />
                    </SelectTrigger>
                    <SelectContent>
                        {COUNTRIES.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                                {t(country.nameKey, country.code)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                )}
            </div>
        </div>
    );
}
