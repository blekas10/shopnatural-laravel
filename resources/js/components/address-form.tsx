import { Input } from './ui/input';
import { Label } from './ui/label';
import type { ShippingAddress } from '@/types/checkout';
import { useTranslation } from '@/hooks/use-translation';

interface AddressFormProps {
    values: Omit<ShippingAddress, 'fullName'> & { fullName?: string };
    errors?: Partial<Record<keyof ShippingAddress, string>>;
    onChange: (field: keyof ShippingAddress, value: string) => void;
    prefix?: string;
}

export const COUNTRIES = [
    { code: 'LT', nameKey: 'countries.lithuania', postalPattern: /^(LT[-\s]?)?\d{5}$/i, format: '12345' },
    { code: 'LV', nameKey: 'countries.latvia', postalPattern: /^(LV[-\s]?)?\d{4}$/i, format: 'LV-1234' },
    { code: 'EE', nameKey: 'countries.estonia', postalPattern: /^(EE[-\s]?)?\d{5}$/i, format: '12345' },
    { code: 'PL', nameKey: 'countries.poland', postalPattern: /^\d{2}[-\s]?\d{3}$/, format: '12-345' },
    { code: 'DE', nameKey: 'countries.germany', postalPattern: /^\d{5}$/, format: '12345' },
    { code: 'FR', nameKey: 'countries.france', postalPattern: /^\d{5}$/, format: '12345' },
    { code: 'ES', nameKey: 'countries.spain', postalPattern: /^\d{5}$/, format: '12345' },
    { code: 'IT', nameKey: 'countries.italy', postalPattern: /^\d{5}$/, format: '12345' },
    { code: 'NL', nameKey: 'countries.netherlands', postalPattern: /^\d{4}\s?[A-Za-z]{2}$/i, format: '1234 AB' },
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

            {/* City, State/Province, and Postal Code */}
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
                    <Label htmlFor={fieldId('state')} className="text-sm font-bold uppercase tracking-wide">
                        {t('checkout.state', 'State/Province')} *
                    </Label>
                    <Input
                        id={fieldId('state')}
                        value={values.state}
                        onChange={(e) => onChange('state', e.target.value)}
                        placeholder={t('checkout.state_placeholder', 'State or Province')}
                        className="mt-1.5"
                        error={errors.state}
                    />
                    {errors.state && (
                        <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                </div>
            </div>

            {/* Postal Code */}
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
    );
}
