<?php

namespace Tests\Feature;

use App\Enums\QuizStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class QuizAccessGateTest extends TestCase
{
    use RefreshDatabase;

    private function registerStudent(): string
    {
        Mail::fake();

        $response = $this->postJson('/api/auth/register', [
            'email' => 'student@example.com',
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Student User',
        ]);

        return $response->json('token');
    }

    private function issueToken(User $user): string
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

    private function seedQuiz(string $accessLevelId, ?string $createdBy = null): string
    {
        $authorId = $createdBy ?? User::factory()->create()->id;
        $id = (string) Str::uuid();

        DB::table('quizzes')->insert([
            'id' => $id,
            'title' => 'Test Quiz ' . $accessLevelId,
            'difficulty' => 'Básico',
            'base_points' => 100,
            'time_limit_secs' => 600,
            'access_level_id' => $accessLevelId,
            'status' => QuizStatus::PUBLISHED->value,
            'created_by' => $authorId,
            'published_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    public function test_public_quiz_is_accessible_without_grant(): void
    {
        $token = $this->registerStudent();
        $quizId = $this->seedQuiz('public');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/quizzes/{$quizId}")
            ->assertStatus(200);
    }

    public function test_restricted_quiz_returns_forbidden_without_grant(): void
    {
        $token = $this->registerStudent();
        $quizId = $this->seedQuiz('jindungo');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/quizzes/{$quizId}")
            ->assertStatus(403);
    }

    public function test_restricted_quiz_is_accessible_with_grant(): void
    {
        $token = $this->registerStudent();
        $user = User::query()->where('email', 'student@example.com')->first();
        $quizId = $this->seedQuiz('jindungo');

        DB::table('user_access_grants')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'access_level_id' => 'jindungo',
            'granted_at' => now(),
            'is_active' => true,
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/quizzes/{$quizId}")
            ->assertStatus(200);
    }

    public function test_quiz_index_filters_by_access_gate(): void
    {
        $token = $this->registerStudent();
        $publicId = $this->seedQuiz('public');
        $restrictedId = $this->seedQuiz('jindungo');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/quizzes');

        $response->assertStatus(200);

        $ids = collect($response->json('data'))->pluck('id')->all();

        $this->assertContains($publicId, $ids);
        $this->assertNotContains($restrictedId, $ids);
    }

    public function test_start_attempt_requires_access(): void
    {
        $token = $this->registerStudent();
        $quizId = $this->seedQuiz('restricted');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/quizzes/{$quizId}/attempts")
            ->assertStatus(403);
    }

    public function test_admin_can_access_any_quiz(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $adminToken = $this->issueToken($admin);
        $quizId = $this->seedQuiz('restricted');

        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson("/api/quizzes/{$quizId}")
            ->assertStatus(200);
    }
}
