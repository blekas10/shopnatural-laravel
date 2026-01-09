import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';
import { Home } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { route } = useTranslation();

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                {/* Home link for mobile */}
                <Link
                    href={route('home')}
                    className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
                    title="Back to store"
                >
                    <Home className="h-5 w-5 text-muted-foreground" />
                </Link>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}
