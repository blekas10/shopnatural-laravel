'use client';

import { AuthModal } from '@/components/auth/auth-modal';
import { CartDrawer } from '@/components/cart-drawer';
import LocaleSwitcher from '@/components/locale-switcher';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/contexts/wishlist-context';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Heart, LogOut, Menu, ShoppingCart, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface MainHeaderProps {
    className?: string;
}

export default function MainHeader({ className }: MainHeaderProps) {
    const { t, route } = useTranslation();
    const { itemCount } = useCart();
    const { itemCount: wishlistCount } = useWishlist();
    const { auth } = usePage().props as any;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
    const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
    const [desktopCategoriesOpen, setDesktopCategoriesOpen] = useState(false);
    const [mobileSectionsOpen, setMobileSectionsOpen] = useState<
        Record<string, boolean>
    >({});
    const [authModal, setAuthModal] = useState<{
        isOpen: boolean;
        view: 'login' | 'register';
    }>({
        isOpen: false,
        view: 'login',
    });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLElement>(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    // Measure header height dynamically
    useEffect(() => {
        const updateHeaderHeight = () => {
            if (headerRef.current) {
                const height = headerRef.current.offsetHeight;
                setHeaderHeight(height);
            }
        };

        // Initial measurement
        updateHeaderHeight();

        // Watch for resize changes
        const resizeObserver = new ResizeObserver(updateHeaderHeight);
        if (headerRef.current) {
            resizeObserver.observe(headerRef.current);
        }

        // Also update on window resize
        window.addEventListener('resize', updateHeaderHeight);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateHeaderHeight);
        };
    }, []);

    // Update height when categories dropdown opens/closes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (headerRef.current) {
                setHeaderHeight(headerRef.current.offsetHeight);
            }
        }, 300); // Match the transition duration

        return () => clearTimeout(timer);
    }, [desktopCategoriesOpen]);

    // Helper to get user initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

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

    // Listen for cart open event
    useEffect(() => {
        const handleOpenCart = () => {
            setCartDrawerOpen(true);
        };

        window.addEventListener('openCart', handleOpenCart);

        return () => {
            window.removeEventListener('openCart', handleOpenCart);
        };
    }, []);

    // Compensate for scrollbar when drawer is open
    useEffect(() => {
        if (cartDrawerOpen && headerRef.current) {
            const scrollbarWidth =
                window.innerWidth - document.documentElement.clientWidth;
            headerRef.current.style.paddingRight = `${scrollbarWidth}px`;
        } else if (headerRef.current) {
            headerRef.current.style.paddingRight = '';
        }
    }, [cartDrawerOpen]);

    return (
        <>
            {/* Main Header */}
            <header
                ref={headerRef}
                className={cn(
                    'fixed top-0 z-40 w-full border-b bg-background',
                    className,
                )}
            >
                <div>
                    {' '}
                    {/* Top Banner */}
                    <div className="w-full bg-white border-b border-border">
                        <div className="container mx-auto flex items-center justify-end px-4 py-2 md:px-6 lg:px-8">
                            <div className="flex items-center space-x-4">
                                {auth?.user ? (
                                    <span className="text-sm text-foreground">
                                        <span className="hidden sm:inline">
                                            {t('auth.welcome', 'Welcome')},{' '}
                                        </span>
                                        {auth.user.name}
                                    </span>
                                ) : (
                                    <>
                                        <button
                                            onClick={() =>
                                                setAuthModal({
                                                    isOpen: true,
                                                    view: 'register',
                                                })
                                            }
                                            className="cursor-pointer text-sm text-foreground transition-colors hover:text-gold uppercase"
                                        >
                                            {t('auth.register', 'Register')}
                                        </button>
                                        <span className="text-foreground">|</span>
                                        <button
                                            onClick={() =>
                                                setAuthModal({
                                                    isOpen: true,
                                                    view: 'login',
                                                })
                                            }
                                            className="cursor-pointer text-sm text-foreground transition-colors hover:text-gold uppercase"
                                        >
                                            {t('auth.login', 'Login')}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="">
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
                                    className="relative cursor-pointer rounded-md px-3 py-2 text-base font-bold tracking-wide text-foreground uppercase transition-colors duration-300 ease-in-out after:absolute after:bottom-1.5 after:left-3 after:h-[1.5px] after:w-0 after:bg-gold after:transition-all after:duration-300 after:ease-in-out hover:text-gold hover:after:w-[calc(100%-1.5rem)]"
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* Categories with click-controlled full-width dropdown */}
                            <div ref={dropdownRef}>
                                <button
                                    onClick={() =>
                                        setDesktopCategoriesOpen(
                                            !desktopCategoriesOpen,
                                        )
                                    }
                                    className={cn(
                                        'relative flex cursor-pointer items-center gap-1 rounded-md px-4 py-2 text-base font-bold tracking-wide uppercase transition-colors duration-300 ease-in-out after:absolute after:bottom-1.5 after:left-4 after:h-[1.5px] after:bg-gold after:transition-all after:duration-300 after:ease-in-out',
                                        desktopCategoriesOpen
                                            ? 'text-gold after:w-[calc(100%-2rem)]'
                                            : 'text-foreground after:w-0 hover:text-gold hover:after:w-[calc(100%-2rem)]',
                                    )}
                                    aria-expanded={desktopCategoriesOpen}
                                    aria-haspopup="true"
                                >
                                    {t('nav.categories')}
                                    <ChevronDown
                                        className={cn(
                                            'size-4 transition-transform duration-300',
                                            desktopCategoriesOpen &&
                                                'rotate-180',
                                        )}
                                    />
                                </button>
                            </div>

                            {/* Desktop Locale Switcher */}
                            <LocaleSwitcher />

                            {/* Desktop User Avatar/Icon */}
                            {auth?.user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="cursor-pointer p-2 text-gray-600 hover:text-gray-900">
                                            <span className="sr-only">
                                                {t(
                                                    'nav.my_account',
                                                    'My Account',
                                                )}
                                            </span>
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-gradient-to-br from-gold to-gold/80 text-sm font-bold text-white">
                                                    {getInitials(
                                                        auth.user.name,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-64"
                                        align="end"
                                        sideOffset={8}
                                    >
                                        <UserMenuContent user={auth.user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <button
                                    onClick={() =>
                                        setAuthModal({
                                            isOpen: true,
                                            view: 'login',
                                        })
                                    }
                                    className="cursor-pointer p-2 text-gray-600 hover:text-gray-900"
                                >
                                    <span className="sr-only">
                                        {t('nav.my_account', 'My Account')}
                                    </span>
                                    <User className="size-6" />
                                </button>
                            )}

                            {/* Desktop Wishlist Icon */}
                            {auth?.user && wishlistCount > 0 && (
                                <Link
                                    href={route('wishlist')}
                                    className="relative rounded-md p-2 transition-colors hover:bg-muted"
                                    aria-label="Wishlist"
                                >
                                    <Heart className="size-6 text-foreground" />
                                    <AnimatePresence>
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-gold text-xs font-bold text-white"
                                        >
                                            {wishlistCount}
                                        </motion.span>
                                    </AnimatePresence>
                                </Link>
                            )}

                            {/* Desktop Cart Icon */}
                            <button
                                onClick={() => setCartDrawerOpen(true)}
                                className="relative rounded-md p-2 transition-colors hover:bg-muted"
                                aria-label="Shopping cart"
                            >
                                <ShoppingCart className="size-6 text-foreground" />
                                <AnimatePresence>
                                    {itemCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-gold text-xs font-bold text-white"
                                        >
                                            {itemCount}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        </nav>

                        {/* Mobile Actions */}
                        <div className="flex items-center gap-2 md:hidden">
                            <LocaleSwitcher />

                            {/* Mobile Wishlist Icon */}
                            {auth?.user && wishlistCount > 0 && (
                                <Link
                                    href={route('wishlist')}
                                    className="relative rounded-md p-2 transition-colors hover:bg-muted"
                                    aria-label="Wishlist"
                                >
                                    <Heart className="size-6 text-foreground" />
                                    <AnimatePresence>
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-gold text-xs font-bold text-white"
                                        >
                                            {wishlistCount}
                                        </motion.span>
                                    </AnimatePresence>
                                </Link>
                            )}

                            {/* Mobile Cart Icon */}
                            <button
                                onClick={() => setCartDrawerOpen(true)}
                                className="relative rounded-md p-2 transition-colors hover:bg-muted"
                                aria-label="Shopping cart"
                            >
                                <ShoppingCart className="size-6 text-foreground" />
                                <AnimatePresence>
                                    {itemCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-gold text-xs font-bold text-white"
                                        >
                                            {itemCount}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>

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
                            'absolute top-full left-0 w-full border-t border-border bg-white shadow-xl transition-all duration-300 ease-in-out',
                            desktopCategoriesOpen
                                ? 'visible translate-y-0 opacity-100'
                                : 'invisible -translate-y-4 opacity-0',
                        )}
                    >
                        <div className="container mx-auto px-4 py-10 md:px-6 lg:px-8">
                            <div className="grid grid-cols-4 gap-10">
                                {categorySections.map((section) => (
                                    <div
                                        key={section.title}
                                        className="space-y-5"
                                    >
                                        <h3 className="border-b-2 border-gold/20 pb-2 text-base font-bold tracking-wide text-gold uppercase">
                                            {section.title}
                                        </h3>
                                        <ul className="space-y-1">
                                            {section.items.map((item) => (
                                                <li key={item.href}>
                                                    <Link
                                                        href={item.href}
                                                        className="block cursor-pointer rounded-md px-3 py-2.5 text-sm font-medium transition-all hover:text-gold"
                                                        onClick={() =>
                                                            setDesktopCategoriesOpen(
                                                                false,
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
                    <Sheet
                        open={mobileMenuOpen}
                        onOpenChange={setMobileMenuOpen}
                    >
                        <SheetContent
                            side="right"
                            className="w-[280px] sm:w-[320px]"
                        >
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
                                        className="relative rounded-md px-3 py-2.5 text-base font-bold tracking-wide text-foreground uppercase transition-colors after:absolute after:bottom-1 after:left-3 after:h-[1.5px] after:w-0 after:bg-gold after:transition-all after:duration-300 after:ease-in-out hover:text-gold hover:after:w-[calc(100%-1.5rem)]"
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
                                            'relative flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-base font-bold tracking-wide uppercase transition-colors duration-300 ease-in-out after:absolute after:bottom-1 after:left-3 after:h-[1.5px] after:bg-gold after:transition-all after:duration-300 after:ease-in-out',
                                            mobileCategoriesOpen
                                                ? 'text-gold after:w-[calc(100%-1.5rem)]'
                                                : 'text-foreground after:w-0 hover:text-gold hover:after:w-0',
                                        )}
                                    >
                                        <span>{t('nav.categories')}</span>
                                        <ChevronDown
                                            className={cn(
                                                'size-4 transition-transform duration-300',
                                                mobileCategoriesOpen &&
                                                    'rotate-180',
                                            )}
                                        />
                                    </CollapsibleTrigger>

                                    <CollapsibleContent className="mt-2 flex flex-col gap-1">
                                        {categorySections.map((section) => {
                                            const isOpen =
                                                mobileSectionsOpen[
                                                    section.title
                                                ] || false;
                                            return (
                                                <Collapsible
                                                    key={section.title}
                                                    open={isOpen}
                                                    onOpenChange={(open) => {
                                                        if (open) {
                                                            // Close all other sections when opening this one
                                                            setMobileSectionsOpen(
                                                                {
                                                                    [section.title]: true,
                                                                },
                                                            );
                                                        } else {
                                                            // Just close this section
                                                            setMobileSectionsOpen(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [section.title]: false,
                                                                }),
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <CollapsibleTrigger
                                                        className={cn(
                                                            'relative flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-bold tracking-wide uppercase transition-all duration-300 ease-in-out after:absolute after:bottom-0.5 after:left-3 after:h-[1.5px] after:bg-gold after:transition-all after:duration-300 after:ease-in-out',
                                                            isOpen
                                                                ? 'text-gold after:w-[calc(100%-1.5rem)]'
                                                                : 'text-foreground after:w-0 hover:text-gold hover:after:w-0',
                                                        )}
                                                    >
                                                        <span>
                                                            {section.title}
                                                        </span>
                                                        <ChevronDown
                                                            className={cn(
                                                                'size-3 transition-transform duration-300 ease-in-out',
                                                                isOpen &&
                                                                    'rotate-180',
                                                            )}
                                                        />
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent className="mt-1 ml-6 flex flex-col gap-1">
                                                        {section.items.map(
                                                            (item) => (
                                                                <Link
                                                                    key={
                                                                        item.href
                                                                    }
                                                                    href={
                                                                        item.href
                                                                    }
                                                                    className="rounded-md px-3 py-2 text-sm font-medium transition-colors duration-300 hover:text-gold"
                                                                    onClick={() =>
                                                                        setMobileMenuOpen(
                                                                            false,
                                                                        )
                                                                    }
                                                                >
                                                                    {item.label}
                                                                </Link>
                                                            ),
                                                        )}
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            );
                                        })}
                                    </CollapsibleContent>
                                </Collapsible>

                                {/* Mobile Auth Links */}
                                <div className="mt-6 space-y-2 border-t pt-4">
                                    {auth?.user ? (
                                        <>
                                            <Link
                                                href={route('dashboard')}
                                                className="relative flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-bold tracking-wide text-foreground uppercase transition-colors after:absolute after:bottom-1 after:left-3 after:h-[1.5px] after:w-0 after:bg-gold after:transition-all after:duration-300 after:ease-in-out hover:text-gold hover:after:w-[calc(100%-1.5rem)]"
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
                                            >
                                                <User className="size-4" />
                                                {t('auth.dashboard')}
                                            </Link>
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="relative flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-base font-bold tracking-wide text-foreground uppercase transition-colors after:absolute after:bottom-1 after:left-3 after:h-[1.5px] after:w-0 after:bg-gold after:transition-all after:duration-300 after:ease-in-out hover:text-gold hover:after:w-[calc(100%-1.5rem)]"
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
                                            >
                                                <LogOut className="size-4" />
                                                {t('auth.logout')}
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setMobileMenuOpen(false);
                                                    setAuthModal({
                                                        isOpen: true,
                                                        view: 'login',
                                                    });
                                                }}
                                                className="relative flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-base font-bold tracking-wide text-foreground uppercase transition-colors after:absolute after:bottom-1 after:left-3 after:h-[1.5px] after:w-0 after:bg-gold after:transition-all after:duration-300 after:ease-in-out hover:text-gold hover:after:w-[calc(100%-1.5rem)]"
                                            >
                                                <User className="size-4" />
                                                {t('auth.login')}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setMobileMenuOpen(false);
                                                    setAuthModal({
                                                        isOpen: true,
                                                        view: 'register',
                                                    });
                                                }}
                                                className="relative flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-base font-bold tracking-wide text-foreground uppercase transition-colors after:absolute after:bottom-1 after:left-3 after:h-[1.5px] after:w-0 after:bg-gold after:transition-all after:duration-300 after:ease-in-out hover:text-gold hover:after:w-[calc(100%-1.5rem)]"
                                            >
                                                <User className="size-4" />
                                                {t('auth.register')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>

                    {/* Cart Drawer */}
                    <CartDrawer
                        isOpen={cartDrawerOpen}
                        onClose={() => setCartDrawerOpen(false)}
                    />

                    {/* Auth Modal */}
                    <AuthModal
                        isOpen={authModal.isOpen}
                        onClose={() =>
                            setAuthModal({ ...authModal, isOpen: false })
                        }
                        initialView={authModal.view}
                    />
                </div>
            </header>
            <div style={{ paddingTop: `${headerHeight}px` }}></div>
        </>
    );
}
