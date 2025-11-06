import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { dashboard } from '@/routes';
import { useTranslation } from '@/hooks/use-translation';

interface AdminDashboardProps {
    auth: {
        user: User;
    };
}

export default function AdminDashboard({ auth }: AdminDashboardProps) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('dashboard.title', 'Dashboard'),
            href: dashboard().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dashboard.title', 'Dashboard')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-4xl font-bold uppercase tracking-wide text-gold">
                                {t('dashboard.admin.hello', 'Hello Admin, {name}!').replace('{name}', auth.user.name)}
                            </h1>
                            <p className="mt-4 text-lg text-muted-foreground">
                                {t('dashboard.admin.welcome', 'Welcome to your admin dashboard. You have full access to manage the system.')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
