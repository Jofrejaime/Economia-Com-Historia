<?php

namespace Tests\Feature;

use App\Mail\EmailVerificationMail;
use App\Mail\PasswordResetMail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        Mail::fake();

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

        Mail::assertSent(EmailVerificationMail::class, function (EmailVerificationMail $mail): bool {
            return $mail->hasTo('test@example.com');
        });
    }

    public function test_register_rejects_admin_role(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/auth/register', [
            'email' => 'admin-attempt@example.com',
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Admin Attempt',
            'role' => 'admin',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['role']);
    }

    public function test_login_rejects_inactive_user(): void
    {
        Mail::fake();

        $this->postJson('/api/auth/register', [
            'email' => 'inactive@example.com',
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Inactive User',
        ]);

        User::query()->where('email', 'inactive@example.com')->update(['is_active' => false]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'inactive@example.com',
            'password' => 'Kh7#m9$Pq2!z',
        ]);

        $response->assertStatus(403);
    }

    public function test_refresh_rejects_expired_session(): void
    {
        Mail::fake();

        $register = $this->postJson('/api/auth/register', [
            'email' => 'expired@example.com',
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Expired Session',
        ]);

        $token = $register->json('token');

        DB::table('user_sessions')
            ->where('refresh_token', $token)
            ->update(['expires_at' => now()->subMinute()]);

        $response = $this->postJson('/api/auth/refresh', [], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(401);
    }

    public function test_user_can_manage_sessions(): void
    {
        Mail::fake();

        $register = $this->postJson('/api/auth/register', [
            'email' => 'sessions@example.com',
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Session User',
        ]);

        $token = $register->json('token');

        $this->postJson('/api/auth/login', [
            'email' => 'sessions@example.com',
            'password' => 'Kh7#m9$Pq2!z',
        ]);

        $list = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/sessions');

        $list->assertStatus(200);
        $this->assertGreaterThanOrEqual(2, count($list->json('data')));

        $otherSession = collect($list->json('data'))->first(fn (array $s) => $s['is_current'] === false);
        $this->assertNotNull($otherSession);

        $revoke = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson('/api/auth/sessions/'.$otherSession['id']);

        $revoke->assertStatus(200);

        $revokeOthers = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson('/api/auth/sessions/others');

        $revokeOthers->assertStatus(200);
        $revokeOthers->assertJsonPath('revoked_count', 0);
    }

    public function test_resend_verification_sends_email(): void
    {
        Mail::fake();

        $this->postJson('/api/auth/register', [
            'email' => 'resend@example.com',
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Resend User',
        ]);

        Mail::fake();

        $response = $this->postJson('/api/auth/resend-verification', [
            'email' => 'resend@example.com',
        ]);

        $response->assertStatus(200);

        Mail::assertSent(EmailVerificationMail::class, function (EmailVerificationMail $mail): bool {
            return $mail->hasTo('resend@example.com');
        });
    }

    public function test_user_can_login(): void
    {
        Mail::fake();

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
        Mail::fake();

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
        Mail::fake();

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
        Mail::fake();

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
        Mail::fake();

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
        Mail::fake();

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
        Mail::fake();

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
