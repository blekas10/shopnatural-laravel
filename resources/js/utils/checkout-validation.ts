import type { ContactInformation, ShippingAddress, CardDetails } from '@/types/checkout';

interface ValidationErrors {
    [key: string]: string | undefined;
}

interface ContactValidationErrors {
    fullName?: string;
    email?: string;
    phone?: string;
}

interface AddressValidationErrors {
    addressLine1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}

interface CardValidationErrors {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardholderName?: string;
}

// Translation helper type
type TranslationFunction = (key: string, fallback: string, params?: Record<string, string>) => string;

export class CheckoutValidator {
    private t: TranslationFunction;

    constructor(translationFunction: TranslationFunction) {
        this.t = translationFunction;
    }

    // Email validation - requires proper email format with TLD
    private isValidEmail(email: string): boolean {
        // Requires @ symbol and at least one dot after @
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone validation (basic)
    private isValidPhone(phone: string): boolean {
        // Remove spaces, dashes, parentheses
        const cleanPhone = phone.replace(/[\s\-()]/g, '');
        // Should have at least 6 digits
        return cleanPhone.length >= 6;
    }

    // Validate contact information
    validateContact(contact: ContactInformation & { fullName: string }): ContactValidationErrors {
        const errors: ContactValidationErrors = {};

        // Full Name validation
        if (!contact.fullName || !contact.fullName.trim()) {
            errors.fullName = this.t('checkout.full_name', 'Full Name') + ' ' + this.t('validation.required', 'is required');
        } else if (contact.fullName.trim().length < 2) {
            errors.fullName = this.t('validation.min_length', 'Must be at least {min} characters', { min: '2' });
        }

        // Email validation
        if (!contact.email || !contact.email.trim()) {
            errors.email = this.t('checkout.email', 'Email') + ' ' + this.t('validation.required', 'is required');
        } else if (!this.isValidEmail(contact.email)) {
            errors.email = this.t('validation.invalid_email', 'Please enter a valid email address');
        }

        // Phone validation
        if (!contact.phone || !contact.phone.trim()) {
            errors.phone = this.t('checkout.phone', 'Phone') + ' ' + this.t('validation.required', 'is required');
        } else if (!this.isValidPhone(contact.phone)) {
            errors.phone = this.t('validation.invalid_phone', 'Please enter a valid phone number');
        }

        return errors;
    }

    // Validate shipping/billing address
    validateAddress(address: Partial<ShippingAddress>): AddressValidationErrors {
        const errors: AddressValidationErrors = {};

        // Country validation
        if (!address.country || !address.country.trim()) {
            errors.country = this.t('checkout.country', 'Country') + ' ' + this.t('validation.required', 'is required');
        }

        // Address Line 1 validation
        if (!address.addressLine1 || !address.addressLine1.trim()) {
            errors.addressLine1 = this.t('checkout.address_line_1', 'Address') + ' ' + this.t('validation.required', 'is required');
        }

        // City validation
        if (!address.city || !address.city.trim()) {
            errors.city = this.t('checkout.city', 'City') + ' ' + this.t('validation.required', 'is required');
        }

        // State validation
        if (!address.state || !address.state.trim()) {
            errors.state = this.t('checkout.state', 'State/Province') + ' ' + this.t('validation.required', 'is required');
        }

        // Postal Code validation
        if (!address.postalCode || !address.postalCode.trim()) {
            errors.postalCode = this.t('checkout.postal_code', 'Postal Code') + ' ' + this.t('validation.required', 'is required');
        }

        return errors;
    }

    // Validate card details
    validateCard(card: CardDetails): CardValidationErrors {
        const errors: CardValidationErrors = {};

        // Card number validation
        if (!card.cardNumber || !card.cardNumber.trim()) {
            errors.cardNumber = this.t('checkout.card_number', 'Card Number') + ' ' + this.t('validation.required', 'is required');
        } else {
            const cleanCardNumber = card.cardNumber.replace(/\s/g, '');
            if (cleanCardNumber.length < 15) {
                errors.cardNumber = this.t('validation.invalid_card_number', 'Please enter a valid card number');
            }
        }

        // Expiry date validation
        if (!card.expiryDate || !card.expiryDate.trim()) {
            errors.expiryDate = this.t('checkout.expiry_date', 'Expiry Date') + ' ' + this.t('validation.required', 'is required');
        } else if (card.expiryDate.replace(/\D/g, '').length < 4) {
            errors.expiryDate = this.t('validation.invalid_expiry', 'Please enter a valid expiry date');
        }

        // CVV validation
        if (!card.cvv || !card.cvv.trim()) {
            errors.cvv = this.t('checkout.cvv', 'CVV') + ' ' + this.t('validation.required', 'is required');
        } else if (card.cvv.length < 3) {
            errors.cvv = this.t('validation.invalid_cvv', 'Please enter a valid CVV');
        }

        // Cardholder name validation
        if (!card.cardholderName || !card.cardholderName.trim()) {
            errors.cardholderName = this.t('checkout.cardholder_name', 'Cardholder Name') + ' ' + this.t('validation.required', 'is required');
        }

        return errors;
    }

    // Check if there are any errors
    hasErrors(errors: ContactValidationErrors | AddressValidationErrors | CardValidationErrors | ValidationErrors): boolean {
        return Object.values(errors).some(error => error !== undefined);
    }
}
