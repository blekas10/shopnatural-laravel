<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Change column type from INTEGER to VARCHAR
        // MySQL allows direct conversion, existing integers will become strings
        Schema::table('product_variants', function (Blueprint $table) {
            $table->string('size', 50)->nullable()->comment('Size with unit (e.g., 250ml, 30VNT, 10.5GR)')->change();
        });

        // Step 2: Append 'ml' to all existing numeric values
        // Only update values that are purely numeric (no letters)
        DB::statement("
            UPDATE product_variants
            SET size = CONCAT(size, 'ml')
            WHERE size IS NOT NULL
            AND size != ''
            AND size REGEXP '^[0-9]+$'
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'ml' suffix from values that have it
        DB::statement("
            UPDATE product_variants
            SET size = REPLACE(size, 'ml', '')
            WHERE size LIKE '%ml'
        ");

        // Change column back to integer
        Schema::table('product_variants', function (Blueprint $table) {
            $table->integer('size')->nullable()->comment('Size in ml')->change();
        });
    }
};
