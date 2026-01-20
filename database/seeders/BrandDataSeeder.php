<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BrandDataSeeder extends Seeder
{
    /**
     * Seed the brand data from shop-natural.com
     */
    public function run(): void
    {
        // Disable foreign key checks, clear existing brands, then re-enable
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Brand::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $brands = $this->getBrandsData();

        foreach ($brands as $order => $brandData) {
            $parent = Brand::create([
                'name' => $brandData['name'],
                'slug' => $brandData['slug'],
                'description' => $brandData['description'],
                'logo' => $brandData['logo'],
                'is_active' => true,
                'order' => $order,
            ]);

            // Create children
            foreach ($brandData['children'] as $childOrder => $childData) {
                Brand::create([
                    'name' => $childData['name'],
                    'slug' => $childData['slug'],
                    'description' => $childData['description'],
                    'logo' => $childData['logo'],
                    'parent_id' => $parent->id,
                    'is_active' => true,
                    'order' => $childOrder,
                ]);
            }
        }
    }

    private function getBrandsData(): array
    {
        return [
            // 1. Naturalmente
            [
                'name' => ['en' => 'Naturalmente', 'lt' => 'Naturalmente'],
                'slug' => 'naturalmente',
                'description' => [
                    'en' => "For 15 years, we've been transforming our concept of beauty and wellness into highly performing natural products.",
                    'lt' => "Jau 15 metų mūsų grožio ir geros savijautos samprata virsta aukštos kokybės natūraliais produktais.",
                ],
                'logo' => '/images/brands/naturalmente-hero.jpg',
                'children' => [
                    [
                        'name' => ['en' => 'Base Oil', 'lt' => 'Baziniai aliejai'],
                        'slug' => 'naturalmente-base-oil',
                        'description' => [
                            'en' => "Naturalmente's base oils nourish and protect hair and skin, providing hydration and essential nutrients. Sustainably sourced and gentle, they enhance vitality for all hair and skin types.",
                            'lt' => "Maitinantys Naturalmente baziniai aliejai padeda apsaugoti odą ir plaukus bei palaikyti jų drėgmės balansą.",
                        ],
                        'logo' => '/images/brands/collections/naturalmente/base-oil.png',
                    ],
                    [
                        'name' => ['en' => 'Botanic Skincare', 'lt' => 'Botanic Skincare'],
                        'slug' => 'naturalmente-botanic-skincare',
                        'description' => [
                            'en' => 'Gentle, plant-based skincare combining efficacy and sustainability. Free from harmful chemicals, the products care for your skin and the environment while delivering authentic, effective results.',
                            'lt' => 'Švelni, augaliniais ingredientais paremta odos priežiūra, derinanti veiksmingumą ir tvarumą.',
                        ],
                        'logo' => '/images/brands/collections/naturalmente/botanic-skincare.png',
                    ],
                    [
                        'name' => ['en' => 'Color Plant Flower', 'lt' => 'Color Plant Flower'],
                        'slug' => 'naturalmente-color-plant-flower',
                        'description' => [
                            'en' => 'Plant-based products that extend the life of colored hair. The products soften hair, enhance shine, and maintain color vibrancy.',
                            'lt' => 'Augalinės kilmės produktai, kurie prailgina dažymo rezultatus, minkština plaukus, suteikia jiems blizgesio ir palaiko spalvos žvilgesį.',
                        ],
                        'logo' => '/images/brands/collections/naturalmente/color-plant-flower.png',
                    ],
                    [
                        'name' => ['en' => 'Curly Hair', 'lt' => 'Curly Hair'],
                        'slug' => 'naturalmente-curly-hair',
                        'description' => [
                            'en' => "Naturalmente's line for natural curls. Hydrates, defines curls, and controls frizz. Made with plant-based ingredients, free from harsh chemicals.",
                            'lt' => 'Naturalmente linija natūralioms garbanoms. Drėkina, išryškina garbanas ir kontroliuoja pasišiaušimą. Pagaminta iš augalinių ingredientų, be agresyvių cheminių medžiagų.',
                        ],
                        'logo' => '/images/brands/collections/naturalmente/curly-hair.jpg',
                    ],
                    [
                        'name' => ['en' => 'Essential Oils', 'lt' => 'Esencijos'],
                        'slug' => 'naturalmente-essential-oils',
                        'description' => [
                            'en' => "Naturalmente's pure, plant-based oils provide therapeutic benefits for hair and skin. Free from synthetic additives, they nourish, strengthen, and enhance your haircare routine.",
                            'lt' => 'Naturalmente augalų esencijos gaminamos iš grynų, natūralių ekstraktų ir pasižymi terapinėmis savybėmis.',
                        ],
                        'logo' => '/images/brands/collections/naturalmente/essential-oils.png',
                    ],
                    [
                        'name' => ['en' => 'Fortify', 'lt' => 'Fortify'],
                        'slug' => 'naturalmente-fortify',
                        'description' => [
                            'en' => 'Naturalmente Fortify Line is designed to strengthen and revitalize hair, targeting weak and thinning strands with nourishing plant-based ingredients.',
                            'lt' => 'Naturalmente Fortify linija sukurta stiprinti ir atgaivinti plaukus, nukreipta į silpnus ir retėjančius plaukus su maitinančiomis augalinėmis sudedamosiomis dalimis.',
                        ],
                        'logo' => '/images/brands/collections/naturalmente/fortify.jpg',
                    ],
                    [
                        'name' => ['en' => 'In Bloom', 'lt' => 'In Bloom'],
                        'slug' => 'naturalmente-in-bloom',
                        'description' => [
                            'en' => "Naturalmente's InBloom line celebrates the power of botanicals, offering hair and scalp care products infused with floral and plant-based extracts.",
                            'lt' => 'Plaukų priežiūros priemonės, praturtintos gėlių ir augaliniais ekstraktais. Švelniai puoselėja galvos odą, drėkina ir suteikia plaukams natūralumą.',
                        ],
                        'logo' => '/images/brands/collections/naturalmente/in-bloom.jpg',
                    ],
                    [
                        'name' => ['en' => 'Nature Inside', 'lt' => 'Nature Inside'],
                        'slug' => 'naturalmente-nature-inside',
                        'description' => [
                            'en' => 'Naturalmente Nature Inside Line is crafted to harness the purity and power of natural ingredients, offering gentle and effective care for hair and scalp.',
                            'lt' => 'Naturalmente Nature Inside linija sukurta išnaudoti natūralių sudedamųjų dalių grynumą ir galią, siūlydama švelnią ir veiksmingą plaukų bei galvos odos priežiūrą.',
                        ],
                        'logo' => '/images/brands/collections/naturalmente/nature-inside.jpg',
                    ],
                    [
                        'name' => ['en' => 'Revitalizing', 'lt' => 'Revitalizing'],
                        'slug' => 'naturalmente-revitalizing',
                        'description' => [
                            'en' => "Naturalmente's line for weak and thinning hair. Its nourishing plant-based formula strengthens hair, reduces shedding, and restores a healthy, vibrant shine.",
                            'lt' => 'Naturalmente linija, skirta silpniems ir slenkantiems plaukams. Maitinančių augalinių ingredientų formulė stiprina plaukus, mažina slinkimą ir suteikia sveiką, gyvybingą spindesį.',
                        ],
                        'logo' => '/images/brands/collections/naturalmente/revitalizing.jpg',
                    ],
                    [
                        'name' => ['en' => 'Styling & Finishing', 'lt' => 'Styling & Finishing'],
                        'slug' => 'naturalmente-styling-finishing',
                        'description' => [
                            'en' => 'Naturalmente Styling and Finishing Line is perfect for both professionals and everyday users, offering versatile products for salon-quality results.',
                            'lt' => 'Naturalmente Styling and Finishing linija puikiai tinka tiek profesionalams, tiek kasdieniam naudojimui, siūlydama universalius produktus salono kokybės rezultatams.',
                        ],
                        'logo' => '/images/brands/collections/naturalmente/styling-finishing.jpg',
                    ],
                    [
                        'name' => ['en' => 'The Suite', 'lt' => 'The Suite'],
                        'slug' => 'naturalmente-the-suite',
                        'description' => [
                            'en' => "Naturalmente's premium hair and scalp care collection with concentrated treatments and specialized formulas, delivering intensive, salon-quality results with plant-based ingredients.",
                            'lt' => 'Aukščiausios klasės plaukų ir galvos odos priežiūros kolekcija, sukurta intensyviai priežiūrai ir salono kokybės rezultatams, naudojant grynus augalinius ingredientus.',
                        ],
                        'logo' => '/images/brands/collections/naturalmente/the-suite.png',
                    ],
                ],
            ],

            // 2. MY.ORGANICS
            [
                'name' => ['en' => 'MY.ORGANICS', 'lt' => 'MY.ORGANICS'],
                'slug' => 'my-organics',
                'description' => [
                    'en' => "Cosmetics that unlock the possibilities of natural care. Each product is crafted from plant-based ingredients, nourishing hair and skin while adding softness, shine, and vitality, all with respect for your health and the environment.",
                    'lt' => "Kosmetika, kuri atveria natūralios priežiūros galimybes. Kiekvienas produktas sukurtas iš augalinių ingredientų, puoselėja plaukus ir odą, suteikia švelnumo, spindesio ir gyvybingumo, kartu gerbiant jūsų sveikatą ir aplinką.",
                ],
                'logo' => '/images/brands/my-organics-hero.jpg',
                'children' => [
                    [
                        'name' => ['en' => 'Basic Line', 'lt' => 'Basic Line'],
                        'slug' => 'my-organics-basic-line',
                        'description' => [
                            'en' => 'Natural, pH-balanced haircare for daily use. Enriched with fennel, rosemary, and argan oil, it hydrates, strengthens, and revitalizes hair while enhancing shine.',
                            'lt' => 'Natūrali, pH subalansuota plaukų priežiūra kasdieniam naudojimui su pagrindinėmis sudedamosiomis dalimis: saldžiuoju pankoliu, rozmarinu ir arganų aliejumi. Produktai drėkina, stiprina ir atgaivina plaukus.',
                        ],
                        'logo' => '/images/brands/collections/my-organics/basic-line.jpg',
                    ],
                    [
                        'name' => ['en' => 'Goji', 'lt' => 'Goji'],
                        'slug' => 'my-organics-goji',
                        'description' => [
                            'en' => 'Enriched with goji berry extract for hair regeneration and protection. This lineup hydrates, restores, and strengthens hair, leaving it healthy, shiny, and resilient.',
                            'lt' => 'Goji uogų ekstraktas regeneracijai ir apsaugai. Asortimentą sudaro Supreme šampūnas, Miracle kaukė, Sublime aliejus, Angel eliksyras ir Revival nenuplaunamas purškiklis, skirti drėkinti, atkurti ir lyginti plaukus.',
                        ],
                        'logo' => '/images/brands/collections/my-organics/goji.jpg',
                    ],
                    [
                        'name' => ['en' => 'Keratin', 'lt' => 'Keratin'],
                        'slug' => 'my-organics-keratin',
                        'description' => [
                            'en' => 'Professional-grade haircare enriched with keratin to restore elasticity, repair damage, and reduce frizz. Deeply nourishes and protects hair, leaving it sleek, strong, and manageable.',
                            'lt' => 'Profesionali linija, praturtinta keratinu, skirta atkurti plaukų elastingumą, regeneruoti pažeistus plaukus ir sumažinti pasišiaušimą, suteikiant plaukams sveiką spindesį ir švelnumą.',
                        ],
                        'logo' => '/images/brands/collections/my-organics/keratin.jpg',
                    ],
                    [
                        'name' => ['en' => 'MY.CURLING', 'lt' => 'MY.CURLING'],
                        'slug' => 'my-organics-curling',
                        'description' => [
                            'en' => 'Line for natural curls, enriched with baobab, mallow, and flaxseed extracts. Provides moisture, increases elasticity, and reduces frizz, nurturing soft, vibrant curls.',
                            'lt' => 'Linija natūralioms garbanoms, praturtinta baobabo, dedešvos ir linų sėmenų ekstraktais. Suteikia drėgmės, didina elastingumą ir mažina pasišiaušimą, puoselėdama minkštas, gyvybingas garbanas.',
                        ],
                        'logo' => '/images/brands/collections/my-organics/curling.jpg',
                    ],
                    [
                        'name' => ['en' => 'MY.LUXE', 'lt' => 'MY.LUXE'],
                        'slug' => 'my-organics-luxe',
                        'description' => [
                            'en' => 'Premium line infused with pure gold and neroli. Includes shampoo, conditioner, mask, and leave-in cream providing salon-quality results with enhanced shine.',
                            'lt' => 'Aukščiausios klasės linija su grynu auksu ir neroliu. Apima šampūną, kondicionierių, kaukę ir nenuplaunamą kremą, teikiančius salono kokybės rezultatus su padidėjusiu blizgesiu.',
                        ],
                        'logo' => '/images/brands/collections/my-organics/luxe.jpg',
                    ],
                    [
                        'name' => ['en' => 'MY.PURE', 'lt' => 'MY.PURE'],
                        'slug' => 'my-organics-pure',
                        'description' => [
                            'en' => 'Botanical-based care using linseed, hamamelis, and sunflower for hydration and natural shine with eco-friendly practices.',
                            'lt' => 'Augalinė priežiūra su linų sėmenimis, hamameliu ir saulėgrąžomis drėkinimui ir natūraliam blizgesiui su ekologiškais metodais.',
                        ],
                        'logo' => '/images/brands/collections/my-organics/pure.jpg',
                    ],
                    [
                        'name' => ['en' => 'Styling', 'lt' => 'Styling'],
                        'slug' => 'my-organics-styling',
                        'description' => [
                            'en' => 'Versatile styling range with botanical extracts and citrus essential oils. Provides volume, definition, and professional results.',
                            'lt' => 'Universalus plaukų formavimo asortimentas su augaliniais ekstraktais ir citrusų eteriniais aliejais. Suteikia apimtį, apibrėžimą ir profesionalius rezultatus.',
                        ],
                        'logo' => '/images/brands/collections/my-organics/styling.webp',
                    ],
                    [
                        'name' => ['en' => 'MY.SCALP', 'lt' => 'MY.SCALP'],
                        'slug' => 'my-organics-scalp',
                        'description' => [
                            'en' => 'Line enriched with botanical extracts to strengthen scalp, stimulate hair growth, and provide freshness and comfort.',
                            'lt' => 'Augaliniais ekstraktais praturtinta linija, skirta stiprinti galvos odą, skatinti plaukų augimą ir suteikti gaivumo bei komforto pojūtį.',
                        ],
                        'logo' => '/images/brands/collections/my-organics/scalp.png',
                    ],
                ],
            ],

            // 3. Essere
            [
                'name' => ['en' => 'Essere', 'lt' => 'Essere'],
                'slug' => 'essere',
                'description' => [
                    'en' => 'Beauty with Purpose - Essere focuses on creating products that prioritize customer well-being by blending natural ingredients with innovative formulations. The brand provides effective, eco-friendly solutions tailored to their unique needs.',
                    'lt' => 'Grožis su tikslu – Essere siekia kurti produktus, kurių pagrindinis tikslas yra vartotojų gerovė. Prekės ženklas derina natūralias sudedamąsias dalis su pažangiomis formulėmis, užtikrindamas, kad kiekvienas galėtų mėgautis veiksmingais, aplinkai draugiškais sprendimais.',
                ],
                'logo' => '/images/brands/essere-logo.png',
                'children' => [
                    [
                        'name' => ['en' => 'Hair', 'lt' => 'Plaukai'],
                        'slug' => 'essere-hair-care',
                        'description' => [
                            'en' => 'Shampoos, conditioners, and hair masks enriched with natural ingredients to cleanse, hydrate, and repair hair. The shampoos gently remove impurities, while conditioners and masks restore hair structure, softness, and natural shine.',
                            'lt' => 'Essere siūlo šampūnus, kondicionierius ir plaukų kaukes, praturtintas natūraliomis sudedamosiomis dalimis, skirtas plaukų valymui, drėkinimui ir atkūrimui. Šampūnai švelniai pašalina nešvarumus, o kondicionieriai ir kaukės atkuria plaukų struktūrą, minkštumą ir natūralų spindesį.',
                        ],
                        'logo' => '/images/brands/collections/essere/hair.jpg',
                    ],
                    [
                        'name' => ['en' => 'Body', 'lt' => 'Kūnas'],
                        'slug' => 'essere-body-care',
                        'description' => [
                            'en' => 'Nourishing lotions, shower gels, and hand creams for soft, hydrated skin. Lotions deeply moisturize, shower gels cleanse gently, and hand creams protect and soothe even the driest skin.',
                            'lt' => 'Maitinamieji losjonai, dušo geliai ir rankų kremai, skirti minkštai ir drėkinamai odos priežiūrai. Losjonai giliai drėkina, o dušo geliai švelniai valo, palaikydami odos pusiausvyrą.',
                        ],
                        'logo' => '/images/brands/collections/essere/body.png',
                    ],
                    [
                        'name' => ['en' => 'Face', 'lt' => 'Veidas'],
                        'slug' => 'essere-face-care',
                        'description' => [
                            'en' => 'Specialized face care products designed to refresh and hydrate skin. Masks gently remove impurities, while moisturizers ensure long-lasting hydration and natural radiance.',
                            'lt' => 'Specializuoti veido priežiūros produktai, skirti odos gaivinimui ir drėkinimui. Kaukės švelniai šalina nešvarumus, o drėkinamosios priemonės užtikrina ilgalaikę drėgmę ir natūralų spindesį.',
                        ],
                        'logo' => '/images/brands/collections/essere/face.png',
                    ],
                ],
            ],

            // 4. Gentleman
            [
                'name' => ['en' => 'Gentleman', 'lt' => 'Gentleman'],
                'slug' => 'gentleman',
                'description' => [
                    'en' => 'A line that blends elegance with an eco-conscious approach. Designed for the modern man who values style, self-care, and a mindful lifestyle, offering high-quality products for everyday comfort and a premium experience.',
                    'lt' => 'Linija, kuri derina eleganciją su atsakingu požiūriu į aplinką. Skirta šiuolaikiniam vyrui, kuris vertina stilių, savęs priežiūrą ir sąmoningą gyvenimo būdą, siūlanti aukštos kokybės produktus kasdieniam komfortui ir išskirtinei patirčiai.',
                ],
                'logo' => '/images/brands/gentleman-hero.jpeg',
                'children' => [
                    [
                        'name' => ['en' => 'Shaving', 'lt' => 'Skutimasis'],
                        'slug' => 'gentleman-shaving',
                        'description' => [
                            'en' => 'Gentleman line with plant-based ingredients for comfortable shaving and a neat, stylish appearance.',
                            'lt' => 'Gentleman linija su augaliniais ingredientais, skirta komfortiškam skutimuisi ir tvarkingam, stilingam įvaizdžiui.',
                        ],
                        'logo' => '/images/brands/gentleman-hero.jpeg',
                    ],
                    [
                        'name' => ['en' => 'Beard', 'lt' => 'Barzda'],
                        'slug' => 'gentleman-beard',
                        'description' => [
                            'en' => 'The Beard Line features green formulations like balm, shampoo, and oil for a groomed and fragrant beard.',
                            'lt' => 'Barzdos linija siūlo ekologiškas formules – balzamą, šampūną ir aliejų prižiūrėtai ir kvepiančiai barzdai.',
                        ],
                        'logo' => '/images/brands/gentleman-hero.jpeg',
                    ],
                    [
                        'name' => ['en' => 'Hair & Body', 'lt' => 'Plaukai ir kūnas'],
                        'slug' => 'gentleman-hair-body',
                        'description' => [
                            'en' => 'Gentleman products provide styling, shine, and care for your hair and body while respecting the planet.',
                            'lt' => 'Gentleman produktai suteikia stilių, blizgesį ir priežiūrą jūsų plaukams ir kūnui, gerbiant planetą.',
                        ],
                        'logo' => '/images/brands/gentleman-hero.jpeg',
                    ],
                ],
            ],

            // 5. Breathe
            [
                'name' => ['en' => 'Breathe', 'lt' => 'Breathe'],
                'slug' => 'breathe',
                'description' => [
                    'en' => "Breathe is a sustainable beauty brand that prioritizes ecological responsibility and natural wellness. With a commitment to using plant-based ingredients and environmentally friendly packaging, Breathe creates products that nurture the skin, hair, and body while respecting the planet. The brand's philosophy revolves around holistic beauty, promoting a balance between self-care and care for the environment.",
                    'lt' => 'Breathe – tai tvaraus grožio prekės ženklas, kuriam svarbiausia ekologinė atsakomybė ir natūralus gerbūvis.',
                ],
                'logo' => '/images/brands/breathe-hero.jpg',
                'children' => [
                    [
                        'name' => ['en' => 'Body Therapy', 'lt' => 'Kūno terapija'],
                        'slug' => 'breathe-body-therapy',
                        'description' => [
                            'en' => 'Breathe Body Therapy offers luxurious organic body care with firming creams, natural deodorants, and slimming treatments. These eco-conscious formulas rejuvenate and tone your body while respecting your skin and the environment.',
                            'lt' => 'Breathe Body Therapy siūlo prabangią ekologišką kūno priežiūrą su stangrinančiais kremais, natūraliais dezodorantais ir lieknėjimo priemonėmis. Šios ekologiškos formulės atjaunina ir tonizuoja jūsų kūną.',
                        ],
                        'logo' => '/images/brands/collections/breathe/body-therapy.png',
                    ],
                    [
                        'name' => ['en' => 'Philosophy', 'lt' => 'Philosophy'],
                        'slug' => 'breathe-philosophy',
                        'description' => [
                            'en' => 'Breathe Philosophy is a premium anti-aging collection featuring concentrated elixirs and eye fillers. These advanced formulas harness nature\'s most potent ingredients to restore youthful radiance and vitality.',
                            'lt' => 'Breathe Philosophy – tai aukščiausios klasės anti-aging kolekcija su koncentruotais eliksyrais ir akių užpildais. Šios pažangios formulės panaudoja galingiausias gamtos sudedamąsias dalis.',
                        ],
                        'logo' => '/images/brands/collections/breathe/philosophy.png',
                    ],
                    [
                        'name' => ['en' => 'Weekly Care', 'lt' => 'Savaitinė priežiūra'],
                        'slug' => 'breathe-weekly-care',
                        'description' => [
                            'en' => 'Breathe Weekly Care provides intensive treatments including age-correction masks and gentle peeling gels. Perfect for your weekly self-care ritual, these products deliver deep renewal and visible results.',
                            'lt' => 'Breathe Weekly Care siūlo intensyvias procedūras, įskaitant amžiaus korekcijos kaukes ir švelnius pilingus. Puikiai tinka jūsų savaitiniam savęs priežiūros ritualui.',
                        ],
                        'logo' => '/images/brands/collections/breathe/weekly-care.png',
                    ],
                    [
                        'name' => ['en' => 'Daily Care', 'lt' => 'Kasdienė priežiūra'],
                        'slug' => 'breathe-daily-care',
                        'description' => [
                            'en' => 'Breathe Daily Care is your everyday skincare essentials collection featuring moisturizing creams, balancing lotions, serums, and eye masks. Formulated for daily use, these products provide consistent hydration and protection.',
                            'lt' => 'Breathe Daily Care – tai kasdienės odos priežiūros kolekcija su drėkinančiais kremais, balansuojančiais losjonais, serumais ir akių kaukėmis. Sukurta kasdieniam naudojimui.',
                        ],
                        'logo' => '/images/brands/collections/breathe/daily-care.png',
                    ],
                ],
            ],
        ];
    }
}
