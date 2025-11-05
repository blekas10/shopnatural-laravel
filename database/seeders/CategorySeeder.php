<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. FACE CARE
        $faceCare = Category::create([
            'slug' => 'face-care',
            'name' => ['en' => 'Face Care', 'lt' => 'Veido priežiūra'],
            'description' => ['en' => 'Natural skincare for your face', 'lt' => 'Natūrali odos priežiūra jūsų veidui'],
            'order' => 1,
            'is_active' => true,
        ]);

        // Face Care > Cleansers
        Category::create([
            'parent_id' => $faceCare->id,
            'slug' => 'cleansers',
            'name' => ['en' => 'Cleansers', 'lt' => 'Valikliai'],
            'description' => ['en' => 'Gentle face cleansers and makeup removers', 'lt' => 'Švelnūs veido valikliai ir makiažo valikliai'],
            'order' => 1,
            'is_active' => true,
        ]);

        // Face Care > Moisturizers
        Category::create([
            'parent_id' => $faceCare->id,
            'slug' => 'moisturizers',
            'name' => ['en' => 'Moisturizers', 'lt' => 'Drėkikliai'],
            'description' => ['en' => 'Hydrating creams and lotions', 'lt' => 'Drėkinantys kremai ir losjonai'],
            'order' => 2,
            'is_active' => true,
        ]);

        // Face Care > Serums
        Category::create([
            'parent_id' => $faceCare->id,
            'slug' => 'serums',
            'name' => ['en' => 'Serums', 'lt' => 'Serumai'],
            'description' => ['en' => 'Concentrated treatments for specific concerns', 'lt' => 'Koncentruotos priemonės specifinėms problemoms'],
            'order' => 3,
            'is_active' => true,
        ]);

        // Face Care > Face Masks
        Category::create([
            'parent_id' => $faceCare->id,
            'slug' => 'face-masks',
            'name' => ['en' => 'Face Masks', 'lt' => 'Veido kaukės'],
            'description' => ['en' => 'Deep treatment masks', 'lt' => 'Gilaus veikimo kaukės'],
            'order' => 4,
            'is_active' => true,
        ]);

        // 2. BODY CARE
        $bodyCare = Category::create([
            'slug' => 'body-care',
            'name' => ['en' => 'Body Care', 'lt' => 'Kūno priežiūra'],
            'description' => ['en' => 'Nourishing products for your body', 'lt' => 'Maitinančios priemonės jūsų kūnui'],
            'order' => 2,
            'is_active' => true,
        ]);

        // Body Care > Body Lotions
        Category::create([
            'parent_id' => $bodyCare->id,
            'slug' => 'body-lotions',
            'name' => ['en' => 'Body Lotions', 'lt' => 'Kūno losjonai'],
            'description' => ['en' => 'Hydrating body lotions and creams', 'lt' => 'Drėkinantys kūno losjonai ir kremai'],
            'order' => 1,
            'is_active' => true,
        ]);

        // Body Care > Body Wash
        Category::create([
            'parent_id' => $bodyCare->id,
            'slug' => 'body-wash',
            'name' => ['en' => 'Body Wash', 'lt' => 'Dušo želė'],
            'description' => ['en' => 'Gentle cleansing for your body', 'lt' => 'Švelnūs kūno valikliai'],
            'order' => 2,
            'is_active' => true,
        ]);

        // Body Care > Body Scrubs
        Category::create([
            'parent_id' => $bodyCare->id,
            'slug' => 'body-scrubs',
            'name' => ['en' => 'Body Scrubs', 'lt' => 'Kūno šveitikliai'],
            'description' => ['en' => 'Exfoliating scrubs for smooth skin', 'lt' => 'Šveitikliai lygiaikrai odai'],
            'order' => 3,
            'is_active' => true,
        ]);

        // Body Care > Hand Care
        $handCare = Category::create([
            'parent_id' => $bodyCare->id,
            'slug' => 'hand-care',
            'name' => ['en' => 'Hand Care', 'lt' => 'Rankų priežiūra'],
            'description' => ['en' => 'Creams and treatments for hands', 'lt' => 'Kremai ir priežiūros priemonės rankoms'],
            'order' => 4,
            'is_active' => true,
        ]);

        // Body Care > Hand Care > Hand Creams
        Category::create([
            'parent_id' => $handCare->id,
            'slug' => 'hand-creams',
            'name' => ['en' => 'Hand Creams', 'lt' => 'Rankų kremai'],
            'description' => ['en' => 'Nourishing hand creams', 'lt' => 'Maitinantys rankų kremai'],
            'order' => 1,
            'is_active' => true,
        ]);

        // 3. HAIR CARE
        $hairCare = Category::create([
            'slug' => 'hair-care',
            'name' => ['en' => 'Hair Care', 'lt' => 'Plaukų priežiūra'],
            'description' => ['en' => 'Natural hair care products', 'lt' => 'Natūralios plaukų priežiūros priemonės'],
            'order' => 3,
            'is_active' => true,
        ]);

        // Hair Care > Shampoo
        Category::create([
            'parent_id' => $hairCare->id,
            'slug' => 'shampoo',
            'name' => ['en' => 'Shampoo', 'lt' => 'Šampūnai'],
            'description' => ['en' => 'Gentle cleansing shampoos', 'lt' => 'Švelniai valantys šampūnai'],
            'order' => 1,
            'is_active' => true,
        ]);

        // Hair Care > Conditioner
        Category::create([
            'parent_id' => $hairCare->id,
            'slug' => 'conditioner',
            'name' => ['en' => 'Conditioner', 'lt' => 'Kondicionieriai'],
            'description' => ['en' => 'Nourishing hair conditioners', 'lt' => 'Maitinantys plaukų kondicionieriai'],
            'order' => 2,
            'is_active' => true,
        ]);

        // Hair Care > Hair Masks
        Category::create([
            'parent_id' => $hairCare->id,
            'slug' => 'hair-masks',
            'name' => ['en' => 'Hair Masks', 'lt' => 'Plaukų kaukės'],
            'description' => ['en' => 'Deep conditioning treatments', 'lt' => 'Giliai maitinančios priemonės'],
            'order' => 3,
            'is_active' => true,
        ]);

        // Hair Care > Hair Oils
        Category::create([
            'parent_id' => $hairCare->id,
            'slug' => 'hair-oils',
            'name' => ['en' => 'Hair Oils', 'lt' => 'Plaukų aliejai'],
            'description' => ['en' => 'Nourishing natural oils', 'lt' => 'Maitinantys natūralūs aliejai'],
            'order' => 4,
            'is_active' => true,
        ]);

        // 4. SPECIAL COLLECTIONS (flat categories)
        Category::create([
            'slug' => 'best-sellers',
            'name' => ['en' => 'Best Sellers', 'lt' => 'Populiariausi'],
            'description' => ['en' => 'Our most popular products', 'lt' => 'Mūsų populiariausi produktai'],
            'order' => 10,
            'is_active' => true,
        ]);

        Category::create([
            'slug' => 'new-arrivals',
            'name' => ['en' => 'New Arrivals', 'lt' => 'Naujienos'],
            'description' => ['en' => 'Latest additions to our collection', 'lt' => 'Naujausi papildymai mūsų kolekcijoje'],
            'order' => 11,
            'is_active' => true,
        ]);

        Category::create([
            'slug' => 'on-sale',
            'name' => ['en' => 'On Sale', 'lt' => 'Akcijos'],
            'description' => ['en' => 'Special offers and discounts', 'lt' => 'Specialūs pasiūlymai ir nuolaidos'],
            'order' => 12,
            'is_active' => true,
        ]);
    }
}
