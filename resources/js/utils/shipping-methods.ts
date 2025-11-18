// EU country codes for shipping price calculation
const EU_COUNTRIES = [
    'AT', // Austria
    'BE', // Belgium
    'BG', // Bulgaria
    'HR', // Croatia
    'CY', // Cyprus
    'CZ', // Czech Republic
    'DK', // Denmark
    'EE', // Estonia
    'FI', // Finland
    'FR', // France
    'DE', // Germany
    'GR', // Greece
    'HU', // Hungary
    'IE', // Ireland
    'IT', // Italy
    'LV', // Latvia
    'LT', // Lithuania
    'LU', // Luxembourg
    'MT', // Malta
    'NL', // Netherlands
    'PL', // Poland
    'PT', // Portugal
    'RO', // Romania
    'SK', // Slovakia
    'SI', // Slovenia
    'ES', // Spain
    'SE', // Sweden
];

export interface ShippingMethod {
    id: string;
    name: string;
    description: string;
    price: number;
    estimatedDays: string;
}

type TranslationFunction = (key: string, fallback: string, params?: Record<string, string>) => string;

/**
 * Get available shipping methods based on country code
 * Pricing structure:
 * - Lithuania: Venipak Courier €4, Venipak Pickup €4
 * - Other EU: Venipak Courier €4
 * - Rest of World: Courier Shipping €20
 */
export function getShippingMethods(countryCode: string, t: TranslationFunction): ShippingMethod[] {
    const isLithuania = countryCode === 'LT';
    const isEU = EU_COUNTRIES.includes(countryCode);

    if (isLithuania) {
        // Lithuania: Both courier and pickup available at €4
        return [
            {
                id: 'venipak-courier',
                name: t('shipping.venipak_courier', 'Venipak Courier'),
                description: t('shipping.venipak_courier_description', 'Delivery to your door'),
                price: 4,
                estimatedDays: t('shipping.venipak_courier_days_lt', '1-2 business days'),
            },
            {
                id: 'venipak-pickup',
                name: t('shipping.venipak_pickup', 'Venipak Pickup Location'),
                description: t('shipping.venipak_pickup_description', 'Pick up from Venipak location'),
                price: 4,
                estimatedDays: t('shipping.venipak_pickup_days', 'Available next day'),
            },
        ];
    } else if (isEU) {
        // Europe: Only courier available at €4
        return [
            {
                id: 'venipak-courier',
                name: t('shipping.venipak_courier', 'Venipak Courier'),
                description: t('shipping.venipak_courier_description', 'Delivery to your door'),
                price: 4,
                estimatedDays: t('shipping.venipak_courier_days_eu', '3-5 business days'),
            },
        ];
    } else {
        // Rest of World: Only courier shipping at €20
        return [
            {
                id: 'courier-shipping',
                name: t('shipping.courier', 'Courier Shipping'),
                description: t('shipping.courier_description', 'International delivery'),
                price: 20,
                estimatedDays: t('shipping.courier_days_world', '7-14 business days'),
            },
        ];
    }
}

/**
 * Calculate final shipping cost
 */
export function calculateShippingCost(
    shippingMethodId: string,
    shippingMethods: ShippingMethod[]
): number {
    const method = shippingMethods.find(m => m.id === shippingMethodId);
    return method?.price || 0;
}
