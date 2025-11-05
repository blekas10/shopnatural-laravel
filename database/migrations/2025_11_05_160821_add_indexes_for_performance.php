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
        // Products table indexes
        Schema::table('products', function (Blueprint $table) {
            $table->index('is_active');
            $table->index('is_featured');
            $table->index('slug');
            $table->index('brand_id');
            $table->index(['is_active', 'is_featured']); // Composite index for featured active products
        });

        // Categories table indexes
        Schema::table('categories', function (Blueprint $table) {
            $table->index('parent_id');
            $table->index('is_active');
            $table->index('order');
            $table->index(['is_active', 'order']); // Composite index for active categories by order
        });

        // Product variants table indexes
        Schema::table('product_variants', function (Blueprint $table) {
            $table->index('product_id');
            $table->index('is_default');
            $table->index('stock');
            $table->index(['product_id', 'is_default']); // Composite index for default variant lookup
        });

        // Product images table indexes
        Schema::table('product_images', function (Blueprint $table) {
            $table->index('product_id');
            $table->index('is_primary');
            $table->index(['product_id', 'is_primary']); // Composite index for primary image lookup
            $table->index(['product_id', 'order']); // Composite index for image ordering
        });

        // Brands table indexes
        Schema::table('brands', function (Blueprint $table) {
            $table->index('is_active');
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop products indexes
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
            $table->dropIndex(['is_featured']);
            $table->dropIndex(['slug']);
            $table->dropIndex(['brand_id']);
            $table->dropIndex(['is_active', 'is_featured']);
        });

        // Drop categories indexes
        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex(['parent_id']);
            $table->dropIndex(['is_active']);
            $table->dropIndex(['order']);
            $table->dropIndex(['is_active', 'order']);
        });

        // Drop product variants indexes
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropIndex(['product_id']);
            $table->dropIndex(['is_default']);
            $table->dropIndex(['stock']);
            $table->dropIndex(['product_id', 'is_default']);
        });

        // Drop product images indexes
        Schema::table('product_images', function (Blueprint $table) {
            $table->dropIndex(['product_id']);
            $table->dropIndex(['is_primary']);
            $table->dropIndex(['product_id', 'is_primary']);
            $table->dropIndex(['product_id', 'order']);
        });

        // Drop brands indexes
        Schema::table('brands', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
            $table->dropIndex(['slug']);
        });
    }
};
