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
        Schema::table('carts', function (Blueprint $table) {
            // Add status field: active, completed, abandoned
            $table->enum('status', ['active', 'completed', 'abandoned'])
                ->default('active')
                ->after('expires_at');

            // Add order relationship
            $table->foreignId('order_id')
                ->nullable()
                ->after('status')
                ->constrained('orders')
                ->nullOnDelete();

            // Add index for faster queries
            $table->index(['status', 'user_id']);
            $table->index(['status', 'session_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropIndex(['status', 'user_id']);
            $table->dropIndex(['status', 'session_id']);
            $table->dropColumn(['status', 'order_id']);
        });
    }
};
