<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle(Request $request)
    {
        // Store the intended URL for redirect after login
        if ($request->has('redirect')) {
            session(['social_auth_redirect' => $request->get('redirect')]);
        }

        // Store the current locale
        session(['social_auth_locale' => app()->getLocale()]);

        return Socialite::driver('google')
            ->with(['prompt' => 'select_account'])
            ->redirect();
    }

    /**
     * Obtain the user information from Google.
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            Log::error('Google OAuth callback failed', [
                'error' => $e->getMessage(),
                'exception_class' => get_class($e),
                'trace' => $e->getTraceAsString(),
                'request_all' => $request->all(),
            ]);

            return $this->redirectWithError(__('auth.google_auth_failed'));
        }

        // Find user by Google ID or email
        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if ($user) {
            // Update Google ID if not set (linking existing email account)
            if (!$user->google_id) {
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);

                Log::info('Linked Google account to existing user', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);
            }

            // Update avatar if changed
            if ($googleUser->getAvatar() && $user->avatar !== $googleUser->getAvatar()) {
                $user->update(['avatar' => $googleUser->getAvatar()]);
            }
        } else {
            // Create new user
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'email_verified_at' => now(), // Google emails are verified
            ]);

            Log::info('Created new user via Google OAuth', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            // Link any guest orders made with this email to the new user
            $user->linkGuestOrders();
        }

        // Log the user in
        Auth::login($user, true);

        // Get redirect URL and locale from session
        $redirectUrl = session('social_auth_redirect');
        $locale = session('social_auth_locale', config('app.locale'));

        // Clear session data
        session()->forget(['social_auth_redirect', 'social_auth_locale']);

        // Determine where to redirect
        if ($redirectUrl) {
            return redirect($redirectUrl);
        }

        // Default redirect to dashboard
        // English routes are at root level, Lithuanian at /lt
        if ($locale === 'lt') {
            return redirect('/lt/dashboard');
        }

        return redirect('/dashboard');
    }

    /**
     * Redirect with error message.
     */
    protected function redirectWithError(string $message)
    {
        $locale = session('social_auth_locale', config('app.locale'));
        session()->forget(['social_auth_redirect', 'social_auth_locale']);

        // English routes are at root level, Lithuanian at /lt
        if ($locale === 'lt') {
            return redirect('/lt?auth=login')->withErrors(['google' => $message]);
        }

        return redirect('/?auth=login')->withErrors(['google' => $message]);
    }
}
