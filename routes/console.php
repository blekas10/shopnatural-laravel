<?php

use App\Jobs\UpdateVenipakTracking;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Venipak tracking status update - every 2 hours during business hours
Schedule::job(new UpdateVenipakTracking())
    ->everyTwoHours()
    ->between('8:00', '20:00')
    ->withoutOverlapping()
    ->name('venipak-tracking-update');
