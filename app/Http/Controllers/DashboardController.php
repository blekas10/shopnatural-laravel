<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        // Check if user has admin role
        if ($user->hasRole('admin')) {
            return Inertia::render('admin-dashboard');
        }

        // Get all user orders with relationships
        $orders = $user->orders()->with(['items.product', 'items.variant'])->get();

        // Calculate statistics
        $stats = [
            'totalOrders' => $orders->count(),
            'pendingOrders' => $orders->whereIn('status', ['pending', 'processing'])->count(),
            'completedOrders' => $orders->where('status', 'delivered')->count(),
            'totalSpent' => $orders->where('payment_status', 'paid')->sum('total'),
        ];

        // Get 5 most recent orders
        $recentOrders = $orders->sortByDesc('created_at')->take(5)->values();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentOrders' => OrderResource::collection($recentOrders),
        ]);
    }
}
