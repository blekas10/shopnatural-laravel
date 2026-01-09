import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Gift, Sparkles, Copy, Check, X } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const STORAGE_KEY = 'shop_natural_promo_last_shown';
const PROMO_CODE = 'WELCOME2026';
const DISCOUNT_PERCENT = 12;
const SHOW_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

interface WelcomePromoModalProps {
    onOpenRegister?: () => void;
}

export function WelcomePromoModal({ onOpenRegister }: WelcomePromoModalProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Check if enough time has passed since last shown (30 minutes)
        const lastShown = localStorage.getItem(STORAGE_KEY);
        const now = Date.now();

        if (!lastShown || (now - parseInt(lastShown, 10)) > SHOW_INTERVAL_MS) {
            // Small delay for better UX - let the page load first
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        setIsOpen(false);
    };

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(PROMO_CODE);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = PROMO_CODE;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleRegisterClick = () => {
        handleClose();
        onOpenRegister?.();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[440px] p-0 border-0 bg-white rounded-2xl shadow-2xl overflow-hidden [&>button]:hidden">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Top decorative section with gradient */}
                <div className="relative bg-gradient-to-br from-[#C2A363] via-[#D4B87A] to-[#C2A363] px-6 pt-8 pb-12">
                    {/* Animated sparkles */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    delay: 0.5 + i * 0.3,
                                    repeat: Infinity,
                                    repeatDelay: 3,
                                }}
                                className="absolute"
                                style={{
                                    left: `${15 + i * 15}%`,
                                    top: `${20 + (i % 3) * 25}%`,
                                }}
                            >
                                <Sparkles className="w-4 h-4 text-white/60" />
                            </motion.div>
                        ))}
                    </div>

                    {/* Gift icon */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="flex justify-center mb-4"
                    >
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                            <Gift className="w-10 h-10 text-white" />
                        </div>
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold text-white text-center mb-2"
                    >
                        {t('promo_modal.title', 'Welcome Gift!')}
                    </motion.h2>
                    <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-white/90 text-center text-sm"
                    >
                        {t('promo_modal.subtitle', 'Exclusive discount for new members')}
                    </motion.p>
                </div>

                {/* Main content */}
                <div className="relative z-10 px-6 pb-6 -mt-6">
                    {/* Discount card */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm"
                    >
                        {/* Discount percentage */}
                        <div className="text-center mb-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
                                className="inline-flex items-baseline"
                            >
                                <span className="text-5xl font-bold text-[#C2A363]">{DISCOUNT_PERCENT}</span>
                                <span className="text-2xl font-bold text-[#C2A363]">%</span>
                            </motion.div>
                            <p className="text-gray-600 text-sm mt-1">
                                {t('promo_modal.discount_label', 'off your first order')}
                            </p>
                        </div>

                        {/* Promo code */}
                        <div className="relative">
                            <div className="flex items-center justify-between bg-white rounded-lg border-2 border-dashed border-[#C2A363]/50 p-3">
                                <span className="font-mono text-lg font-bold tracking-wider text-gray-800">
                                    {PROMO_CODE}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopyCode}
                                    className="h-8 px-3 text-[#C2A363] hover:text-[#A8923A] hover:bg-[#C2A363]/10"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 mr-1" />
                                    ) : (
                                        <Copy className="w-4 h-4 mr-1" />
                                    )}
                                    {copied ? t('promo_modal.copied', 'Copied!') : t('promo_modal.copy', 'Copy')}
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Info text */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-xs text-gray-500 text-center mt-4 mb-4"
                    >
                        {t('promo_modal.register_info', 'Register an account to use this code at checkout')}
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="space-y-3"
                    >
                        <Button
                            onClick={handleRegisterClick}
                            className="w-full bg-[#C2A363] hover:bg-[#A8923A] text-white font-medium py-5 rounded-xl transition-all duration-200 hover:shadow-lg"
                        >
                            {t('promo_modal.register_now', 'Create Account & Save')}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            className="w-full text-gray-500 hover:text-gray-700 font-medium py-3"
                        >
                            {t('promo_modal.maybe_later', 'Maybe later')}
                        </Button>
                    </motion.div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
