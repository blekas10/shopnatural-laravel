import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { CartProvider } from './contexts/cart-context';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <CartProvider>
                    <App {...props} />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: 'hsl(var(--background))',
                                color: 'hsl(var(--foreground))',
                                border: '2px solid hsl(var(--border))',
                                fontSize: '14px',
                                fontWeight: '500',
                                padding: '16px 20px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                                opacity: '1',
                                backdropFilter: 'blur(8px)',
                            },
                            className: 'toast',
                        }}
                        richColors
                        expand={false}
                        duration={4000}
                    />
                </CartProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
