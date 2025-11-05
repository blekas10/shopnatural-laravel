<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Services\ProductService;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    public function __construct(
        private ProductService $productService
    ) {}

    /**
     * Display the home page
     */
    public function index(): Response
    {
        $products = $this->productService->getFeaturedProducts(8);

        return Inertia::render('home', [
            'canRegister' => Features::enabled(Features::registration()),
            'products' => ProductResource::collection($products)->resolve(),
        ]);
    }
}
