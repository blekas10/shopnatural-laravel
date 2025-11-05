'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import LocaleSwitcher from '@/components/locale-switcher';
import { useTranslation } from '@/hooks/use-translation';

interface MainHeaderProps {
    className?: string;
}

export default function MainHeader({ className }: MainHeaderProps) {
    const { t, route } = useTranslation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
    const [desktopCategoriesOpen, setDesktopCategoriesOpen] = useState(false);
    const [mobileSectionsOpen, setMobileSectionsOpen] = useState<Record<string, boolean>>({});
    const dropdownRef = useRef<HTMLDivElement>(null);

    const navigationLinks = [
        { label: t('nav.home'), href: route('home') },
        { label: t('nav.shop'), href: route('products.index') },
        { label: t('nav.about'), href: route('about') },
    ];

    const categorySections = [
        {
            title: 'Face Care',
            items: [
                { label: 'Cleansers', href: '/categories/cleansers' },
                { label: 'Moisturizers', href: '/categories/moisturizers' },
                { label: 'Serums', href: '/categories/serums' },
                { label: 'Face Masks', href: '/categories/face-masks' },
            ],
        },
        {
            title: 'Body Care',
            items: [
                { label: 'Body Lotions', href: '/categories/body-lotions' },
                { label: 'Body Wash', href: '/categories/body-wash' },
                { label: 'Body Scrubs', href: '/categories/body-scrubs' },
                { label: 'Hand Care', href: '/categories/hand-care' },
            ],
        },
        {
            title: 'Hair Care',
            items: [
                { label: 'Shampoo', href: '/categories/shampoo' },
                { label: 'Conditioner', href: '/categories/conditioner' },
                { label: 'Hair Masks', href: '/categories/hair-masks' },
                { label: 'Styling', href: '/categories/styling' },
            ],
        },
        {
            title: 'Makeup',
            items: [
                { label: 'Foundation', href: '/categories/foundation' },
                { label: 'Lipstick', href: '/categories/lipstick' },
                { label: 'Mascara', href: '/categories/mascara' },
                { label: 'Eyeshadow', href: '/categories/eyeshadow' },
            ],
        },
    ];

    // Click-outside detection for desktop categories dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDesktopCategoriesOpen(false);
            }
        }

        if (desktopCategoriesOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [desktopCategoriesOpen]);

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full border-b bg-background',
                className
            )}
        >
            <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-6 lg:px-8">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 transition-opacity hover:opacity-80"
                >
                    <img
                        src="/images/shop-natural-logo.png"
                        alt="Shop Natural"
                        className="h-16 w-auto md:h-18"
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-6 md:flex">
                    {navigationLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="relative rounded-md px-3 py-2 text-base font-bold uppercase tracking-wide text-foreground transition-colors duration-300 ease-in-out cursor-pointer hover:text-gold after:absolute after:bottom-1.5 after:left-3 after:h-[1.5px] after:w-0 after:bg-gold after:transition-all after:duration-300 after:ease-in-out hover:after:w-[calc(100%-1.5rem)]"
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* Categories with click-controlled full-width dropdown */}
                    <div ref={dropdownRef}>
                        <button
                            onClick={() =>
                                setDesktopCategoriesOpen(
                                    !desktopCategoriesOpen
                                )
                            }
                            className={cn(
                                'relative flex items-center gap-1 rounded-md px-4 py-2 text-base font-bold uppercase tracking-wide transition-colors duration-300 ease-in-out cursor-pointer after:absolute after:bottom-1.5 after:left-4 after:h-[1.5px] after:bg-gold after:transition-all after:duration-300 after:ease-in-out',
                                desktopCategoriesOpen
                                    ? 'text-gold after:w-[calc(100%-2rem)]'
                                    : 'text-foreground hover:text-gold after:w-0 hover:after:w-[calc(100%-2rem)]'
                            )}
                            aria-expanded={desktopCategoriesOpen}
                            aria-haspopup="true"
                        >
                            {t('nav.categories')}
                            <ChevronDown
                                className={cn(
                                    'size-4 transition-transform duration-300',
                                    desktopCategoriesOpen && 'rotate-180'
                                )}
                            />
                        </button>
                    </div>

                    {/* Desktop Locale Switcher */}
                    <LocaleSwitcher />
                </nav>

                {/* Mobile Actions */}
                <div className="flex items-center gap-2 md:hidden">
                    <LocaleSwitcher />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu className="size-6" />
                    </Button>
                </div>
            </div>

            {/* Full-width categories mega menu */}
            <div
                className={cn(
                    'absolute left-0 top-full w-full bg-white border-t border-border shadow-xl transition-all duration-300 ease-in-out',
                    desktopCategoriesOpen
                        ? 'opacity-100 translate-y-0 visible'
                        : 'opacity-0 -translate-y-4 invisible'
                )}
            >
                <div className="container mx-auto px-4 py-10 md:px-6 lg:px-8">
                    <div className="grid grid-cols-4 gap-10">
                        {categorySections.map((section) => (
                            <div key={section.title} className="space-y-5">
                                <h3 className="text-base font-bold text-gold uppercase tracking-wide border-b-2 border-gold/20 pb-2">
                                    {section.title}
                                </h3>
                                <ul className="space-y-1">
                                    {section.items.map((item) => (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className="block rounded-md px-3 py-2.5 text-sm font-medium transition-all hover:text-gold cursor-pointer"
                                                onClick={() =>
                                                    setDesktopCategoriesOpen(
                                                        false
                                                    )
                                                }
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Sheet Sidebar */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                    <SheetHeader>
                        <SheetTitle>
                            <Link
                                href="/"
                                className="flex items-center"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <img
                                    src="/images/shop-natural-logo.png"
                                    alt="Shop Natural"
                                    className="h-10 w-auto"
                                />
                            </Link>
                        </SheetTitle>
                    </SheetHeader>

                    <nav className="mt-6 flex flex-col gap-2">
                        {navigationLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="relative rounded-md px-3 py-2.5 text-base font-bold uppercase tracking-wide text-foreground transition-colors hover:text-gold after:absolute after:bottom-1 after:left-3 after:h-[1.5px] after:w-0 after:bg-gold after:transition-all after:duration-300 after:ease-in-out hover:after:w-[calc(100%-1.5rem)]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Mobile Categories - Nested Collapsible */}
                        <Collapsible
                            open={mobileCategoriesOpen}
                            onOpenChange={setMobileCategoriesOpen}
                        >
                            <CollapsibleTrigger
                                className={cn(
                                    'relative flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-base font-bold uppercase tracking-wide transition-colors duration-300 ease-in-out after:absolute after:bottom-1 after:left-3 after:h-[1.5px] after:bg-gold after:transition-all after:duration-300 after:ease-in-out',
                                    mobileCategoriesOpen
                                        ? 'text-gold after:w-[calc(100%-1.5rem)]'
                                        : 'text-foreground hover:text-gold after:w-0 hover:after:w-0'
                                )}
                            >
                                <span>{t('nav.categories')}</span>
                                <ChevronDown
                                    className={cn(
                                        'size-4 transition-transform duration-300',
                                        mobileCategoriesOpen && 'rotate-180'
                                    )}
                                />
                            </CollapsibleTrigger>

                            <CollapsibleContent className="mt-2 flex flex-col gap-1">
                                {categorySections.map((section) => {
                                    const isOpen = mobileSectionsOpen[section.title] || false;
                                    return (
                                        <Collapsible
                                            key={section.title}
                                            open={isOpen}
                                            onOpenChange={(open) => {
                                                if (open) {
                                                    // Close all other sections when opening this one
                                                    setMobileSectionsOpen({
                                                        [section.title]: true,
                                                    });
                                                } else {
                                                    // Just close this section
                                                    setMobileSectionsOpen((prev) => ({
                                                        ...prev,
                                                        [section.title]: false,
                                                    }));
                                                }
                                            }}
                                        >
                                            <CollapsibleTrigger
                                                className={cn(
                                                    'relative flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-bold uppercase tracking-wide transition-all duration-300 ease-in-out after:absolute after:bottom-0.5 after:left-3 after:h-[1.5px] after:bg-gold after:transition-all after:duration-300 after:ease-in-out',
                                                    isOpen
                                                        ? 'text-gold after:w-[calc(100%-1.5rem)]'
                                                        : 'text-foreground hover:text-gold after:w-0 hover:after:w-0'
                                                )}
                                            >
                                                <span>{section.title}</span>
                                                <ChevronDown
                                                    className={cn(
                                                        'size-3 transition-transform duration-300 ease-in-out',
                                                        isOpen && 'rotate-180'
                                                    )}
                                                />
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="ml-6 mt-1 flex flex-col gap-1">
                                                {section.items.map((item) => (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        className="rounded-md px-3 py-2 text-sm font-medium transition-colors duration-300 hover:text-gold"
                                                        onClick={() =>
                                                            setMobileMenuOpen(false)
                                                        }
                                                    >
                                                        {item.label}
                                                    </Link>
                                                ))}
                                            </CollapsibleContent>
                                        </Collapsible>
                                    );
                                })}
                            </CollapsibleContent>
                        </Collapsible>
                    </nav>
                </SheetContent>
            </Sheet>
        </header>
    );
}
