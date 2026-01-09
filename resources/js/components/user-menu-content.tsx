import { Link, router } from '@inertiajs/react';
import { User, Package, Settings, LogOut, Languages } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface UserMenuContentProps {
    user: {
        name: string;
        email: string;
    };
}

const flagEmojis: Record<string, string> = {
    en: '🇬🇧',
    lt: '🇱🇹',
};

const languageNames: Record<string, string> = {
    en: 'English',
    lt: 'Lietuvių',
};

export function UserMenuContent({ user }: UserMenuContentProps) {
    const { t, route, locale, availableLocales, switchLocale } = useTranslation();

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const handleLanguageSwitch = () => {
        const currentIndex = availableLocales.indexOf(locale);
        const nextIndex = (currentIndex + 1) % availableLocales.length;
        switchLocale(availableLocales[nextIndex]);
    };

    const nextLocale = availableLocales[(availableLocales.indexOf(locale) + 1) % availableLocales.length];

    return (
        <div className="py-2">
            {/* User Info */}
            <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>

            {/* Menu Items */}
            <div className="py-1">
                <Link
                    href={route('dashboard')}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gold/10 hover:text-gold transition-colors"
                >
                    <User className="size-4" />
                    {t('auth.dashboard', 'Dashboard')}
                </Link>
                <Link
                    href={route('orders.index')}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gold/10 hover:text-gold transition-colors"
                >
                    <Package className="size-4" />
                    {t('nav.my_orders', 'My Orders')}
                </Link>
                <Link
                    href={route('profile.edit')}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gold/10 hover:text-gold transition-colors"
                >
                    <Settings className="size-4" />
                    {t('nav.settings', 'Settings')}
                </Link>
            </div>

            {/* Language Switcher */}
            <div className="border-t py-1">
                <button
                    onClick={handleLanguageSwitch}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gold/10 hover:text-gold transition-colors"
                >
                    <Languages className="size-4" />
                    <span className="flex items-center gap-2">
                        <span>{flagEmojis[nextLocale]}</span>
                        <span>{languageNames[nextLocale]}</span>
                    </span>
                </button>
            </div>

            {/* Logout */}
            <div className="border-t py-1">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gold/10 hover:text-gold transition-colors"
                >
                    <LogOut className="size-4" />
                    {t('auth.logout', 'Logout')}
                </button>
            </div>
        </div>
    );
}
