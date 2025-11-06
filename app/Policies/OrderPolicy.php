<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Determine if the user can view the order.
     *
     * This policy allows:
     * 1. Authenticated users to view their own orders
     * 2. Guest users to view orders if their email matches the session
     */
    public function view(?User $user, Order $order): bool
    {
        // For authenticated users: verify order ownership
        if ($user !== null) {
            return $order->user_id === $user->id;
        }

        // For guest users: verify email in session matches order email
        $guestEmail = session('guest_order_email');

        return $guestEmail !== null && $guestEmail === $order->customer_email;
    }
}
