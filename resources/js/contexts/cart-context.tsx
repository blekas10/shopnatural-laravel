'use client';

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import type { CartItem } from '@/types';
import type { ProductListItem, ProductVariant } from '@/types/product';
import { pushToDataLayer } from '@/hooks/use-gtm';

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    totalPrice: number;
    addItem: (product: ProductListItem, variant: ProductVariant | null, quantity?: number) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    isInCart: (productId: number, variantId: number | null) => boolean;
    getItemQuantity: (productId: number, variantId: number | null) => number;
    restoreCart: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'shop-natural-cart';

interface CartProviderProps {
    children: React.ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load cart from localStorage on mount and sync with backend
    useEffect(() => {
        const initializeCart = async () => {
            try {
                // First, check backend cart status
                const response = await axios.get('/api/cart/status');
                const { should_clear, cart_status } = response.data;

                if (should_clear && cart_status === 'completed') {
                    // Backend cart is completed, clear localStorage
                    console.log('Backend cart is completed, clearing localStorage cart');
                    localStorage.removeItem(CART_STORAGE_KEY);
                    setItems([]);
                } else {
                    // Load cart from localStorage
                    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
                    if (storedCart) {
                        const parsedCart = JSON.parse(storedCart);
                        setItems(parsedCart);
                    }
                }
            } catch (error) {
                console.error('Failed to sync cart with backend:', error);
                // Fallback: still load from localStorage
                try {
                    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
                    if (storedCart) {
                        const parsedCart = JSON.parse(storedCart);
                        setItems(parsedCart);
                    }
                } catch (e) {
                    console.error('Failed to load cart from localStorage:', e);
                }
            } finally {
                setIsInitialized(true);
            }
        };

        initializeCart();
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isInitialized) {
            try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
            } catch (error) {
                console.error('Failed to save cart to localStorage:', error);
            }
        }
    }, [items, isInitialized]);

    // Generate unique cart item ID
    const generateItemId = useCallback((productId: number, variantId: number | null): string => {
        return `${productId}-${variantId || 'default'}`;
    }, []);

    // Add item to cart
    const addItem = useCallback((
        product: ProductListItem,
        variant: ProductVariant | null,
        quantity: number = 1
    ) => {
        if (!variant) {
            console.error('Variant is required');
            return;
        }

        // Update localStorage immediately for instant UI
        setItems((currentItems) => {
            const itemId = generateItemId(product.id, variant?.id || null);
            const existingItemIndex = currentItems.findIndex(item => item.id === itemId);

            if (existingItemIndex > -1) {
                // Item already exists, update quantity
                const newItems = [...currentItems];
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: newItems[existingItemIndex].quantity + quantity,
                };
                return newItems;
            } else {
                // Add new item
                const newItem: CartItem = {
                    id: itemId,
                    productId: product.id,
                    variantId: variant?.id || null,
                    quantity,
                    product,
                    variant,
                };
                return [...currentItems, newItem];
            }
        });

        // Track AddToCart event for Facebook CAPI
        // Get auth user lazily from Inertia router (CartProvider is outside Inertia page context)
        const page = router.page as { props?: { auth?: { user?: { id: number; email: string } } } } | null;
        const authUser = page?.props?.auth?.user ?? null;
        pushToDataLayer({
            event: 'AddToCart',
            content_ids: [variant.sku],
            content_name: product.name,
            content_type: 'product',
            value: variant.price * quantity,
            currency: 'EUR',
            quantity,
            items: [{ item_id: variant.sku, item_name: product.name, price: variant.price, quantity }],
        }, authUser);

        // Save to database in background using axios
        axios.post('/cart/add', {
            product_id: product.id,
            variant_id: variant.id,
            quantity,
        }).catch(error => {
            console.error('Failed to sync cart to database:', error);
        });
    }, [generateItemId]);

    // Remove item from cart
    const removeItem = useCallback((itemId: string) => {
        // Get the item before removing from state
        const item = items.find(i => i.id === itemId);

        // Update localStorage immediately for instant UI
        setItems((currentItems) => currentItems.filter(item => item.id !== itemId));

        // Sync to backend using axios
        if (item) {
            axios.post('/cart/remove', {
                product_id: item.productId,
                variant_id: item.variantId,
            }).catch(error => {
                console.error('Failed to remove item from database cart:', error);
            });
        }
    }, [items]);

    // Update item quantity
    const updateQuantity = useCallback((itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(itemId);
            return;
        }

        // Get the item before updating state
        const item = items.find(i => i.id === itemId);

        // Update localStorage immediately for instant UI
        setItems((currentItems) => {
            const itemIndex = currentItems.findIndex(item => item.id === itemId);
            if (itemIndex === -1) return currentItems;

            const newItems = [...currentItems];
            newItems[itemIndex] = {
                ...newItems[itemIndex],
                quantity,
            };
            return newItems;
        });

        // Sync to backend using axios
        if (item) {
            axios.post('/cart/update-quantity', {
                product_id: item.productId,
                variant_id: item.variantId,
                quantity,
            }).catch(error => {
                console.error('Failed to update quantity in database cart:', error);
            });
        }
    }, [items, removeItem]);

    // Clear entire cart
    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    // Restore cart from saved items (used for continuing abandoned checkouts)
    const restoreCart = useCallback((newItems: CartItem[]) => {
        setItems(newItems);
        // Also persist to localStorage immediately
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
        } catch (error) {
            console.error('Failed to save restored cart to localStorage:', error);
        }
    }, []);

    // Check if item is in cart
    const isInCart = useCallback((productId: number, variantId: number | null): boolean => {
        const itemId = generateItemId(productId, variantId);
        return items.some(item => item.id === itemId);
    }, [items, generateItemId]);

    // Get item quantity
    const getItemQuantity = useCallback((productId: number, variantId: number | null): number => {
        const itemId = generateItemId(productId, variantId);
        const item = items.find(item => item.id === itemId);
        return item?.quantity || 0;
    }, [items, generateItemId]);

    // Computed values
    const itemCount = useMemo(() => {
        return items.reduce((total, item) => total + item.quantity, 0);
    }, [items]);

    const totalPrice = useMemo(() => {
        return items.reduce((total, item) => {
            const price = item.variant?.price || item.product.price;
            return total + (price * item.quantity);
        }, 0);
    }, [items]);

    const value = useMemo<CartContextType>(
        () => ({
            items,
            itemCount,
            totalPrice,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            isInCart,
            getItemQuantity,
            restoreCart,
        }),
        [items, itemCount, totalPrice, addItem, removeItem, updateQuantity, clearCart, isInCart, getItemQuantity, restoreCart]
    );

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCartContext() {
    const context = React.useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCartContext must be used within a CartProvider');
    }
    return context;
}
