<?php

namespace App\Providers;

use App\Services\AccessGateService;
use App\Services\GamificationService;
use App\Services\NotificationService;
use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;

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
        RateLimiter::for('auth', function (Request $request) {
            return $request->user()
                ? Limit::perMinute(10)->by($request->user()->id)
                : Limit::perMinute(5)->by($request->ip());
        });
    }
}
