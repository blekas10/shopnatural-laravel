<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class CartStatusController extends Controller
{
    /**
     * Check cart status - returns if cart is completed/should be cleared
     */
    public function status(Request $request)
    {
        $user = auth()->user();

        if ($user) {
            // Check if user has a completed cart
            $completedCart = Cart::where('user_id', $user->id)
                ->where('status', 'completed')
                ->whereNotNull('order_id')
                ->latest()
                ->first();

            if ($completedCart) {
                return response()->json([
                    'should_clear' => true,
                    'cart_status' => 'completed',
                    'order_id' => $completedCart->order_id,
                ]);
            }
        } else {
            // Check guest cart by session
            $sessionId = Session::getId();
            $completedCart = Cart::where('session_id', $sessionId)
                ->where('status', 'completed')
                ->whereNotNull('order_id')
                ->latest()
                ->first();

            if ($completedCart) {
                return response()->json([
                    'should_clear' => true,
                    'cart_status' => 'completed',
                    'order_id' => $completedCart->order_id,
                ]);
            }
        }

        return response()->json([
            'should_clear' => false,
            'cart_status' => 'active',
        ]);
    }
}
