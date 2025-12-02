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
    const { auth } = usePage<{ auth: { user: { name: string; email: string } | null } }>().props;
    const { url } = usePage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
    const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
    const [mobileBrandsOpen, setMobileBrandsOpen] = useState(false);
    const [desktopCategoriesOpen, setDesktopCategoriesOpen] = useState(false);
    const [desktopBrandsOpen, setDesktopBrandsOpen] = useState(false);
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
    const brandsDropdownRef = useRef<HTMLDivElement>(null);
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

    // Brand links with IDs for filtering
    const brandLinks = [
        {
            name: 'Naturalmente',
            id: 1,
            slug: 'naturalmente',
            logo: '/images/brands/naturalmente-logo.png',
        },
        {
            name: 'MY.ORGANICS',
            id: 12,
            slug: 'my-organics',
            logo: '/images/brands/my-organics-logo.png',
        },
        {
            name: 'Breathe',
            id: 29,
            slug: 'breathe',
            logo: '/images/brands/breathe-logo.jpg',
        },
        {
            name: 'Essere',
            id: 21,
            slug: 'essere',
            logo: '/images/brands/essere-logo.png',
        },
        {
            name: 'Gentleman',
            id: 25,
            slug: 'gentleman',
            logo: '/images/brands/gentleman-logo.png',
        },
    ];

    // Category sections matching database structure
    const categorySections = [
        {
            title: t('nav.categories_brands', 'Brands'),
            items: [
                { label: 'Naturalmente', href: route('brands.show', { slug: 'naturalmente' }) },
                { label: 'MY.ORGANICS', href: route('brands.show', { slug: 'my-organics' }) },
                { label: 'Breathe', href: route('brands.show', { slug: 'breathe' }) },
                { label: 'Essere', href: route('brands.show', { slug: 'essere' }) },
                { label: 'Gentleman', href: route('brands.show', { slug: 'gentleman' }) },
            ],
        },
        {
            title: t('nav.categories_hair_care', 'Hair Care'),
            items: [
                { label: t('categories.shampoos', 'Shampoos'), href: `${route('products.index')}?categories=87` },
                { label: t('categories.conditioners', 'Conditioners'), href: `${route('products.index')}?categories=83` },
                { label: t('categories.hair_masks', 'Hair Masks'), href: `${route('products.index')}?categories=84` },
                { label: t('categories.color_products', 'Color Products'), href: `${route('products.index')}?categories=81` },
                { label: t('categories.leave_in_treatments', 'Leave-In Treatments'), href: `${route('products.index')}?categories=85` },
                { label: t('categories.oils_creams', 'Oils, Creams'), href: `${route('products.index')}?categories=86` },
                { label: t('categories.color_protection', 'Color Protection'), href: `${route('products.index')}?categories=82` },
                { label: t('categories.sun_protection_hair', 'Sun Protection for Hair'), href: `${route('products.index')}?categories=88` },
            ],
        },
        {
            title: t('nav.categories_hair_condition', 'Hair Condition'),
            items: [
                { label: t('categories.blonde_hair', 'Blonde Hair'), href: `${route('products.index')}?categories=90` },
                { label: t('categories.colored_hair', 'Colored Hair'), href: `${route('products.index')}?categories=91` },
                { label: t('categories.damaged_hair', 'Damaged Hair'), href: `${route('products.index')}?categories=92` },
                { label: t('categories.dry_hair', 'Dry Hair'), href: `${route('products.index')}?categories=93` },
                { label: t('categories.frizzy_hair', 'Frizzy Hair'), href: `${route('products.index')}?categories=94` },
                { label: t('categories.hair_loss', 'Hair Loss'), href: `${route('products.index')}?categories=95` },
                { label: t('categories.healthy_normal_hair', 'Healthy, Normal Hair'), href: `${route('products.index')}?categories=96` },
                { label: t('categories.oily_hair', 'Oily Hair'), href: `${route('products.index')}?categories=97` },
                { label: t('categories.split_ends', 'Split Ends'), href: `${route('products.index')}?categories=98` },
            ],
        },
        {
            title: t('nav.categories_styling', 'Styling Products'),
            items: [
                { label: t('categories.glossing_products', 'Glossing Products'), href: `${route('products.index')}?categories=109` },
                { label: t('categories.hair_styling_creams', 'Hair Styling Creams, Gels'), href: `${route('products.index')}?categories=110` },
                { label: t('categories.hairsprays', 'Hairsprays'), href: `${route('products.index')}?categories=111` },
                { label: t('categories.heat_protection', 'Heat Protection'), href: `${route('products.index')}?categories=112` },
                { label: t('categories.mousses', 'Mousses'), href: `${route('products.index')}?categories=113` },
                { label: t('categories.volumizing', 'Volumizing'), href: `${route('products.index')}?categories=114` },
                { label: t('categories.waxes', 'Waxes'), href: `${route('products.index')}?categories=115` },
            ],
        },
        {
            title: t('nav.categories_others', 'Others'),
            items: [
                { label: t('categories.face', 'Face'), href: `${route('products.index')}?categories=59` },
                { label: t('categories.body_care', 'Body Care'), href: `${route('products.index')}?categories=58` },
                { label: t('categories.men', 'Men'), href: `${route('products.index')}?categories=117` },
            ],
        },
    ];

    // Click-outside detection for desktop dropdowns
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDesktopCategoriesOpen(false);
            }
            if (
                brandsDropdownRef.current &&
                !brandsDropdownRef.current.contains(event.target as Node)
            ) {
                setDesktopBrandsOpen(false);
            }
        }

        if (desktopCategoriesOpen || desktopBrandsOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [desktopCategoriesOpen, desktopBrandsOpen]);

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
                            {/* Shop */}
                            <Link
                                href={route('products.index')}
                                className={cn(
                                    'relative cursor-pointer rounded-md px-3 py-2 text-base font-bold tracking-wide uppercase transition-colors duration-300 ease-in-out after:absolute after:bottom-1.5 after:left-3 after:h-[1.5px] after:bg-gold after:transition-all after:duration-300 after:ease-in-out hover:text-gold hover:after:w-[calc(100%-1.5rem)]',
                                    url.startsWith('/products')
                                        ? 'text-gold after:w-[calc(100%-1.5rem)]'
                                        : 'text-foreground after:w-0',
                                )}
                            >
                                {t('nav.shop')}
                            </Link>

                            {/* Categories with click-controlled full-width dropdown */}
                            <div ref={dropdownRef}>
                                <button
                                    onClick={() => {
                                        setDesktopCategoriesOpen(!desktopCategoriesOpen);
                                        setDesktopBrandsOpen(false);
                                    }}
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
                                            desktopCategoriesOpen && 'rotate-180',
                                        )}
                                    />
                                </button>
                            </div>

                            {/* Brands with click-controlled full-width dropdown */}
                            <div ref={brandsDropdownRef}>
                                <button
                                    onClick={() => {
                                        setDesktopBrandsOpen(!desktopBrandsOpen);
                                        setDesktopCategoriesOpen(false);
                                    }}
                                    className={cn(
                                        'relative flex cursor-pointer items-center gap-1 rounded-md px-4 py-2 text-base font-bold tracking-wide uppercase transition-colors duration-300 ease-in-out after:absolute after:bottom-1.5 after:left-4 after:h-[1.5px] after:bg-gold after:transition-all after:duration-300 after:ease-in-out',
                                        desktopBrandsOpen
                                            ? 'text-gold after:w-[calc(100%-2rem)]'
                                            : 'text-foreground after:w-0 hover:text-gold hover:after:w-[calc(100%-2rem)]',
                                    )}
                                    aria-expanded={desktopBrandsOpen}
                                    aria-haspopup="true"
                                >
                                    {t('nav.brands', 'Brands')}
                                    <ChevronDown
                                        className={cn(
                                            'size-4 transition-transform duration-300',
                                            desktopBrandsOpen && 'rotate-180',
                                        )}
                                    />
                                </button>
                            </div>

                            {/* About */}
                            <Link
                                href={route('about')}
                                className={cn(
                                    'relative cursor-pointer rounded-md px-3 py-2 text-base font-bold tracking-wide uppercase transition-colors duration-300 ease-in-out after:absolute after:bottom-1.5 after:left-3 after:h-[1.5px] after:bg-gold after:transition-all after:duration-300 after:ease-in-out hover:text-gold hover:after:w-[calc(100%-1.5rem)]',
                                    url.startsWith('/about')
                                        ? 'text-gold after:w-[calc(100%-1.5rem)]'
                                        : 'text-foreground after:w-0',
                                )}
                            >
                                {t('nav.about')}
                            </Link>

                            {/* Contact */}
                            <Link
                                href={route('contact')}
                                className={cn(
                                    'relative cursor-pointer rounded-md px-3 py-2 text-base font-bold tracking-wide uppercase transition-colors duration-300 ease-in-out after:absolute after:bottom-1.5 after:left-3 after:h-[1.5px] after:bg-gold after:transition-all after:duration-300 after:ease-in-out hover:text-gold hover:after:w-[calc(100%-1.5rem)]',
                                    url.startsWith('/contact')
                                        ? 'text-gold after:w-[calc(100%-1.5rem)]'
                                        : 'text-foreground after:w-0',
                                )}
                            >
                                {t('nav.contact')}
                            </Link>

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

                    {/* Full-width brands mega menu */}
                    <div
                        className={cn(
                            'absolute top-full left-0 w-full border-t border-border bg-white shadow-xl transition-all duration-300 ease-in-out',
                            desktopBrandsOpen
                                ? 'visible translate-y-0 opacity-100'
                                : 'invisible -translate-y-4 opacity-0',
                        )}
                    >
                        <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
                            <div className="grid grid-cols-5 gap-4">
                                {brandLinks.map((brand) => (
                                    <Link
                                        key={brand.slug}
                                        href={`${route('products.index')}?brands=${brand.id}`}
                                        className="group flex flex-col items-center gap-3 rounded-lg border border-border p-4 transition-all hover:border-gold/50 hover:shadow-md"
                                        onClick={() => setDesktopBrandsOpen(false)}
                                    >
                                        <div className="flex h-16 w-full items-center justify-center">
                                            <img
                                                src={brand.logo}
                                                alt={brand.name}
                                                className="max-h-full max-w-full object-contain transition-all duration-300"
                                            />
                                        </div>
                                        <span className="text-sm font-bold tracking-wide text-gold uppercase">
                                            {brand.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
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
                            <div className="grid grid-cols-5 gap-8">
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
                            className="flex w-[280px] flex-col sm:w-[320px]"
                        >
                            <SheetHeader className="flex-shrink-0">
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

                            <nav className="mt-6 flex flex-1 flex-col gap-2 overflow-y-auto pb-6">
                                {/* Shop */}
                                <Link
                                    href={route('products.index')}
                                    className={cn(
                                        'relative rounded-md px-3 py-2.5 text-base font-bold tracking-wide uppercase transition-colors after:absolute after:bottom-1 after:left-3 after:h-[1.5px] after:bg-gold after:transition-all after:duration-300 after:ease-in-out hover:text-gold hover:after:w-[calc(100%-1.5rem)]',
                                        url.startsWith('/products')
                                            ? 'text-gold after:w-[calc(100%-1.5rem)]'
                                            : 'text-foreground after:w-0',
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {t('nav.shop')}
                                </Link>

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

                                {/* Mobile Brands - Collapsible */}
                                <Collapsible
                                    open={mobileBrandsOpen}
                                    onOpenChange={setMobileBrandsOpen}
                                >
                                    <CollapsibleTrigger
                                        className={cn(
                                            'relative flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-base font-bold tracking-wide uppercase transition-colors duration-300 ease-in-out after:absolute after:bottom-1 after:left-3 after:h-[1.5px] after:bg-gold after:transition-all after:duration-300 after:ease-in-out',
                                            mobileBrandsOpen
                                                ? 'text-gold after:w-[calc(100%-1.5rem)]'
                                                : 'text-foreground after:w-0 hover:text-gold hover:after:w-0',
                                        )}
                                    >
                                        <span>{t('nav.brands', 'Brands')}</span>
                                        <ChevronDown
                                            className={cn(
                                                'size-4 transition-transform duration-300',
                                                mobileBrandsOpen && 'rotate-180',
                                            )}
                                        />
                                    </CollapsibleTrigger>

                                    <CollapsibleContent className="mt-1 ml-6 flex flex-col gap-1">
                                        {brandLinks.map((brand) => (
                                            <Link
                                                key={brand.slug}
                                                href={`${route('products.index')}?brands=${brand.id}`}
                                                className="rounded-md px-3 py-2 text-sm font-medium transition-colors duration-300 hover:text-gold"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {brand.name}
                                            </Link>
                                        ))}
                                    </CollapsibleContent>
                                </Collapsible>

                                {/* About */}
                                <Link
                                    href={route('about')}
                                    className={cn(
                                        'relative rounded-md px-3 py-2.5 text-base font-bold tracking-wide uppercase transition-colors after:absolute after:bottom-1 after:left-3 after:h-[1.5px] after:bg-gold after:transition-all after:duration-300 after:ease-in-out hover:text-gold hover:after:w-[calc(100%-1.5rem)]',
                                        url.startsWith('/about')
                                            ? 'text-gold after:w-[calc(100%-1.5rem)]'
                                            : 'text-foreground after:w-0',
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {t('nav.about')}
                                </Link>

                                {/* Contact */}
                                <Link
                                    href={route('contact')}
                                    className={cn(
                                        'relative rounded-md px-3 py-2.5 text-base font-bold tracking-wide uppercase transition-colors after:absolute after:bottom-1 after:left-3 after:h-[1.5px] after:bg-gold after:transition-all after:duration-300 after:ease-in-out hover:text-gold hover:after:w-[calc(100%-1.5rem)]',
                                        url.startsWith('/contact')
                                            ? 'text-gold after:w-[calc(100%-1.5rem)]'
                                            : 'text-foreground after:w-0',
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {t('nav.contact')}
                                </Link>

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
