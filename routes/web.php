<?php

use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\BrandController as AdminBrandController;
use App\Http\Controllers\Admin\ProductImageController as AdminProductImageController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PayseraController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\VenipakController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


// Override Fortify email verification routes
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware(['auth', 'signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])
    ->middleware(['auth', 'throttle:6,1'])
    ->name('verification.send');

// Payment webhooks and callbacks (must be accessible without CSRF protection)
Route::post('stripe/webhook', [StripeWebhookController::class, 'handle'])->name('stripe.webhook');
Route::get('paysera/accept', [PayseraController::class, 'accept'])->name('paysera.accept');
Route::get('paysera/cancel', [PayseraController::class, 'cancel'])->name('paysera.cancel');
Route::post('paysera/callback', [PayseraController::class, 'callback'])->name('paysera.callback');

// API routes for Venipak (accessible without locale prefix)
Route::prefix('api')->group(function () {
    Route::get('venipak/pickup-points', [VenipakController::class, 'getPickupPoints'])->name('api.venipak.pickup-points');
    Route::post('venipak/clear-cache', [VenipakController::class, 'clearCache'])->middleware('auth')->name('api.venipak.clear-cache');
    Route::get('cart/status', [\App\Http\Controllers\Api\CartStatusController::class, 'status'])->name('api.cart.status');

    // Wishlist routes
    Route::get('wishlist/items', [\App\Http\Controllers\Api\WishlistController::class, 'items'])->name('api.wishlist.items');
    Route::post('wishlist/add', [\App\Http\Controllers\Api\WishlistController::class, 'add'])->middleware('auth')->name('api.wishlist.add');
    Route::post('wishlist/remove', [\App\Http\Controllers\Api\WishlistController::class, 'remove'])->middleware('auth')->name('api.wishlist.remove');

    // Contact form route
    Route::post('contact', [\App\Http\Controllers\Api\ContactController::class, 'send'])->name('api.contact.send');
});

// Cart routes (accessible without locale prefix)
Route::post('cart/add', [CartController::class, 'addItem'])->name('cart.add');
Route::post('cart/update-quantity', [CartController::class, 'updateQuantity'])->name('cart.update-quantity');
Route::post('cart/remove', [CartController::class, 'removeByProduct'])->name('cart.remove-product');
Route::patch('cart/items/{item}', [CartController::class, 'updateItem'])->name('cart.update');
Route::delete('cart/items/{item}', [CartController::class, 'removeItem'])->name('cart.remove');
Route::delete('cart/clear', [CartController::class, 'clear'])->name('cart.clear');

// English routes (default, no prefix)
Route::group([], function () {
    Route::get('/', [HomeController::class, 'index'])->name('en.home');
    Route::get('products', [ProductController::class, 'index'])->name('en.products.index');
    Route::get('products/{slug}', [ProductController::class, 'show'])->name('en.products.show');
    Route::get('cart', fn() => Inertia::render('cart'))->name('en.cart');
    Route::get('wishlist', [WishlistController::class, 'index'])->name('en.wishlist');
    Route::get('contact', [ContactController::class, 'index'])->name('en.contact');

    // Static pages
    Route::get('about', [PageController::class, 'about'])->name('en.about');
    Route::get('return-policy', [PageController::class, 'returnPolicy'])->name('en.return-policy');
    Route::get('shipping-policy', [PageController::class, 'shippingPolicy'])->name('en.shipping-policy');
    Route::get('privacy-policy', [PageController::class, 'privacyPolicy'])->name('en.privacy-policy');

    // Auth routes - redirect to home with modal (handled by Fortify for default locale)
    // The /login and /register routes are automatically handled by FortifyServiceProvider

    // Password reset routes (English)
    Route::get('reset-password/{token}', function ($token) {
        return Inertia::render('auth/reset-password', [
            'email' => request('email'),
            'token' => $token,
        ]);
    })->name('password.reset');

    // Checkout routes
    Route::get('checkout', [CheckoutController::class, 'index'])->name('en.checkout');
    Route::post('checkout', [CheckoutController::class, 'store'])->name('en.checkout.store');

    // Order routes - protected by authentication
    Route::middleware('auth')->group(function () {
        Route::get('orders', [OrderController::class, 'index'])->name('en.orders.index');
        Route::get('orders/{orderNumber}', [OrderController::class, 'show'])->name('en.orders.show');
        Route::get('orders/{orderNumber}/invoice/download', [OrderController::class, 'downloadInvoice'])->name('en.orders.invoice.download');
        Route::get('orders/{orderNumber}/invoice/view', [OrderController::class, 'viewInvoice'])->name('en.orders.invoice.view');
    });

    // Order confirmation - accessible after checkout (uses policy for authorization)
    Route::get('order/confirmation/{orderNumber}', [OrderController::class, 'confirmation'])->name('en.order.confirmation');
});

// Lithuanian routes (with /lt prefix and translated segments)
Route::group(['prefix' => 'lt'], function () {
    Route::get('/', [HomeController::class, 'index'])->name('lt.home');
    Route::get('produktai', [ProductController::class, 'index'])->name('lt.products.index');
    Route::get('produktai/{slug}', [ProductController::class, 'show'])->name('lt.products.show');
    Route::get('krepselis', fn() => Inertia::render('cart'))->name('lt.cart');
    Route::get('pageidavimu-sarasas', [WishlistController::class, 'index'])->name('lt.wishlist');
    Route::get('kontaktai', [ContactController::class, 'index'])->name('lt.contact');

    // Static pages
    Route::get('apie-mus', [PageController::class, 'about'])->name('lt.about');
    Route::get('grazinimo-politika', [PageController::class, 'returnPolicy'])->name('lt.return-policy');
    Route::get('pristatymo-politika', [PageController::class, 'shippingPolicy'])->name('lt.shipping-policy');
    Route::get('privatumo-politika', [PageController::class, 'privacyPolicy'])->name('lt.privacy-policy');

    // Auth routes (translated) - redirect to home with modal
    Route::get('prisijungti', function () {
        return redirect('/lt?auth=login');
    })->name('lt.login');
    Route::get('registruotis', function () {
        return redirect('/lt?auth=register');
    })->name('lt.register');

    // Checkout routes (translated)
    Route::get('apmokejimas', [CheckoutController::class, 'index'])->name('lt.checkout');
    Route::post('apmokejimas', [CheckoutController::class, 'store'])->name('lt.checkout.store');

    // Order routes (translated) - protected by authentication
    Route::middleware('auth')->group(function () {
        Route::get('uzsakymai', [OrderController::class, 'index'])->name('lt.orders.index');
        Route::get('uzsakymai/{orderNumber}', [OrderController::class, 'show'])->name('lt.orders.show');
        Route::get('uzsakymai/{orderNumber}/saskaita/atsisiusti', [OrderController::class, 'downloadInvoice'])->name('lt.orders.invoice.download');
        Route::get('uzsakymai/{orderNumber}/saskaita/perziureti', [OrderController::class, 'viewInvoice'])->name('lt.orders.invoice.view');
    });

    // Order confirmation - accessible after checkout (uses policy for authorization)
    Route::get('uzsakymas/patvirtinimas/{orderNumber}', [OrderController::class, 'confirmation'])->name('lt.order.confirmation');

    // Password reset routes (Lithuanian)
    Route::get('reset-password/{token}', function ($token) {
        return Inertia::render('auth/reset-password', [
            'email' => request('email'),
            'token' => $token,
        ]);
    })->name('lt.password.reset');

    // Authenticated routes (Lithuanian)
    Route::middleware(['auth'])->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('lt.dashboard');

        // Admin routes
        Route::prefix('admin')->group(function () {
            Route::get('products', [AdminProductController::class, 'index'])->name('lt.admin.products.index');
            Route::get('products/create', [AdminProductController::class, 'create'])->name('lt.admin.products.create');
            Route::post('products', [AdminProductController::class, 'store'])->name('lt.admin.products.store');
            Route::get('products/{product}/edit', [AdminProductController::class, 'edit'])->name('lt.admin.products.edit');
            Route::put('products/{product}', [AdminProductController::class, 'update'])->name('lt.admin.products.update');
            Route::delete('products/{product}', [AdminProductController::class, 'destroy'])->name('lt.admin.products.destroy');
            Route::patch('products/{product}/variants/{variant}/quick-update', [AdminProductController::class, 'quickUpdateVariant'])->name('lt.admin.products.variants.quick-update');

            // Product image management
            Route::post('products/{product}/images', [AdminProductImageController::class, 'store'])->name('lt.admin.products.images.store');
            Route::delete('products/{product}/images/{image}', [AdminProductImageController::class, 'destroy'])->name('lt.admin.products.images.destroy');
            Route::post('products/{product}/images/{image}/primary', [AdminProductImageController::class, 'setPrimary'])->name('lt.admin.products.images.primary');
            Route::post('products/{product}/images/reorder', [AdminProductImageController::class, 'reorder'])->name('lt.admin.products.images.reorder');
            Route::put('products/{product}/images/{image}/alt', [AdminProductImageController::class, 'updateAlt'])->name('lt.admin.products.images.alt');

            // Category management
            Route::get('categories', [AdminCategoryController::class, 'index'])->name('lt.admin.categories.index');
            Route::get('categories/create', [AdminCategoryController::class, 'create'])->name('lt.admin.categories.create');
            Route::post('categories', [AdminCategoryController::class, 'store'])->name('lt.admin.categories.store');
            Route::get('categories/{category}/edit', [AdminCategoryController::class, 'edit'])->name('lt.admin.categories.edit');
            Route::put('categories/{category}', [AdminCategoryController::class, 'update'])->name('lt.admin.categories.update');
            Route::delete('categories/{category}', [AdminCategoryController::class, 'destroy'])->name('lt.admin.categories.destroy');

            // Brand management
            Route::get('brands', [AdminBrandController::class, 'index'])->name('lt.admin.brands.index');
            Route::get('brands/create', [AdminBrandController::class, 'create'])->name('lt.admin.brands.create');
            Route::post('brands', [AdminBrandController::class, 'store'])->name('lt.admin.brands.store');
            Route::get('brands/{brand}/edit', [AdminBrandController::class, 'edit'])->name('lt.admin.brands.edit');
            Route::put('brands/{brand}', [AdminBrandController::class, 'update'])->name('lt.admin.brands.update');
            Route::delete('brands/{brand}', [AdminBrandController::class, 'destroy'])->name('lt.admin.brands.destroy');

            // Order management
            Route::get('orders', [AdminOrderController::class, 'index'])->name('lt.admin.orders.index');
            Route::get('orders/{order}', [AdminOrderController::class, 'show'])->name('lt.admin.orders.show');
            Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('lt.admin.orders.update-status');
            Route::patch('orders/{order}/payment-status', [AdminOrderController::class, 'updatePaymentStatus'])->name('lt.admin.orders.update-payment-status');
            Route::get('orders/{order}/invoice/download', [AdminOrderController::class, 'downloadInvoice'])->name('lt.admin.orders.invoice.download');
            Route::get('orders/{order}/invoice/view', [AdminOrderController::class, 'viewInvoice'])->name('lt.admin.orders.invoice.view');
        });
    });
});

