<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Get all existing slugs
        $categories = DB::table('categories')->select('id', 'slug')->get();

        // Add temporary column
        Schema::table('categories', function (Blueprint $table) {
            $table->json('slug_new')->nullable()->after('slug');
        });

        // Migrate existing slugs to JSON format
        foreach ($categories as $category) {
            DB::table('categories')
                ->where('id', $category->id)
                ->update([
                    'slug_new' => json_encode(['en' => $category->slug, 'lt' => ''])
                ]);
        }

        // Drop old column and rename new one
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('slug');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->renameColumn('slug_new', 'slug');
        });
    }

    public function down(): void
    {
        // Get all categories
        $categories = DB::table('categories')->select('id', 'slug')->get();

        // Add temporary string column
        Schema::table('categories', function (Blueprint $table) {
            $table->string('slug_old')->nullable()->after('slug');
        });

        // Extract English slug from JSON
        foreach ($categories as $category) {
            $slugData = json_decode($category->slug, true);
            $enSlug = $slugData['en'] ?? '';

            DB::table('categories')
                ->where('id', $category->id)
                ->update(['slug_old' => $enSlug]);
        }

        // Drop JSON column and rename old one
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('slug');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->renameColumn('slug_old', 'slug');
        });
    }
};
