import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Copy, Check, X } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const STORAGE_KEY = 'shop_natural_promo_last_shown';
const PROMO_CODE = 'WELCOME2026';
const DISCOUNT_PERCENT = 12;
const SHOW_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const AUTO_DISMISS_DELAY = 9000; // 9 seconds

interface WelcomePromoModalProps {
    onOpenRegister?: () => void;
}

export function WelcomePromoModal({ onOpenRegister }: WelcomePromoModalProps) {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Check if enough time has passed since last shown (30 minutes)
        const lastShown = localStorage.getItem(STORAGE_KEY);
        const now = Date.now();

        if (!lastShown || (now - parseInt(lastShown, 10)) > SHOW_INTERVAL_MS) {
            // Small delay for better UX - let the page load first
            const showTimer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);

            return () => clearTimeout(showTimer);
        }
    }, []);

    useEffect(() => {
        if (isVisible) {
            // Auto-dismiss after delay
            const dismissTimer = setTimeout(() => {
                handleClose();
            }, AUTO_DISMISS_DELAY);

            return () => clearTimeout(dismissTimer);
        }
    }, [isVisible]);

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        setIsVisible(false);
    };

    const handleCopyCode = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering the click handler
        try {
            await navigator.clipboard.writeText(PROMO_CODE);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers (execCommand is deprecated but still works)
            const textArea = document.createElement('textarea');
            textArea.value = PROMO_CODE;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            // @ts-ignore - execCommand is deprecated but needed for older browsers
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleNotificationClick = () => {
        handleClose();
        onOpenRegister?.();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ x: -400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -400, opacity: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        mass: 0.8,
                    }}
                    className="fixed bottom-4 left-4 z-50 max-w-[350px] w-[calc(100vw-2rem)] sm:w-[350px]"
                >
                    {/* Main notification card */}
                    <div
                        onClick={handleNotificationClick}
                        className="relative bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden cursor-pointer group hover:shadow-3xl transition-all duration-300"
                    >
                        {/* Decorative gold accent bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C2A363] via-[#D4B87A] to-[#C2A363]" />

                        {/* Close button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClose();
                            }}
                            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Content */}
                        <div className="p-4 pr-10">
                            {/* Header with icon and discount */}
                            <div className="flex items-start gap-3 mb-3">
                                {/* Gift icon with subtle animation */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 15,
                                        delay: 0.1,
                                    }}
                                    className="flex-shrink-0 bg-gradient-to-br from-[#C2A363] to-[#D4B87A] rounded-xl p-2.5 shadow-md"
                                >
                                    <Gift className="w-5 h-5 text-white" />
                                </motion.div>

                                {/* Discount badge and title */}
                                <div className="flex-1 min-w-0">
                                    <motion.div
                                        initial={{ y: -10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex items-baseline gap-1.5 mb-1"
                                    >
                                        <span className="text-3xl font-bold text-[#C2A363] leading-none">
                                            {DISCOUNT_PERCENT}%
                                        </span>
                                        <span className="text-sm font-semibold text-gray-700">
                                            {t('promo_modal.discount_label', 'off your first order')}
                                        </span>
                                    </motion.div>
                                    <motion.p
                                        initial={{ y: -5, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-xs text-gray-600"
                                    >
                                        {t('promo_modal.subtitle', 'Exclusive discount for new members')}
                                    </motion.p>
                                </div>
                            </div>

                            {/* Promo code section */}
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-dashed border-[#C2A363]/30 p-2.5"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">
                                            {t('promo_modal.copy', 'Copy')} code
                                        </p>
                                        <p className="font-mono text-sm font-bold tracking-wider text-gray-800 truncate">
                                            {PROMO_CODE}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCopyCode}
                                        className="flex-shrink-0 p-2 rounded-lg bg-[#C2A363] hover:bg-[#A8923A] text-white transition-all duration-200 hover:shadow-md active:scale-95"
                                        aria-label={copied ? t('promo_modal.copied', 'Copied!') : t('promo_modal.copy', 'Copy')}
                                    >
                                        {copied ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </motion.div>

                            {/* CTA text */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-xs text-gray-600 mt-3 flex items-center gap-1.5"
                            >
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C2A363] animate-pulse" />
                                {t('promo_modal.register_info', 'Register an account to use this code at checkout')}
                            </motion.p>
                        </div>

                        {/* Subtle hover effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#C2A363]/0 via-[#C2A363]/5 to-[#C2A363]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </div>

                    {/* Auto-dismiss progress bar */}
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C2A363]/20 rounded-b-2xl overflow-hidden"
                    >
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{
                                duration: AUTO_DISMISS_DELAY / 1000,
                                ease: "linear",
                            }}
                            className="h-full bg-gradient-to-r from-[#C2A363] to-[#D4B87A]"
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
