<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Updates products to use correct sub-brand IDs based on WooCommerce category data.
     */
    public function up(): void
    {
        // brand_id => [product_ids]
        $brandUpdates = [
            3 => [10, 11, 99, 100, 101, 102, 103, 104, 105, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235], // Botanic Skincare
            23 => [12, 124, 125, 126, 127, 128, 129, 130, 139], // Body (Essere)
            22 => [13, 14, 131, 132, 133, 134, 135, 136, 137, 138, 140], // Hair (Essere)
            30 => [15, 16, 20, 21, 22], // The Suite
            6 => [17, 18, 19, 175, 176, 177, 178], // Essential Oils
            19 => [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 56, 57], // Styling (MY.ORGANICS)
            20 => [52, 53, 54, 58, 60, 61, 62, 63, 64, 65], // MY.SCALP
            10 => [55, 170, 171, 172], // Revitalizing
            7 => [59, 169], // Fortify
            15 => [66, 67, 181], // Keratin
            18 => [68, 69, 70], // MY.PURE
            17 => [73, 74, 75, 76], // MY.LUXE
            16 => [77, 78], // MY.CURLING
            14 => [81, 82, 83, 84, 85, 86], // Goji
            13 => [87], // Basic Line
            24 => [106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123], // Face (Essere)
            4 => [154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168], // Color Plant Flower
            2 => [173, 174], // Base Oil
            9 => [182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193], // Nature Inside
            5 => [194, 195, 196, 197], // Curly Hair
            8 => [198, 199, 200, 201, 202, 203, 204, 205], // In Bloom
            11 => [206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216], // Styling & Finishing
        ];

        foreach ($brandUpdates as $brandId => $productIds) {
            DB::table('products')
                ->whereIn('id', $productIds)
                ->update(['brand_id' => $brandId]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be easily reversed as we don't store the original brand_ids
        // If needed, restore from backup or re-run the original import
    }
};
