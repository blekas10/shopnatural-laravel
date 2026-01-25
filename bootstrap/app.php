<?php

use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\OldSlugRedirect;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->validateCsrfTokens(except: [
            'stripe/webhook',
            'paysera/callback',
        ]);

        $middleware->web(append: [
            SetLocale::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Register middleware aliases
        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
            'old-slug-redirect' => OldSlugRedirect::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (NotFoundHttpException $_e, Request $request) {
            // Detect locale from URL segment (same logic as SetLocale middleware)
            $firstSegment = $request->segment(1);
            $availableLocales = config('app.available_locales', ['en', 'lt']);
            $locale = in_array($firstSegment, $availableLocales) ? $firstSegment : config('app.locale', 'en');

            // Set locale for the app
            app()->setLocale($locale);

            // Load translations for the detected locale
            $filePath = lang_path("{$locale}.json");
            $translations = file_exists($filePath)
                ? json_decode(file_get_contents($filePath), true) ?? []
                : [];

            return Inertia::render('errors/404')
                ->with([
                    'locale' => $locale,
                    'availableLocales' => $availableLocales,
                    'translations' => $translations,
                    'seo' => [
                        'siteName' => config('app.name'),
                        'siteUrl' => config('app.url'),
                    ],
                ])
                ->toResponse($request)
                ->setStatusCode(404);
        });
    })->create();
