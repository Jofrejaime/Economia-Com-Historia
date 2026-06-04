<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class NotificationServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_send_persists_notification(): void
    {
        $user = User::factory()->create();
        $service = app(NotificationService::class);

        $notification = $service->send(
            $user,
            'system_announcement',
            'Test title',
            'Test message',
            allowedTypes: ['system_announcement'],
        );

        $this->assertDatabaseHas('notifications', [
            'id' => $notification['id'],
            'user_id' => $user->id,
            'type' => 'system_announcement',
            'title' => 'Test title',
        ]);
    }

    public function test_send_rejects_disallowed_type(): void
    {
        $user = User::factory()->create();
        $service = app(NotificationService::class);

        $this->expectException(\InvalidArgumentException::class);

        $service->send(
            $user,
            'invalid_type',
            'Title',
            allowedTypes: ['system_announcement'],
        );
    }
}
