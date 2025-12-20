<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function verify(EmailVerificationRequest $request)
    {
        // Get locale from session
        $locale = session('locale', app()->getLocale()) ?? 'en';
        $dashboardRoute = $locale === 'lt' ? 'lt.dashboard' : 'dashboard';

        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route($dashboardRoute))
                ->with('status', 'email-already-verified');
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));

            // Link any guest orders made with this email to the user
            $request->user()->linkGuestOrders();
        }

        // Redirect to dashboard with success message
        return redirect()->route($dashboardRoute)
            ->with('status', 'email-verified');
    }

    /**
     * Resend the email verification notification.
     */
    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return back()->with('status', 'email-already-verified');
        }

        // Get locale from request first, then session
        $locale = $request->input('locale') ?? session('locale', 'en');
        app()->setLocale($locale);

        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'verification-link-sent');
    }
}
