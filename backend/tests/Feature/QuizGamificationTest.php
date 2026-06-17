<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\PointTransactionReason;
use Database\Seeders\BadgesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class QuizGamificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(BadgesSeeder::class);
    }

    public function test_completing_quiz_awards_points_level_and_badge(): void
    {
        Mail::fake();

        $register = $this->postJson('/api/auth/register', [
            'email' => 'quizplayer@example.com',
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Quiz Player',
        ])->assertCreated();

        $token = $register->json('token');
        $userId = User::query()->where('email', 'quizplayer@example.com')->value('id');

        $quiz = $this->seedQuiz($userId);
        $correctOptionId = $quiz['correct_option_id'];

        $attemptId = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/quizzes/{$quiz['quiz_id']}/attempts")
            ->assertCreated()
            ->json('id');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/quiz-attempts/{$attemptId}/answers", [
                'question_id' => $quiz['question_id'],
                'selected_option_id' => $correctOptionId,
                'time_spent_secs' => 30,
            ])
            ->assertOk()
            ->assertJsonPath('is_correct', true);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/quiz-attempts/{$attemptId}/complete", [
                'time_spent_secs' => 400,
            ])
            ->assertOk();

        $response->assertJsonPath('data.status', 'completed');
        $response->assertJsonPath('gamification.points_delta', 120);
        $response->assertJsonPath('gamification.current_level', 2);
        $this->assertNotEmpty($response->json('gamification.badges_earned'));

        $this->assertDatabaseHas('point_transactions', [
            'user_id' => $userId,
            'reason' => PointTransactionReason::QUIZ_COMPLETION,
            'reference_id' => $attemptId,
        ]);

        $this->assertDatabaseHas('user_levels', [
            'user_id' => $userId,
            'total_points' => 120,
            'current_level' => 2,
            'quizzes_completed' => 1,
        ]);

        $this->assertDatabaseHas('user_badges', ['user_id' => $userId]);
    }

    /**
     * @return array{quiz_id: string, question_id: string, correct_option_id: string}
     */
    private function seedQuiz(string $createdBy): array
    {
        $quizId = (string) Str::uuid();
        $questionId = (string) Str::uuid();
        $correctOptionId = (string) Str::uuid();
        $wrongOptionId = (string) Str::uuid();

        DB::table('quizzes')->insert([
            'id' => $quizId,
            'title' => 'Gamification Quiz',
            'difficulty' => 'Básico',
            'base_points' => 100,
            'time_limit_secs' => 600,
            'access_level_id' => 'public',
            'status' => 'published',
            'created_by' => $createdBy,
            'published_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('quiz_questions')->insert([
            'id' => $questionId,
            'quiz_id' => $quizId,
            'question_order' => 1,
            'title' => 'Sample question?',
            'question_type' => 'multiple_choice',
            'points' => 10,
        ]);

        DB::table('quiz_options')->insert([
            [
                'id' => $correctOptionId,
                'question_id' => $questionId,
                'option_key' => 'A',
                'text' => 'Yes',
                'is_correct' => true,
            ],
            [
                'id' => $wrongOptionId,
                'question_id' => $questionId,
                'option_key' => 'B',
                'text' => 'No',
                'is_correct' => false,
            ],
        ]);

        return [
            'quiz_id' => $quizId,
            'question_id' => $questionId,
            'correct_option_id' => $correctOptionId,
        ];
    }
}
