<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\Brand;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get Breathe parent brand
        $breathe = Brand::where('name->en', 'Breathe')->first();

        if (!$breathe) {
            return;
        }

        // Create Breathe sub-brands
        $bodyTherapy = Brand::create([
            'name' => ['en' => 'Body Therapy', 'lt' => 'Kūno terapija'],
            'slug' => 'breathe-body-therapy',
            'description' => [
                'en' => 'Breathe Body Therapy offers luxurious organic body care with firming creams, natural deodorants, and slimming treatments. These eco-conscious formulas rejuvenate and tone your body while respecting your skin and the environment.',
                'lt' => 'Breathe Body Therapy siūlo prabangią ekologišką kūno priežiūrą su stangrinančiais kremais, natūraliais dezodorantais ir lieknėjimo priemonėmis.',
            ],
            'logo' => '/images/brands/collections/breathe/body-therapy.png',
            'parent_id' => $breathe->id,
            'is_active' => true,
            'order' => 0,
        ]);

        $philosophy = Brand::create([
            'name' => ['en' => 'Philosophy', 'lt' => 'Philosophy'],
            'slug' => 'breathe-philosophy',
            'description' => [
                'en' => 'Breathe Philosophy is a premium anti-aging collection featuring concentrated elixirs and eye fillers. These advanced formulas harness nature\'s most potent ingredients to restore youthful radiance and vitality.',
                'lt' => 'Breathe Philosophy – tai aukščiausios klasės anti-aging kolekcija su koncentruotais eliksyrais ir akių užpildais.',
            ],
            'logo' => '/images/brands/collections/breathe/philosophy.png',
            'parent_id' => $breathe->id,
            'is_active' => true,
            'order' => 1,
        ]);

        $weeklyCare = Brand::create([
            'name' => ['en' => 'Weekly Care', 'lt' => 'Savaitinė priežiūra'],
            'slug' => 'breathe-weekly-care',
            'description' => [
                'en' => 'Breathe Weekly Care provides intensive treatments including age-correction masks and gentle peeling gels. Perfect for your weekly self-care ritual, these products deliver deep renewal and visible results.',
                'lt' => 'Breathe Weekly Care siūlo intensyvias procedūras, įskaitant amžiaus korekcijos kaukes ir švelnius pilingus.',
            ],
            'logo' => '/images/brands/collections/breathe/weekly-care.png',
            'parent_id' => $breathe->id,
            'is_active' => true,
            'order' => 2,
        ]);

        $dailyCare = Brand::create([
            'name' => ['en' => 'Daily Care', 'lt' => 'Kasdienė priežiūra'],
            'slug' => 'breathe-daily-care',
            'description' => [
                'en' => 'Breathe Daily Care is your everyday skincare essentials collection featuring moisturizing creams, balancing lotions, serums, and eye masks. Formulated for daily use, these products provide consistent hydration and protection.',
                'lt' => 'Breathe Daily Care – tai kasdienės odos priežiūros kolekcija su drėkinančiais kremais, balansuojančiais losjonais, serumais ir akių kaukėmis.',
            ],
            'logo' => '/images/brands/collections/breathe/daily-care.png',
            'parent_id' => $breathe->id,
            'is_active' => true,
            'order' => 3,
        ]);

        // Assign Breathe products to sub-brands
        // Body Therapy: 23-26
        DB::table('products')->whereIn('id', [23, 24, 25, 26])->update(['brand_id' => $bodyTherapy->id]);

        // Philosophy: 27-28
        DB::table('products')->whereIn('id', [27, 28])->update(['brand_id' => $philosophy->id]);

        // Weekly Care: 29-30
        DB::table('products')->whereIn('id', [29, 30])->update(['brand_id' => $weeklyCare->id]);

        // Daily Care: 31-36
        DB::table('products')->whereIn('id', [31, 32, 33, 34, 35, 36])->update(['brand_id' => $dailyCare->id]);

        // Get Gentleman sub-brands and assign products
        $shaving = Brand::where('slug', 'gentleman-shaving')->first();
        $beard = Brand::where('slug', 'gentleman-beard')->first();
        $hairBody = Brand::where('slug', 'gentleman-hair-body')->first();

        if ($shaving) {
            // Shaving: 145 (Shaving Cream), 153 (After Shave)
            DB::table('products')->whereIn('id', [145, 153])->update(['brand_id' => $shaving->id]);
            // Update logo to use product image
            $shaving->update(['logo' => '/images/brands/collections/gentleman/shaving.png']);
        }

        if ($beard) {
            // Beard: 141, 142, 144, 146, 147
            DB::table('products')->whereIn('id', [141, 142, 144, 146, 147])->update(['brand_id' => $beard->id]);
            $beard->update(['logo' => '/images/brands/collections/gentleman/beard.png']);
        }

        if ($hairBody) {
            // Hair & Body: 143, 148, 149, 150, 151, 152
            DB::table('products')->whereIn('id', [143, 148, 149, 150, 151, 152])->update(['brand_id' => $hairBody->id]);
            $hairBody->update(['logo' => '/images/brands/collections/gentleman/hair-body.png']);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Get Breathe parent brand
        $breathe = Brand::where('name->en', 'Breathe')->first();

        if ($breathe) {
            // Move products back to parent brand
            $subBrandIds = Brand::where('parent_id', $breathe->id)->pluck('id');
            DB::table('products')->whereIn('brand_id', $subBrandIds)->update(['brand_id' => $breathe->id]);

            // Delete sub-brands
            Brand::where('parent_id', $breathe->id)->delete();
        }

        // Get Gentleman parent brand
        $gentleman = Brand::where('name->en', 'Gentleman')->first();

        if ($gentleman) {
            // Move products back to parent brand
            $subBrandIds = Brand::where('parent_id', $gentleman->id)->pluck('id');
            DB::table('products')->whereIn('brand_id', $subBrandIds)->update(['brand_id' => $gentleman->id]);

            // Reset sub-brand logos to hero image
            Brand::where('parent_id', $gentleman->id)->update(['logo' => '/images/brands/gentleman-hero.jpeg']);
        }
    }
};
