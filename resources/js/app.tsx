import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { CartProvider } from './contexts/cart-context';
import { WishlistProvider } from './contexts/wishlist-context';
import { initializeTheme } from './hooks/use-appearance';
import axios from 'axios';

// Configure axios to send CSRF token with all requests
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token.getAttribute('content');
} else {
    console.error('CSRF token not found');
}

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
                    <WishlistProvider>
                        <App {...props} />
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                style: {
                                    background: 'white',
                                    color: '#18181b',
                                    border: '2px solid #e4e4e7',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    padding: '16px 20px',
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                                },
                                className: 'toast',
                            }}
                            expand={false}
                            duration={4000}
                        />
                    </WishlistProvider>
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
