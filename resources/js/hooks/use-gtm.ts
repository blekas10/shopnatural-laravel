// Google Tag Manager DataLayer helper hook
// Used for Facebook CAPI events via Stape.io server-side GTM

import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

declare global {
    interface Window {
        dataLayer: Record<string, unknown>[];
    }
}

export interface UserTrackingData {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    postalCode?: string;
    country?: string;
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

/**
 * Build user_data and external_id fields for Facebook CAPI Event Match Quality.
 * Combines auth user data (for external_id + email) with extra user data
 * (phone, address) when available.
 */
function buildUserFields(
    authUser: { id: number; email: string } | null,
    extraUserData?: UserTrackingData,
): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const userData: Record<string, unknown> = {};

    // Auth user provides external_id and base email
    if (authUser) {
        result.external_id = String(authUser.id);
        userData.email_address = authUser.email;
    }

    // Extra user data supplements/overrides auth data
    if (extraUserData) {
        if (extraUserData.email) userData.email_address = extraUserData.email;
        if (extraUserData.phone) userData.phone_number = extraUserData.phone;

        const hasAddress = extraUserData.firstName || extraUserData.lastName ||
            extraUserData.city || extraUserData.postalCode || extraUserData.country;
        if (hasAddress) {
            const address: Record<string, string> = {};
            if (extraUserData.firstName) address.first_name = extraUserData.firstName;
            if (extraUserData.lastName) address.last_name = extraUserData.lastName;
            if (extraUserData.city) address.city = extraUserData.city;
            if (extraUserData.postalCode) address.postal_code = extraUserData.postalCode;
            if (extraUserData.country) address.country = extraUserData.country;
            userData.address = address;
        }
    }

    if (Object.keys(userData).length > 0) {
        result.user_data = userData;
    }

    return result;
}

export function useGTM() {
    // Get auth user from Inertia shared props for automatic user tracking
    const { auth } = usePage<SharedData>().props;
    const authUser = auth?.user ? { id: auth.user.id, email: auth.user.email } : null;

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
                event_id: generateEventId(),
                first_party_collection: true,
                content_ids: [sku],
                content_name: name,
                content_type: 'product',
                value: price,
                currency,
                items: [{ item_id: sku, item_name: name, price, quantity: 1 }],
                ...getFacebookParams(),
                ...buildUserFields(authUser),
            });
        },

        // Facebook CAPI: AddToCart
        addToCart: (_productId: number, sku: string, name: string, price: number, quantity: number, currency = 'EUR') => {
            push({
                event: 'AddToCart',
                event_id: generateEventId(),
                first_party_collection: true,
                content_ids: [sku],
                content_name: name,
                content_type: 'product',
                value: price * quantity,
                currency,
                quantity,
                items: [{ item_id: sku, item_name: name, price, quantity }],
                ...getFacebookParams(),
                ...buildUserFields(authUser),
            });
        },

        // Facebook CAPI: InitiateCheckout
        initiateCheckout: (
            skus: string[],
            names: string[],
            value: number,
            numItems: number,
            currency = 'EUR',
            userData?: UserTrackingData,
        ) => {
            push({
                event: 'InitiateCheckout',
                event_id: generateEventId(),
                first_party_collection: true,
                content_ids: skus,
                content_name: names.join(', '),
                content_type: 'product',
                value,
                currency,
                num_items: numItems,
                items: skus.map((sku, i) => ({
                    item_id: sku,
                    item_name: names[i] || '',
                    quantity: 1,
                })),
                ...getFacebookParams(),
                ...buildUserFields(authUser, userData),
            });
        },

        // Facebook CAPI: AddPaymentInfo
        addPaymentInfo: (
            skus: string[],
            value: number,
            currency = 'EUR',
            userData?: UserTrackingData,
        ) => {
            push({
                event: 'AddPaymentInfo',
                event_id: generateEventId(),
                first_party_collection: true,
                content_ids: skus,
                content_type: 'product',
                value,
                currency,
                items: skus.map(sku => ({
                    item_id: sku,
                    quantity: 1,
                })),
                ...getFacebookParams(),
                ...buildUserFields(authUser, userData),
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
            userData?: UserTrackingData,
        ) => {
            push({
                event: 'Purchase',
                event_id: generateEventId(),
                first_party_collection: true,
                order_id: orderId,
                content_ids: skus,
                content_name: names.join(', '),
                content_type: 'product',
                value,
                currency,
                num_items: numItems,
                items: skus.map((sku, i) => ({
                    item_id: sku,
                    item_name: names[i] || '',
                    quantity: 1,
                })),
                ...getFacebookParams(),
                ...buildUserFields(authUser, userData),
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
export function pushToDataLayer(
    data: Record<string, unknown>,
    authUser?: { id: number; email: string } | null,
) {
    if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            ...data,
            event_id: generateEventId(),
            first_party_collection: true,
            fbp: getFbp(),
            fbc: getFbc(),
            user_agent: getUserAgent(),
            event_source_url: window.location.href,
            ...buildUserFields(authUser ?? null),
        });
    }
}
