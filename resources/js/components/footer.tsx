import { Link } from '@inertiajs/react';
import { Facebook, Instagram } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

interface FooterProps {
    className?: string;
}

const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/shopnatural.lt', label: 'Facebook' },
    { icon: Instagram, href: 'https://www.instagram.com/shopnatural.lt', label: 'Instagram' },
];

export default function Footer({ className }: FooterProps) {
    const { t, route } = useTranslation();

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
                        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-end">
                            <input
                                type="email"
                                placeholder={t('footer.newsletter.placeholder')}
                                className="flex-1 rounded-md border-2 border-border bg-background px-4 py-2 text-sm text-foreground transition-colors duration-300 placeholder:text-foreground/50 focus:border-gold focus:outline-none lg:w-[70%]"
                            />
                            <button className="inline-flex items-center justify-center rounded-md border-2 border-gold bg-gold px-6 py-2 text-sm font-bold uppercase tracking-wide text-foreground transition-all duration-300 ease-in-out hover:bg-background hover:text-gold hover:shadow-lg hover:shadow-gold/50">
                                {t('footer.newsletter.button')}
                            </button>
                        </div>

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
