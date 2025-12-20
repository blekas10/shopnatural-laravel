<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Determine if the user can view the order.
     *
     * - Authenticated users can view their own orders
     * - Guest orders (user_id = null) are accessible to anyone
     */
    public function view(?User $user, Order $order): bool
    {
        // Guest orders are accessible to anyone
        if ($order->user_id === null) {
            return true;
        }

        // Authenticated users can only view their own orders
        return $user !== null && $order->user_id === $user->id;
    }
}
