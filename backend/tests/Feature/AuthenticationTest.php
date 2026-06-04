<?php

namespace Tests\Feature;

use App\Mail\PasswordResetMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Test User',
            'role' => 'estudante',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'token',
            'verification_token',
            'user' => ['id', 'email', 'email_verified', 'is_active', 'role'],
        ]);
    }

    public function test_user_can_login(): void
    {
        $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Test User',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'Kh7#m9$Pq2!z',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'token',
            'user' => ['id', 'email'],
        ]);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Test User',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['message']);
    }

    public function test_user_can_access_protected_me_route(): void
    {
        $register = $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Test User',
        ]);

        $token = $register->json('token');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/me');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'user' => ['id', 'email'],
            'profile' => ['display_name'],
        ]);
    }

    public function test_protected_route_fails_without_token(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401);
    }

    public function test_user_can_verify_email(): void
    {
        $register = $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Test User',
        ]);

        $verificationToken = $register->json('verification_token');

        $response = $this->postJson('/api/auth/verify-email', [
            'token' => $verificationToken,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Email verified successfully.']);
    }

    public function test_user_can_refresh_token(): void
    {
        $register = $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Test User',
        ]);

        $token = $register->json('token');

        $response = $this->postJson('/api/auth/refresh', [], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['message', 'token']);
    }

    public function test_user_can_logout(): void
    {
        $register = $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Test User',
        ]);

        $token = $register->json('token');

        $response = $this->postJson('/api/auth/logout', [], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Logged out.']);
    }

    public function test_user_can_request_password_reset(): void
    {
        Mail::fake();

        $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Test User',
        ]);

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200);

        $response->assertJsonStructure(['message']);
        $response->assertJsonMissing(['reset_token']);

        Mail::assertSent(PasswordResetMail::class, function (PasswordResetMail $mail): bool {
            return $mail->hasTo('test@example.com');
        });
    }

    public function test_user_can_reset_password(): void
    {
        $register = $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Test User',
        ]);

        $forgot = $this->postJson('/api/auth/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $forgot->assertStatus(200);

        $resetToken = DB::table('verification_tokens')
            ->where('type', 'password_reset')
            ->whereNull('used_at')
            ->value('token');

        $response = $this->postJson('/api/auth/reset-password', [
            'token' => $resetToken,
            'password' => 'Ap9#xR7$wQ!z',
            'password_confirmation' => 'Ap9#xR7$wQ!z',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Password reset successfully.']);
    }
}
