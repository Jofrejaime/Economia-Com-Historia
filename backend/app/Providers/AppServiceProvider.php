<?php

namespace App\Providers;

use App\Services\AccessGateService;
use App\Services\GamificationService;
use App\Services\Media\NullPreviewGenerator;
use App\Services\Media\PreviewGenerator;
use App\Services\MediaService;
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

        // Infraestrutura global de media — trocar a implementação de preview
        // (ex.: PDF → PNG) exige apenas alterar este binding.
        $this->app->bind(PreviewGenerator::class, NullPreviewGenerator::class);
        $this->app->singleton(MediaService::class);
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
