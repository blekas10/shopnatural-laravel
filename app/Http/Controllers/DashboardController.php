<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Order;
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
            return $this->adminDashboard();
        }

        // Get all user orders with relationships
        $orders = $user->orders()->with(['items.product.primaryImage', 'items.variant'])->get();

        // Calculate statistics
        $stats = [
            'totalOrders' => $orders->count(),
            'pendingOrders' => $orders->whereIn('status', ['confirmed', 'processing'])->count(),
            'completedOrders' => $orders->where('status', 'completed')->count(),
            'totalSpent' => $orders->where('payment_status', 'paid')->sum('total'),
        ];

        // Get 5 most recent orders
        $recentOrders = $orders->sortByDesc('created_at')->take(5)->values();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentOrders' => OrderResource::collection($recentOrders),
            'emailVerified' => $user->hasVerifiedEmail(),
            'status' => session('status'),
        ]);
    }

    /**
     * Admin dashboard (separate route /admin/dashboard)
     */
    public function adminIndex(): Response
    {
        return $this->adminDashboard();
    }

    private function adminDashboard(): Response
    {
        // Get order statistics
        $stats = [
            'totalOrders' => Order::count(),
            'pendingOrders' => Order::where('status', 'pending')->count(),
            'confirmedOrders' => Order::where('status', 'confirmed')->count(),
            'processingOrders' => Order::where('status', 'processing')->count(),
            'shippedOrders' => Order::where('status', 'shipped')->count(),
            'completedOrders' => Order::where('status', 'completed')->count(),
            'todayOrders' => Order::whereDate('created_at', today())->count(),
            'todayRevenue' => Order::whereDate('created_at', today())->where('payment_status', 'paid')->sum('total'),
        ];

        // Get recent orders that need attention (confirmed, processing)
        $recentOrders = Order::with(['items'])
            ->whereIn('status', ['confirmed', 'processing', 'shipped'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->getShippingFullName(),
                    'customer_email' => $order->customer_email,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'total' => (float) $order->total,
                    'items_count' => $order->items->count(),
                    'created_at' => $order->created_at->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('admin-dashboard', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'statuses' => [
                'pending' => __('orders.status.pending'),
                'confirmed' => __('orders.status.confirmed'),
                'processing' => __('orders.status.processing'),
                'shipped' => __('orders.status.shipped'),
                'completed' => __('orders.status.completed'),
                'cancelled' => __('orders.status.cancelled'),
            ],
            'paymentStatuses' => [
                'pending' => __('orders.payment.pending'),
                'paid' => __('orders.payment.paid'),
                'failed' => __('orders.payment.failed'),
                'refunded' => __('orders.payment.refunded'),
            ],
        ]);
    }
}
