<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds fields for secondary carrier tracking (used for Global shipments)
     * Global shipments use external carriers like TNT/GLS who provide their own tracking
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Secondary carrier info (returned by Venipak for global shipments)
            $table->string('venipak_carrier_code')->nullable()->after('venipak_delivered_at');
            $table->string('venipak_carrier_tracking')->nullable()->after('venipak_carrier_code');
            $table->string('venipak_shipment_id')->nullable()->after('venipak_carrier_tracking');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'venipak_carrier_code',
                'venipak_carrier_tracking',
                'venipak_shipment_id',
            ]);
        });
    }
};
