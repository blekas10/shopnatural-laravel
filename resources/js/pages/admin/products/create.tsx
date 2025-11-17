import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { useTranslation } from '@/hooks/use-translation';

export default function AdminProductCreate() {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('sidebar.dashboard', 'Dashboard'),
            href: dashboard().url,
        },
        {
            title: t('sidebar.manage_products.all', 'All Products'),
            href: '/admin/products',
        },
        {
            title: t('sidebar.manage_products.add', 'Add Product'),
            href: '/admin/products/create',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('sidebar.manage_products.add', 'Add Product')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-4xl font-bold uppercase tracking-wide text-gold">
                                Hey - Add Product Page
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
