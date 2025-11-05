<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// English routes (default, no prefix)
Route::group([], function () {
    Route::get('/', [HomeController::class, 'index'])->name('en.home');
    Route::get('products', [ProductController::class, 'index'])->name('en.products.index');
    Route::get('products/{slug}', [ProductController::class, 'show'])->name('en.products.show');
    Route::get('cart', fn() => Inertia::render('cart'))->name('en.cart');
});

// Lithuanian routes (with /lt prefix and translated segments)
Route::group(['prefix' => 'lt'], function () {
    Route::get('/', [HomeController::class, 'index'])->name('lt.home');
    Route::get('produktai', [ProductController::class, 'index'])->name('lt.products.index');
    Route::get('produktai/{slug}', [ProductController::class, 'show'])->name('lt.products.show');
    Route::get('krepselis', fn() => Inertia::render('cart'))->name('lt.cart');
});

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
