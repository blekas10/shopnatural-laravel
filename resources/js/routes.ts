import { route } from '@/lib/route';

// Main routes
export const home = () => route('home');
export const dashboard = () => route('dashboard');
export const login = () => route('login');
export const logout = () => route('logout');

// Auth routes
export { login as loginRoute };

// Password reset routes
export const passwordEmail = () => route('password.email');
export const passwordReset = (token?: string) => route('password.reset', token ? { token } : undefined);

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

// Register routes (used by register.tsx)
export const register = () => route('register');
export const registerStore = () => route('register');

// Two-factor routes
export const twoFactorQrCode = () => route('two-factor.qr-code');
export const twoFactorRecoveryCodes = () => route('two-factor.recovery-codes');
export const twoFactorSecretKey = () => route('two-factor.secret-key');
export const twoFactorEnable = () => route('two-factor.enable');
export const twoFactorDisable = () => route('two-factor.disable');
export const twoFactorShow = () => route('two-factor.show');
export const twoFactorConfirm = () => route('two-factor.confirm');
export const twoFactorRegenerateRecoveryCodes = () => route('two-factor.recovery-codes');
export const twoFactorLoginStore = () => route('two-factor.login');

// Profile routes
export const profileEdit = () => route('profile.edit');
export const profileUpdate = () => route('profile.update');

// Appearance routes
export const appearanceEdit = () => route('appearance.edit');
export const appearanceUpdate = () => route('appearance.update');

// Password routes
export const userPasswordEdit = () => route('user-password.edit');
export const userPasswordUpdate = () => route('user-password.update');

// Admin Categories routes
export const adminCategoriesIndex = () => route('admin.categories.index');
export const adminCategoriesCreate = () => route('admin.categories.create');
export const adminCategoriesStore = () => route('admin.categories.store');
export const adminCategoriesEdit = (id: number) => route('admin.categories.edit', { category: id });
export const adminCategoriesUpdate = (id: number) => route('admin.categories.update', { category: id });
export const adminCategoriesDestroy = (id: number) => route('admin.categories.destroy', { category: id });

// Admin Brands routes
export const adminBrandsIndex = () => route('admin.brands.index');
export const adminBrandsCreate = () => route('admin.brands.create');
export const adminBrandsStore = () => route('admin.brands.store');
export const adminBrandsEdit = (id: number) => route('admin.brands.edit', { brand: id });
export const adminBrandsUpdate = (id: number) => route('admin.brands.update', { brand: id });
export const adminBrandsDestroy = (id: number) => route('admin.brands.destroy', { brand: id });
