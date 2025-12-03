<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PromoCodeController extends Controller
{
    public function index()
    {
        $promoCodes = PromoCode::orderByDesc('created_at')
            ->get()
            ->map(function ($code) {
                return [
                    'id' => $code->id,
                    'code' => $code->code,
                    'description' => $code->description,
                    'type' => $code->type,
                    'value' => (float) $code->value,
                    'formattedValue' => $code->getFormattedValue(),
                    'minOrderAmount' => $code->min_order_amount ? (float) $code->min_order_amount : null,
                    'maxDiscountAmount' => $code->max_discount_amount ? (float) $code->max_discount_amount : null,
                    'usageLimit' => $code->usage_limit,
                    'perUserLimit' => $code->per_user_limit,
                    'timesUsed' => $code->times_used,
                    'startsAt' => $code->starts_at?->toIso8601String(),
                    'endsAt' => $code->ends_at?->toIso8601String(),
                    'isActive' => $code->is_active,
                    'isValid' => $code->isValid(),
                    'isAvailable' => $code->isAvailable(),
                    'createdAt' => $code->created_at->toIso8601String(),
                ];
            });

        return Inertia::render('admin/promo-codes/index', [
            'promoCodes' => $promoCodes,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/promo-codes/form', [
            'promoCode' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:promo_codes,code',
            'description' => 'nullable|string|max:255',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'per_user_limit' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'is_active' => 'boolean',
        ]);

        // Validate percentage isn't over 100
        if ($validated['type'] === 'percentage' && $validated['value'] > 100) {
            return back()->withErrors(['value' => 'Percentage discount cannot exceed 100%.']);
        }

        // Uppercase the code
        $validated['code'] = strtoupper($validated['code']);
        $validated['is_active'] = $request->boolean('is_active');

        PromoCode::create($validated);

        return redirect()->route('admin.promo-codes.index')
            ->with('success', 'Promo code created successfully.');
    }

    public function edit(PromoCode $promoCode)
    {
        return Inertia::render('admin/promo-codes/form', [
            'promoCode' => [
                'id' => $promoCode->id,
                'code' => $promoCode->code,
                'description' => $promoCode->description,
                'type' => $promoCode->type,
                'value' => (float) $promoCode->value,
                'min_order_amount' => $promoCode->min_order_amount ? (float) $promoCode->min_order_amount : null,
                'max_discount_amount' => $promoCode->max_discount_amount ? (float) $promoCode->max_discount_amount : null,
                'usage_limit' => $promoCode->usage_limit,
                'per_user_limit' => $promoCode->per_user_limit,
                'starts_at' => $promoCode->starts_at?->format('Y-m-d\TH:i'),
                'ends_at' => $promoCode->ends_at?->format('Y-m-d\TH:i'),
                'is_active' => $promoCode->is_active,
            ],
        ]);
    }

    public function update(Request $request, PromoCode $promoCode)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:promo_codes,code,' . $promoCode->id,
            'description' => 'nullable|string|max:255',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'per_user_limit' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'is_active' => 'boolean',
        ]);

        // Validate percentage isn't over 100
        if ($validated['type'] === 'percentage' && $validated['value'] > 100) {
            return back()->withErrors(['value' => 'Percentage discount cannot exceed 100%.']);
        }

        // Uppercase the code
        $validated['code'] = strtoupper($validated['code']);
        $validated['is_active'] = $request->boolean('is_active');

        $promoCode->update($validated);

        return redirect()->route('admin.promo-codes.index')
            ->with('success', 'Promo code updated successfully.');
    }

    public function destroy(PromoCode $promoCode)
    {
        // Check if code has been used
        if ($promoCode->times_used > 0) {
            return back()->withErrors(['error' => 'Cannot delete a promo code that has been used. Deactivate it instead.']);
        }

        $promoCode->delete();

        return redirect()->route('admin.promo-codes.index')
            ->with('success', 'Promo code deleted successfully.');
    }
}
