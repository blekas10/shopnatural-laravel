<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactFormMail;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    /**
     * Send contact form email
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function send(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:2|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|min:5|max:255',
            'message' => 'required|string|min:10|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        try {
            // Get locale from request or session
            $locale = $request->input('locale', app()->getLocale());

            // Store in database
            ContactMessage::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'subject' => $validated['subject'],
                'message' => $validated['message'],
                'locale' => $locale,
            ]);

            // Send the email
            Mail::to('info@naturalmente.lt')->send(new ContactFormMail(
                $validated['name'],
                $validated['email'],
                $validated['subject'],
                $validated['message']
            ));

            return response()->json([
                'message' => 'Your message has been sent successfully. We will get back to you soon.',
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Contact form email failed: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to send message. Please try again later.',
                'success' => false
            ], 500);
        }
    }
}
