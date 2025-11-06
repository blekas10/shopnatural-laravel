import { Head, Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Lock, Check, ChevronRight } from 'lucide-react';
import { useState } from 'react';
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
import type {
    CheckoutFormData,
    ShippingAddress,
    ContactInformation,
    CardDetails,
    CheckoutPageProps,
} from '@/types/checkout';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

export default function Checkout({
    shippingMethods = [
        {
            id: 'standard',
            name: 'Standard Shipping',
            description: 'Free for orders over €50',
            price: 5.99,
            estimatedDays: '5-7 business days',
        },
        {
            id: 'express',
            name: 'Express Shipping',
            description: '1-2 business days',
            price: 9.99,
            estimatedDays: '1-2 business days',
        },
    ],
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
    errors = {},
}: CheckoutPageProps) {
    const { items, totalPrice } = useCart();
    const { t, route } = useTranslation();

    // Step Management
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    // Form State
    const [contact, setContact] = useState<ContactInformation & { fullName: string }>({
        email: '',
        phone: '',
        fullName: '',
    });

    const [shippingAddress, setShippingAddress] = useState<Omit<ShippingAddress, 'fullName'> & { fullName?: string }>({
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: '',
        country: 'LT',
    });

    const [billingAddress, setBillingAddress] = useState<Omit<ShippingAddress, 'fullName'> & { fullName?: string }>({
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: '',
        country: 'LT',
    });

    const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
    const [selectedShippingMethod, setSelectedShippingMethod] =
        useState('pickup');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
    const [cardDetails, setCardDetails] = useState<CardDetails>({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
    });
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    // Redirect to cart if empty
    if (items.length === 0) {
        router.visit(route('cart'));
        return null;
    }

    // Calculate totals
    const subtotal = totalPrice;
    const shippingMethod = shippingMethods.find(
        (m) => m.id === selectedShippingMethod,
    );
    const shipping = shippingMethod?.id === 'pickup'
        ? 0
        : shippingMethod?.id === 'standard' && subtotal >= 50
            ? 0
            : shippingMethod?.price || 0;
    const tax = 0;
    const discount = 0;
    const total = subtotal + shipping + tax - discount;

    const orderSummaryData = {
        subtotal,
        shipping,
        tax,
        discount,
        total,
        items,
    };

    // Validation functions
    const validateContactInfo = () => {
        if (!contact.fullName.trim()) {
            toast.error(t('checkout.field_required', '{field} is required', { field: t('checkout.full_name', 'Full Name') }));
            return false;
        }
        if (!contact.email.trim()) {
            toast.error(t('checkout.field_required', '{field} is required', { field: t('checkout.email', 'Email') }));
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact.email)) {
            toast.error(t('checkout.invalid_email', 'Please enter a valid email address'));
            return false;
        }
        return true;
    };

    const validateShippingAddress = () => {
        const requiredFields = [
            { value: shippingAddress.addressLine1, name: t('checkout.address_line_1', 'Address') },
            { value: shippingAddress.city, name: t('checkout.city', 'City') },
            { value: shippingAddress.postalCode, name: t('checkout.postal_code', 'Postal Code') },
            { value: shippingAddress.country, name: t('checkout.country', 'Country') },
        ];

        const missingField = requiredFields.find(field => !field.value?.trim());
        if (missingField) {
            toast.error(t('checkout.field_required', '{field} is required', { field: missingField.name }));
            return false;
        }
        return true;
    };

    const validateBillingAddress = () => {
        if (billingSameAsShipping) return true;

        const requiredFields = [
            { value: billingAddress.addressLine1, name: t('checkout.address_line_1', 'Address') },
            { value: billingAddress.city, name: t('checkout.city', 'City') },
            { value: billingAddress.postalCode, name: t('checkout.postal_code', 'Postal Code') },
            { value: billingAddress.country, name: t('checkout.country', 'Country') },
        ];

        const missingField = requiredFields.find(field => !field.value?.trim());
        if (missingField) {
            toast.error(t('checkout.field_required', '{field} is required', { field: missingField.name }));
            return false;
        }
        return true;
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
                isValid = true; // Shipping method always has a selection
                break;
            case 4:
                isValid = validatePayment();
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

        if (!agreeToTerms) {
            toast.error(
                t(
                    'checkout.please_accept_terms',
                    'Please accept the terms and conditions',
                ),
            );
            return;
        }

        const checkoutData: CheckoutFormData = {
            contact,
            shippingAddress,
            billingAddress: billingSameAsShipping
                ? shippingAddress
                : billingAddress,
            billingSameAsShipping,
            shippingMethod: selectedShippingMethod,
            paymentMethod: selectedPaymentMethod,
            cardDetails:
                selectedPaymentMethod === 'card' ? cardDetails : undefined,
            agreeToTerms,
            items: items.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.variant?.price || 0,
            })),
            subtotal,
            shipping,
            tax,
            discount,
            total,
        };

        router.post(route('checkout.store'), checkoutData, {
            preserveScroll: true,
            onError: (errors) => {
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
    };

    const updateBillingAddress = (
        field: keyof ShippingAddress,
        value: string,
    ) => {
        setBillingAddress((prev) => ({ ...prev, [field]: value }));
    };

    const updateCardDetails = (field: keyof CardDetails, value: string) => {
        setCardDetails((prev) => ({ ...prev, [field]: value }));
    };

    // Step indicator component
    const StepIndicator = ({ step, title, isCompleted, isCurrent }: { step: number; title: string; isCompleted: boolean; isCurrent: boolean }) => (
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
            <Head title={t('checkout.title', 'Checkout')} />

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
                        <h1 className="text-3xl font-bold uppercase tracking-wide md:text-4xl">
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
                                        <StepIndicator step={1} title={t('checkout.contact', 'Contact')} isCompleted={completedSteps.includes(1)} isCurrent={currentStep === 1} />
                                        <div className="h-px flex-1 bg-border" />
                                        <StepIndicator step={2} title={t('checkout.address', 'Address')} isCompleted={completedSteps.includes(2)} isCurrent={currentStep === 2} />
                                        <div className="h-px flex-1 bg-border" />
                                        <StepIndicator step={3} title={t('checkout.delivery', 'Delivery')} isCompleted={completedSteps.includes(3)} isCurrent={currentStep === 3} />
                                        <div className="h-px flex-1 bg-border" />
                                        <StepIndicator step={4} title={t('checkout.payment', 'Payment')} isCompleted={completedSteps.includes(4)} isCurrent={currentStep === 4} />
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
                                                        onChange={(e) =>
                                                            setContact((prev) => ({
                                                                ...prev,
                                                                fullName: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="Jonas Jonaitis"
                                                        className="mt-1.5"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wide">
                                                        {t('checkout.email', 'Email')} *
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={contact.email}
                                                        onChange={(e) =>
                                                            setContact((prev) => ({
                                                                ...prev,
                                                                email: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="your@email.com"
                                                        className="mt-1.5"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="phone" className="text-sm font-bold uppercase tracking-wide">
                                                        {t('checkout.phone', 'Phone')}
                                                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                                                            ({t('checkout.optional', 'Optional')})
                                                        </span>
                                                    </Label>
                                                    <Input
                                                        id="phone"
                                                        type="tel"
                                                        value={contact.phone || ''}
                                                        onChange={(e) =>
                                                            setContact((prev) => ({
                                                                ...prev,
                                                                phone: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="+370 600 12345"
                                                        className="mt-1.5"
                                                    />
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
                                            <AddressForm
                                                values={shippingAddress}
                                                onChange={updateShippingAddress}
                                                prefix="shipping"
                                            />

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
                                                    <AddressForm
                                                        values={billingAddress}
                                                        onChange={updateBillingAddress}
                                                        prefix="billing"
                                                    />
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
                                                        const isFree =
                                                            method.id === 'standard' &&
                                                            subtotal >= 50;

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
                                                                        <div>
                                                                            <p className="font-bold uppercase tracking-wide text-foreground">
                                                                                {method.name}
                                                                            </p>
                                                                            <p className="mt-1 text-sm text-muted-foreground">
                                                                                {
                                                                                    method.description
                                                                                }
                                                                            </p>
                                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                                {
                                                                                    method.estimatedDays
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                        <p className="font-bold text-gold">
                                                                            {isFree
                                                                                ? t('checkout.free', 'Free')
                                                                                : `€${method.price.toFixed(2)}`}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </RadioGroup>
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
                                            <PaymentForm
                                                selectedMethod={selectedPaymentMethod}
                                                onMethodChange={setSelectedPaymentMethod}
                                                cardDetails={cardDetails}
                                                onCardDetailsChange={updateCardDetails}
                                                availableMethods={paymentMethods}
                                            />
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
                                                <Button
                                                    type="button"
                                                    onClick={() => handleContinue(4)}
                                                    className="bg-gold hover:bg-gold/90"
                                                >
                                                    {t('checkout.continue', 'Continue')}
                                                    <ChevronRight className="ml-2 size-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 5: Review & Submit */}
                                    {currentStep === 5 && (
                                        <motion.div
                                            key="step5"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4"
                                        >

                                            {/* Terms and Conditions */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className="flex items-start space-x-3 rounded-2xl border-2 border-border bg-background p-6"
                                            >
                                                <Checkbox
                                                    id="agreeToTerms"
                                                    checked={agreeToTerms}
                                                    onCheckedChange={(checked) =>
                                                        setAgreeToTerms(checked as boolean)
                                                    }
                                                    required
                                                />
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
                                            </motion.div>

                                            {/* Submit Button */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <SubmitButton />
                                            </motion.div>
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
