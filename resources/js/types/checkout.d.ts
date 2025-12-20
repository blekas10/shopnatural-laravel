import type { CartItem } from './index';
import type { VenipakPickupPoint } from '@/components/venipak-pickup-selector';

export interface ShippingAddress {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface ContactInformation {
    email: string;
    phone: string;
}

export interface ShippingMethod {
    id: string;
    name: string;
    description: string;
    price: number;
    estimatedDays: string;
}

export interface PaymentMethod {
    id: string;
    name: string;
    description: string;
}

export interface CardDetails {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
}

export interface PromoCode {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    discountAmount: number;
    formattedValue: string;
}

export interface OrderSummaryData {
    items: CartItem[];
    // Price breakdown (all prices include VAT)
    originalSubtotal: number; // Sum of original prices before product discount
    productDiscount: number; // Product discount amount
    subtotal: number; // Price after product discount (originalSubtotal - productDiscount)
    subtotalExclVat: number; // Subtotal without VAT
    vatAmount: number; // VAT amount (21%)
    shipping: number; // Shipping cost (checkout only)
    promoCodeDiscount: number; // Promo code discount (checkout only)
    total: number; // Grand total
    // Applied promo code info
    promoCode?: PromoCode;
}

export interface CheckoutFormData {
    contact: ContactInformation;
    shippingAddress: ShippingAddress;
    billingAddress?: ShippingAddress;
    billingSameAsShipping: boolean;
    shippingMethod: string;
    venipakPickupPoint?: VenipakPickupPoint;
    paymentMethod: string;
    cardDetails?: CardDetails;
    promoCode?: string;
    agreeToTerms: boolean;
    items: Array<{
        productId: number;
        variantId: number | null;
        quantity: number;
        price: number;
        originalPrice?: number; // Original price before product discount
    }>;
    // Price breakdown
    originalSubtotal: number;
    productDiscount: number;
    subtotal: number;
    subtotalExclVat: number;
    vatAmount: number;
    shipping: number;
    promoCodeDiscount: number;
    total: number;
}

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'completed'
    | 'cancelled';

export interface OrderTimeline {
    status: OrderStatus;
    timestamp: string;
    description: string;
}

export interface Order {
    id: number;
    orderNumber: string;
    status: OrderStatus;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    items: CartItem[];
    // Price breakdown
    originalSubtotal: number;
    productDiscount: number;
    subtotal: number;
    subtotalExclVat: number;
    vatAmount: number;
    shipping: number;
    promoCode?: {
        code: string;
        value: string;
    };
    promoCodeDiscount: number;
    total: number;
    // Addresses
    contact: ContactInformation;
    shippingAddress: ShippingAddress;
    billingAddress?: ShippingAddress;
    shippingMethod: ShippingMethod;
    paymentMethod: PaymentMethod;
    trackingNumber?: string;
    // Venipak tracking
    venipakPackNo?: string;
    venipakTrackingUrl?: string;
    venipakShipmentCreatedAt?: string;
    estimatedDelivery?: string;
    timeline: OrderTimeline[];
    createdAt: string;
    updatedAt: string;
}

export interface CheckoutPageProps {
    paymentMethods: PaymentMethod[];
    cartItems?: CartItem[];
    originalSubtotal?: number;
    productDiscount?: number;
    subtotal?: number;
    errors?: Record<string, string>;
}

export interface OrderConfirmationProps {
    order: Order;
}

export interface OrderDetailsProps {
    order: Order;
}

export interface CartPageProps {
    cartItems: CartItem[];
    recommendedProducts?: Array<{
        id: number;
        name: string;
        slug: string;
        price: number;
        image: string;
    }>;
}
