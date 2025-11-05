import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

interface HeroSectionProps {
    className?: string;
}

export default function HeroSection({ className }: HeroSectionProps) {
    const { t } = useTranslation();

    return (
        <section
            className={cn(
                'relative flex h-[80vh] w-full items-center justify-center p-[5px]',
                className
            )}
        >
            {/* Background image */}
            <div
                className="absolute inset-[5px] top-0 z-0 rounded-b-lg bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url(/images/Foto2.jpg)',
                }}
                aria-hidden="true"
            />

            {/* Overlay for better text readability */}
            <div
                className="absolute inset-[5px] top-0 z-0 rounded-b-lg bg-black/35"
                aria-hidden="true"
            />

            {/* Hero content */}
            <div className="container relative z-10 mx-auto flex flex-col items-center gap-8 px-4 text-center md:px-6 lg:items-start lg:px-8 lg:text-left">
                <div className="space-y-4">
                    <h1 className="text-4xl font-medium uppercase leading-tight tracking-wide sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl">
                        <span className="text-gold">{t('hero.title').split(',')[0]},</span>
                        <br />
                        <span className="text-teal">{t('hero.title').split(',')[1]}</span>
                    </h1>

                </div>

                <Link
                    href="#"
                    className="relative inline-flex items-center justify-center rounded-md border-2 border-gold px-8 py-3 text-base font-bold uppercase tracking-wide text-gold transition-all duration-300 ease-in-out hover:bg-gold hover:text-foreground hover:shadow-lg hover:shadow-gold/50"
                >
                    {t('hero.cta')}
                </Link>
            </div>
        </section>
    );
}
