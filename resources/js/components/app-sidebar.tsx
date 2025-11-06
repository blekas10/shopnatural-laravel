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
import { dashboard } from '@/routes';
import { type NavItem, type User as UserType } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Package, User, ShoppingBag, Home, Settings, Users, BoxIcon } from 'lucide-react';
import AppLogo from './app-logo';
import { useTranslation } from '@/hooks/use-translation';

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: UserType } }>().props;
    const { t } = useTranslation();

    // Check if user has admin role
    const isAdmin = auth?.user?.roles?.some((role) => role.name === 'admin') ?? false;

    const simpleUserNavItems: NavItem[] = [
        {
            title: t('sidebar.dashboard', 'Dashboard'),
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: t('sidebar.my_orders', 'My Orders'),
            href: '/orders',
            icon: Package,
        },
        {
            title: t('sidebar.profile', 'Profile'),
            href: '/profile',
            icon: User,
        },
        {
            title: t('sidebar.shop', 'Shop'),
            href: '/products',
            icon: ShoppingBag,
        },
    ];

    const adminNavItems: NavItem[] = [
        {
            title: t('sidebar.dashboard', 'Dashboard'),
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: t('sidebar.manage_products', 'Manage Products'),
            href: '/admin/products',
            icon: BoxIcon,
        },
        {
            title: t('sidebar.manage_orders', 'Manage Orders'),
            href: '/admin/orders',
            icon: Package,
        },
        {
            title: t('sidebar.manage_users', 'Manage Users'),
            href: '/admin/users',
            icon: Users,
        },
        {
            title: t('sidebar.settings', 'Settings'),
            href: '/admin/settings',
            icon: Settings,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: t('sidebar.back_to_store', 'Back to Store'),
            href: '/',
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
                            <Link href={dashboard()} prefetch>
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
