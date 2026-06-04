<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class QuizAttemptQuestionsTest extends TestCase
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

    public function test_quiz_questions_endpoint_hides_correctness_and_explanation(): void
    {
        $token = $this->registerStudent();
        
        $author = User::factory()->create();
        $quizId = (string) Str::uuid();
        $qId = (string) Str::uuid();

        DB::table('quizzes')->insert([
            'id' => $quizId,
            'title' => 'Quiz Hiding Test',
            'created_by' => $author->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('quiz_questions')->insert([
            'id' => $qId,
            'quiz_id' => $quizId,
            'question_order' => 1,
            'title' => 'Qual o dobro de 2?',
        ]);

        DB::table('quiz_options')->insert([
            [
                'id' => (string) Str::uuid(),
                'question_id' => $qId,
                'option_key' => 'A',
                'text' => '4',
                'is_correct' => true,
                'explanation' => 'Porque 2+2=4.'
            ],
            [
                'id' => (string) Str::uuid(),
                'question_id' => $qId,
                'option_key' => 'B',
                'text' => '5',
                'is_correct' => false,
                'explanation' => 'Incorreto.'
            ]
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/quizzes/{$quizId}/questions");

        $response->assertStatus(200);

        // Check payload structure
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'question',
                    'options' => [
                        '*' => [
                            'id',
                            'option_text',
                            'option_key'
                        ]
                    ]
                ]
            ]
        ]);

        // Assert is_correct and explanation are not exposed
        $data = $response->json('data');
        $this->assertNotEmpty($data);
        foreach ($data as $question) {
            $this->assertEquals('Qual o dobro de 2?', $question['question']);
            $this->assertNotEmpty($question['options']);
            foreach ($question['options'] as $option) {
                $this->assertArrayNotHasKey('is_correct', $option);
                $this->assertArrayNotHasKey('explanation', $option);
            }
        }
    }
}
