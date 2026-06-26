<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class UserDirectoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_requires_authentication(): void
    {
        $response = $this->getJson('/api/users/search?q=jo');

        $response->assertStatus(401);
    }

    public function test_search_finds_users_by_display_name(): void
    {
        $this->actingUser();
        $target = $this->createUserWithProfile([
            'display_name' => 'Jofre',
            'full_name' => 'Jofre Jaime',
            'institution' => 'ISPTEC',
            'avatar_url' => 'https://example.com/avatar.jpg',
        ]);

        $response = $this->authGetJson('/api/users/search?q=jof');

        $response->assertOk();
        $response->assertJsonPath('0.id', $target->id);
        $response->assertJsonPath('0.display_name', 'Jofre');
        $response->assertJsonPath('0.full_name', 'Jofre Jaime');
        $response->assertJsonPath('0.institution', 'ISPTEC');
    }

    public function test_search_finds_users_by_full_name(): void
    {
        $this->actingUser();
        $target = $this->createUserWithProfile([
            'display_name' => 'Mila',
            'full_name' => 'Maria Lurdes Almeida',
            'institution' => 'Universidade de Luanda',
            'avatar_url' => null,
        ]);

        $response = $this->authGetJson('/api/users/search?q=lurdes');

        $response->assertOk();
        $response->assertJsonPath('0.id', $target->id);
        $response->assertJsonPath('0.display_name', 'Mila');
    }

    public function test_search_excludes_inactive_users(): void
    {
        $this->actingUser();
        $this->createUserWithProfile([
            'display_name' => 'Ativo',
            'full_name' => 'Utilizador Ativo',
        ]);
        $inactive = $this->createUserWithProfile([
            'display_name' => 'Inativo',
            'full_name' => 'Utilizador Inativo',
        ], ['is_active' => false]);

        $response = $this->authGetJson('/api/users/search?q=utilizador');

        $response->assertOk();
        $this->assertFalse(collect($response->json('data'))->contains(fn (array $user): bool => $user['id'] === $inactive->id));
    }

    public function test_search_can_limit_results(): void
    {
        $this->actingUser();

        $this->createUserWithProfile(['display_name' => 'Alpha One', 'full_name' => 'Alpha One']);
        $this->createUserWithProfile(['display_name' => 'Alpha Two', 'full_name' => 'Alpha Two']);
        $this->createUserWithProfile(['display_name' => 'Alpha Three', 'full_name' => 'Alpha Three']);

        $response = $this->authGetJson('/api/users/search?q=alpha&limit=2');

        $response->assertOk();
        $response->assertJsonCount(2);
    }

    public function test_search_respects_email_verification_when_required(): void
    {
        config()->set('auth.api.require_email_verification', true);

        $this->actingUser();
        $verified = $this->createUserWithProfile([
            'display_name' => 'Verificado',
            'full_name' => 'Utilizador Verificado',
        ], ['email_verified' => true]);
        $this->createUserWithProfile([
            'display_name' => 'NaoVerificado',
            'full_name' => 'Utilizador Nao Verificado',
        ], ['email_verified' => false]);

        $response = $this->authGetJson('/api/users/search?q=utilizador');

        $response->assertOk();
        $this->assertTrue(collect($response->json())->contains(fn (array $user): bool => $user['id'] === $verified->id));
        $this->assertFalse(collect($response->json())->contains(fn (array $user): bool => $user['display_name'] === 'NaoVerificado'));
    }

    public function test_search_does_not_expose_sensitive_fields(): void
    {
        $this->actingUser();
        $this->createUserWithProfile([
            'display_name' => 'Privado',
            'full_name' => 'Utilizador Privado',
        ]);

        $response = $this->authGetJson('/api/users/search?q=privado');

        $response->assertOk();
        $item = $response->json('0');

        $this->assertArrayNotHasKey('email', $item);
        $this->assertArrayNotHasKey('password', $item);
        $this->assertArrayNotHasKey('role', $item);
        $this->assertArrayNotHasKey('tokens', $item);
    }

    private function actingUser(): User
    {
        $user = User::factory()->create([
            'email_verified' => true,
            'is_active' => true,
        ]);

        $this->createProfile($user, [
            'display_name' => 'Requester',
            'full_name' => 'Requester User',
            'institution' => 'ISPTEC',
        ]);

        $this->issueSession($user);

        return $user;
    }

    private function authGetJson(string $uri)
    {
        $token = DB::table('user_sessions')->latest('created_at')->value('refresh_token');

        return $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson($uri);
    }

    private function createUserWithProfile(array $profileAttributes = [], array $userAttributes = []): User
    {
        $user = User::factory()->create(array_merge([
            'email_verified' => true,
            'is_active' => true,
        ], $userAttributes));

        $this->createProfile($user, array_merge([
            'display_name' => 'Utilizador '.Str::random(6),
            'full_name' => 'Nome '.Str::random(6),
            'institution' => 'ISPTEC',
            'avatar_url' => null,
        ], $profileAttributes));

        return $user;
    }

    private function createProfile(User $user, array $attributes): void
    {
        DB::table('user_profiles')->insert(array_merge([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'display_name' => $attributes['display_name'],
            'full_name' => $attributes['full_name'] ?? null,
            'institution' => $attributes['institution'] ?? null,
            'province' => $attributes['province'] ?? null,
            'avatar_url' => $attributes['avatar_url'] ?? null,
            'bio' => null,
            'website_url' => null,
            'research_areas' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ], []));
    }

    private function issueSession(User $user): void
    {
        DB::table('user_sessions')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'refresh_token' => Str::random(80),
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit',
            'expires_at' => now()->addDay(),
            'created_at' => now(),
        ]);
    }
}
