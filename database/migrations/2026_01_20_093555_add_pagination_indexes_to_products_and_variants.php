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
        // Add composite index for featured + created_at (featured sorting)
        Schema::table('products', function (Blueprint $table) {
            $table->index(['is_featured', 'created_at'], 'idx_products_featured_created');
            $table->index('brand_id');
        });

        // Add indexes for product variants filtering and sorting
        Schema::table('product_variants', function (Blueprint $table) {
            $table->index(['is_default', 'price'], 'idx_variants_default_price');
            $table->index(['compare_at_price', 'price'], 'idx_variants_sale');
            $table->index(['is_active', 'stock'], 'idx_variants_active_stock');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_featured_created');
            $table->dropIndex(['brand_id']);
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropIndex('idx_variants_default_price');
            $table->dropIndex('idx_variants_sale');
            $table->dropIndex('idx_variants_active_stock');
        });
    }
};
