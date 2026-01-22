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

// Daily backup at 3 AM
Schedule::command('backup:run')
    ->dailyAt('03:00')
    ->withoutOverlapping()
    ->name('daily-backup')
    ->onFailure(function () {
        \Log::error('Daily backup failed');
    });

// Weekly backup cleanup (removes old backups based on retention policy)
Schedule::command('backup:clean')
    ->weekly()
    ->sundays()
    ->at('04:00')
    ->withoutOverlapping()
    ->name('backup-cleanup');

// Daily backup health check
Schedule::command('backup:monitor')
    ->dailyAt('05:00')
    ->withoutOverlapping()
    ->name('backup-monitor');
