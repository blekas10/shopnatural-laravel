import { route } from '@/lib/route';

export const home = () => route('home');
export const dashboard = () => route('dashboard');
export const login = () => route('login');
export const register = () => route('register');
export const logout = () => route('logout');

// Admin routes
export const adminDashboard = () => route('admin.dashboard');
export const adminProducts = () => route('admin.products.index');
export const adminCategories = () => route('admin.categories.index');
export const adminBrands = () => route('admin.brands.index');
export const adminOrders = () => route('admin.orders.index');

// Public routes
export const products = () => route('products.index');
export const cart = () => route('cart.index');
export const wishlist = () => route('wishlist.index');
export const checkout = () => route('checkout.index');
export const about = () => route('about');
export const contact = () => route('contact');
