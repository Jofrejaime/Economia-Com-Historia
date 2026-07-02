<?php

namespace Tests\Feature;

use App\Models\Badge;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class GamificationAdminTest extends TestCase
{
    use RefreshDatabase;

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function createAdmin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    private function createStudent(): User
    {
        return User::factory()->create(['role' => 'student', 'is_active' => true]);
    }

    private function actingAsAdmin(): array
    {
        $admin = $this->createAdmin();
        $token = $this->loginUser($admin);
        return [$admin, $token];
    }

    private function loginUser(User $user): string
    {
        $token = Str::random(80);
        DB::table('user_sessions')->insert([
            'id'            => Str::uuid(),
            'user_id'       => $user->id,
            'refresh_token' => $token,
            'expires_at'    => now()->addDays(1),
            'created_at'    => now(),
        ]);
        return $token;
    }

    private function createBadge(array $overrides = []): Badge
    {
        return Badge::create(array_merge([
            'id'             => (string) Str::uuid(),
            'name'           => 'Badge Test ' . Str::random(4),
            'description'    => 'Description of badge test.',
            'criteria_type'  => 'points',
            'criteria_value' => 100,
            'is_active'      => true,
        ], $overrides));
    }

    private function createQuiz(): string
    {
        $id = (string) Str::uuid();
        $user = User::factory()->create();
        DB::table('quizzes')->insert([
            'id'          => $id,
            'title'       => 'Test Quiz',
            'module'      => 'economy',
            'description' => 'Test description',
            'difficulty'  => 'easy',
            'base_points' => 50,
            'status'      => 'published',
            'created_by'  => $user->id,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
        return $id;
    }

    public function test_admin_can_list_badges(): void
    {
        [$admin, $token] = $this->actingAsAdmin();
        $this->createBadge();

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson('/api/admin/badges');

        $response->assertOk()
            ->assertJsonStructure(['data', 'stats']);
    }

    public function test_admin_can_create_badge(): void
    {
        [$admin, $token] = $this->actingAsAdmin();

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->postJson('/api/admin/badges', [
                'name'           => 'Golden Scholar',
                'description'    => 'Complete 10 quizzes.',
                'criteria_type'  => 'quizzes',
                'criteria_value' => 10,
                'color_hex'      => '#FFD700',
                'category'       => 'quizzes',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Golden Scholar');
    }

    public function test_admin_can_update_badge(): void
    {
        [$admin, $token] = $this->actingAsAdmin();
        $badge = $this->createBadge();

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->patchJson("/api/admin/badges/{$badge->id}", [
                'name'           => 'Updated Scholar',
                'description'    => 'Complete 20 quizzes.',
                'criteria_type'  => 'quizzes',
                'criteria_value' => 20,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated Scholar');
    }

    public function test_admin_can_toggle_badge_status(): void
    {
        [$admin, $token] = $this->actingAsAdmin();
        $badge = $this->createBadge(['is_active' => true]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->postJson("/api/admin/badges/{$badge->id}/toggle-status");

        $response->assertOk();
        $this->assertFalse((bool) $badge->fresh()->is_active);
    }

    public function test_admin_can_delete_badge(): void
    {
        [$admin, $token] = $this->actingAsAdmin();
        $badge = $this->createBadge();

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->deleteJson("/api/admin/badges/{$badge->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('badges', ['id' => $badge->id]);
    }

    // ─── Point Transactions & Quiz Attempts Tests ───────────────────────────

    public function test_admin_can_list_point_transactions(): void
    {
        [$admin, $token] = $this->actingAsAdmin();
        $student = $this->createStudent();

        DB::table('point_transactions')->insert([
            'id'             => (string) Str::uuid(),
            'user_id'        => $student->id,
            'points'         => 50,
            'reason'         => 'quiz_completion',
            'created_at'     => now(),
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson('/api/admin/point-transactions');

        $response->assertOk()
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_admin_can_list_quiz_attempts(): void
    {
        [$admin, $token] = $this->actingAsAdmin();
        $student = $this->createStudent();
        $quizId = $this->createQuiz();

        DB::table('quiz_attempts')->insert([
            'id'              => (string) Str::uuid(),
            'quiz_id'         => $quizId,
            'user_id'         => $student->id,
            'status'          => 'completed',
            'score'           => 90,
            'correct_answers' => 9,
            'total_questions' => 10,
            'time_spent_secs' => 120,
            'points_earned'   => 50,
            'started_at'      => now(),
            'completed_at'    => now(),
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson('/api/admin/quiz-attempts');

        $response->assertOk()
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_admin_can_view_quiz_attempt(): void
    {
        [$admin, $token] = $this->actingAsAdmin();
        $student = $this->createStudent();
        $quizId = $this->createQuiz();
        $attemptId = (string) Str::uuid();

        DB::table('quiz_attempts')->insert([
            'id'              => $attemptId,
            'quiz_id'         => $quizId,
            'user_id'         => $student->id,
            'status'          => 'completed',
            'score'           => 90,
            'correct_answers' => 9,
            'total_questions' => 10,
            'time_spent_secs' => 120,
            'points_earned'   => 50,
            'started_at'      => now(),
            'completed_at'    => now(),
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson("/api/admin/quiz-attempts/{$attemptId}");

        $response->assertOk()
            ->assertJsonPath('data.id', $attemptId);
    }

    // ─── Leaderboard Tests ───────────────────────────────────────────────────

    public function test_admin_can_view_leaderboard(): void
    {
        [$admin, $token] = $this->actingAsAdmin();

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson('/api/admin/leaderboard');

        $response->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_admin_can_view_leaderboard_snapshots(): void
    {
        [$admin, $token] = $this->actingAsAdmin();

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson('/api/admin/leaderboard/snapshots');

        $response->assertOk()
            ->assertJsonStructure(['data']);
    }

    // ─── Security Tests ──────────────────────────────────────────────────────

    public function test_non_admin_cannot_access_admin_gamification(): void
    {
        $student = $this->createStudent();
        $token = $this->loginUser($student);

        // Try access endpoints
        $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson('/api/admin/badges')
            ->assertStatus(403);

        $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson('/api/admin/leaderboard')
            ->assertStatus(403);
    }
}
