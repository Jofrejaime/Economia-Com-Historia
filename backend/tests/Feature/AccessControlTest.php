<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccessControlTest extends TestCase
{
    use RefreshDatabase;

    protected function registerAndLogin(): string
    {
        $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'display_name' => 'Test User',
        ]);

        $login = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'Password123!',
        ]);

        return $login->json('token');
    }

    public function test_user_can_list_access_levels(): void
    {
        $token = $this->registerAndLogin();

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/access-levels');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                ['id', 'name', 'description'],
            ],
        ]);
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    public function test_user_can_request_access_level(): void
    {
        $token = $this->registerAndLogin();

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/access-requests', [
                'access_level_id' => 'public',
                'justification' => 'I need access to public content.',
            ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'data' => ['id', 'user_id', 'access_level_id', 'status'],
        ]);
    }

    public function test_user_cannot_request_same_level_twice(): void
    {
        $token = $this->registerAndLogin();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/access-requests', [
                'access_level_id' => 'public',
                'justification' => 'I need access.',
            ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/access-requests', [
                'access_level_id' => 'public',
                'justification' => 'I need access again.',
            ]);

        $response->assertStatus(409);
    }

    public function test_user_can_list_access_requests(): void
    {
        $token = $this->registerAndLogin();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/access-requests', [
                'access_level_id' => 'public',
            ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/access-requests');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                ['id', 'user_id', 'access_level_id', 'status'],
            ],
        ]);
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    public function test_user_can_list_access_grants(): void
    {
        $token = $this->registerAndLogin();

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/access-grants');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
        ]);
    }

    public function test_auto_grant_access_level_creates_grant(): void
    {
        $token = $this->registerAndLogin();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/access-requests', [
                'access_level_id' => 'public',
            ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/access-grants');

        $response->assertStatus(200);
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    public function test_manual_approval_required_for_restricted_access(): void
    {
        $token = $this->registerAndLogin();

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/access-requests', [
                'access_level_id' => 'restricted',
                'justification' => 'I need restricted access.',
            ]);

        $response->assertStatus(201);
        $this->assertEquals('pending', $response->json('data.status'));

        $grants = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/access-grants');

        $this->assertEquals(0, count($grants->json('data')));
    }
}
