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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique(); // Unique product identifier
            $table->string('slug')->unique(); // URL-friendly identifier

            // Translatable text fields
            $table->json('name'); // Product name: {en: "Natural Shampoo", lt: "Natūralus šampūnas"}
            $table->json('title')->nullable(); // Tagline/subtitle: {en: "For daily care", lt: "Kasdienei priežiūrai"}
            $table->json('short_description')->nullable(); // Brief description for listings
            $table->json('description'); // Full product description
            $table->json('additional_information')->nullable(); // Usage instructions, care tips, etc.
            $table->json('ingredients'); // List of ingredients

            // Product details
            $table->decimal('size', 8, 2)->nullable(); // Size in ml (e.g., 250.00, 500.00, 1000.00)
            $table->decimal('price', 10, 2); // Price in EUR (e.g., 15.99)
            $table->decimal('compare_at_price', 10, 2)->nullable(); // Original price for sale items

            // Inventory
            $table->integer('stock')->default(0);
            $table->integer('low_stock_threshold')->default(10);

            // Status
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);

            // SEO (optional, translatable)
            $table->json('meta_title')->nullable();
            $table->json('meta_description')->nullable();

            $table->timestamps();
            $table->softDeletes(); // Soft delete for order history preservation

            // Indexes
            $table->index('sku');
            $table->index('slug');
            $table->index('is_active');
            $table->index('is_featured');
            $table->index('stock');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
