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
 * - Lithuania: Pickup €2, Standard €5, Express €9
 * - Other EU: Pickup €4, Standard €8, Express €15
 * - Rest of World: Pickup €20, Standard €25, Express €40
 */
export function getShippingMethods(countryCode: string, t: TranslationFunction): ShippingMethod[] {
    const isLithuania = countryCode === 'LT';
    const isEU = EU_COUNTRIES.includes(countryCode);

    // Determine pricing based on country
    let pickupPrice: number;
    let standardPrice: number;
    let expressPrice: number;
    let standardDays: string;
    let expressDays: string;

    if (isLithuania) {
        pickupPrice = 2;
        standardPrice = 5;
        expressPrice = 9;
        standardDays = t('shipping.standard_days_lt', '3-5 business days');
        expressDays = t('shipping.express_days_lt', '1-2 business days');
    } else if (isEU) {
        pickupPrice = 4;
        standardPrice = 8;
        expressPrice = 15;
        standardDays = t('shipping.standard_days_eu', '5-7 business days');
        expressDays = t('shipping.express_days_eu', '2-3 business days');
    } else {
        pickupPrice = 20;
        standardPrice = 25;
        expressPrice = 40;
        standardDays = t('shipping.standard_days_world', '10-15 business days');
        expressDays = t('shipping.express_days_world', '5-7 business days');
    }

    return [
        {
            id: 'pickup',
            name: t('shipping.pickup', 'Pick Up'),
            description: t('shipping.pickup_description', 'Pick up from our store'),
            price: pickupPrice,
            estimatedDays: t('shipping.pickup_days', 'Available today'),
        },
        {
            id: 'standard',
            name: t('shipping.standard', 'Standard Shipping'),
            description: t('shipping.standard_description', 'Free for orders over €50', { price: `€${standardPrice.toFixed(2)}` }),
            price: standardPrice,
            estimatedDays: standardDays,
        },
        {
            id: 'express',
            name: t('shipping.express', 'Express Shipping'),
            description: t('shipping.express_description', 'Fast delivery'),
            price: expressPrice,
            estimatedDays: expressDays,
        },
    ];
}

/**
 * Calculate final shipping cost (can apply free shipping rules here)
 */
export function calculateShippingCost(
    shippingMethodId: string,
    shippingMethods: ShippingMethod[],
    subtotal: number,
    freeShippingThreshold: number = 50
): number {
    // Pickup is always the set price
    if (shippingMethodId === 'pickup') {
        const pickupMethod = shippingMethods.find(m => m.id === 'pickup');
        return pickupMethod?.price || 0;
    }

    const method = shippingMethods.find(m => m.id === shippingMethodId);
    if (!method) return 0;

    // Free shipping for standard if over threshold
    if (shippingMethodId === 'standard' && subtotal >= freeShippingThreshold) {
        return 0;
    }

    return method.price;
}
