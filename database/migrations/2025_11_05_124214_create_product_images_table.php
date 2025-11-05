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
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('path'); // storage/products/image.jpg
            $table->json('alt_text')->nullable(); // Translatable alt text for SEO/accessibility
            $table->boolean('is_primary')->default(false); // Main product image
            $table->integer('order')->default(0); // Display order
            $table->timestamps();

            // Indexes
            $table->index('product_id');
            $table->index('is_primary');
            $table->index('order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_images');
    }
};
