import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import type { CardDetails, PaymentMethod } from '@/types/checkout';
import { useTranslation } from '@/hooks/use-translation';
import { CreditCard, Wallet, Building2, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { StripeLogo, PayseraLogo, ApplePayLogo, GooglePayLogo, VisaLogo, MastercardLogo, PayseraBankLogos } from './payment-logos';

interface PaymentFormProps {
    selectedMethod: string;
    onMethodChange: (method: string) => void;
    cardDetails?: CardDetails;
    onCardDetailsChange?: (field: keyof CardDetails, value: string) => void;
    cardErrors?: Partial<Record<keyof CardDetails, string>>;
    availableMethods: PaymentMethod[];
}

const paymentIcons: Record<string, React.ElementType> = {
    cash: Banknote,
    card: CreditCard,
    paypal: Wallet,
    bank_transfer: Building2,
    stripe: CreditCard,
    paysera: Building2,
};

// Payment method logo components
const PaymentMethodLogo = ({ methodId }: { methodId: string }) => {
    switch (methodId) {
        case 'stripe':
            return (
                <div className="flex flex-col gap-1">
                    <StripeLogo className="h-5" />
                    <div className="flex items-center gap-1.5 mt-1">
                        <ApplePayLogo className="h-4 opacity-70" />
                        <GooglePayLogo className="h-4 opacity-70" />
                    </div>
                </div>
            );
        case 'paysera':
            return <PayseraLogo className="h-5" />;
        default:
            return null;
    }
};

// Card type detection
function detectCardType(cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'discover' | null {
    const cleaned = cardNumber.replace(/\s/g, '');

    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';

    return null;
}

const cardTypeColors: Record<string, string> = {
    visa: 'text-blue-600',
    mastercard: 'text-orange-600',
    amex: 'text-blue-700',
    discover: 'text-orange-500',
};

export function PaymentForm({
    selectedMethod,
    onMethodChange,
    cardDetails,
    onCardDetailsChange,
    cardErrors = {},
    availableMethods,
}: PaymentFormProps) {
    const { t } = useTranslation();

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\s/g, '');
        const cardType = detectCardType(cleaned);

        // American Express uses different grouping (4-6-5)
        if (cardType === 'amex') {
            const match = cleaned.match(/^(\d{0,4})(\d{0,6})(\d{0,5})/);
            if (match) {
                return [match[1], match[2], match[3]]
                    .filter(Boolean)
                    .join(' ');
            }
        }

        // Default grouping (4-4-4-4)
        const groups = cleaned.match(/.{1,4}/g) || [];
        return groups.join(' ');
    };

    const formatExpiryDate = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
        }
        return cleaned;
    };

    const cardType = cardDetails ? detectCardType(cardDetails.cardNumber) : null;

    return (
        <div className="space-y-6">
            {/* Payment Method Selection */}
            <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
                <div className="space-y-3">
                    {availableMethods.map((method) => {
                        const Icon = paymentIcons[method.id] || CreditCard;
                        const isSelected = selectedMethod === method.id;
                        const hasLogo = method.id === 'stripe' || method.id === 'paysera';

                        return (
                            <label
                                key={method.id}
                                htmlFor={`payment-${method.id}`}
                                className={cn(
                                    'flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-all',
                                    isSelected
                                        ? 'border-gold bg-gold/5'
                                        : 'border-border bg-background hover:border-gold/40',
                                )}
                            >
                                <RadioGroupItem
                                    value={method.id}
                                    id={`payment-${method.id}`}
                                    className="mt-0.5"
                                />
                                <div className="flex flex-1 items-start gap-3">
                                    {hasLogo ? (
                                        <div className="flex min-w-[80px] shrink-0 items-start justify-center rounded-lg border border-border bg-white p-2">
                                            <PaymentMethodLogo methodId={method.id} />
                                        </div>
                                    ) : (
                                        <div
                                            className={cn(
                                                'rounded-lg p-2',
                                                isSelected
                                                    ? 'bg-gold/10 text-gold'
                                                    : 'bg-muted text-muted-foreground',
                                            )}
                                        >
                                            <Icon className="size-5" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-bold uppercase tracking-wide text-foreground">
                                            {method.name}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {method.description}
                                        </p>
                                        {/* Show card brands for Stripe */}
                                        {method.id === 'stripe' && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <VisaLogo className="h-4" />
                                                <MastercardLogo className="h-4" />
                                            </div>
                                        )}
                                        {/* Show bank logos for Paysera */}
                                        {method.id === 'paysera' && (
                                            <div className="mt-2">
                                                <PayseraBankLogos />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </RadioGroup>

            {/* Card Details Form (shown only for card payment) */}
            <AnimatePresence mode="wait">
                {selectedMethod === 'card' &&
                    cardDetails &&
                    onCardDetailsChange && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-4 rounded-lg border-2 border-border bg-muted/30 p-4">
                                <h3 className="text-sm font-bold uppercase tracking-wide">
                                    {t('checkout.card_details', 'Card Details')}
                                </h3>

                                {/* Card Number */}
                                <div>
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor="cardNumber"
                                            className="text-sm font-bold uppercase tracking-wide"
                                        >
                                            {t('checkout.card_number', 'Card Number')} *
                                        </Label>
                                        {cardType && (
                                            <span className={cn(
                                                'text-xs font-bold uppercase tracking-wider',
                                                cardTypeColors[cardType]
                                            )}>
                                                {cardType}
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="cardNumber"
                                            type="text"
                                            inputMode="numeric"
                                            value={cardDetails.cardNumber}
                                            onChange={(e) => {
                                                const formatted = formatCardNumber(
                                                    e.target.value,
                                                );
                                                const maxDigits = detectCardType(formatted) === 'amex' ? 15 : 16;
                                                if (formatted.replace(/\s/g, '').length <= maxDigits) {
                                                    onCardDetailsChange(
                                                        'cardNumber',
                                                        formatted,
                                                    );
                                                }
                                            }}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={cardType === 'amex' ? 17 : 19}
                                            className="mt-1.5"
                                            error={cardErrors.cardNumber}
                                        />
                                        {cardType && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.75">
                                                <CreditCard className={cn(
                                                    'size-5',
                                                    cardTypeColors[cardType]
                                                )} />
                                            </div>
                                        )}
                                    </div>
                                    {cardErrors.cardNumber && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {cardErrors.cardNumber}
                                        </p>
                                    )}
                                </div>

                                {/* Expiry Date and CVV */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label
                                            htmlFor="expiryDate"
                                            className="text-sm font-bold uppercase tracking-wide"
                                        >
                                            {t('checkout.expiry_date', 'Expiry Date')} *
                                        </Label>
                                        <Input
                                            id="expiryDate"
                                            type="text"
                                            inputMode="numeric"
                                            value={cardDetails.expiryDate}
                                            onChange={(e) => {
                                                const formatted =
                                                    formatExpiryDate(
                                                        e.target.value,
                                                    );
                                                if (formatted.replace(/\D/g, '').length <= 4) {
                                                    onCardDetailsChange(
                                                        'expiryDate',
                                                        formatted,
                                                    );
                                                }
                                            }}
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            className="mt-1.5"
                                            error={cardErrors.expiryDate}
                                        />
                                        {cardErrors.expiryDate && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {cardErrors.expiryDate}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor="cvv"
                                                className="text-sm font-bold uppercase tracking-wide"
                                            >
                                                {t('checkout.cvv', 'CVV')} *
                                            </Label>
                                            <span className="text-xs text-muted-foreground">
                                                {cardType === 'amex' ? '4 digits' : '3 digits'}
                                            </span>
                                        </div>
                                        <Input
                                            id="cvv"
                                            type="text"
                                            inputMode="numeric"
                                            value={cardDetails.cvv}
                                            onChange={(e) => {
                                                const value =
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        '',
                                                    );
                                                const maxLength = cardType === 'amex' ? 4 : 3;
                                                if (value.length <= maxLength) {
                                                    onCardDetailsChange(
                                                        'cvv',
                                                        value,
                                                    );
                                                }
                                            }}
                                            placeholder={cardType === 'amex' ? '1234' : '123'}
                                            maxLength={cardType === 'amex' ? 4 : 3}
                                            className="mt-1.5"
                                            error={cardErrors.cvv}
                                        />
                                        {cardErrors.cvv && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {cardErrors.cvv}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Cardholder Name */}
                                <div>
                                    <Label
                                        htmlFor="cardholderName"
                                        className="text-sm font-bold uppercase tracking-wide"
                                    >
                                        {t('checkout.cardholder_name', 'Cardholder Name')} *
                                    </Label>
                                    <Input
                                        id="cardholderName"
                                        type="text"
                                        value={cardDetails.cardholderName}
                                        onChange={(e) =>
                                            onCardDetailsChange(
                                                'cardholderName',
                                                e.target.value,
                                            )
                                        }
                                        placeholder={t('checkout.cardholder_name_placeholder', 'Name on card')}
                                        className="mt-1.5"
                                        error={cardErrors.cardholderName}
                                    />
                                    {cardErrors.cardholderName && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {cardErrors.cardholderName}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
            </AnimatePresence>
        </div>
    );
}
