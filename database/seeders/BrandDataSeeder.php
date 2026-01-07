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
                            'en' => "Naturalmente's base oils nourish and protect hair and skin with rich hydration and essential nutrients. Sustainably sourced, they align with the brand's eco-conscious philosophy. Their natural properties enhance vitality while remaining gentle and suitable for all types.",
                            'lt' => "Naturalmente baziniai aliejai maitina ir saugo plaukus bei odą, suteikdami gausią drėgmę.",
                        ],
                        'logo' => '/images/brands/collections/naturalmente/base-oil.png',
                    ],
                    [
                        'name' => ['en' => 'Botanic Skincare', 'lt' => 'Botanic Skincare'],
                        'slug' => 'naturalmente-botanic-skincare',
                        'description' => [
                            'en' => 'Natural and sustainable cosmetics from Botanic Skincare, made with pure plant-based ingredients and free from harmful chemicals, caring for both your skin and the environment. Innovative formulas designed for those who value authentic beauty and seek exceptional results, crafted responsibly with sustainably sourced ingredients and recyclable packaging.',
                            'lt' => 'Natūrali ir tvari kosmetika iš Botanic Skincare, pagaminta iš grynų augalinių sudedamųjų dalių ir be kenksmingų cheminių medžiagų, rūpinantis jūsų oda ir aplinka. Inovatyvios formulės, sukurtos tiems, kurie vertina autentišką grožį ir siekia išskirtinių rezultatų.',
                        ],
                        'logo' => '/images/brands/collections/naturalmente/botanic-skincare.png',
                    ],
                    [
                        'name' => ['en' => 'Color Plant Flower', 'lt' => 'Color Plant Flower'],
                        'slug' => 'naturalmente-color-plant-flower',
                        'description' => [
                            'en' => 'Naturalmente Color Plant Line provides a natural, ammonia-free hair coloring solution crafted from plant-based ingredients, designed to enhance and nourish hair while being gentle on both your scalp and the environment. Its eco-friendly formulas deliver beautiful, authentic tones inspired by nature, ensuring vibrant results without harsh chemicals.',
                            'lt' => 'Natūrali, be amoniako sukurta plaukų dažymo priemonė, pagaminta iš augalinės kilmės ingredientų.',
                        ],
                        'logo' => '/images/brands/collections/naturalmente/color-plant-flower.png',
                    ],
                    [
                        'name' => ['en' => 'Curly Hair', 'lt' => 'Curly Hair'],
                        'slug' => 'naturalmente-curly-hair',
                        'description' => [
                            'en' => 'Naturalmente Curly Hair Line enhances and cares for natural curls by providing hydration, definition, and frizz control. Made with plant-based ingredients and free from harsh chemicals.',
                            'lt' => 'Naturalmente Curly Hair linija puoselėja ir rūpinasi natūraliomis garbanomis, suteikdama drėgmę, apibrėžimą ir pūkavimosi kontrolę. Pagaminta iš augalinių sudedamųjų dalių ir be agresyvių cheminių medžiagų.',
                        ],
                        'logo' => '/images/brands/collections/naturalmente/curly-hair.jpg',
                    ],
                    [
                        'name' => ['en' => 'Essential Oils', 'lt' => 'Esencijos'],
                        'slug' => 'naturalmente-essential-oils',
                        'description' => [
                            'en' => 'Naturalmente Essential Oils are crafted from pure, natural extracts to provide therapeutic benefits for both hair and scalp. Free from synthetic additives, they enhance the haircare experience with their calming and aromatic properties.',
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
                            'en' => 'Naturalmente InBloom Line celebrates the power of botanicals, offering hair and body care products infused with floral and plant-based extracts.',
                            'lt' => 'Plaukų ir kūno priežiūros priemonės, praturtintos gėlių ir augaliniais ekstraktais.',
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
                            'en' => 'Naturalmente Revitalizing Treatment is formulated to restore energy and vitality to tired or damaged hair, using nourishing plant-based ingredients.',
                            'lt' => 'Naturalmente Revitalizing procedūra sukurta atkurti energiją ir gyvybingumą pavargusius ar pažeistus plaukus, naudojant maitinančias augalines sudedamąsias dalis.',
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
                            'en' => 'The Suite by Naturalmente is a premium hair and scalp care collection featuring concentrated treatments and specialized formulas. Designed for intensive care, these products deliver salon-quality results with pure botanical ingredients for healthy, revitalized hair.',
                            'lt' => 'The Suite by Naturalmente – tai aukščiausios klasės plaukų ir galvos odos priežiūros kolekcija su koncentruotomis priemonėmis ir specializuotomis formulėmis. Sukurta intensyviai priežiūrai, šie produktai suteikia salono kokybės rezultatus su grynais augaliniais ingredientais.',
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
                    'en' => "At MY.ORGANICS we want to spread the philosophy of possibility, an example of how dreams should not remain secret wishes but must become the chance to turn obstacles into new goals.",
                    'lt' => "MY.ORGANICS siekiame skleisti galimybių filosofiją – parodyti, kad svajonės neturi likti slaptais troškimais.",
                ],
                'logo' => '/images/brands/my-organics-hero.jpg',
                'children' => [
                    [
                        'name' => ['en' => 'Basic Line', 'lt' => 'Basic Line'],
                        'slug' => 'my-organics-basic-line',
                        'description' => [
                            'en' => 'Natural, pH-balanced haircare for daily use with key ingredients like sweet fennel, rosemary, and argan oil. Products hydrate, strengthen, and revitalize hair across various needs while promoting shine and softness for all hair types.',
                            'lt' => 'Natūrali, pH subalansuota plaukų priežiūra kasdieniam naudojimui su pagrindinėmis sudedamosiomis dalimis: saldžiuoju pankoliu, rozmarinu ir arganų aliejumi. Produktai drėkina, stiprina ir atgaivina plaukus.',
                        ],
                        'logo' => '/images/brands/collections/my-organics/basic-line.jpg',
                    ],
                    [
                        'name' => ['en' => 'Goji', 'lt' => 'Goji'],
                        'slug' => 'my-organics-goji',
                        'description' => [
                            'en' => 'Features goji berry extract for regeneration and protection. The lineup includes Supreme Shampoo, Miracle Mask, Sublime Oil, Angel Potion, and Revival Leave-In Mist designed to hydrate, restore, and smooth hair with antioxidant-rich benefits.',
                            'lt' => 'Goji uogų ekstraktas regeneracijai ir apsaugai. Asortimentą sudaro Supreme šampūnas, Miracle kaukė, Sublime aliejus, Angel eliksyras ir Revival nenuplaunamas purškiklis, skirti drėkinti, atkurti ir lyginti plaukus.',
                        ],
                        'logo' => '/images/brands/collections/my-organics/goji.jpg',
                    ],
                    [
                        'name' => ['en' => 'Keratin', 'lt' => 'Keratin'],
                        'slug' => 'my-organics-keratin',
                        'description' => [
                            'en' => 'Professional-grade line enriched with keratin to restore elasticity, repair damage, and reduce frizz. Includes Pro-Keratin Shampoo and Conditioner providing deep nourishment and long-lasting protection for sleek, manageable hair.',
                            'lt' => 'Profesionali linija, praturtinta keratinu elastingumui atkurti, pažeidimams taisyti ir pūkavimui mažinti. Apima Pro-Keratin šampūną ir kondicionierių, teikiančius gilų maitinimą ir ilgalaikę apsaugą.',
                        ],
                        'logo' => '/images/brands/collections/my-organics/keratin.jpg',
                    ],
                    [
                        'name' => ['en' => 'MY.CURLING', 'lt' => 'MY.CURLING'],
                        'slug' => 'my-organics-curling',
                        'description' => [
                            'en' => 'Tailored for curls using baobab, mallow, and flaxseed extracts. Products combat frizz, boost elasticity, and deliver hydration for soft, bouncy, manageable curls.',
                            'lt' => 'Sukurta garbanoms su baobabo, dedešvos ir linų sėmenų ekstraktais. Produktai kovoja su pūkavimu, didina elastingumą ir suteikia drėgmę minkštoms, šokinėjančioms garbanoms.',
                        ],
                        'logo' => '/images/brands/collections/my-organics/curling.jpg',
                    ],
                    [
                        'name' => ['en' => 'MY.LUXE', 'lt' => 'MY.LUXE'],
                        'slug' => 'my-organics-luxe',
                        'description' => [
                            'en' => 'Premium offering infused with pure gold and neroli. Includes shampoo, conditioner, mask, and leave-in cream providing salon-quality results with enhanced shine and softness.',
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
                            'en' => 'Versatile range including modeling fluid, smoothing fluid, volumizing gel, and hairsprays with botanical extracts and citrus essential oils for professional results.',
                            'lt' => 'Universalus asortimentas, įskaitant modeliavimo skystį, lyginimo skystį, apimties gelį ir plaukų lakus su augaliniais ekstraktais ir citrusų eteriniais aliejais.',
                        ],
                        'logo' => '/images/brands/collections/my-organics/styling.webp',
                    ],
                    [
                        'name' => ['en' => 'MY.SCALP', 'lt' => 'MY.SCALP'],
                        'slug' => 'my-organics-scalp',
                        'description' => [
                            'en' => 'Addresses scalp health through enzymatic treatments, growth-stimulating sprays, and calming refreshers using neem, orange, and peony extracts.',
                            'lt' => 'Sprendžia galvos odos sveikatą fermentiniais gydymais, augimą skatinančiais purškikliais ir raminančiais gaivinamaisiais su nimbamedžio, apelsinų ir bijūnų ekstraktais.',
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
                            'en' => 'Essere provides shampoos, conditioners, and hair masks enriched with natural ingredients to cleanse, hydrate, and repair hair. The shampoos gently remove impurities, while conditioners and masks restore softness and shine to dull or damaged hair. Free from silicones and harsh chemicals.',
                            'lt' => 'Essere siūlo šampūnus, kondicionierius ir plaukų kaukes, praturtintas natūraliomis sudedamosiomis dalimis valymui, drėkinimui ir atstatymui. Šampūnai švelniai pašalina nešvarumus, o kondicionieriai ir kaukės atkuria minkštumą ir blizgesį.',
                        ],
                        'logo' => '/images/brands/collections/essere/hair.jpg',
                    ],
                    [
                        'name' => ['en' => 'Body', 'lt' => 'Kūnas'],
                        'slug' => 'essere-body-care',
                        'description' => [
                            'en' => 'Body care range includes nourishing lotions, shower gels, and hand creams for soft and hydrated skin. Lotions deeply moisturize, shower gels cleanse gently without disrupting skin balance, and hand creams protect and soothe even the driest hands.',
                            'lt' => 'Kūno priežiūros asortimentą sudaro maitinamieji losjonai, dušo geliai ir rankų kremai minkštai, drėkinamai odai. Losjonai giliai drėkina, dušo geliai švelniai valo nepažeisdami odos pusiausvyros.',
                        ],
                        'logo' => '/images/brands/collections/essere/body.png',
                    ],
                    [
                        'name' => ['en' => 'Face', 'lt' => 'Veidas'],
                        'slug' => 'essere-face-care',
                        'description' => [
                            'en' => 'Face care products include cleansing masks and moisturizers designed to refresh and hydrate skin. Masks remove impurities leaving skin smooth and revitalized, while moisturizers provide lasting hydration and radiance. With natural and gentle formulations, this line is perfect for achieving a clear and healthy complexion.',
                            'lt' => 'Veido priežiūros produktai apima valomąsias kaukes ir drėkiklius, skirtus gaivinti ir drėkinti odą. Kaukės pašalina nešvarumus, palikdamos odą lygią ir atgaivintą, o drėkikliai suteikia ilgalaikę drėgmę ir spindesį.',
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
                    'en' => 'Gentleman represents the union of elegance and sustainability. Dedicated to modern men who value style, self-care, and eco-conscious living, the brand combines refined grooming products with respect for the planet. By using natural, organic ingredients, Naturalmente Gentleman redefines grooming as a sophisticated yet sustainable ritual.',
                    'lt' => 'Gentleman – tai elegancijos ir tvarumo dermė. Šis prekės ženklas skirtas šiuolaikiniam vyrui, kuris vertina stilių, savęs priežiūrą ir sąmoningą gyvenimo būdą.',
                ],
                'logo' => '/images/brands/gentleman-hero.jpeg',
                'children' => [
                    [
                        'name' => ['en' => 'Shaving', 'lt' => 'Skutimasis'],
                        'slug' => 'gentleman-shaving',
                        'description' => [
                            'en' => 'The Gentleman Shaving Line offers shaving essentials with organic, plant-based ingredients, blending vintage charm with modern style.',
                            'lt' => 'Gentleman skutimosi linija siūlo skutimosi reikmenis su ekologiškais, augaliniais ingredientais, derinančiais vintažinį žavesį su moderniu stiliumi.',
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
