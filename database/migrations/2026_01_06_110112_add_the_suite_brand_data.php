<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update 'The Suite' sub-brand with description and logo
        DB::table('brands')
            ->where('name->en', 'The Suite')
            ->update([
                'description' => json_encode([
                    'en' => 'The Suite by Naturalmente is a premium hair and scalp care collection featuring concentrated treatments and specialized formulas. Designed for intensive care, these products deliver salon-quality results with pure botanical ingredients for healthy, revitalized hair.',
                    'lt' => 'The Suite by Naturalmente – tai aukščiausios klasės plaukų ir galvos odos priežiūros kolekcija su koncentruotomis priemonėmis ir specializuotomis formulėmis. Sukurta intensyviai priežiūrai, šie produktai suteikia salono kokybės rezultatus su grynais augaliniais ingredientais.',
                ]),
                'logo' => '/images/brands/collections/naturalmente/the-suite.png',
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('brands')
            ->where('name->en', 'The Suite')
            ->update([
                'description' => null,
                'logo' => null,
            ]);
    }
};
