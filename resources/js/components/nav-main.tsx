import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { resolveUrl, cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useTranslation } from '@/hooks/use-translation';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const { t } = useTranslation();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="uppercase tracking-wide text-xs font-bold text-gold/70">
                {t('sidebar.account', 'ACCOUNT')}
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const isActive = item.href ? page.url.startsWith(resolveUrl(item.href)) : false;
                    const hasSubItems = item.items && item.items.length > 0;

                    if (hasSubItems) {
                        return (
                            <Collapsible key={item.title} asChild defaultOpen={false}>
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={{ children: item.title }}
                                            className="transition-colors hover:bg-gold/10 hover:text-gold"
                                        >
                                            {item.icon && <item.icon className="text-gold/80" />}
                                            <span>{item.title}</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-gold/60" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items!.map((subItem) => {
                                                const isSubActive = subItem.href ? page.url.startsWith(resolveUrl(subItem.href)) : false;
                                                return (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isSubActive}
                                                            className={cn(
                                                                'transition-colors hover:bg-gold/10 hover:text-gold',
                                                                isSubActive &&
                                                                    'bg-gold/10 text-gold hover:bg-gold/12 hover:text-gold font-bold'
                                                            )}
                                                        >
                                                            <Link href={subItem.href!} prefetch>
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                                className={cn(
                                    'transition-colors hover:bg-gold/10 hover:text-gold',
                                    isActive &&
                                        'bg-gold/10 text-gold hover:bg-gold/12 hover:text-gold font-bold'
                                )}
                            >
                                <Link href={item.href!} prefetch>
                                    {item.icon && <item.icon className={cn('text-gold/80', isActive && 'text-gold')} />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
