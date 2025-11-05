import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Leaf, Rabbit, Truck } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface FeaturesSectionProps {
    className?: string;
}

export default function FeaturesSection({ className }: FeaturesSectionProps) {
    const { t } = useTranslation();

    const features = [
        {
            icon: Leaf,
            title: t('features.natural_ingredients'),
            description: t('features.natural_ingredients.description'),
            color: 'gold',
            gradient: 'from-gold/10 to-gold/5',
            iconBg: 'bg-gold/10',
            iconColor: 'text-black/70',
            borderColor: 'border-gold/20',
            hoverBorder: 'hover:border-gold/40',
            hoverShadow: 'hover:shadow-gold/10',
        },
        {
            icon: Rabbit,
            title: t('features.cruelty_free'),
            description: t('features.cruelty_free.description'),
            color: 'gold',
            gradient: 'from-gold/10 to-gold/5',
            iconBg: 'bg-gold/10',
            iconColor: 'text-black/70',
            borderColor: 'border-gold/20',
            hoverBorder: 'hover:border-gold/40',
            hoverShadow: 'hover:shadow-gold/10',
        },
        {
            icon: Truck,
            title: t('features.fast_shipping'),
            description: t('features.fast_shipping.description'),
            color: 'gold',
            gradient: 'from-gold/10 to-gold/5',
            iconBg: 'bg-gold/10',
            iconColor: 'text-black/70',
            borderColor: 'border-gold/20',
            hoverBorder: 'hover:border-gold/40',
            hoverShadow: 'hover:shadow-gold/10',
        },
    ];

    return (
        <section className={cn('w-full bg-muted/30 py-16 md:py-24', className)}>
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-3 lg:gap-12">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{
                                    duration: 0.5,
                                    ease: 'easeOut',
                                    delay: index * 0.15,
                                }}
                                className={cn(
                                    'group relative overflow-hidden rounded-2xl border-2 bg-background p-8 transition-all duration-300 hover:shadow-lg',
                                    feature.borderColor,
                                    feature.hoverBorder,
                                    feature.hoverShadow,
                                )}
                            >
                                {/* Icon container with animation */}
                                <motion.div
                                    initial={{ scale: 1 }}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 20,
                                    }}
                                    className={cn(
                                        'mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-muted/50 transition-all duration-300 md:h-20 md:w-20',
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'h-8 w-8 transition-transform duration-300 md:h-10 md:w-10',
                                            feature.iconColor,
                                        )}
                                        strokeWidth={2}
                                    />
                                </motion.div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <h3 className="mb-3 text-xl font-bold text-foreground uppercase md:text-2xl">
                                        {feature.title}
                                    </h3>
                                    <p className="leading-relaxed text-foreground/70">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
