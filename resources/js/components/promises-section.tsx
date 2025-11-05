import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PromisesSectionProps {
    className?: string;
}

export default function PromisesSection({ className }: PromisesSectionProps) {
    return (
        <section className={cn('relative w-full p-[5px]', className)}>
            {/* Gradient background */}
            <div className="absolute inset-[5px] rounded-lg bg-[radial-gradient(ellipse_at_center,transparent_30%,oklch(0.78_0.08_75_/_0.15)_100%)]" />

            <div className="container relative z-10 mx-auto px-4 py-16 md:px-6 md:py-24 lg:px-8">
                <div className="grid md:grid-cols-2 md:gap-0">
                    {/* Promise to You */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="border-b border-gold/30 py-0 pb-8 md:py-8 md:border-b-0 md:border-r-2 md:pr-12"
                    >
                        <h2 className="mb-6 text-2xl font-bold uppercase text-foreground md:text-3xl">
                            Our Promise to You
                        </h2>
                        <p className="leading-relaxed text-foreground/70 md:text-lg">
                            We believe in beauty with a conscience. From cruelty-free formulas to
                            plastic-free packaging, we're here to help you look and feel
                            great without compromising the planet's health.
                        </p>
                    </motion.div>

                    {/* Promise to the Planet */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                        className="py-0 py-8 md:pl-12"
                    >
                        <h2 className="mb-6 text-2xl font-bold uppercase text-foreground md:text-3xl">
                            Our Promise to the Planet
                        </h2>
                        <p className="leading-relaxed text-foreground/70 md:text-lg">
                            Each product is designed to be as gentle on the environment as
                            it is on your skin. With us, sustainability isn't just a trend
                            — it's a commitment.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
