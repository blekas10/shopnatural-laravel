import { Link, router } from '@inertiajs/react';
import { User, Package, Settings, LogOut, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Flag } from '@/components/country-selector';

interface UserMenuContentProps {
    user: {
        name: string;
        email: string;
    };
}

const flagCodes: Record<string, string> = {
    en: 'GB',
    lt: 'LT',
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

            {/* Language Selection */}
            <div className="border-t py-1">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t('settings.language', 'Language')}
                </div>
                {availableLocales.map((loc) => {
                    const isActive = loc === locale;
                    return (
                        <button
                            key={loc}
                            onClick={() => switchLocale(loc)}
                            className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${
                                isActive
                                    ? 'bg-gold/10 text-gold font-medium'
                                    : 'text-gray-700 hover:bg-gold/10 hover:text-gold'
                            }`}
                        >
                            <Flag code={flagCodes[loc]} className="h-4 w-6" />
                            <span className="flex-1 text-left">{languageNames[loc]}</span>
                            {isActive && <Check className="size-4" />}
                        </button>
                    );
                })}
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
