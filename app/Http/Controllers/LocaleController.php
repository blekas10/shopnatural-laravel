<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class LocaleController extends Controller
{
    /**
     * Switch the application locale (fallback - main switching happens in frontend)
     */
    public function switch(Request $request)
    {
        $locale = $request->input('locale');

        // Validate locale
        if (!in_array($locale, config('app.available_locales'))) {
            return back()->withErrors(['locale' => 'Invalid locale']);
        }

        // Store locale in session
        session(['locale' => $locale]);

        return back();
    }
}
