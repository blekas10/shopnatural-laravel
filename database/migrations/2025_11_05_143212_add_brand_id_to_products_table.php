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
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('brand_id')->nullable()->after('slug')->constrained()->onDelete('set null');

            // Remove fields that now live in variants
            $table->dropColumn(['sku', 'price', 'compare_at_price', 'size', 'stock', 'low_stock_threshold']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['brand_id']);
            $table->dropColumn('brand_id');

            // Restore removed fields
            $table->string('sku')->unique();
            $table->decimal('price', 10, 2);
            $table->decimal('compare_at_price', 10, 2)->nullable();
            $table->integer('size')->nullable();
            $table->integer('stock')->default(0);
            $table->integer('low_stock_threshold')->default(10);
        });
    }
};
