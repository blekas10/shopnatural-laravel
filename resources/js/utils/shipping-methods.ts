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

// Baltic countries - Venipak domestic delivery with pickup points
const BALTIC_COUNTRIES = ['LT', 'LV', 'EE'];

// International countries - Venipak courier only, same price as Baltic
const INTERNATIONAL_COUNTRIES = ['PL', 'FI'];

// Free shipping threshold for Lithuania
const FREE_SHIPPING_THRESHOLD_LT = 50;

/**
 * Get available shipping methods based on country code and subtotal
 * Pricing structure:
 * - Lithuania (LT): FREE shipping for orders over €50, otherwise €4
 * - Baltic (LT, LV, EE): Venipak Courier €4, Venipak Pickup €4, 1-5 days
 * - International (PL, FI): Venipak Courier €4, 1-5 days
 * - Global (other EU + World): Courier €20, 2-10 days
 */
export function getShippingMethods(countryCode: string, t: TranslationFunction, subtotal: number = 0): ShippingMethod[] {
    const isBaltic = BALTIC_COUNTRIES.includes(countryCode);
    const isInternational = INTERNATIONAL_COUNTRIES.includes(countryCode);
    const isEU = EU_COUNTRIES.includes(countryCode);

    // Check if free shipping applies for Lithuania
    const isLithuania = countryCode === 'LT';
    const hasFreeShipping = isLithuania && subtotal >= FREE_SHIPPING_THRESHOLD_LT;

    if (isBaltic) {
        // Baltic countries (LT, LV, EE): Both courier and pickup available
        // Lithuania gets free shipping for orders over €50
        const shippingPrice = hasFreeShipping ? 0 : 4;
        const freeShippingNote = isLithuania && !hasFreeShipping
            ? ` (${t('shipping.free_over', 'Free over')} €${FREE_SHIPPING_THRESHOLD_LT})`
            : hasFreeShipping
                ? ` (${t('shipping.free', 'Free!')})`
                : '';

        return [
            {
                id: 'venipak-courier',
                name: t('shipping.venipak_courier', 'Venipak Courier'),
                description: t('shipping.venipak_courier_description', 'Delivery to your door') + freeShippingNote,
                price: shippingPrice,
                estimatedDays: t('shipping.delivery_days_baltic', '1-5 business days'),
            },
            {
                id: 'venipak-pickup',
                name: t('shipping.venipak_pickup', 'Venipak Pickup Location'),
                description: t('shipping.venipak_pickup_description', 'Pick up from Venipak location') + freeShippingNote,
                price: shippingPrice,
                estimatedDays: t('shipping.delivery_days_baltic', '1-5 business days'),
            },
        ];
    } else if (isInternational) {
        // International (PL, FI): Only courier available at €4
        return [
            {
                id: 'venipak-courier',
                name: t('shipping.venipak_courier', 'Venipak Courier'),
                description: t('shipping.venipak_courier_description', 'Delivery to your door'),
                price: 4,
                estimatedDays: t('shipping.delivery_days_international', '1-5 business days'),
            },
        ];
    } else if (isEU) {
        // Global EU: Only courier at €20
        return [
            {
                id: 'venipak-courier',
                name: t('shipping.venipak_courier', 'Venipak Courier'),
                description: t('shipping.venipak_courier_description', 'Delivery to your door'),
                price: 20,
                estimatedDays: t('shipping.delivery_days_global', '2-10 business days'),
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
                estimatedDays: t('shipping.delivery_days_global', '2-10 business days'),
            },
        ];
    }
}

/**
 * Check if country has pickup points available
 */
export function hasPickupPoints(countryCode: string): boolean {
    return BALTIC_COUNTRIES.includes(countryCode);
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
