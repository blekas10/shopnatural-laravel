<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) ?? 'en' }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="30">
    <title>{{ __('We\'ll Be Right Back') }} - {{ config('app.name', 'Shop Natural') }}</title>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=roboto:300,400,500,700" rel="stylesheet" />
    <style>
        :root {
            --gold: oklch(0.78 0.08 75);
            --gold-light: oklch(0.78 0.08 75 / 0.15);
            --background: oklch(1 0 0);
            --foreground: oklch(0.30 0.015 75);
            --muted: oklch(0.556 0 0);
            --border: oklch(0.922 0 0);
        }
        .dark {
            --background: oklch(0.145 0 0);
            --foreground: oklch(0.985 0 0);
            --muted: oklch(0.708 0 0);
            --border: oklch(0.269 0 0);
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html {
            background-color: var(--background);
        }
        body {
            font-family: 'Roboto', ui-sans-serif, system-ui, sans-serif;
            background-color: var(--background);
            color: var(--foreground);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            transition: background-color 0.3s, color 0.3s;
            overflow: hidden;
        }
        .container {
            text-align: center;
            max-width: 500px;
            position: relative;
            z-index: 1;
        }
        .logo {
            margin-bottom: 2rem;
        }
        .logo img {
            height: 60px;
            width: auto;
        }
        .icon-wrapper {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: var(--gold-light);
            margin-bottom: 2rem;
            position: relative;
        }
        .icon-wrapper svg {
            width: 56px;
            height: 56px;
            color: var(--gold);
        }
        /* Animated rings */
        .icon-wrapper::before,
        .icon-wrapper::after {
            content: '';
            position: absolute;
            border-radius: 50%;
            border: 2px solid var(--gold);
            opacity: 0;
            animation: pulse-ring 2s ease-out infinite;
        }
        .icon-wrapper::before {
            inset: -10px;
            animation-delay: 0s;
        }
        .icon-wrapper::after {
            inset: -25px;
            animation-delay: 0.5s;
        }
        @keyframes pulse-ring {
            0% { opacity: 0.6; transform: scale(0.9); }
            100% { opacity: 0; transform: scale(1.1); }
        }
        /* Gear rotation animation */
        .gear {
            animation: rotate 4s linear infinite;
        }
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .error-title {
            font-size: 1.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--foreground);
        }
        .error-message {
            font-size: 1rem;
            color: var(--muted);
            margin-top: 1rem;
            line-height: 1.7;
        }
        .progress-container {
            margin-top: 2.5rem;
            padding: 0 2rem;
        }
        .progress-bar {
            height: 4px;
            background: var(--border);
            border-radius: 2px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: var(--gold);
            border-radius: 2px;
            animation: progress 2s ease-in-out infinite;
        }
        @keyframes progress {
            0% { width: 0%; margin-left: 0; }
            50% { width: 60%; margin-left: 20%; }
            100% { width: 0%; margin-left: 100%; }
        }
        .progress-text {
            font-size: 0.75rem;
            color: var(--muted);
            margin-top: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        .theme-toggle {
            position: fixed;
            top: 1.5rem;
            right: 1.5rem;
            width: 2.75rem;
            height: 2.75rem;
            border-radius: 0.5rem;
            background-color: transparent;
            border: 2px solid var(--border);
            color: var(--foreground);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            z-index: 10;
        }
        .theme-toggle:hover {
            border-color: var(--gold);
            color: var(--gold);
        }
        .theme-toggle svg {
            width: 1.25rem;
            height: 1.25rem;
        }
        .sun-icon { display: none; }
        .moon-icon { display: block; }
        .dark .sun-icon { display: block; }
        .dark .moon-icon { display: none; }
        .decoration {
            position: fixed;
            border-radius: 50%;
            background: var(--gold);
            opacity: 0.08;
            pointer-events: none;
        }
        .decoration-1 {
            width: 400px;
            height: 400px;
            top: -150px;
            right: -150px;
        }
        .decoration-2 {
            width: 300px;
            height: 300px;
            bottom: -100px;
            left: -100px;
        }
        .decoration-3 {
            width: 150px;
            height: 150px;
            top: 50%;
            left: 10%;
            opacity: 0.05;
        }
        .footer-note {
            position: fixed;
            bottom: 2rem;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 0.75rem;
            color: var(--muted);
        }
        @media (max-width: 640px) {
            .error-title {
                font-size: 1.375rem;
            }
            .icon-wrapper {
                width: 100px;
                height: 100px;
            }
            .icon-wrapper svg {
                width: 44px;
                height: 44px;
            }
        }
    </style>
</head>
<body>
    <div class="decoration decoration-1"></div>
    <div class="decoration decoration-2"></div>
    <div class="decoration decoration-3"></div>

    <button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle theme">
        <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
    </button>

    <div class="container">
        <div class="logo">
            <img src="/images/shop-natural-logo.png" alt="{{ config('app.name', 'Shop Natural') }}">
        </div>

        <div class="icon-wrapper">
            <svg class="gear" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
        </div>

        <h1 class="error-title">{{ __("We'll Be Right Back") }}</h1>
        <p class="error-message">
            {{ __("We're making some quick improvements to bring you a better experience. This will only take a moment.") }}
        </p>

        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <p class="progress-text">{{ __('Updating...') }}</p>
        </div>
    </div>

    <div class="footer-note">
        {{ __('This page will refresh automatically') }}
    </div>

    <script>
        function toggleTheme() {
            const html = document.documentElement;
            const isDark = html.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        }

        // Initialize theme from localStorage or system preference
        (function() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            }
        })();
    </script>
</body>
</html>
