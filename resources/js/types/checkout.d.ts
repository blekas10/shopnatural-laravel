import type { CartItem } from './index';

export interface ShippingAddress {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
}

export interface ContactInformation {
    email: string;
    phone?: string;
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
    discount: number;
    type: 'percentage' | 'fixed';
}

export interface OrderSummaryData {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    items: CartItem[];
}

export interface CheckoutFormData {
    contact: ContactInformation;
    shippingAddress: ShippingAddress;
    billingAddress?: ShippingAddress;
    billingSameAsShipping: boolean;
    shippingMethod: string;
    paymentMethod: string;
    cardDetails?: CardDetails;
    promoCode?: string;
    agreeToTerms: boolean;
    items: Array<{
        productId: number;
        variantId: number | null;
        quantity: number;
        price: number;
    }>;
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
}

export type OrderStatus =
    | 'pending'
    | 'processing'
    | 'confirmed'
    | 'shipped'
    | 'delivered'
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
    items: CartItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    contact: ContactInformation;
    shippingAddress: ShippingAddress;
    billingAddress?: ShippingAddress;
    shippingMethod: ShippingMethod;
    paymentMethod: PaymentMethod;
    trackingNumber?: string;
    estimatedDelivery?: string;
    timeline: OrderTimeline[];
    createdAt: string;
    updatedAt: string;
}

export interface CheckoutPageProps {
    shippingMethods: ShippingMethod[];
    paymentMethods: PaymentMethod[];
    cartItems: CartItem[];
    subtotal: number;
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
