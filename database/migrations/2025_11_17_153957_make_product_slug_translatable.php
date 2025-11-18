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
        // First, get all existing slugs
        $products = DB::table('products')->select('id', 'slug')->get();

        // Add a temporary column for the new JSON structure
        Schema::table('products', function (Blueprint $table) {
            $table->json('slug_new')->nullable()->after('slug');
        });

        // Migrate existing slugs to JSON format (as English translation)
        foreach ($products as $product) {
            DB::table('products')
                ->where('id', $product->id)
                ->update([
                    'slug_new' => json_encode(['en' => $product->slug, 'lt' => ''])
                ]);
        }

        // Drop old slug column and rename new one
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('slug');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->renameColumn('slug_new', 'slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Get all products with JSON slugs
        $products = DB::table('products')->select('id', 'slug')->get();

        // Add temporary string column
        Schema::table('products', function (Blueprint $table) {
            $table->string('slug_old')->nullable()->after('slug');
        });

        // Extract English slug from JSON
        foreach ($products as $product) {
            $slugData = json_decode($product->slug, true);
            $enSlug = $slugData['en'] ?? '';

            DB::table('products')
                ->where('id', $product->id)
                ->update(['slug_old' => $enSlug]);
        }

        // Drop JSON column and rename old one
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('slug');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->renameColumn('slug_old', 'slug');
        });
    }
};
