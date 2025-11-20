<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    /**
     * Display the About Us page
     */
    public function about(): Response
    {
        return Inertia::render('about/index');
    }

    /**
     * Display the Return Policy page
     */
    public function returnPolicy(): Response
    {
        return Inertia::render('return-policy/index');
    }

    /**
     * Display the Shipping Policy page
     */
    public function shippingPolicy(): Response
    {
        return Inertia::render('shipping-policy/index');
    }

    /**
     * Display the Privacy Policy page
     */
    public function privacyPolicy(): Response
    {
        return Inertia::render('privacy-policy/index');
    }
}
