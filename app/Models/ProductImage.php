<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Translatable\HasTranslations;

class ProductImage extends Model
{
    use HasTranslations;

    protected $fillable = [
        'product_id',
        'path',
        'alt_text',
        'is_primary',
        'order',
    ];

    public $translatable = ['alt_text'];

    protected $casts = [
        'is_primary' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Get the product that owns this image
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the full URL to the image
     */
    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->path);
    }
}
