<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Services\GamificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GamificationServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_service_resolves_from_container(): void
    {
        $service = app(GamificationService::class);

        $this->assertInstanceOf(GamificationService::class, $service);

        $user = User::factory()->create();
        $this->assertIsArray($service->evaluateBadges($user));
    }
}
