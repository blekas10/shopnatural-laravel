<?php

use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// English routes (default, no prefix)
Route::group([], function () {
    Route::get('/', [HomeController::class, 'index'])->name('en.home');
    Route::get('products', [ProductController::class, 'index'])->name('en.products.index');
    Route::get('products/{slug}', [ProductController::class, 'show'])->name('en.products.show');
    Route::get('cart', fn() => Inertia::render('cart'))->name('en.cart');

    // Auth routes - redirect to home with modal (handled by Fortify for default locale)
    // The /login and /register routes are automatically handled by FortifyServiceProvider

    // Checkout routes
    Route::get('checkout', [CheckoutController::class, 'index'])->name('en.checkout');
    Route::post('checkout', [CheckoutController::class, 'store'])->name('en.checkout.store');

    // Order routes - protected by authentication
    Route::middleware('auth')->group(function () {
        Route::get('orders', [OrderController::class, 'index'])->name('en.orders.index');
        Route::get('orders/{orderNumber}', [OrderController::class, 'show'])->name('en.orders.show');
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
    });

    // Order confirmation - accessible after checkout (uses policy for authorization)
    Route::get('uzsakymas/patvirtinimas/{orderNumber}', [OrderController::class, 'confirmation'])->name('lt.order.confirmation');

    // Authenticated routes (Lithuanian)
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('lt.dashboard');

        // Admin routes
        Route::prefix('admin')->group(function () {
            Route::get('products', [AdminProductController::class, 'index'])->name('lt.admin.products.index');
            Route::get('products/create', [AdminProductController::class, 'create'])->name('lt.admin.products.create');
            Route::post('products', [AdminProductController::class, 'store'])->name('lt.admin.products.store');
            Route::get('products/{product}/edit', [AdminProductController::class, 'edit'])->name('lt.admin.products.edit');
            Route::put('products/{product}', [AdminProductController::class, 'update'])->name('lt.admin.products.update');
            Route::delete('products/{product}', [AdminProductController::class, 'destroy'])->name('lt.admin.products.destroy');

            // Category management
            Route::get('categories', [AdminCategoryController::class, 'index'])->name('lt.admin.categories.index');
            Route::get('categories/create', [AdminCategoryController::class, 'create'])->name('lt.admin.categories.create');
            Route::post('categories', [AdminCategoryController::class, 'store'])->name('lt.admin.categories.store');
            Route::get('categories/{category}/edit', [AdminCategoryController::class, 'edit'])->name('lt.admin.categories.edit');
            Route::put('categories/{category}', [AdminCategoryController::class, 'update'])->name('lt.admin.categories.update');
            Route::delete('categories/{category}', [AdminCategoryController::class, 'destroy'])->name('lt.admin.categories.destroy');
        });
    });
});

// Authenticated routes (English)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::get('products', [AdminProductController::class, 'index'])->name('admin.products.index');
        Route::get('products/create', [AdminProductController::class, 'create'])->name('admin.products.create');
        Route::post('products', [AdminProductController::class, 'store'])->name('admin.products.store');
        Route::get('products/{product}/edit', [AdminProductController::class, 'edit'])->name('admin.products.edit');
        Route::put('products/{product}', [AdminProductController::class, 'update'])->name('admin.products.update');
        Route::delete('products/{product}', [AdminProductController::class, 'destroy'])->name('admin.products.destroy');

        // Category management
        Route::get('categories', [AdminCategoryController::class, 'index'])->name('admin.categories.index');
        Route::get('categories/create', [AdminCategoryController::class, 'create'])->name('admin.categories.create');
        Route::post('categories', [AdminCategoryController::class, 'store'])->name('admin.categories.store');
        Route::get('categories/{category}/edit', [AdminCategoryController::class, 'edit'])->name('admin.categories.edit');
        Route::put('categories/{category}', [AdminCategoryController::class, 'update'])->name('admin.categories.update');
        Route::delete('categories/{category}', [AdminCategoryController::class, 'destroy'])->name('admin.categories.destroy');
    });
});

require __DIR__.'/settings.php';
