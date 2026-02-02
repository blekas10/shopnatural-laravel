// Google Tag Manager DataLayer helper hook
// Used for Facebook CAPI events via Stape.io server-side GTM

declare global {
    interface Window {
        dataLayer: Record<string, unknown>[];
    }
}

/**
 * Generate a unique event ID for deduplication between browser Pixel and server CAPI
 * Format: timestamp-random to ensure uniqueness
 */
function generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get or create Facebook browser ID cookie (_fbp)
 * Format: fb.1.timestamp.random
 *
 * NOTE: Without Facebook Pixel, we must generate this ourselves.
 * This is the browser identifier that persists across sessions.
 */
function getFbp(): string {
    if (typeof document === 'undefined') return '';

    // Check if _fbp cookie already exists
    const match = document.cookie.match(/_fbp=([^;]+)/);
    if (match) return match[1];

    // Generate new _fbp (since we don't have Facebook Pixel to create it)
    // Format: fb.1.timestamp.random (10 digits)
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000000000); // 10 digit random
    const fbp = `fb.1.${timestamp}.${random}`;

    // Store in cookie (expires in 90 days, same as Facebook Pixel)
    document.cookie = `_fbp=${fbp}; max-age=${90 * 24 * 60 * 60}; path=/; SameSite=Lax`;

    return fbp;
}

/**
 * Get Facebook click ID cookie (_fbc)
 * This is set when user comes from a Facebook ad (contains fbclid)
 * Format: fb.1.timestamp.fbclid
 */
function getFbc(): string | null {
    if (typeof document === 'undefined') return null;

    // First check cookie
    const cookieMatch = document.cookie.match(/_fbc=([^;]+)/);
    if (cookieMatch) return cookieMatch[1];

    // If no cookie, check URL for fbclid and construct fbc
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');
    if (fbclid) {
        // Format: fb.1.timestamp.fbclid
        const fbc = `fb.1.${Date.now()}.${fbclid}`;
        // Store in cookie for future page loads (expires in 90 days)
        document.cookie = `_fbc=${fbc}; max-age=${90 * 24 * 60 * 60}; path=/; SameSite=Lax`;
        return fbc;
    }

    return null;
}

/**
 * Get user IP (will be overridden by server-side GTM, but good to include)
 */
function getUserAgent(): string {
    if (typeof navigator === 'undefined') return '';
    return navigator.userAgent;
}

export function useGTM() {
    const push = (data: Record<string, unknown>) => {
        if (typeof window !== 'undefined') {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push(data);
        }
    };

    /**
     * Get common Facebook tracking parameters
     * These are critical for ad attribution and Event Match Quality
     */
    const getFacebookParams = () => ({
        fbp: getFbp(),           // Browser ID - identifies user across sessions
        fbc: getFbc(),           // Click ID - links to Facebook ad click
        user_agent: getUserAgent(),
        event_source_url: typeof window !== 'undefined' ? window.location.href : '',
    });

    return {
        // Facebook CAPI: ViewContent - Product page view
        viewContent: (_productId: number, sku: string, name: string, price: number, currency = 'EUR') => {
            push({
                event: 'ViewContent',
                event_id: generateEventId(),  // For deduplication
                content_ids: [sku],
                content_name: name,
                content_type: 'product',
                value: price,
                currency,
                ...getFacebookParams(),
            });
        },

        // Facebook CAPI: AddToCart
        addToCart: (_productId: number, sku: string, name: string, price: number, quantity: number, currency = 'EUR') => {
            push({
                event: 'AddToCart',
                event_id: generateEventId(),
                content_ids: [sku],
                content_name: name,
                content_type: 'product',
                value: price * quantity,
                currency,
                quantity,
                ...getFacebookParams(),
            });
        },

        // Facebook CAPI: InitiateCheckout
        initiateCheckout: (skus: string[], names: string[], value: number, numItems: number, currency = 'EUR') => {
            push({
                event: 'InitiateCheckout',
                event_id: generateEventId(),
                content_ids: skus,
                content_name: names.join(', '),
                content_type: 'product',
                value,
                currency,
                num_items: numItems,
                ...getFacebookParams(),
            });
        },

        // Facebook CAPI: AddPaymentInfo
        addPaymentInfo: (skus: string[], value: number, currency = 'EUR') => {
            push({
                event: 'AddPaymentInfo',
                event_id: generateEventId(),
                content_ids: skus,
                content_type: 'product',
                value,
                currency,
                ...getFacebookParams(),
            });
        },

        // Facebook CAPI: Purchase - most important event for ad optimization
        // Include user data for higher Event Match Quality (EMQ)
        purchase: (
            orderId: string,
            skus: string[],
            names: string[],
            value: number,
            numItems: number,
            currency = 'EUR',
            userData?: {
                email?: string;
                phone?: string;
                firstName?: string;
                lastName?: string;
                city?: string;
                postalCode?: string;
                country?: string;
            }
        ) => {
            push({
                event: 'Purchase',
                event_id: generateEventId(),
                order_id: orderId,
                content_ids: skus,
                content_name: names.join(', '),
                content_type: 'product',
                value,
                currency,
                num_items: numItems,
                ...getFacebookParams(),
                // User data for higher Event Match Quality
                // Server-side GTM will hash these before sending to Facebook
                ...(userData && {
                    user_data: {
                        email: userData.email,
                        phone: userData.phone,
                        first_name: userData.firstName,
                        last_name: userData.lastName,
                        city: userData.city,
                        postal_code: userData.postalCode,
                        country: userData.country,
                    },
                }),
            });
        },

        // Consent update for GTM consent mode
        updateConsent: (granted: boolean) => {
            push({
                event: 'consent_update',
                analytics_storage: granted ? 'granted' : 'denied',
                ad_storage: granted ? 'granted' : 'denied',
                ad_user_data: granted ? 'granted' : 'denied',
                ad_personalization: granted ? 'granted' : 'denied',
            });
        },
    };
}

// Standalone function for use outside of React components (e.g., in context)
export function pushToDataLayer(data: Record<string, unknown>) {
    if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            ...data,
            event_id: generateEventId(),
            fbp: getFbp(),
            fbc: getFbc(),
            user_agent: getUserAgent(),
            event_source_url: window.location.href,
        });
    }
}