// Authenticated routes (English)
Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::get('products', [AdminProductController::class, 'index'])->name('admin.products.index');
        Route::get('products/create', [AdminProductController::class, 'create'])->name('admin.products.create');
        Route::post('products', [AdminProductController::class, 'store'])->name('admin.products.store');
        Route::get('products/{product}/edit', [AdminProductController::class, 'edit'])->name('admin.products.edit');
        Route::put('products/{product}', [AdminProductController::class, 'update'])->name('admin.products.update');
        Route::delete('products/{product}', [AdminProductController::class, 'destroy'])->name('admin.products.destroy');
        Route::patch('products/{product}/variants/{variant}/quick-update', [AdminProductController::class, 'quickUpdateVariant'])->name('admin.products.variants.quick-update');

        // Product image management
        Route::post('products/{product}/images', [AdminProductImageController::class, 'store'])->name('admin.products.images.store');
        Route::delete('products/{product}/images/{image}', [AdminProductImageController::class, 'destroy'])->name('admin.products.images.destroy');
        Route::post('products/{product}/images/{image}/primary', [AdminProductImageController::class, 'setPrimary'])->name('admin.products.images.primary');
        Route::post('products/{product}/images/reorder', [AdminProductImageController::class, 'reorder'])->name('admin.products.images.reorder');
        Route::put('products/{product}/images/{image}/alt', [AdminProductImageController::class, 'updateAlt'])->name('admin.products.images.alt');

        // Category management
        Route::get('categories', [AdminCategoryController::class, 'index'])->name('admin.categories.index');
        Route::get('categories/create', [AdminCategoryController::class, 'create'])->name('admin.categories.create');
        Route::post('categories', [AdminCategoryController::class, 'store'])->name('admin.categories.store');
        Route::get('categories/{category}/edit', [AdminCategoryController::class, 'edit'])->name('admin.categories.edit');
        Route::put('categories/{category}', [AdminCategoryController::class, 'update'])->name('admin.categories.update');
        Route::delete('categories/{category}', [AdminCategoryController::class, 'destroy'])->name('admin.categories.destroy');

        // Brand management
        Route::get('brands', [AdminBrandController::class, 'index'])->name('admin.brands.index');
        Route::get('brands/create', [AdminBrandController::class, 'create'])->name('admin.brands.create');
        Route::post('brands', [AdminBrandController::class, 'store'])->name('admin.brands.store');
        Route::get('brands/{brand}/edit', [AdminBrandController::class, 'edit'])->name('admin.brands.edit');
        Route::put('brands/{brand}', [AdminBrandController::class, 'update'])->name('admin.brands.update');
        Route::delete('brands/{brand}', [AdminBrandController::class, 'destroy'])->name('admin.brands.destroy');

        // Order management
        Route::get('orders', [AdminOrderController::class, 'index'])->name('admin.orders.index');
        Route::get('orders/{order}', [AdminOrderController::class, 'show'])->name('admin.orders.show');
        Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('admin.orders.update-status');
        Route::patch('orders/{order}/payment-status', [AdminOrderController::class, 'updatePaymentStatus'])->name('admin.orders.update-payment-status');
        Route::get('orders/{order}/invoice/download', [AdminOrderController::class, 'downloadInvoice'])->name('admin.orders.invoice.download');
        Route::get('orders/{order}/invoice/view', [AdminOrderController::class, 'viewInvoice'])->name('admin.orders.invoice.view');
    });
});

require __DIR__.'/settings.php';
