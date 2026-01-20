<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NewsletterController extends Controller
{
    /**
     * Subscribe to newsletter
     */
    public function subscribe(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Please enter a valid email address.',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = $request->input('email');
        $locale = $request->input('locale', app()->getLocale());

        try {
            // Check if already subscribed
            $existing = NewsletterSubscriber::where('email', $email)->first();

            if ($existing) {
                if ($existing->is_active) {
                    return response()->json([
                        'message' => 'This email is already subscribed to our newsletter.',
                        'success' => false
                    ], 422);
                } else {
                    // Reactivate subscription
                    $existing->update([
                        'is_active' => true,
                        'locale' => $locale,
                    ]);

                    return response()->json([
                        'message' => 'Welcome back! Your subscription has been reactivated.',
                        'success' => true
                    ]);
                }
            }

            // Create new subscriber
            NewsletterSubscriber::create([
                'email' => $email,
                'locale' => $locale,
                'is_active' => true,
            ]);

            return response()->json([
                'message' => 'Thank you for subscribing! You will receive our latest updates.',
                'success' => true
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to subscribe. Please try again later.',
                'success' => false
            ], 500);
        }
    }
}
