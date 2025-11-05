import { Link } from '@inertiajs/react';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps {
    className?: string;
}

const footerLinks = {
    shop: [
        { label: 'All Products', href: '/products' },
        { label: 'Face Care', href: '/categories/face-care' },
        { label: 'Body Care', href: '/categories/body-care' },
        { label: 'Hair Care', href: '/categories/hair-care' },
    ],

    support: [
        { label: 'Shipping Info', href: '/shipping' },
        { label: 'Returns', href: '/returns' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms & Conditions', href: '/terms' },
    ],
};

const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
];

export default function Footer({ className }: FooterProps) {
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
                            Natural beauty products that care for you and the planet.
                        </p>
                    </div>

                    {/* Links Sections - Two Columns */}
                    <div className="grid grid-cols-2 gap-8 lg:col-span-8">
                        {/* Shop Links */}
                        <div>
                            <h3 className="mb-4 text-sm text-gold font-bold uppercase tracking-wide text-foreground">
                                Shop
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
                                Support
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
                            Subscribe to Our Newsletter
                        </h3>
                        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-end">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="flex-1 rounded-md border-2 border-border bg-background px-4 py-2 text-sm text-foreground transition-colors duration-300 placeholder:text-foreground/50 focus:border-gold focus:outline-none lg:w-[70%]"
                            />
                            <button className="inline-flex items-center justify-center rounded-md border-2 border-gold bg-gold px-6 py-2 text-sm font-bold uppercase tracking-wide text-foreground transition-all duration-300 ease-in-out hover:bg-background hover:text-gold hover:shadow-lg hover:shadow-gold/50">
                                Subscribe
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
                        <p>© {new Date().getFullYear()} Shop Natural. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link
                                href="/privacy"
                                className="transition-colors duration-300 hover:text-gold"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/terms"
                                className="transition-colors duration-300 hover:text-gold"
                            >
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
