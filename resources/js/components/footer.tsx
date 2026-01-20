import { Link, usePage } from '@inertiajs/react';
import { Facebook, Instagram, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { useState } from 'react';
import { toast } from 'sonner';

interface FooterProps {
    className?: string;
}

const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/shopnatural.lt', label: 'Facebook' },
    { icon: Instagram, href: 'https://www.instagram.com/shopnatural.lt', label: 'Instagram' },
];

export default function Footer({ className }: FooterProps) {
    const { t, route } = useTranslation();
    const { locale } = usePage<{ locale: string }>().props;

    // Newsletter state
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    // Category IDs: Face Care=60, Body Care=58, Hair Care=80
    const footerLinks = {
        shop: [
            { label: t('footer.all_products'), href: route('products.index') },
            { label: t('footer.face_care'), href: `${route('products.index')}?categories=60` },
            { label: t('footer.body_care'), href: `${route('products.index')}?categories=58` },
            { label: t('footer.hair_care'), href: `${route('products.index')}?categories=80` },
        ],

        support: [
            { label: t('footer.shipping_info'), href: route('shipping-policy') },
            { label: t('footer.returns'), href: route('return-policy') },
            { label: t('footer.privacy'), href: route('privacy-policy') },
        ],
    };

    // Handle newsletter subscription
    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous error
        setError('');

        // Validate email
        if (!email.trim()) {
            setError(t('footer.newsletter.error_empty', 'Please enter your email address'));
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError(t('footer.newsletter.error_invalid', 'Please enter a valid email address'));
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ email, locale }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsSuccess(true);
                setEmail('');
                toast.success(t('footer.newsletter.success', 'Thank you for subscribing! You will receive our latest updates.'));

                // Reset success message after 5 seconds
                setTimeout(() => setIsSuccess(false), 5000);
            } else {
                setError(t('footer.newsletter.error', 'Failed to subscribe. Please try again.'));
                toast.error(t('footer.newsletter.error', 'Failed to subscribe. Please try again.'));
            }
        } catch {
            setError(t('footer.newsletter.error', 'Failed to subscribe. Please try again.'));
            toast.error(t('footer.newsletter.error', 'Failed to subscribe. Please try again.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <footer className={cn('w-full border-t border-border bg-background', className)}>
            <div className="container mx-auto px-4 py-12 md:px-6 md:py-16 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-24 lg:gap-8">
                    {/* Logo and Description */}
                    <div className="lg:col-span-8">
                        <Link href="/" className="inline-block">
                            <img
                                src="/images/shop-natural-logo.png"
                                alt="Shop Natural"
                                className="h-16 w-auto"
                            />
                        </Link>
                        <p className="mt-4 text-sm text-foreground/70">
                            {t('footer.tagline')}
                        </p>
                    </div>

                    {/* Links Sections - Two Columns */}
                    <div className="grid grid-cols-2 gap-8 lg:col-span-8">
                        {/* Shop Links */}
                        <div>
                            <h3 className="mb-4 text-sm text-gold font-bold uppercase tracking-wide text-foreground">
                                {t('footer.shop')}
                            </h3>
                            <ul className="space-y-2">
                                {footerLinks.shop.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-foreground/70 transition-colors duration-300 hover:text-gold"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Support Links */}
                        <div>
                            <h3 className="mb-4 text-sm text-gold font-bold uppercase tracking-wide text-foreground">
                                {t('footer.support')}
                            </h3>
                            <ul className="space-y-2">
                                {footerLinks.support.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-foreground/70 transition-colors duration-300 hover:text-gold"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Subscribe and Social */}
                    <div className="lg:col-span-8 lg:text-right">
                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gold">
                            {t('footer.newsletter.title')}
                        </h3>
                        <form onSubmit={handleSubscribe} noValidate>
                            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-end">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError('');
                                    }}
                                    placeholder={t('footer.newsletter.placeholder')}
                                    disabled={isSubmitting || isSuccess}
                                    className={cn(
                                        "flex-1 rounded-md border-2 bg-background px-4 py-2 text-sm text-foreground transition-colors duration-300 placeholder:text-foreground/50 focus:outline-none lg:w-[70%]",
                                        error ? "border-red-500" : "border-border focus:border-gold",
                                        isSuccess && "border-green-500"
                                    )}
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isSuccess}
                                    className="inline-flex items-center justify-center rounded-md border-2 border-gold bg-gold px-6 py-2 text-sm font-bold uppercase tracking-wide text-foreground transition-all duration-300 ease-in-out hover:bg-background hover:text-gold hover:shadow-lg hover:shadow-gold/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            {t('footer.newsletter.subscribing', 'Subscribing...')}
                                        </>
                                    ) : isSuccess ? (
                                        <>
                                            <CheckCircle2 className="mr-2 size-4" />
                                            {t('footer.newsletter.subscribed', 'Subscribed!')}
                                        </>
                                    ) : (
                                        t('footer.newsletter.button')
                                    )}
                                </button>
                            </div>
                            {error && (
                                <p className="mt-2 text-sm text-red-500 lg:text-right">{error}</p>
                            )}
                        </form>

                        {/* Social Links */}
                        <div className="mt-6 flex gap-4 lg:justify-end">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        aria-label={social.label}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border text-foreground transition-all duration-300 hover:border-gold hover:text-gold"
                                    >
                                        <Icon className="h-5 w-5" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 border-t border-border pt-8">
                    <div className="flex flex-col items-center justify-between gap-4 text-sm text-foreground/60 md:flex-row">
                        <p>{t('footer.copyright').replace('{year}', new Date().getFullYear().toString())}</p>
                        <div className="flex gap-6">
                            <Link
                                href={route('privacy-policy')}
                                className="transition-colors duration-300 hover:text-gold"
                            >
                                {t('footer.privacy')}
                            </Link>
                            <Link
                                href={route('return-policy')}
                                className="transition-colors duration-300 hover:text-gold"
                            >
                                {t('footer.returns')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
