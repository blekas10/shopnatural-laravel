<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index(Request $request)
    {
        $query = User::with(['roles', 'orders'])
            ->withCount('orders')
            ->withSum('orders', 'total')
            ->orderBy('created_at', 'desc');

        // Search by name or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->filled('role') && $request->role !== 'all') {
            $query->whereHas('roles', function($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        // Filter by email verification status
        if ($request->filled('verified')) {
            if ($request->verified === 'yes') {
                $query->whereNotNull('email_verified_at');
            } elseif ($request->verified === 'no') {
                $query->whereNull('email_verified_at');
            }
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $users = $query->paginate(20)->through(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'email_verified' => $user->email_verified_at !== null,
                'email_verified_at' => $user->email_verified_at?->format('Y-m-d H:i'),
                'roles' => $user->roles->pluck('name')->toArray(),
                'orders_count' => $user->orders_count ?? 0,
                'total_spent' => (float) ($user->orders_sum_total ?? 0),
                'created_at' => $user->created_at->format('Y-m-d H:i'),
                'last_order_at' => $user->orders->first()?->created_at?->format('Y-m-d H:i'),
            ];
        });

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'search' => $request->search,
                'role' => $request->role,
                'verified' => $request->verified,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
            'roles' => [
                'admin' => __('users.roles.admin'),
                'customer' => __('users.roles.customer'),
            ],
        ]);
    }

    /**
     * Display the specified user
     */
    public function show(User $user)
    {
        $user->load(['roles', 'orders.items']);

        // Get user statistics
        $stats = [
            'total_orders' => $user->orders->count(),
            'total_spent' => $user->orders->sum('total'),
            'average_order' => $user->orders->count() > 0 ? $user->orders->avg('total') : 0,
            'completed_orders' => $user->orders->where('status', 'completed')->count(),
            'pending_orders' => $user->orders->where('status', 'pending')->count(),
        ];

        return Inertia::render('admin/users/show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'email_verified' => $user->email_verified_at !== null,
                'email_verified_at' => $user->email_verified_at?->format('Y-m-d H:i'),
                'roles' => $user->roles->pluck('name')->toArray(),
                'created_at' => $user->created_at->format('Y-m-d H:i'),
                'updated_at' => $user->updated_at->format('Y-m-d H:i'),
                // Billing address
                'billing_address' => $user->billing_address,
                'billing_city' => $user->billing_city,
                'billing_state' => $user->billing_state,
                'billing_postal_code' => $user->billing_postal_code,
                'billing_country' => $user->billing_country,
                // Shipping address
                'shipping_address' => $user->shipping_address,
                'shipping_city' => $user->shipping_city,
                'shipping_state' => $user->shipping_state,
                'shipping_postal_code' => $user->shipping_postal_code,
                'shipping_country' => $user->shipping_country,
            ],
            'stats' => $stats,
            'orders' => $user->orders->sortByDesc('created_at')->take(10)->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'total' => (float) $order->total,
                    'items_count' => $order->items->count(),
                    'created_at' => $order->created_at->format('Y-m-d H:i'),
                ];
            })->values()->toArray(),
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

    /**
     * Toggle user role (admin/customer)
     */
    public function toggleRole(Request $request, User $user)
    {
        // Prevent removing admin from self
        if ($user->id === auth()->id() && $request->action === 'remove') {
            return redirect()->back()->with('error', __('users.cannot_remove_own_admin'));
        }

        if ($request->action === 'add') {
            $user->assignRole('admin');
        } else {
            $user->removeRole('admin');
        }

        return redirect()->back()->with('success', __('users.role_updated'));
    }
}
