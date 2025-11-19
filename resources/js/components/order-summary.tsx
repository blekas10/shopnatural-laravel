import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import type { OrderSummaryData } from '@/types/checkout';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface OrderSummaryProps {
    data: OrderSummaryData;
    onPromoCodeApply?: (code: string) => void;
    isApplyingPromo?: boolean;
    className?: string;
    sticky?: boolean;
    showItems?: boolean;
}

export function OrderSummary({
    data,
    onPromoCodeApply,
    isApplyingPromo = false,
    className,
    sticky = false,
    showItems = true,
}: OrderSummaryProps) {
    const { t } = useTranslation();
    const [promoCode, setPromoCode] = useState('');
    const [showPromoInput, setShowPromoInput] = useState(false);

    const handleApplyPromo = () => {
        if (promoCode.trim() && onPromoCodeApply) {
            onPromoCodeApply(promoCode.trim());
        }
    };

    return (
        <div
            className={cn(
                'rounded-xl border border-border bg-background p-6',
                sticky && 'lg:sticky lg:top-24',
                className,
            )}
        >
            <h2 className="mb-6 text-lg font-bold uppercase tracking-wide">
                {t('checkout.order_summary', 'Order Summary')}
            </h2>

            {/* Items List */}
            {showItems && data.items.length > 0 && (
                <div className="mb-6 space-y-4 border-b border-border pb-6">
                    {data.items.map((item) => {
                        const price = item.variant?.price || item.product.price;
                        const compareAtPrice = item.variant?.compareAtPrice || item.product.compareAtPrice;
                        const lineTotal = price * item.quantity;
                        const compareLineTotal = compareAtPrice ? compareAtPrice * item.quantity : null;

                        return (
                            <div key={item.id} className="flex gap-3">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                                    <img
                                        src={item.variant?.image || item.product.image}
                                        alt={item.product.name}
                                        className="h-full w-full object-contain"
                                    />
                                    <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-gold text-xs font-bold text-white">
                                        {item.quantity}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold uppercase tracking-wide text-foreground line-clamp-2">
                                        {item.product.name}
                                    </p>
                                    {item.variant && (
                                        <p className="text-xs text-muted-foreground">
                                            {item.variant.size}
                                        </p>
                                    )}
                                    <div className="mt-1 flex items-center gap-2">
                                        <p className="text-sm font-bold text-gold">
                                            €{lineTotal.toFixed(2)}
                                        </p>
                                        {compareLineTotal && compareLineTotal > lineTotal && (
                                            <p className="text-xs font-medium text-muted-foreground line-through">
                                                €{compareLineTotal.toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Promo Code */}
            {onPromoCodeApply && (
                <div className="mb-6 border-b border-border pb-6">
                    {!showPromoInput ? (
                        <button
                            onClick={() => setShowPromoInput(true)}
                            className="flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-gold/80"
                        >
                            <Tag className="size-4" />
                            {t('checkout.add_promo_code', 'Add promo code')}
                        </button>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex gap-2"
                        >
                            <Input
                                value={promoCode}
                                onChange={(e) =>
                                    setPromoCode(
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                placeholder={t(
                                    'checkout.promo_code_placeholder',
                                    'Enter code',
                                )}
                                className="flex-1 uppercase"
                                disabled={isApplyingPromo}
                            />
                            <Button
                                onClick={handleApplyPromo}
                                disabled={!promoCode.trim() || isApplyingPromo}
                                className="bg-gold text-white hover:bg-gold/90"
                            >
                                {isApplyingPromo
                                    ? t('checkout.applying', 'Applying...')
                                    : t('checkout.apply', 'Apply')}
                            </Button>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        {t('checkout.subtotal', 'Subtotal')}
                    </span>
                    <span className="font-medium text-foreground">
                        €{data.subtotal.toFixed(2)}
                    </span>
                </div>

                {data.shipping > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            {t('checkout.shipping', 'Shipping')}
                        </span>
                        <span className="font-medium text-foreground">
                            €{data.shipping.toFixed(2)}
                        </span>
                    </div>
                )}

                {data.tax > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            {t('checkout.tax', 'Tax')}
                        </span>
                        <span className="font-medium text-foreground">
                            €{data.tax.toFixed(2)}
                        </span>
                    </div>
                )}

                {data.discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-teal-600 dark:text-teal-400">
                            {t('checkout.discount', 'Discount')}
                        </span>
                        <span className="font-medium text-teal-600 dark:text-teal-400">
                            -€{data.discount.toFixed(2)}
                        </span>
                    </div>
                )}

                <div className="border-t border-border pt-3">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-foreground">
                            {t('checkout.total', 'Total')}
                        </span>
                        <span className="text-2xl font-bold text-gold">
                            €{data.total.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
