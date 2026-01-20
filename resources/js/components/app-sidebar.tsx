import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem, type User as UserType } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Package, User, ShoppingBag, Home, Users, BoxIcon, Percent, Ticket } from 'lucide-react';
import AppLogo from './app-logo';
import { useTranslation } from '@/hooks/use-translation';

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: UserType } }>().props;
    const { t, route } = useTranslation();

    // Check if user has admin role (Spatie)
    const isAdmin = auth?.user?.roles?.some((role) => role.name === 'admin') ?? false;

    const simpleUserNavItems: NavItem[] = [
        {
            title: t('sidebar.dashboard', 'Dashboard'),
            href: route('dashboard'),
            icon: LayoutGrid,
        },
        {
            title: t('sidebar.my_orders', 'My Orders'),
            href: route('orders.index'),
            icon: Package,
        },
        {
            title: t('sidebar.profile', 'Profile'),
            href: route('profile.edit'),
            icon: User,
        },
        {
            title: t('sidebar.shop', 'Shop'),
            href: route('products.index'),
            icon: ShoppingBag,
        },
    ];

    const adminNavItems: NavItem[] = [
        {
            title: t('sidebar.dashboard', 'Dashboard'),
            href: route('admin.dashboard'),
            icon: LayoutGrid,
        },
        {
            title: t('sidebar.manage_products', 'Manage Products'),
            icon: BoxIcon,
            items: [
                {
                    title: t('sidebar.manage_products.all', 'All Products'),
                    href: route('admin.products.index'),
                },
                {
                    title: t('sidebar.manage_products.add', 'Add Product'),
                    href: route('admin.products.create'),
                },
                {
                    title: t('sidebar.manage_products.categories', 'Categories'),
                    href: route('admin.categories.index'),
                },
                {
                    title: t('sidebar.manage_products.brands', 'Brands'),
                    href: route('admin.brands.index'),
                },
            ],
        },
        {
            title: t('sidebar.discounts', 'Discounts'),
            icon: Percent,
            items: [
                {
                    title: t('sidebar.product_discounts', 'Product Discounts'),
                    href: route('admin.product-discounts.index'),
                },
                {
                    title: t('sidebar.promo_codes', 'Promo Codes'),
                    href: route('admin.promo-codes.index'),
                },
            ],
        },
        {
            title: t('sidebar.manage_orders', 'Manage Orders'),
            href: route('admin.orders.index'),
            icon: Package,
        },
        {
            title: t('sidebar.manage_users', 'Manage Users'),
            href: route('admin.users.index'),
            icon: Users,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: t('sidebar.back_to_store', 'Back to Store'),
            href: route('home'),
            icon: Home,
        },
    ];

    // Select appropriate nav items based on role
    const mainNavItems = isAdmin ? adminNavItems : simpleUserNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('home')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
