<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $imageData = [
            // 1. Aloe & Sandalwood Shampoo (both sizes)
            1 => [
                ['path' => 'products/aloe-sandalwood-shampoo-500ml-front.jpg', 'is_primary' => true, 'order' => 1, 'alt_text' => ['en' => 'Aloe & Sandalwood Shampoo 500ml bottle front view', 'lt' => 'Alavijo ir santalmedžio šampūno 500ml butelis, vaizdas iš priekio']],
                ['path' => 'products/aloe-sandalwood-shampoo-500ml-back.jpg', 'is_primary' => false, 'order' => 2, 'alt_text' => ['en' => 'Aloe & Sandalwood Shampoo 500ml ingredients label', 'lt' => 'Alavijo ir santalmedžio šampūno 500ml sudėties etiketė']],
                ['path' => 'products/aloe-sandalwood-shampoo-500ml-lifestyle.jpg', 'is_primary' => false, 'order' => 3, 'alt_text' => ['en' => 'Using Aloe & Sandalwood Shampoo in shower', 'lt' => 'Alavijo ir santalmedžio šampūno naudojimas duše']],
                ['path' => 'products/aloe-sandalwood-shampoo-1000ml-front.jpg', 'is_primary' => false, 'order' => 4, 'alt_text' => ['en' => 'Aloe & Sandalwood Shampoo 1L bottle', 'lt' => 'Alavijo ir santalmedžio šampūno 1L butelis']],
                ['path' => 'products/aloe-sandalwood-shampoo-1000ml-detail.jpg', 'is_primary' => false, 'order' => 5, 'alt_text' => ['en' => 'Shampoo texture close-up', 'lt' => 'Šampūno tekstūros arti planas']],
            ],

            // 2. Lavender Deep Conditioning Mask
            2 => [
                ['path' => 'products/lavender-hair-mask-front.jpg', 'is_primary' => true, 'order' => 1, 'alt_text' => ['en' => 'Lavender Deep Conditioning Hair Mask jar', 'lt' => 'Levandų giliai kondicionuojančios plaukų kaukės stiklainis']],
                ['path' => 'products/lavender-hair-mask-texture.jpg', 'is_primary' => false, 'order' => 2, 'alt_text' => ['en' => 'Creamy hair mask texture', 'lt' => 'Kreminė plaukų kaukės tekstūra']],
                ['path' => 'products/lavender-hair-mask-application.jpg', 'is_primary' => false, 'order' => 3, 'alt_text' => ['en' => 'Applying lavender mask to hair', 'lt' => 'Levandų kaukės naudojimas plaukams']],
            ],

            // 3. Rose & Almond Body Lotion
            3 => [
                ['path' => 'products/rose-almond-lotion-front.jpg', 'is_primary' => true, 'order' => 1, 'alt_text' => ['en' => 'Rose & Almond Body Lotion bottle', 'lt' => 'Rožių ir migdolų kūno losjono butelis']],
                ['path' => 'products/rose-almond-lotion-pump.jpg', 'is_primary' => false, 'order' => 2, 'alt_text' => ['en' => 'Lotion pump dispenser detail', 'lt' => 'Losjono dozatoriaus detalė']],
            ],

            // 4. Eucalyptus & Mint Shower Gel
            4 => [
                ['path' => 'products/eucalyptus-mint-shower-gel-front.jpg', 'is_primary' => true, 'order' => 1, 'alt_text' => ['en' => 'Eucalyptus & Mint Shower Gel bottle', 'lt' => 'Eukaliptų ir mėtų dušo želės butelis']],
                ['path' => 'products/eucalyptus-mint-shower-gel-lifestyle.jpg', 'is_primary' => false, 'order' => 2, 'alt_text' => ['en' => 'Refreshing shower with eucalyptus gel', 'lt' => 'Gaivus dušas su eukaliptų želė']],
            ],

            // 5. Coffee & Brown Sugar Scrub
            5 => [
                ['path' => 'products/coffee-sugar-scrub-front.jpg', 'is_primary' => true, 'order' => 1, 'alt_text' => ['en' => 'Coffee & Brown Sugar Body Scrub jar', 'lt' => 'Kavos ir rudo cukraus kūno šveitiklio stiklainis']],
                ['path' => 'products/coffee-sugar-scrub-texture.jpg', 'is_primary' => false, 'order' => 2, 'alt_text' => ['en' => 'Coffee scrub granules close-up', 'lt' => 'Kavos šveitiklio granulės iš arti']],
                ['path' => 'products/coffee-sugar-scrub-application.jpg', 'is_primary' => false, 'order' => 3, 'alt_text' => ['en' => 'Applying coffee scrub to skin', 'lt' => 'Kavos šveitiklio naudojimas odai']],
            ],

            // 6. Hyaluronic Acid Serum
            6 => [
                ['path' => 'products/hyaluronic-serum-front.jpg', 'is_primary' => true, 'order' => 1, 'alt_text' => ['en' => 'Hyaluronic Acid Face Serum bottle', 'lt' => 'Hialurono rūgšties veido serumo butelis']],
                ['path' => 'products/hyaluronic-serum-dropper.jpg', 'is_primary' => false, 'order' => 2, 'alt_text' => ['en' => 'Serum dropper with liquid', 'lt' => 'Serumo lašintuvas su skysčiu']],
            ],

            // 7. Vitamin C Brightening Serum
            7 => [
                ['path' => 'products/vitamin-c-serum-front.jpg', 'is_primary' => true, 'order' => 1, 'alt_text' => ['en' => 'Vitamin C Brightening Serum amber bottle', 'lt' => 'Vitamino C šviesinančio serumo gintarinis butelis']],
                ['path' => 'products/vitamin-c-serum-application.jpg', 'is_primary' => false, 'order' => 2, 'alt_text' => ['en' => 'Applying Vitamin C serum to face', 'lt' => 'Vitamino C serumo naudojimas veidui']],
            ],

            // 8. Gentle Micellar Water
            8 => [
                ['path' => 'products/micellar-water-front.jpg', 'is_primary' => true, 'order' => 1, 'alt_text' => ['en' => 'Gentle Micellar Water bottle', 'lt' => 'Švelnus micelinės vanduo butelis']],
                ['path' => 'products/micellar-water-cotton.jpg', 'is_primary' => false, 'order' => 2, 'alt_text' => ['en' => 'Micellar water on cotton pad', 'lt' => 'Micelinis vanduo ant vatos pagaliuko']],
            ],

            // 9. Natural Daily Moisturizer
            9 => [
                ['path' => 'products/daily-moisturizer-front.jpg', 'is_primary' => true, 'order' => 1, 'alt_text' => ['en' => 'Natural Daily Moisturizer jar', 'lt' => 'Natūralaus kasdienio drėkiklio stiklainis']],
                ['path' => 'products/daily-moisturizer-texture.jpg', 'is_primary' => false, 'order' => 2, 'alt_text' => ['en' => 'Moisturizer cream texture', 'lt' => 'Drėkiklio kremo tekstūra']],
                ['path' => 'products/daily-moisturizer-lifestyle.jpg', 'is_primary' => false, 'order' => 3, 'alt_text' => ['en' => 'Applying daily moisturizer', 'lt' => 'Kasdienio drėkiklio naudojimas']],
            ],
        ];

        foreach ($imageData as $productId => $images) {
            foreach ($images as $imageInfo) {
                \App\Models\ProductImage::create([
                    'product_id' => $productId,
                    'path' => $imageInfo['path'],
                    'alt_text' => $imageInfo['alt_text'],
                    'is_primary' => $imageInfo['is_primary'],
                    'order' => $imageInfo['order'],
                ]);
            }
        }
    }
}
