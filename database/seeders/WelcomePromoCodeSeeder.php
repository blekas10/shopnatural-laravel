<?php

namespace Database\Seeders;

use App\Models\PromoCode;
use Illuminate\Database\Seeder;

class WelcomePromoCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create WELCOME2026 promo code for registered users (12% discount)
        PromoCode::updateOrCreate(
            ['code' => 'WELCOME2026'],
            [
                'description' => 'Welcome discount for registered users - 12% off',
                'type' => 'percentage',
                'value' => 12.00,
                'min_order_amount' => null,
                'max_discount_amount' => null,
                'usage_limit' => null, // Unlimited total usage
                'per_user_limit' => 1, // Each user can use it once
                'times_used' => 0,
                'starts_at' => now(),
                'ends_at' => now()->endOfYear(), // Valid until end of 2026
                'is_active' => true,
            ]
        );

        $this->command->info('WELCOME2026 promo code created successfully!');
    }
}
