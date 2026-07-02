<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('leaderboard:refresh-national')->hourly();
Schedule::command('gamification:reset-periodic-points weekly')->weekly();
Schedule::command('gamification:reset-periodic-points monthly')->monthly();
Schedule::command('leaderboard:snapshot-daily')->daily();

