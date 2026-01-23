<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ __('Page Not Found') }} - {{ config('app.name', 'Shop Natural') }}</title>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=roboto:300,400,500,700" rel="stylesheet" />
    <style>
        :root {
            --gold: oklch(0.78 0.08 75);
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
        }
        .container {
            text-align: center;
            max-width: 500px;
        }
        .logo {
            margin-bottom: 2rem;
        }
        .logo img {
            height: 60px;
            width: auto;
        }
        .error-code {
            font-size: 8rem;
            font-weight: 700;
            color: var(--gold);
            line-height: 1;
            letter-spacing: -0.05em;
        }
        .error-title {
            font-size: 1.5rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 1rem;
            color: var(--foreground);
        }
        .error-message {
            font-size: 1rem;
            color: var(--muted);
            margin-top: 1rem;
            line-height: 1.6;
        }
        .actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2.5rem;
            flex-wrap: wrap;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 2rem;
            font-size: 0.875rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            text-decoration: none;
            border-radius: 0.5rem;
            transition: all 0.3s;
            cursor: pointer;
            border: 2px solid transparent;
        }
        .btn-primary {
            background-color: var(--gold);
            color: white;
            border-color: var(--gold);
        }
        .btn-primary:hover {
            background-color: transparent;
            color: var(--gold);
        }
        .btn-outline {
            background-color: transparent;
            color: var(--foreground);
            border-color: var(--border);
        }
        .btn-outline:hover {
            border-color: var(--gold);
            color: var(--gold);
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
            opacity: 0.1;
            pointer-events: none;
        }
        .decoration-1 {
            width: 300px;
            height: 300px;
            top: -100px;
            right: -100px;
        }
        .decoration-2 {
            width: 200px;
            height: 200px;
            bottom: -50px;
            left: -50px;
        }
        @media (max-width: 640px) {
            .error-code {
                font-size: 5rem;
            }
            .error-title {
                font-size: 1.25rem;
            }
        }
    </style>
</head>
<body>
    <div class="decoration decoration-1"></div>
    <div class="decoration decoration-2"></div>

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
            <a href="/">
                <img src="/logo.svg" alt="{{ config('app.name', 'Shop Natural') }}">
            </a>
        </div>

        <div class="error-code">404</div>
        <h1 class="error-title">{{ __('Page Not Found') }}</h1>
        <p class="error-message">
            {{ __("The page you're looking for doesn't exist or has been moved. Let's get you back on track.") }}
        </p>

        <div class="actions">
            <a href="/" class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                {{ __('Back to Home') }}
            </a>
            <button onclick="history.back()" class="btn btn-outline">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m12 19-7-7 7-7"></path>
                    <path d="M19 12H5"></path>
                </svg>
                {{ __('Go Back') }}
            </button>
        </div>
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
