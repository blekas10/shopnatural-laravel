<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = [
        'name',
        'email',
        'subject',
        'message',
        'locale',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];
}
