<?php

namespace App\Providers;

use App\Services\AccessGateService;
use App\Services\GamificationService;
use App\Services\NotificationService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(AccessGateService::class);
        $this->app->singleton(GamificationService::class);
        $this->app->singleton(NotificationService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
