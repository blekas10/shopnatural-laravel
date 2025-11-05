'use client';

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { CartItem } from '@/types';
import type { ProductListItem, ProductVariant } from '@/types/product';

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'shop-natural-cart';

interface CartProviderProps {
    children: React.ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const storedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (storedCart) {
                const parsedCart = JSON.parse(storedCart);
                setItems(parsedCart);
            }
        } catch (error) {
            console.error('Failed to load cart from localStorage:', error);
        } finally {
            setIsInitialized(true);
        }
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
    }, [generateItemId]);

    // Remove item from cart
    const removeItem = useCallback((itemId: string) => {
        setItems((currentItems) => currentItems.filter(item => item.id !== itemId));
    }, []);

    // Update item quantity
    const updateQuantity = useCallback((itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(itemId);
            return;
        }

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
    }, [removeItem]);

    // Clear entire cart
    const clearCart = useCallback(() => {
        setItems([]);
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
        }),
        [items, itemCount, totalPrice, addItem, removeItem, updateQuantity, clearCart, isInCart, getItemQuantity]
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
