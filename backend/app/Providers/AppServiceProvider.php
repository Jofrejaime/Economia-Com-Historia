<?php

namespace App\Providers;

use App\Services\AccessGateService;
use App\Services\GamificationService;
use App\Services\Media\NullPreviewGenerator;
use App\Services\Media\PreviewGenerator;
use App\Services\MediaService;
use App\Services\NotificationService;
use App\Subscribers\DocumentSubscriber;
use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Event;
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

        // Event-Driven Architecture (Sprint 18.9) — subscribers por domínio.
        // A Sprint 19.0 (Reverb) adiciona apenas listeners de broadcast aqui.
        Event::subscribe(DocumentSubscriber::class);
    }
}
