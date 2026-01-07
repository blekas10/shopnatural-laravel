<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
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
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            // Load translations for the current locale
            $locale = app()->getLocale();
            $filePath = lang_path("{$locale}.json");
            $translations = file_exists($filePath)
                ? json_decode(file_get_contents($filePath), true) ?? []
                : [];

            return Inertia::render('errors/404')
                ->with([
                    'locale' => $locale,
                    'availableLocales' => config('app.available_locales'),
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
