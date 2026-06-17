<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class AccessControlTest extends TestCase
{
    use RefreshDatabase;

    protected function registerAndLogin(string $email = 'test@example.com'): string
    {
        Mail::fake();

        $this->postJson('/api/auth/register', [
            'email' => $email,
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Test User',
        ]);

        $login = $this->postJson('/api/auth/login', [
            'email' => $email,
            'password' => 'Kh7#m9$Pq2!z',
        ]);

        return $login->json('token');
    }

    protected function issueToken(User $user): string
    {
        $token = Str::random(80);

        DB::table('user_sessions')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'refresh_token' => $token,
            'expires_at' => now()->addDays(30),
            'created_at' => now(),
        ]);

        return $token;
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

    public function test_user_cannot_request_when_grant_already_exists(): void
    {
        $token = $this->registerAndLogin();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/access-requests', [
                'access_level_id' => 'public',
            ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/access-requests', [
                'access_level_id' => 'public',
            ]);

        $response->assertStatus(409);
    }

    public function test_user_can_list_access_requests(): void
    {
        $token = $this->registerAndLogin();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/access-requests', [
                'access_level_id' => 'restricted',
                'justification' => 'Research',
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

    public function test_show_request_forbidden_for_other_users(): void
    {
        $tokenA = $this->registerAndLogin('usera@example.com');
        $tokenB = $this->registerAndLogin('userb@example.com');

        $create = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->postJson('/api/access-requests', [
                'access_level_id' => 'restricted',
            ]);

        $requestId = $create->json('data.id');

        $this->withHeader('Authorization', "Bearer {$tokenB}")
            ->getJson("/api/access-requests/{$requestId}")
            ->assertStatus(403);
    }

    public function test_admin_can_list_all_pending_requests(): void
    {
        $studentToken = $this->registerAndLogin('student@example.com');

        $this->withHeader('Authorization', "Bearer {$studentToken}")
            ->postJson('/api/access-requests', [
                'access_level_id' => 'jindungo',
                'justification' => 'Need access',
            ]);

        $admin = User::factory()->create(['role' => 'admin', 'email' => 'admin@example.com']);
        $adminToken = $this->issueToken($admin);

        $response = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/access-requests?scope=all&status=pending');

        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, count($response->json('data')));
    }

    public function test_non_admin_cannot_use_scope_all(): void
    {
        $token = $this->registerAndLogin();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/access-requests?scope=all')
            ->assertStatus(403);
    }

    public function test_admin_can_approve_request_and_create_grant(): void
    {
        $studentToken = $this->registerAndLogin('approve-student@example.com');

        $create = $this->withHeader('Authorization', "Bearer {$studentToken}")
            ->postJson('/api/access-requests', [
                'access_level_id' => 'jindungo',
                'justification' => 'Research project',
            ]);

        $requestId = $create->json('data.id');

        $admin = User::factory()->create(['role' => 'admin']);
        $adminToken = $this->issueToken($admin);

        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->patchJson("/api/access-requests/{$requestId}", [
                'status' => 'approved',
                'review_notes' => 'Approved for research.',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'approved');

        $grants = $this->withHeader('Authorization', "Bearer {$studentToken}")
            ->getJson('/api/access-grants');

        $grants->assertStatus(200);
        $this->assertTrue(
            collect($grants->json('data'))->contains('access_level_id', 'jindungo')
        );
    }
}
