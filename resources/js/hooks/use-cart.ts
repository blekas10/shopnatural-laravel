import { useCartContext } from '@/contexts/cart-context';

/**
 * Custom hook for accessing cart functionality
 * Provides convenient access to cart context with helper methods
 */
export function useCart() {
    return useCartContext();
}
