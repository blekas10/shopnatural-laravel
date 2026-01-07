import { Link, router, usePage } from '@inertiajs/react';
import SEO from '@/components/seo';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Lock, Check, ChevronRight } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import MainHeader from '@/components/main-header';
import Footer from '@/components/footer';
import { useCart } from '@/hooks/use-cart';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { OrderSummary } from '@/components/order-summary';
import { AddressForm } from '@/components/address-form';
import { PaymentForm } from '@/components/payment-form';
import { CountrySelector } from '@/components/country-selector';
import { VenipakPickupSelector, VenipakPickupPoint } from '@/components/venipak-pickup-selector';
import { VenipakLogo } from '@/components/payment-logos';
import { PhoneInputField, isValidPhoneNumber } from '@/components/ui/phone-input';
import type {
    CheckoutFormData,
    ShippingAddress,
    ContactInformation,
    CardDetails,
    CheckoutPageProps,
} from '@/types/checkout';
import type { SharedData } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CheckoutValidator } from '@/utils/checkout-validation';
import { getShippingMethods, calculateShippingCost, hasPickupPoints } from '@/utils/shipping-methods';

const CHECKOUT_DATA_KEY = 'shop-natural-checkout-data';

function SubmitButton() {
    const { pending } = useFormStatus();
    const { t } = useTranslation();

    return (
        <Button
            type="submit"
            disabled={pending}
            className="h-14 w-full rounded-lg bg-gold text-base font-bold uppercase tracking-wide text-white transition-all hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
            <Lock className="mr-2 size-5" />
            {pending
                ? t('checkout.processing', 'Processing...')
                : t('checkout.place_order', 'Place Order')}
        </Button>
    );
}

interface UserWithAddress {
    phone?: string;
    billing_address?: string;
    billing_city?: string;
    billing_state?: string;
    billing_postal_code?: string;
    billing_country?: string;
    shipping_address?: string;
    shipping_city?: string;
    shipping_state?: string;
    shipping_postal_code?: string;
    shipping_country?: string;
}

