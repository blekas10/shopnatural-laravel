import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const STORAGE_KEY = 'shop_natural_promo_seen';
const DISCOUNT_PERCENT = 12;

interface WelcomePromoModalProps {
    onOpenRegister?: () => void;
}

export function WelcomePromoModal({ onOpenRegister }: WelcomePromoModalProps) {
    const { t, route } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already seen the promo (show only once)
        const hasSeenPromo = localStorage.getItem(STORAGE_KEY);

        if (!hasSeenPromo) {
            // Small delay for better UX - let the page load first
            const showTimer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);

            return () => clearTimeout(showTimer);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsVisible(false);
    };

    const handleRegister = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsVisible(false);
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
                    <div className="relative bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
                        {/* Decorative gold accent bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C2A363] via-[#D4B87A] to-[#C2A363]" />

                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Content */}
                        <div className="p-5 pr-10">
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

                            {/* Info message */}
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-gradient-to-r from-amber-50 to-yellow-50/50 rounded-lg border border-[#C2A363]/20 p-3 mb-3"
                            >
                                <p className="text-sm text-gray-700 text-center leading-relaxed">
                                    {t('promo_modal.email_info', 'Your exclusive discount code will be sent to your email when you register!')}
                                </p>
                            </motion.div>

                            {/* Register button */}
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                onClick={handleRegister}
                                className="w-full bg-gradient-to-r from-[#C2A363] to-[#D4B87A] hover:from-[#A8923A] hover:to-[#C2A363] text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-98"
                            >
                                {t('promo_modal.register_button', 'Register Now')}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
