<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: First, expand the enum to include both old and new values
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'])
                ->default('pending')
                ->change();
        });

        // Step 2: Update existing 'pending' orders to 'confirmed'
        DB::table('orders')
            ->where('status', 'pending')
            ->update(['status' => 'confirmed']);

        // Step 3: Update existing 'delivered' orders to 'completed'
        DB::table('orders')
            ->where('status', 'delivered')
            ->update(['status' => 'completed']);

        // Step 4: Finally, remove old values from enum
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status', ['confirmed', 'processing', 'shipped', 'completed', 'cancelled'])
                ->default('confirmed')
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Step 1: Expand enum to include both old and new values
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'])
                ->default('confirmed')
                ->change();
        });

        // Step 2: Update 'confirmed' orders back to 'pending'
        DB::table('orders')
            ->where('status', 'confirmed')
            ->update(['status' => 'pending']);

        // Step 3: Update 'completed' orders back to 'delivered'
        DB::table('orders')
            ->where('status', 'completed')
            ->update(['status' => 'delivered']);

        // Step 4: Restore original enum values
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
                ->default('pending')
                ->change();
        });
    }
};