export default function Checkout({
    paymentMethods = [
        {
            id: 'card',
            name: 'Credit / Debit Card',
            description: 'Pay securely with your card',
        },
        {
            id: 'paypal',
            name: 'PayPal',
            description: 'Fast and secure PayPal checkout',
        },
    ],
}: CheckoutPageProps) {
    const { items, totalPrice } = useCart();
    const { t, route } = useTranslation();
    const { auth } = usePage<SharedData>().props;

    // Initialize validator
    const validator = useMemo(() => new CheckoutValidator(t), [t]);

    // Step Management
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    // Form State - ALL useState declarations BEFORE useEffects
    const [contact, setContact] = useState<ContactInformation & { fullName: string }>({
        email: '',
        phone: '',
        fullName: '',
    });

    const [shippingAddress, setShippingAddress] = useState<Omit<ShippingAddress, 'fullName'> & { fullName?: string }>({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
    });

    const [billingAddress, setBillingAddress] = useState<Omit<ShippingAddress, 'fullName'> & { fullName?: string }>({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
    });

    const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
    const [selectedShippingMethod, setSelectedShippingMethod] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
    const [selectedVenipakPoint, setSelectedVenipakPoint] = useState<VenipakPickupPoint | null>(null);
    const [cardDetails, setCardDetails] = useState<CardDetails>({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
    });
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    // Promo Code State
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [appliedPromoCode, setAppliedPromoCode] = useState<{
        code: string;
        type: 'percentage' | 'fixed';
        value: number;
        discountAmount: number;
    } | null>(null);
    const [promoCodeLoading, setPromoCodeLoading] = useState(false);
    const [promoCodeError, setPromoCodeError] = useState<string | null>(null);

    // Validation Errors
    const [contactErrors, setContactErrors] = useState<{
        fullName?: string;
        email?: string;
        phone?: string;
    }>({});

    const [shippingAddressErrors, setShippingAddressErrors] = useState<{
        country?: string;
        addressLine1?: string;
        city?: string;
        state?: string;
        postalCode?: string;
    }>({});

    const [billingAddressErrors, setBillingAddressErrors] = useState<{
        country?: string;
        addressLine1?: string;
        city?: string;
        state?: string;
        postalCode?: string;
    }>({});

    // Get shipping methods based on selected country and cart total
    // Free shipping for Lithuania when subtotal >= €50
    const shippingMethods = useMemo(() => {
        const country = shippingAddress.country;
        if (!country) {
            // Default to Lithuania if no country selected yet
            return getShippingMethods('LT', t, totalPrice);
        }
        return getShippingMethods(country, t, totalPrice);
    }, [shippingAddress.country, t, totalPrice]);

    // Autofill form with user data if authenticated
    useEffect(() => {
        if (auth?.user) {
            const user = auth.user as UserWithAddress;

            // eslint-disable-next-line react-hooks/set-state-in-effect -- Legitimate initialization from user data
            setContact({
                fullName: auth.user.name ?? '',
                email: auth.user.email ?? '',
                phone: user.phone ?? '',
            });

            // Check if user has different billing and shipping addresses
            const hasBillingAddress = user.billing_address && user.billing_city;
            const hasShippingAddress = user.shipping_address && user.shipping_city;
            const addressesAreDifferent = hasBillingAddress && hasShippingAddress && (
                user.billing_address !== user.shipping_address ||
                user.billing_city !== user.shipping_city ||
                user.billing_postal_code !== user.shipping_postal_code
            );

            if (addressesAreDifferent) {
                // Show billing address in main form
                setShippingAddress({
                    fullName: auth.user.name ?? '',
                    addressLine1: user.billing_address ?? '',
                    addressLine2: '',
                    city: user.billing_city ?? '',
                    state: user.billing_state ?? '',
                    postalCode: user.billing_postal_code ?? '',
                    country: user.billing_country ?? 'LT',
                });

                // Uncheck "same as shipping" and show shipping address separately
                setBillingSameAsShipping(false);
                setBillingAddress({
                    fullName: auth.user.name ?? '',
                    addressLine1: user.shipping_address ?? '',
                    addressLine2: '',
                    city: user.shipping_city ?? '',
                    state: user.shipping_state ?? '',
                    postalCode: user.shipping_postal_code ?? '',
                    country: user.shipping_country ?? 'LT',
                });
            } else if (hasBillingAddress) {
                // Only billing address exists, use it
                setShippingAddress({
                    fullName: auth.user.name ?? '',
                    addressLine1: user.billing_address ?? '',
                    addressLine2: '',
                    city: user.billing_city ?? '',
                    state: user.billing_state ?? '',
                    postalCode: user.billing_postal_code ?? '',
                    country: user.billing_country ?? 'LT',
                });
            } else if (hasShippingAddress) {
                // Only shipping address exists, use it
                setShippingAddress({
                    fullName: auth.user.name ?? '',
                    addressLine1: user.shipping_address ?? '',
                    addressLine2: '',
                    city: user.shipping_city ?? '',
                    state: user.shipping_state ?? '',
                    postalCode: user.shipping_postal_code ?? '',
                    country: user.shipping_country ?? 'LT',
                });
            }
        }
    }, [auth]);

    // Load saved checkout data if user returns from canceled payment
    useEffect(() => {
        try {
            const savedData = localStorage.getItem(CHECKOUT_DATA_KEY);
            if (savedData) {
                const parsed = JSON.parse(savedData);

                // Only restore if auth user matches or is guest
                const canRestore = !auth?.user || !parsed.userId || parsed.userId === auth.user.id;

                // Only restore if data is less than 30 minutes old
                const isRecent = parsed.timestamp && (Date.now() - parsed.timestamp) < 30 * 60 * 1000;

                if (canRestore && isRecent) {
                    console.log('Restoring saved checkout data');

                    // Restore form data
                    // eslint-disable-next-line react-hooks/set-state-in-effect -- Legitimate restoration from localStorage
                    setContact(parsed.contact);
                    setShippingAddress(parsed.shippingAddress);
                    setBillingAddress(parsed.billingAddress);
                    setBillingSameAsShipping(parsed.billingSameAsShipping);
                    setSelectedShippingMethod(parsed.selectedShippingMethod);
                    setSelectedPaymentMethod(parsed.selectedPaymentMethod);
                    if (parsed.selectedVenipakPoint) {
                        setSelectedVenipakPoint(parsed.selectedVenipakPoint);
                    }
                    setAgreeToTerms(parsed.agreeToTerms || false);

                    // Mark all previous steps as completed and go to payment
                    setCompletedSteps([1, 2, 3]);
                    setCurrentStep(4);
                }

                // Always clear saved data after processing
                localStorage.removeItem(CHECKOUT_DATA_KEY);
            }
        } catch (error) {
            console.error('Failed to restore checkout data:', error);
        }
    }, [auth, t]);

    // Redirect to cart if empty
    if (items.length === 0) {
        router.visit(route('cart'));
        return null;
    }

    // VAT rate (21%)
    const VAT_RATE = 0.21;

    // Calculate original subtotal (sum of original prices before product discount)
    // All prices include VAT
    const originalSubtotal = items.reduce((sum, item) => {
        const price = item.variant?.price || item.product.price;
        const compareAtPrice = item.variant?.compareAtPrice || item.product.compareAtPrice;
        const originalPrice = compareAtPrice || price;
        return sum + (originalPrice * item.quantity);
    }, 0);

    // Subtotal = sum of current prices (after product discount, with VAT)
    const subtotal = totalPrice;

    // Product discount = difference between original and current prices
    const productDiscount = originalSubtotal - subtotal;

    // Calculate VAT breakdown from subtotal (prices include VAT)
    const subtotalExclVat = subtotal / (1 + VAT_RATE);
    const vatAmount = subtotal - subtotalExclVat;

    // Shipping cost
    const shipping = calculateShippingCost(
        selectedShippingMethod,
        shippingMethods
    );

    // Promo code discount - calculated from applied promo code
    const promoCodeDiscount = appliedPromoCode?.discountAmount ?? 0;

    // Total = subtotal + shipping - promo code discount
    const total = subtotal + shipping - promoCodeDiscount;

    // Function to validate and apply promo code
    const handleApplyPromoCode = async () => {
        if (!promoCodeInput.trim()) {
            setPromoCodeError(t('promo_code.enter_code', 'Please enter a promo code'));
            return;
        }

        setPromoCodeLoading(true);
        setPromoCodeError(null);

        try {
            const response = await fetch('/api/promo-code/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    code: promoCodeInput.trim(),
                    cart_total: subtotal,
                    email: contact.email || undefined,
                }),
            });

            const data = await response.json();

            if (data.valid) {
                setAppliedPromoCode({
                    code: data.code,
                    type: data.type,
                    value: data.value,
                    discountAmount: data.discount_amount,
                });
                setPromoCodeInput('');
                toast.success(t('promo_code.applied', 'Promo code applied!'));
            } else {
                setPromoCodeError(data.error || t('promo_code.invalid', 'Invalid promo code'));
            }
        } catch {
            setPromoCodeError(t('promo_code.error', 'Failed to validate promo code'));
        } finally {
            setPromoCodeLoading(false);
        }
    };

    // Function to remove applied promo code
    const handleRemovePromoCode = () => {
        setAppliedPromoCode(null);
        setPromoCodeError(null);
    };

    const orderSummaryData = {
        items,
        originalSubtotal,
        productDiscount,
        subtotal,
        subtotalExclVat,
        vatAmount,
        shipping,
        promoCodeDiscount,
        total,
        promoCode: appliedPromoCode ? {
            code: appliedPromoCode.code,
            type: appliedPromoCode.type,
            value: appliedPromoCode.value,
            discountAmount: appliedPromoCode.discountAmount,
            formattedValue: appliedPromoCode.type === 'percentage'
                ? `${appliedPromoCode.value}%`
                : `€${appliedPromoCode.value.toFixed(2)}`,
        } : undefined,
    };

    // Validation functions
    const validateContactInfo = () => {
        const errors = validator.validateContact(contact);
        setContactErrors(errors);
        return !validator.hasErrors(errors);
    };

    const validateShippingAddress = () => {
        const errors = validator.validateAddress(shippingAddress);
        setShippingAddressErrors(errors);
        return !validator.hasErrors(errors);
    };

    const validateBillingAddress = () => {
        if (billingSameAsShipping) return true;

        const errors = validator.validateAddress(billingAddress);
        setBillingAddressErrors(errors);
        return !validator.hasErrors(errors);
    };

    const validatePayment = () => {
        // Cash on delivery doesn't need validation
        if (selectedPaymentMethod === 'cash') return true;

        // Card payment validation
        if (selectedPaymentMethod !== 'card') return true;

        const cardFields = [
            { value: cardDetails.cardNumber, name: t('checkout.card_number', 'Card Number'), minLength: 15 },
            { value: cardDetails.expiryDate, name: t('checkout.expiry_date', 'Expiry Date'), minLength: 5 },
            { value: cardDetails.cvv, name: t('checkout.cvv', 'CVV'), minLength: 3 },
            { value: cardDetails.cardholderName, name: t('checkout.cardholder_name', 'Cardholder Name') },
        ];

        const invalidCard = cardFields.find(field => !field.value?.trim() || (field.minLength && field.value.replace(/\D/g, '').length < field.minLength));
        if (invalidCard) {
            toast.error(t('checkout.invalid_field', 'Invalid {field}', { field: invalidCard.name }));
            return false;
        }
        return true;
    };

    // Step handlers
    const handleContinue = (step: number) => {
        let isValid = false;

        switch (step) {
            case 1:
                isValid = validateContactInfo();
                break;
            case 2:
                isValid = validateShippingAddress() && validateBillingAddress();
                break;
            case 3:
                // Validate shipping method is selected
                if (!selectedShippingMethod) {
                    toast.error(t('checkout.please_select_shipping', 'Please select a delivery method'));
                    isValid = false;
                    break;
                }

                // Validate Venipak pickup point if Baltic country + Venipak Pickup selected
                if (selectedShippingMethod === 'venipak-pickup' && hasPickupPoints(shippingAddress.country)) {
                    if (!selectedVenipakPoint) {
                        toast.error(t('venipak.please_select', 'Please select a Venipak pickup point'));
                        isValid = false;
                        break;
                    }
                }
                isValid = true;
                break;
        }

        if (isValid) {
            setCompletedSteps(prev => [...new Set([...prev, step])]);
            setCurrentStep(step + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleEdit = (step: number) => {
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate payment
        if (!validatePayment()) {
            return;
        }

        if (!agreeToTerms) {
            toast.error(
                t(
                    'checkout.please_accept_terms',
                    'Please accept the terms and conditions',
                ),
            );
            return;
        }

        // Save form data to localStorage before submitting (in case payment is canceled)
        try {
            const dataToSave = {
                contact,
                shippingAddress,
                billingAddress,
                billingSameAsShipping,
                selectedShippingMethod,
                selectedPaymentMethod,
                selectedVenipakPoint,
                agreeToTerms,
                userId: auth?.user?.id || null,
                timestamp: Date.now(),
            };
            localStorage.setItem(CHECKOUT_DATA_KEY, JSON.stringify(dataToSave));
            console.log('Checkout data saved to localStorage');
        } catch (error) {
            console.error('Failed to save checkout data:', error);
        }

        const checkoutData: CheckoutFormData = {
            contact,
            shippingAddress,
            billingAddress: billingSameAsShipping
                ? shippingAddress
                : billingAddress,
            billingSameAsShipping,
            shippingMethod: selectedShippingMethod,
            venipakPickupPoint: selectedVenipakPoint || undefined,
            paymentMethod: selectedPaymentMethod,
            cardDetails:
                selectedPaymentMethod === 'card' ? cardDetails : undefined,
            agreeToTerms,
            items: items.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.variant?.price || item.product.price,
                originalPrice: item.variant?.compareAtPrice || item.product.compareAtPrice || undefined,
            })),
            originalSubtotal,
            productDiscount,
            subtotal,
            subtotalExclVat,
            vatAmount,
            shipping,
            promoCode: appliedPromoCode?.code || undefined,
            promoCodeDiscount,
            total,
        };

        router.post(route('checkout.store'), checkoutData, {
            preserveScroll: true,
            onError: (errors) => {
                // If checkout fails, restore the cart
                console.log('Checkout failed - cart was already cleared but form failed');
                const firstError = Object.values(errors)[0];
                if (firstError) {
                    toast.error(firstError as string);
                }
            },
        });
    };

    const updateShippingAddress = (
        field: keyof ShippingAddress,
        value: string,
    ) => {
        setShippingAddress((prev) => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (shippingAddressErrors[field as keyof typeof shippingAddressErrors]) {
            setShippingAddressErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const updateBillingAddress = (
        field: keyof ShippingAddress,
        value: string,
    ) => {
        setBillingAddress((prev) => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (billingAddressErrors[field as keyof typeof billingAddressErrors]) {
            setBillingAddressErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const updateCardDetails = (field: keyof CardDetails, value: string) => {
        setCardDetails((prev) => ({ ...prev, [field]: value }));
    };

    // Render step indicator
    const renderStepIndicator = (step: number, title: string, isCompleted: boolean, isCurrent: boolean) => (
        <div className="flex items-center gap-3">
            <div
                className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full border-2 font-bold transition-all',
                    isCompleted
                        ? 'border-gold bg-gold text-white'
                        : isCurrent
                        ? 'border-gold bg-background text-gold'
                        : 'border-border bg-background text-muted-foreground'
                )}
            >
                {isCompleted ? <Check className="size-4" /> : step}
            </div>
            <span
                className={cn(
                    'text-sm font-medium',
                    isCurrent || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                )}
            >
                {title}
            </span>
        </div>
    );

    return (
        <>
            <SEO
                title={t('checkout.title', 'Checkout')}
                noindex={true}
                nofollow={true}
            />

            <div className="min-h-screen bg-background">
                <MainHeader />

                <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route('cart')}
                            className="group mb-4 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-gold"
                        >
                            <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-1" />
                            {t('checkout.back_to_cart', 'Back to Cart')}
                        </Link>
                        <h1 className="text-2xl font-bold uppercase tracking-wide md:text-3xl lg:text-4xl">
                            {t('checkout.title', 'Checkout')}
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Checkout Form */}
                            <div className="space-y-4 lg:col-span-2">
                                {/* Progress Indicator */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="hidden rounded-2xl border-2 border-border bg-background p-4 md:block"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        {renderStepIndicator(1, t('checkout.contact', 'Contact'), completedSteps.includes(1), currentStep === 1)}
                                        <div className="h-px flex-1 bg-border" />
                                        {renderStepIndicator(2, t('checkout.address', 'Address'), completedSteps.includes(2), currentStep === 2)}
                                        <div className="h-px flex-1 bg-border" />
                                        {renderStepIndicator(3, t('checkout.delivery', 'Delivery'), completedSteps.includes(3), currentStep === 3)}
                                        <div className="h-px flex-1 bg-border" />
                                        {renderStepIndicator(4, t('checkout.payment', 'Payment'), completedSteps.includes(4), currentStep === 4)}
                                    </div>
                                </motion.div>

                                <AnimatePresence mode="wait">
                                    {/* Step 1: Contact Information */}
                                    {currentStep === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="rounded-2xl border-2 border-border bg-background p-6"
                                        >
                                            <h2 className="mb-6 text-xl font-bold uppercase tracking-wide">
                                                1. {t('checkout.contact_information', 'Contact Information')}
                                            </h2>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="fullName" className="text-sm font-bold uppercase tracking-wide">
                                                        {t('checkout.full_name', 'Full Name')} *
                                                    </Label>
                                                    <Input
                                                        id="fullName"
                                                        type="text"
                                                        value={contact.fullName}
                                                        onChange={(e) => {
                                                            setContact((prev) => ({
                                                                ...prev,
                                                                fullName: e.target.value,
                                                            }));
                                                            // Clear error when user types
                                                            if (contactErrors.fullName) {
                                                                setContactErrors((prev) => ({ ...prev, fullName: undefined }));
                                                            }
                                                        }}
                                                        placeholder="Jonas Jonaitis"
                                                        className="mt-1.5"
                                                        error={contactErrors.fullName}
                                                        autoFocus
                                                    />
                                                    {contactErrors.fullName && (
                                                        <p className="mt-1 text-sm text-red-600">{contactErrors.fullName}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wide">
                                                        {t('checkout.email', 'Email')} *
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={contact.email}
                                                        onChange={(e) => {
                                                            setContact((prev) => ({
                                                                ...prev,
                                                                email: e.target.value,
                                                            }));
                                                            // Clear error when user types
                                                            if (contactErrors.email) {
                                                                setContactErrors((prev) => ({ ...prev, email: undefined }));
                                                            }
                                                        }}
                                                        placeholder="your@email.com"
                                                        className="mt-1.5"
                                                        error={contactErrors.email}
                                                    />
                                                    {contactErrors.email && (
                                                        <p className="mt-1 text-sm text-red-600">{contactErrors.email}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <Label htmlFor="phone" className="text-sm font-bold uppercase tracking-wide">
                                                        {t('checkout.phone', 'Phone')} *
                                                    </Label>
                                                    <div className="mt-1.5">
                                                        <PhoneInputField
                                                            value={contact.phone || ''}
                                                            onChange={(value) => {
                                                                setContact((prev) => ({
                                                                    ...prev,
                                                                    phone: value || '',
                                                                }));
                                                                // Clear error when user types
                                                                if (contactErrors.phone) {
                                                                    setContactErrors((prev) => ({ ...prev, phone: undefined }));
                                                                }
                                                            }}
                                                            defaultCountry="LT"
                                                            placeholder="+370 612 34567"
                                                            error={contactErrors.phone}
                                                        />
                                                        {contactErrors.phone && (
                                                            <p className="mt-1 text-sm text-red-600">{contactErrors.phone}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => handleContinue(1)}
                                                className="mt-6 w-full bg-gold hover:bg-gold/90"
                                            >
                                                {t('checkout.continue', 'Continue')}
                                                <ChevronRight className="ml-2 size-4" />
                                            </Button>
                                        </motion.div>
                                    )}

                                    {/* Step 2: Shipping & Billing Address */}
                                    {currentStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="rounded-2xl border-2 border-border bg-background p-6"
                                        >
                                            <h2 className="mb-6 text-xl font-bold uppercase tracking-wide">
                                                2. {t('checkout.shipping_address', 'Shipping Address')}
                                            </h2>

                                            {/* Country Selector */}
                                            <div className="mb-6">
                                                <CountrySelector
                                                    value={shippingAddress.country}
                                                    onChange={(value) => updateShippingAddress('country', value)}
                                                    label={t('checkout.country', 'Country')}
                                                    placeholder={t('checkout.select_country', 'Select country...')}
                                                />
                                                {shippingAddressErrors.country && (
                                                    <p className="mt-1 text-sm text-red-600">{shippingAddressErrors.country}</p>
                                                )}
                                            </div>

                                            {/* Address Form - only show after country selected */}
                                            {shippingAddress.country && (
                                                <AddressForm
                                                    values={shippingAddress}
                                                    onChange={updateShippingAddress}
                                                    errors={shippingAddressErrors}
                                                    prefix="shipping"
                                                />
                                            )}

                                            {/* Billing Address Checkbox */}
                                            <div className="mt-6 mb-6 flex items-center space-x-2">
                                                <Checkbox
                                                    id="billingSameAsShipping"
                                                    checked={billingSameAsShipping}
                                                    onCheckedChange={(checked) =>
                                                        setBillingSameAsShipping(
                                                            checked as boolean,
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor="billingSameAsShipping"
                                                    className="cursor-pointer text-sm font-medium"
                                                >
                                                    {t('checkout.billing_same_as_shipping', 'Billing address same as shipping')}
                                                </Label>
                                            </div>

                                            {/* Billing Address Form (conditional) */}
                                            {!billingSameAsShipping && (
                                                <>
                                                    <h3 className="mb-4 text-lg font-bold uppercase tracking-wide">
                                                        {t('checkout.billing_address', 'Billing Address')}
                                                    </h3>

                                                    {/* Billing Country Selector */}
                                                    <div className="mb-6">
                                                        <CountrySelector
                                                            value={billingAddress.country}
                                                            onChange={(value) => updateBillingAddress('country', value)}
                                                            label={t('checkout.country', 'Country')}
                                                            placeholder={t('checkout.select_country', 'Select country...')}
                                                        />
                                                        {billingAddressErrors.country && (
                                                            <p className="mt-1 text-sm text-red-600">{billingAddressErrors.country}</p>
                                                        )}
                                                    </div>

                                                    {/* Billing Address Form - only show after country selected */}
                                                    {billingAddress.country && (
                                                        <AddressForm
                                                            values={billingAddress}
                                                            onChange={updateBillingAddress}
                                                            errors={billingAddressErrors}
                                                            prefix="billing"
                                                        />
                                                    )}
                                                </>
                                            )}

                                            <div className="mt-6 flex items-center justify-between gap-3">
                                                <Button
                                                    type="button"
                                                    onClick={() => handleEdit(1)}
                                                    variant="outline"
                                                    className="border-2"
                                                >
                                                    <ArrowLeft className="mr-2 size-4" />
                                                    {t('checkout.back', 'Back')}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => handleContinue(2)}
                                                    className="bg-gold hover:bg-gold/90"
                                                >
                                                    {t('checkout.continue', 'Continue')}
                                                    <ChevronRight className="ml-2 size-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 3: Shipping Method */}
                                    {currentStep === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="rounded-2xl border-2 border-border bg-background p-6"
                                        >
                                            <h2 className="mb-6 text-xl font-bold uppercase tracking-wide">
                                                3. {t('checkout.delivery_method', 'Delivery Method')}
                                            </h2>
                                            <RadioGroup
                                                value={selectedShippingMethod}
                                                onValueChange={setSelectedShippingMethod}
                                            >
                                                <div className="space-y-3">
                                                    {shippingMethods.map((method) => {
                                                        const isSelected =
                                                            selectedShippingMethod ===
                                                            method.id;

                                                        return (
                                                            <label
                                                                key={method.id}
                                                                htmlFor={`shipping-${method.id}`}
                                                                className={cn(
                                                                    'flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-all',
                                                                    isSelected
                                                                        ? 'border-gold bg-gold/5'
                                                                        : 'border-border bg-background hover:border-gold/40',
                                                                )}
                                                            >
                                                                <RadioGroupItem
                                                                    value={method.id}
                                                                    id={`shipping-${method.id}`}
                                                                    className="mt-0.5"
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex items-start gap-3">
                                                                            {/* Venipak logo for venipak methods */}
                                                                            {method.id.startsWith('venipak') && (
                                                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white border border-border">
                                                                                    <VenipakLogo className="h-4" />
                                                                                </div>
                                                                            )}
                                                                            <div>
                                                                                <p className="font-bold uppercase tracking-wide text-foreground">
                                                                                    {method.name}
                                                                                </p>
                                                                                <p className="mt-1 text-sm text-muted-foreground">
                                                                                    {method.description}
                                                                                </p>
                                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                                    {method.estimatedDays}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <p className="font-bold text-gold">
                                                                            €{method.price.toFixed(2)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </RadioGroup>

                                            {/* Venipak Pickup Point Selector - Show when Venipak Pickup + Baltic countries */}
                                            {selectedShippingMethod === 'venipak-pickup' && hasPickupPoints(shippingAddress.country) && (
                                                <div className="mt-6">
                                                    <VenipakPickupSelector
                                                        country={shippingAddress.country}
                                                        selectedPickupPoint={selectedVenipakPoint}
                                                        onSelect={setSelectedVenipakPoint}
                                                    />
                                                </div>
                                            )}

                                            <div className="mt-6 flex items-center justify-between gap-3">
                                                <Button
                                                    type="button"
                                                    onClick={() => handleEdit(2)}
                                                    variant="outline"
                                                    className="border-2"
                                                >
                                                    <ArrowLeft className="mr-2 size-4" />
                                                    {t('checkout.back', 'Back')}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => handleContinue(3)}
                                                    className="bg-gold hover:bg-gold/90"
                                                >
                                                    {t('checkout.continue', 'Continue')}
                                                    <ChevronRight className="ml-2 size-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 4: Payment Method */}
                                    {currentStep === 4 && (
                                        <motion.div
                                            key="step4"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="rounded-2xl border-2 border-border bg-background p-6"
                                        >
                                            <h2 className="mb-6 text-xl font-bold uppercase tracking-wide">
                                                4. {t('checkout.payment_method', 'Payment Method')}
                                            </h2>

                                            {/* Promo Code Section */}
                                            <div className="mb-6 rounded-lg border-2 border-border bg-muted/30 p-4">
                                                <Label className="mb-2 block text-sm font-medium">
                                                    {t('checkout.promo_code', 'Promo Code')}
                                                </Label>
                                                {appliedPromoCode ? (
                                                    <div className="flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-900/20 p-3 border border-green-200 dark:border-green-800">
                                                        <div className="flex items-center gap-2">
                                                            <Check className="size-5 text-green-600" />
                                                            <span className="font-mono font-medium text-green-700 dark:text-green-400">
                                                                {appliedPromoCode.code}
                                                            </span>
                                                            <span className="text-sm text-green-600 dark:text-green-500">
                                                                ({appliedPromoCode.type === 'percentage'
                                                                    ? `-${appliedPromoCode.value}%`
                                                                    : `-€${appliedPromoCode.value.toFixed(2)}`})
                                                            </span>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={handleRemovePromoCode}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            {t('checkout.remove', 'Remove')}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="text"
                                                            value={promoCodeInput}
                                                            onChange={(e) => {
                                                                setPromoCodeInput(e.target.value.toUpperCase());
                                                                setPromoCodeError(null);
                                                            }}
                                                            placeholder={t('checkout.enter_promo_code', 'Enter promo code')}
                                                            className={cn(
                                                                "flex-1 font-mono uppercase",
                                                                promoCodeError && "border-red-500"
                                                            )}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    handleApplyPromoCode();
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={handleApplyPromoCode}
                                                            disabled={promoCodeLoading || !promoCodeInput.trim()}
                                                            variant="outline"
                                                            className="border-2 border-gold text-gold hover:bg-gold hover:text-white"
                                                        >
                                                            {promoCodeLoading
                                                                ? t('checkout.applying', 'Applying...')
                                                                : t('checkout.apply', 'Apply')}
                                                        </Button>
                                                    </div>
                                                )}
                                                {promoCodeError && (
                                                    <p className="mt-2 text-sm text-red-500">{promoCodeError}</p>
                                                )}
                                            </div>

                                            <PaymentForm
                                                selectedMethod={selectedPaymentMethod}
                                                onMethodChange={setSelectedPaymentMethod}
                                                cardDetails={cardDetails}
                                                onCardDetailsChange={updateCardDetails}
                                                availableMethods={paymentMethods}
                                            />

                                            {/* Terms and Conditions */}
                                            <div className={cn(
                                                "mt-6 flex items-start space-x-3 rounded-lg border-2 p-4 transition-colors",
                                                !agreeToTerms ? "border-border bg-background" : "border-gold bg-gold/5"
                                            )}>
                                                <Checkbox
                                                    id="agreeToTerms"
                                                    checked={agreeToTerms}
                                                    onCheckedChange={(checked) =>
                                                        setAgreeToTerms(checked as boolean)
                                                    }
                                                />
                                                <div className="flex-1">
                                                    <Label
                                                        htmlFor="agreeToTerms"
                                                        className="cursor-pointer text-sm leading-relaxed"
                                                    >
                                                        {t('checkout.agree_to_terms_prefix', 'I agree to the')}{' '}
                                                        <Link
                                                            href="/terms"
                                                            className="font-medium text-gold hover:underline"
                                                        >
                                                            {t('checkout.terms_and_conditions', 'Terms and Conditions')}
                                                        </Link>
                                                        {' '}
                                                        {t('checkout.and', 'and')}{' '}
                                                        <Link
                                                            href="/privacy"
                                                            className="font-medium text-gold hover:underline"
                                                        >
                                                            {t('checkout.privacy_policy', 'Privacy Policy')}
                                                        </Link>
                                                    </Label>
                                                </div>
                                            </div>

                                            {/* Buttons */}
                                            <div className="mt-6 flex items-center justify-between gap-3">
                                                <Button
                                                    type="button"
                                                    onClick={() => handleEdit(3)}
                                                    variant="outline"
                                                    className="border-2"
                                                >
                                                    <ArrowLeft className="mr-2 size-4" />
                                                    {t('checkout.back', 'Back')}
                                                </Button>
                                                <SubmitButton />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Order Summary Sidebar */}
                            <div className="lg:col-span-1">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="sticky top-24"
                                >
                                    <OrderSummary
                                        data={orderSummaryData}
                                        sticky
                                        showItems
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </form>
                </div>

                <Footer />
            </div>
        </>
    );
}
