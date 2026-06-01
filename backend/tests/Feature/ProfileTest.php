<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();

        // Register and login a test user
        $response = $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'TestPassword123!',
            'password_confirmation' => 'TestPassword123!',
            'display_name' => 'Test User',
            'full_name' => 'Test Full Name',
            'institution' => 'Test University',
            'province' => 'Luanda',
        ]);

        $this->token = $response->json('token');
            $this->user = $response->json('user');
    }

    /** @test */
    public function test_get_current_user_profile()
    {
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->getJson('/api/me');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'user' => ['id', 'email', 'email_verified', 'is_active', 'role'],
            'profile' => ['id', 'user_id', 'display_name', 'created_at'],
            'access_grants' => [],
        ]);
        $this->assertEquals('test@example.com', $response->json('user.email'));
    }

    /** @test */
    public function test_get_profile_details()
    {
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->getJson('/api/profile');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'profile' => ['id', 'user_id', 'display_name', 'full_name', 'institution', 'province'],
        ]);
        $this->assertEquals('Test User', $response->json('profile.display_name'));
    }

    /** @test */
    public function test_update_profile()
    {
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->putJson('/api/profile', [
                'display_name' => 'Updated Name',
                'bio' => 'New bio',
                'website_url' => 'https://example.com',
                'research_areas' => ['Economics', 'History'],
            ]);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Profile updated successfully.']);

        // Verify update
        $profile = DB::table('user_profiles')
            ->where('user_id', $this->user['id'])
            ->first();

        $this->assertEquals('Updated Name', $profile->display_name);
        $this->assertEquals('New bio', $profile->bio);
        $this->assertEquals('https://example.com', $profile->website_url);
    }

    /** @test */
    public function test_update_profile_validation()
    {
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->putJson('/api/profile', [
                'website_url' => 'invalid-url',
                'research_areas' => ['Valid', 123], // 123 is not a string
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['website_url']);
    }

    /** @test */
    public function test_update_password()
    {
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->putJson('/api/profile/password', [
                'current_password' => 'TestPassword123!',
                'password' => 'NewPassword456!',
                'password_confirmation' => 'NewPassword456!',
            ]);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Password changed successfully. Other sessions have been revoked.']);

        // Verify can login with new password
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'NewPassword456!',
        ]);

        $loginResponse->assertStatus(200);
    }

    /** @test */
    public function test_update_password_with_wrong_current()
    {
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->putJson('/api/profile/password', [
                'current_password' => 'WrongPassword123!',
                'password' => 'NewPassword456!',
                'password_confirmation' => 'NewPassword456!',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['current_password']);
    }

    /** @test */
    public function test_update_password_confirmation_mismatch()
    {
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->putJson('/api/profile/password', [
                'current_password' => 'TestPassword123!',
                'password' => 'NewPassword456!',
                'password_confirmation' => 'Different456!',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function test_update_avatar()
    {
        $image = \Illuminate\Http\UploadedFile::fake()->image('avatar.jpg', 100, 100);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson('/api/profile/avatar', [
                'avatar' => $image,
            ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['message', 'avatar_url']);
        $this->assertStringContainsString('avatars/', $response->json('avatar_url'));
    }

    /** @test */
    public function test_update_avatar_invalid_file()
    {
        $file = \Illuminate\Http\UploadedFile::fake()->create('document.pdf', 100);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson('/api/profile/avatar', [
                'avatar' => $file,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['avatar']);
    }

    /** @test */
    public function test_update_avatar_too_large()
    {
        $image = \Illuminate\Http\UploadedFile::fake()->image('avatar.jpg')->size(6000); // > 5MB

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson('/api/profile/avatar', [
                'avatar' => $image,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['avatar']);
    }

    /** @test */
    public function test_get_me_with_access_grants()
    {
        // Grant access level to user
        DB::table('user_access_grants')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $this->user['id'],
            'access_level_id' => 'public',
            'granted_at' => now(),
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->getJson('/api/me');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('access_grants'));
        $this->assertEquals('public', $response->json('access_grants.0.access_level_id'));
    }

    /** @test */
    public function test_profile_requires_authentication()
    {
        $response = $this->getJson('/api/profile');
        $response->assertStatus(401);

        $response = $this->getJson('/api/me');
        $response->assertStatus(401);
    }
}
