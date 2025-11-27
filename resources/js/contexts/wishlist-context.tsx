'use client';

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

interface WishlistItem {
    productId: number;
    variantId: number | null;
    productName: string;
}

interface WishlistContextType {
    items: WishlistItem[];
    itemCount: number;
    addItem: (productId: number, variantId: number | null, productName: string) => Promise<{ success: boolean; requiresLogin: boolean }>;
    removeItem: (productId: number, variantId: number | null) => Promise<{ success: boolean }>;
    toggleItem: (productId: number, variantId: number | null, productName: string) => Promise<{ success: boolean; action: 'added' | 'removed'; requiresLogin: boolean }>;
    isInWishlist: (productId: number, variantId: number | null) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'shop-natural-wishlist';

interface WishlistProviderProps {
    children: React.ReactNode;
}

export function WishlistProvider({ children }: WishlistProviderProps) {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    // Generate unique wishlist item ID
    const generateItemId = useCallback((productId: number, variantId: number | null): string => {
        return `${productId}-${variantId || 'default'}`;
    }, []);

    // Load wishlist from localStorage or backend on mount
    useEffect(() => {
        const initializeWishlist = async () => {
            try {
                // Try to load from backend first
                const response = await axios.get('/api/wishlist/items');
                const backendItems = response.data.items || [];

                if (backendItems.length > 0) {
                    // User is authenticated and has items
                    setItems(backendItems);
                    setIsAuthenticated(true);
                } else {
                    // Check if response indicates authentication
                    setIsAuthenticated(response.status === 200);

                    // Load from localStorage as fallback
                    const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
                    if (storedWishlist) {
                        const parsedWishlist = JSON.parse(storedWishlist);
                        setItems(parsedWishlist);
                    }
                }
            } catch {
                // Not authenticated or error, load from localStorage
                setIsAuthenticated(false);
                try {
                    const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
                    if (storedWishlist) {
                        const parsedWishlist = JSON.parse(storedWishlist);
                        setItems(parsedWishlist);
                    }
                } catch (e) {
                    console.error('Failed to load wishlist from localStorage:', e);
                }
            } finally {
                setIsInitialized(true);
            }
        };

        initializeWishlist();
    }, []);

    // Save wishlist to localStorage whenever it changes (for guests)
    useEffect(() => {
        if (isInitialized && isAuthenticated === false) {
            try {
                localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
            } catch (err) {
                console.error('Failed to save wishlist to localStorage:', err);
            }
        }
    }, [items, isInitialized, isAuthenticated]);

    // Add item to wishlist
    const addItem = useCallback(async (
        productId: number,
        variantId: number | null,
        productName: string
    ): Promise<{ success: boolean; requiresLogin: boolean }> => {
        // Update localStorage/state immediately for instant UI
        const itemId = generateItemId(productId, variantId);
        const existingIndex = items.findIndex(item =>
            generateItemId(item.productId, item.variantId) === itemId
        );

        if (existingIndex === -1) {
            const newItem: WishlistItem = { productId, variantId, productName };
            setItems(prevItems => [...prevItems, newItem]);

            // Background sync to database (will check auth on backend)
            try {
                await axios.post('/api/wishlist/add', {
                    product_id: productId,
                    product_variant_id: variantId,
                });
                setIsAuthenticated(true);
                return { success: true, requiresLogin: false };
            } catch (err) {
                // Check if it's an auth error
                const axiosError = err as { response?: { status?: number } };
                if (axiosError.response?.status === 401) {
                    setIsAuthenticated(false);
                    // Revert on auth error
                    setItems(prevItems => prevItems.filter(item =>
                        generateItemId(item.productId, item.variantId) !== itemId
                    ));
                    return { success: false, requiresLogin: true };
                } else {
                    console.error('Failed to sync wishlist add to database:', err);
                    return { success: true, requiresLogin: false }; // Still succeeds locally
                }
            }
        }
        return { success: true, requiresLogin: false };
    }, [items, generateItemId]);

    // Remove item from wishlist
    const removeItem = useCallback(async (
        productId: number,
        variantId: number | null
    ): Promise<{ success: boolean }> => {
        // Update localStorage/state immediately for instant UI
        const itemId = generateItemId(productId, variantId);
        const itemToRemove = items.find(item =>
            generateItemId(item.productId, item.variantId) === itemId
        );

        if (itemToRemove) {
            setItems(prevItems => prevItems.filter(item =>
                generateItemId(item.productId, item.variantId) !== itemId
            ));

            // Background sync to database
            try {
                await axios.post('/api/wishlist/remove', {
                    product_id: productId,
                    product_variant_id: variantId,
                });
            } catch (err) {
                // Only log error, don't revert removal (guest users can still remove)
                const axiosError = err as { response?: { status?: number } };
                if (axiosError.response?.status !== 401) {
                    console.error('Failed to sync wishlist remove to database:', err);
                }
            }
            return { success: true };
        }
        return { success: false };
    }, [items, generateItemId]);

    // Toggle item in wishlist
    const toggleItem = useCallback(async (
        productId: number,
        variantId: number | null,
        productName: string
    ): Promise<{ success: boolean; action: 'added' | 'removed'; requiresLogin: boolean }> => {
        const itemId = generateItemId(productId, variantId);
        const isInList = items.some(item =>
            generateItemId(item.productId, item.variantId) === itemId
        );

        if (isInList) {
            const result = await removeItem(productId, variantId);
            return { success: result.success, action: 'removed', requiresLogin: false };
        } else {
            const result = await addItem(productId, variantId, productName);
            return { success: result.success, action: 'added', requiresLogin: result.requiresLogin };
        }
    }, [items, generateItemId, addItem, removeItem]);

    // Check if item is in wishlist
    const isInWishlist = useCallback((
        productId: number,
        variantId: number | null
    ): boolean => {
        const itemId = generateItemId(productId, variantId);
        return items.some(item =>
            generateItemId(item.productId, item.variantId) === itemId
        );
    }, [items, generateItemId]);

    // Calculate item count
    const itemCount = useMemo(() => items.length, [items]);

    const value = useMemo(() => ({
        items,
        itemCount,
        addItem,
        removeItem,
        toggleItem,
        isInWishlist,
    }), [items, itemCount, addItem, removeItem, toggleItem, isInWishlist]);

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = React.useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
