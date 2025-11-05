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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->onDelete('cascade');
            $table->string('slug')->unique();
            $table->json('name'); // Translatable: {en: "Body Care", lt: "Kūno priežiūra"}
            $table->json('description')->nullable(); // Translatable
            $table->string('image')->nullable();
            $table->integer('order')->default(0); // For manual sorting
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes
            $table->index('parent_id');
            $table->index('is_active');
            $table->index('order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
