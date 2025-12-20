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
            // Venipak shipment fields
            $table->string('venipak_pack_no')->nullable()->after('tracking_number');
            $table->string('venipak_manifest_id')->nullable()->after('venipak_pack_no');
            $table->string('venipak_label_path')->nullable()->after('venipak_manifest_id');
            $table->timestamp('venipak_shipment_created_at')->nullable()->after('venipak_label_path');
            $table->text('venipak_error')->nullable()->after('venipak_shipment_created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'venipak_pack_no',
                'venipak_manifest_id',
                'venipak_label_path',
                'venipak_shipment_created_at',
                'venipak_error',
            ]);
        });
    }
};
