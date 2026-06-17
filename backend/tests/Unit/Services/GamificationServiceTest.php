<?php

namespace Tests\Unit\Services;

use App\Services\GamificationService;
use Tests\TestCase;

class GamificationServiceTest extends TestCase
{
    public function test_service_is_registered_as_singleton(): void
    {
        $service = app(GamificationService::class);

        $this->assertInstanceOf(GamificationService::class, $service);
        $this->assertSame($service, app(GamificationService::class));
    }
}
