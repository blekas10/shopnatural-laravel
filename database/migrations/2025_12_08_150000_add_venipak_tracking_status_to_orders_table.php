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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('venipak_status')->nullable()->after('venipak_error');
            $table->timestamp('venipak_status_updated_at')->nullable()->after('venipak_status');
            $table->timestamp('venipak_delivered_at')->nullable()->after('venipak_status_updated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'venipak_status',
                'venipak_status_updated_at',
                'venipak_delivered_at',
            ]);
        });
    }
};
