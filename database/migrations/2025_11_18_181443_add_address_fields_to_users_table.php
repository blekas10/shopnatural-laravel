<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Billing address
            $table->string('billing_address')->nullable()->after('email_verified_at');
            $table->string('billing_city')->nullable()->after('billing_address');
            $table->string('billing_state')->nullable()->after('billing_city');
            $table->string('billing_postal_code')->nullable()->after('billing_state');
            $table->string('billing_country')->nullable()->after('billing_postal_code');

            // Shipping address
            $table->string('shipping_address')->nullable()->after('billing_country');
            $table->string('shipping_city')->nullable()->after('shipping_address');
            $table->string('shipping_state')->nullable()->after('shipping_city');
            $table->string('shipping_postal_code')->nullable()->after('shipping_state');
            $table->string('shipping_country')->nullable()->after('shipping_postal_code');

            // Phone number
            $table->string('phone')->nullable()->after('shipping_country');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'billing_address',
                'billing_city',
                'billing_state',
                'billing_postal_code',
                'billing_country',
                'shipping_address',
                'shipping_city',
                'shipping_state',
                'shipping_postal_code',
                'shipping_country',
                'phone',
            ]);
        });
    }
};
