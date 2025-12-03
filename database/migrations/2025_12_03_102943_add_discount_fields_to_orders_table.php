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
            // Original product total (before product discounts, with VAT)
            $table->decimal('original_subtotal', 10, 2)->default(0)->after('subtotal');

            // Product discount amount (from product/brand/category discounts)
            $table->decimal('product_discount', 10, 2)->default(0)->after('original_subtotal');

            // Subtotal excluding VAT (calculated from subtotal)
            $table->decimal('subtotal_excl_vat', 10, 2)->default(0)->after('product_discount');

            // VAT amount
            $table->decimal('vat_amount', 10, 2)->default(0)->after('subtotal_excl_vat');

            // Promo code reference (discount field already exists for amount)
            $table->foreignId('promo_code_id')->nullable()->after('discount')->constrained('promo_codes')->onDelete('set null');
            $table->string('promo_code_value')->nullable()->after('promo_code_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['promo_code_id']);
            $table->dropColumn([
                'original_subtotal',
                'product_discount',
                'subtotal_excl_vat',
                'vat_amount',
                'promo_code_id',
                'promo_code_value',
            ]);
        });
    }
};
