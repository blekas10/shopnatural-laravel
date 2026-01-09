import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';
import { Flag } from '@/components/country-selector';
import { type User } from '@/types';

const flagCodes: Record<string, string> = {
    en: 'GB',
    lt: 'LT',
};

export function UserInfo({
    user,
    showEmail = false,
    showFlag = true,
}: {
    user: User;
    showEmail?: boolean;
    showFlag?: boolean;
}) {
    const getInitials = useInitials();
    const { locale } = useTranslation();

    return (
        <>
            <div className="relative">
                <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>
                {showFlag && (
                    <div className="absolute -bottom-1 -right-1 rounded-sm bg-white shadow-sm ring-1 ring-border">
                        <Flag code={flagCodes[locale] || 'GB'} className="h-3 w-4" />
                    </div>
                )}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}
