<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            [
                'name' => [
                    'en' => 'Naturalmente',
                    'lt' => 'Naturalmente',
                ],
                'slug' => 'naturalmente',
                'description' => [
                    'en' => 'Italian natural cosmetics brand focused on professional hair care with organic ingredients.',
                    'lt' => 'Italų natūralios kosmetikos prekės ženklas, orientuotas į profesionalią plaukų priežiūrą su organiniais ingredientais.',
                ],
                'is_active' => true,
            ],
            [
                'name' => [
                    'en' => 'MY.ORGANICS',
                    'lt' => 'MY.ORGANICS',
                ],
                'slug' => 'my-organics',
                'description' => [
                    'en' => 'Premium organic beauty products line with certified organic ingredients and sustainable packaging.',
                    'lt' => 'Aukščiausios klasės organinių grožio produktų linija su sertifikuotais organiniais ingredientais ir tvariais pakuotėmis.',
                ],
                'is_active' => true,
            ],
        ];

        foreach ($brands as $brand) {
            Brand::create($brand);
        }
    }
}
