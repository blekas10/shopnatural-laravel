<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get brands
        $naturalmente = Brand::where('slug', 'naturalmente')->first();
        $myOrganics = Brand::where('slug', 'my-organics')->first();

        // Get categories for assignment
        $shampoo = Category::where('slug', 'shampoo')->first();
        $conditioner = Category::where('slug', 'conditioner')->first();
        $hairMasks = Category::where('slug', 'hair-masks')->first();
        $bodyLotions = Category::where('slug', 'body-lotions')->first();
        $bodyWash = Category::where('slug', 'body-wash')->first();
        $bodyScrubs = Category::where('slug', 'body-scrubs')->first();
        $moisturizers = Category::where('slug', 'moisturizers')->first();
        $serums = Category::where('slug', 'serums')->first();
        $cleansers = Category::where('slug', 'cleansers')->first();
        $bestSellers = Category::where('slug', 'best-sellers')->first();
        $newArrivals = Category::where('slug', 'new-arrivals')->first();
        $onSale = Category::where('slug', 'on-sale')->first();

        // 1. Aloe & Sandalwood Shampoo (Naturalmente)
        $product1 = Product::create([
            'brand_id' => $naturalmente->id,
            'slug' => 'aloe-sandalwood-shampoo',
            'name' => ['en' => 'Aloe & Sandalwood Shampoo', 'lt' => 'Alavijo ir santalmedžio šampūnas'],
            'title' => ['en' => 'For daily gentle care', 'lt' => 'Kasdienei švelniai priežiūrai'],
            'short_description' => [
                'en' => 'Natural shampoo with organic aloe vera and sandalwood for all hair types',
                'lt' => 'Natūralus šampūnas su ekologišku alaviju ir santalmedžiu visiems plaukų tipams'
            ],
            'description' => [
                'en' => 'Our Aloe & Sandalwood Shampoo gently cleanses while nourishing your hair with natural ingredients. Perfect for daily use, it leaves hair soft, shiny, and healthy.',
                'lt' => 'Mūsų alavijo ir santalmedžio šampūnas švelniai valo ir maitina plaukus natūraliais ingredientais. Puikiai tinka kasdieniam naudojimui, palieka plaukus minkštus, blizgius ir sveikus.'
            ],
            'additional_information' => [
                'en' => 'Apply to wet hair, massage gently, and rinse thoroughly. For best results, follow with our Aloe Conditioner.',
                'lt' => 'Užtepkite ant šlapių plaukų, švelniai masažuokite ir kruopščiai nuplaukite. Geriausiam rezultatui naudokite su mūsų alavijo kondicionieriumi.'
            ],
            'ingredients' => [
                'en' => 'Aloe Vera Extract (70%), Sandalwood Essential Oil, Coconut Oil, Vitamin E, Natural Surfactants, Purified Water',
                'lt' => 'Alavijo ekstraktas (70%), Santalmedžio eterinis aliejus, Kokosų aliejus, Vitaminas E, Natūralūs paviršinio aktyvumo medžiagos, Grynas vanduo'
            ],
            'is_active' => true,
            'is_featured' => true,
        ]);
        $product1->categories()->attach([$shampoo->id, $bestSellers->id]);

        ProductVariant::create([
            'product_id' => $product1->id,
            'sku' => 'SHMP-ALO-500',
            'size' => 500,
            'price' => 15.99,
            'stock' => 45,
            'is_default' => true,
        ]);

        ProductVariant::create([
            'product_id' => $product1->id,
            'sku' => 'SHMP-ALO-1000',
            'size' => 1000,
            'price' => 24.99,
            'compare_at_price' => 31.98,
            'stock' => 32,
            'is_default' => false,
        ]);

        // 2. Lavender Hair Mask (Naturalmente)
        $product2 = Product::create([
            'brand_id' => $naturalmente->id,
            'slug' => 'lavender-deep-conditioning-hair-mask',
            'name' => ['en' => 'Lavender Deep Conditioning Mask', 'lt' => 'Levandų gilaus poveikio kaukė'],
            'title' => ['en' => 'Intense hydration therapy', 'lt' => 'Intensyvaus drėkinimo terapija'],
            'short_description' => [
                'en' => 'Weekly treatment mask for dry and damaged hair',
                'lt' => 'Savaitinė priežiūros kaukė sausiems ir pažeistiems plaukams'
            ],
            'description' => [
                'en' => 'This intensive conditioning mask deeply nourishes and repairs damaged hair. Infused with lavender essential oil and argan oil for maximum hydration.',
                'lt' => 'Ši intensyvi kondicionavimo kaukė giliai maitina ir atnaujina pažeistus plaukus. Papildyta levandų eteriniu aliejumi ir argano aliejumi maksimaliam drėkinimui.'
            ],
            'additional_information' => [
                'en' => 'Apply to clean, damp hair. Leave for 10-15 minutes, then rinse. Use 1-2 times per week.',
                'lt' => 'Užtepkite ant švarių, drėgnų plaukų. Palikite 10-15 minučių, tada nuplaukite. Naudokite 1-2 kartus per savaitę.'
            ],
            'ingredients' => [
                'en' => 'Lavender Essential Oil, Argan Oil, Shea Butter, Keratin, Vitamin B5, Aqua',
                'lt' => 'Levandų eterinis aliejus, Argano aliejus, Sviesto riešutų sviestas, Keratinas, Vitaminas B5, Vanduo'
            ],
            'is_active' => true,
            'is_featured' => true,
        ]);
        $product2->categories()->attach([$hairMasks->id, $bestSellers->id, $newArrivals->id]);

        ProductVariant::create([
            'product_id' => $product2->id,
            'sku' => 'MASK-LAV-250',
            'size' => 250,
            'price' => 22.50,
            'stock' => 28,
            'is_default' => true,
        ]);

        // 3. Rose & Almond Body Lotion (Naturalmente)
        $product3 = Product::create([
            'brand_id' => $naturalmente->id,
            'slug' => 'rose-almond-body-lotion',
            'name' => ['en' => 'Rose & Almond Body Lotion', 'lt' => 'Rožių ir migdolų kūno losjonas'],
            'title' => ['en' => 'Silky smooth skin all day', 'lt' => 'Šilkinė lygi oda visą dieną'],
            'short_description' => [
                'en' => 'Luxurious body lotion with rose extract and sweet almond oil',
                'lt' => 'Prabangus kūno losjonas su rožių ekstraktu ir saldžiųjų migdolų aliejumi'
            ],
            'description' => [
                'en' => 'Indulge your skin with this rich, non-greasy lotion. Rose extract soothes while almond oil deeply moisturizes. Perfect for all skin types.',
                'lt' => 'Lepinkite savo odą šiuo turtingu, neriebalojančiu losjonu. Rožių ekstraktas nuramina, o migdolų aliejus giliai drėkina. Puikiai tinka visiems odos tipams.'
            ],
            'additional_information' => [
                'en' => 'Apply generously to clean skin. Massage in circular motions until fully absorbed. Use daily for best results.',
                'lt' => 'Gausiai užtepkite ant švarios odos. Masažuokite žiediniais judesiais, kol visiškai įsigeria. Naudokite kasdien geriausiam rezultatui.'
            ],
            'ingredients' => [
                'en' => 'Sweet Almond Oil, Rose Extract, Glycerin, Jojoba Oil, Vitamin E, Natural Fragrance',
                'lt' => 'Saldžiųjų migdolų aliejus, Rožių ekstraktas, Glicerinas, Jojobos aliejus, Vitaminas E, Natūralūs kvapai'
            ],
            'is_active' => true,
            'is_featured' => false,
        ]);
        $product3->categories()->attach([$bodyLotions->id]);

        ProductVariant::create([
            'product_id' => $product3->id,
            'sku' => 'LOT-ROS-300',
            'size' => 300,
            'price' => 18.99,
            'stock' => 55,
            'is_default' => true,
        ]);

        // 4. Eucalyptus & Mint Shower Gel (Naturalmente)
        $product4 = Product::create([
            'brand_id' => $naturalmente->id,
            'slug' => 'eucalyptus-mint-shower-gel',
            'name' => ['en' => 'Eucalyptus & Mint Shower Gel', 'lt' => 'Eukaliptas ir mėtų dušo želė'],
            'title' => ['en' => 'Refreshing morning boost', 'lt' => 'Gaivinantis ryto postūmis'],
            'short_description' => [
                'en' => 'Energizing shower gel with natural eucalyptus and peppermint',
                'lt' => 'Energinganti dušo želė su natūraliu eukaliptu ir pipirmėte'
            ],
            'description' => [
                'en' => 'Wake up your senses with this invigorating shower gel. Eucalyptus and mint provide a cooling, refreshing experience while gently cleansing your skin.',
                'lt' => 'Pažadinkite savo jutimus šia gaivinančia dušo žele. Eukaliptas ir mėtos suteikia vėsinantį, gaivų pojūtį švelniai valant odą.'
            ],
            'additional_information' => [
                'en' => 'Apply to wet skin, work into a lather, and rinse. Safe for daily use.',
                'lt' => 'Užtepkite ant drėgnos odos, sudaryti putas ir nuplaukite. Saugu kasdieniam naudojimui.'
            ],
            'ingredients' => [
                'en' => 'Eucalyptus Essential Oil, Peppermint Oil, Aloe Vera, Natural Cleansing Base, Vitamin C',
                'lt' => 'Eukaliptmedžio eterinis aliejus, Pipirmėčių aliejus, Alavijas, Natūrali valymo bazė, Vitaminas C'
            ],
            'is_active' => true,
            'is_featured' => false,
        ]);
        $product4->categories()->attach([$bodyWash->id]);

        ProductVariant::create([
            'product_id' => $product4->id,
            'sku' => 'WASH-EUC-400',
            'size' => 400,
            'price' => 12.99,
            'stock' => 68,
            'is_default' => true,
        ]);

        // 5. Coffee & Brown Sugar Body Scrub (Naturalmente) (Sale)
        $product5 = Product::create([
            'brand_id' => $naturalmente->id,
            'slug' => 'coffee-brown-sugar-scrub',
            'name' => ['en' => 'Coffee & Brown Sugar Scrub', 'lt' => 'Kavos ir rudo cukraus šveitiklis'],
            'title' => ['en' => 'Exfoliate & energize', 'lt' => 'Nušveiskite ir suteikite energijos'],
            'short_description' => [
                'en' => 'Natural exfoliating scrub with coffee grounds and brown sugar',
                'lt' => 'Natūralus šveitiklis su kavos tirščiais ir rudu cukrumi'
            ],
            'description' => [
                'en' => 'Buff away dead skin cells and reveal smoother, brighter skin. Coffee stimulates circulation while brown sugar gently exfoliates.',
                'lt' => 'Pašalinkite negyvias odos ląsteles ir atskleiskite lygesnę, šviesesnę odą. Kava stimuliuoja kraujotaką, o rudas cukrus švelniai šveitia.'
            ],
            'additional_information' => [
                'en' => 'Use 2-3 times per week. Apply to damp skin in circular motions, then rinse. Not for facial use.',
                'lt' => 'Naudokite 2-3 kartus per savaitę. Užtepkite ant drėgnos odos žiediniais judesiais, tada nuplaukite. Netinka veidui.'
            ],
            'ingredients' => [
                'en' => 'Arabica Coffee Grounds, Brown Sugar, Coconut Oil, Sweet Almond Oil, Vitamin E',
                'lt' => 'Arabikos kavos tirščiai, Rudas cukrus, Kokosų aliejus, Saldžiųjų migdolų aliejus, Vitaminas E'
            ],
            'is_active' => true,
            'is_featured' => true,
        ]);
        $product5->categories()->attach([$bodyScrubs->id, $onSale->id, $bestSellers->id]);

        ProductVariant::create([
            'product_id' => $product5->id,
            'sku' => 'SCRB-COF-200',
            'size' => 200,
            'price' => 14.99,
            'compare_at_price' => 19.99,
            'stock' => 42,
            'is_default' => true,
        ]);

        // 6. Hyaluronic Acid Serum (MY.ORGANICS)
        $product6 = Product::create([
            'brand_id' => $myOrganics->id,
            'slug' => 'hyaluronic-acid-serum',
            'name' => ['en' => 'Hyaluronic Acid Serum', 'lt' => 'Hialurono rūgšties serumas'],
            'title' => ['en' => 'Plump & hydrate', 'lt' => 'Prapūskite ir drėkinkite'],
            'short_description' => [
                'en' => 'Concentrated serum with 2% hyaluronic acid for intense hydration',
                'lt' => 'Koncentruotas serumas su 2% hialurono rūgštimi intensyviam drėkinimui'
            ],
            'description' => [
                'en' => 'This lightweight serum delivers deep hydration, plumping fine lines and leaving skin dewy and refreshed. Suitable for all skin types.',
                'lt' => 'Šis lengvas serumas suteikia gilų drėkinimą, išlygina smulkias raukšles ir palieka odą gaivią. Tinka visiems odos tipams.'
            ],
            'additional_information' => [
                'en' => 'Apply 2-3 drops to clean face morning and evening. Follow with moisturizer. Can be used under makeup.',
                'lt' => 'Užtepkite 2-3 lašus ant švario veido ryte ir vakare. Tęskite su drėkikliu. Galima naudoti po makiažu.'
            ],
            'ingredients' => [
                'en' => 'Hyaluronic Acid (2%), Glycerin, Vitamin B5, Aloe Vera, Purified Water',
                'lt' => 'Hialurono rūgštis (2%), Glicerinas, Vitaminas B5, Alavijas, Grynas vanduo'
            ],
            'is_active' => true,
            'is_featured' => true,
        ]);
        $product6->categories()->attach([$serums->id, $newArrivals->id]);

        ProductVariant::create([
            'product_id' => $product6->id,
            'sku' => 'SER-HYA-30',
            'size' => 30,
            'price' => 28.99,
            'stock' => 24,
            'is_default' => true,
        ]);

        // 7. Vitamin C Brightening Serum (MY.ORGANICS)
        $product7 = Product::create([
            'brand_id' => $myOrganics->id,
            'slug' => 'vitamin-c-brightening-serum',
            'name' => ['en' => 'Vitamin C Brightening Serum', 'lt' => 'Vitamino C šviesinantis serumas'],
            'title' => ['en' => 'Radiant, even skin tone', 'lt' => 'Spinduliuojanti, vienoda odos spalva'],
            'short_description' => [
                'en' => '15% Vitamin C serum for brighter, more even complexion',
                'lt' => '15% Vitamino C serumas šviesesnei, vienodesesnei odai'
            ],
            'description' => [
                'en' => 'Powerful antioxidant serum that brightens dark spots, evens skin tone, and protects against environmental damage.',
                'lt' => 'Galingas antioksidantinis serumas, kuris šviesina tamsias dėmes, išlygina odos spalvą ir apsaugo nuo aplinkos poveikio.'
            ],
            'additional_information' => [
                'en' => 'Use in the morning. Apply to clean skin before moisturizer. Always follow with SPF.',
                'lt' => 'Naudokite ryte. Užtepkite ant švarios odos prieš drėkiklį. Visada naudokite su SPF.'
            ],
            'ingredients' => [
                'en' => 'L-Ascorbic Acid (15%), Vitamin E, Ferulic Acid, Hyaluronic Acid, Purified Water',
                'lt' => 'L-askorbino rūgštis (15%), Vitaminas E, Ferulo rūgštis, Hialurono rūgštis, Grynas vanduo'
            ],
            'is_active' => true,
            'is_featured' => false,
        ]);
        $product7->categories()->attach([$serums->id, $newArrivals->id]);

        ProductVariant::create([
            'product_id' => $product7->id,
            'sku' => 'SER-VTC-30',
            'size' => 30,
            'price' => 32.99,
            'stock' => 18,
            'is_default' => true,
        ]);

        // 8. Gentle Micellar Water (MY.ORGANICS)
        $product8 = Product::create([
            'brand_id' => $myOrganics->id,
            'slug' => 'gentle-micellar-water',
            'name' => ['en' => 'Gentle Micellar Water', 'lt' => 'Švelnaus miceliinis vanduo'],
            'title' => ['en' => 'No-rinse makeup remover', 'lt' => 'Makiažo valiklis be skalavimo'],
            'short_description' => [
                'en' => 'All-in-one cleanser and makeup remover for sensitive skin',
                'lt' => 'Viena priemonė valymui ir makiažo šalinimui jautriai odai'
            ],
            'description' => [
                'en' => 'This gentle, no-rinse formula removes makeup, cleanses, and tones in one step. Perfect for all skin types, especially sensitive.',
                'lt' => 'Ši švelni, neskalavimo formulė pašalina makiažą, valo ir tonizuoja vienu žingsniu. Puikiai tinka visiems odos tipams, ypač jautriai odai.'
            ],
            'additional_information' => [
                'en' => 'Soak cotton pad and gently wipe over face and eyes. No rinsing needed. Use morning and evening.',
                'lt' => 'Pamirkykite vatos diskelį ir švelniai nušluostykite veidą ir akis. Skalavimas nebūtinas. Naudokite ryte ir vakare.'
            ],
            'ingredients' => [
                'en' => 'Micelles, Glycerin, Rose Water, Cucumber Extract, Purified Water',
                'lt' => 'Micelės, Glicerinas, Rožių vanduo, Agurkų ekstraktas, Grynas vanduo'
            ],
            'is_active' => true,
            'is_featured' => false,
        ]);
        $product8->categories()->attach([$cleansers->id]);

        ProductVariant::create([
            'product_id' => $product8->id,
            'sku' => 'CLN-MIC-400',
            'size' => 400,
            'price' => 11.99,
            'stock' => 73,
            'is_default' => true,
        ]);

        // 9. Natural Daily Moisturizer (MY.ORGANICS)
        $product9 = Product::create([
            'brand_id' => $myOrganics->id,
            'slug' => 'natural-daily-moisturizer',
            'name' => ['en' => 'Natural Daily Moisturizer', 'lt' => 'Natūralus kasdieninis drėkiklis'],
            'title' => ['en' => 'Hydration that lasts', 'lt' => 'Ilgai trunkantis drėkinimas'],
            'short_description' => [
                'en' => 'Lightweight daily cream with shea butter and jojoba oil',
                'lt' => 'Lengvas kasdieninis kremas su sviesto riešutų sviestu ir jojobos aliejumi'
            ],
            'description' => [
                'en' => 'Keep your skin hydrated all day with this fast-absorbing moisturizer. Shea butter and jojoba oil nourish without feeling heavy.',
                'lt' => 'Palaikykite odos drėgmę visą dieną su šiuo greitai įsigerančiu drėkikliu. Sviesto riešutų sviestas ir jojobos aliejus maitina be sunkumo jausmo.'
            ],
            'additional_information' => [
                'en' => 'Apply to clean face and neck morning and evening. Massage gently until absorbed.',
                'lt' => 'Užtepkite ant švario veido ir kaklo ryte ir vakare. Švelniai masažuokite, kol įsigeria.'
            ],
            'ingredients' => [
                'en' => 'Shea Butter, Jojoba Oil, Aloe Vera, Vitamin E, Green Tea Extract, Aqua',
                'lt' => 'Sviesto riešutų sviestas, Jojobos aliejus, Alavijas, Vitaminas E, Žaliosios arbatos ekstraktas, Vanduo'
            ],
            'is_active' => true,
            'is_featured' => true,
        ]);
        $product9->categories()->attach([$moisturizers->id, $bestSellers->id]);

        ProductVariant::create([
            'product_id' => $product9->id,
            'sku' => 'MOIS-NAT-50',
            'size' => 50,
            'price' => 24.99,
            'stock' => 39,
            'is_default' => true,
        ]);
    }
}
