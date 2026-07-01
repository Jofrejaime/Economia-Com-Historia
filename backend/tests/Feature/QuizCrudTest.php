<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class QuizCrudTest extends TestCase
{
    use RefreshDatabase;

    private function registerUser(string $email, string $role): string
    {
        $user = User::factory()->create([
            'email' => $email,
            'role' => $role,
        ]);
        return $this->issueToken($user);
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

    public function test_admin_or_professor_can_create_quiz_with_nested_questions_and_options(): void
    {
        $token = $this->registerUser('admin@example.com', 'admin');

        $payload = [
            'title' => 'Novo Quiz de Economia',
            'difficulty' => 'Intermédio',
            'base_points' => 150,
            'time_limit_secs' => 300,
            'access_level_id' => 'public',
            'status' => 'published',
            'questions' => [
                [
                    'question_order' => 1,
                    'title' => 'O que é inflação?',
                    'points' => 20,
                    'options' => [
                        [
                            'option_key' => 'A',
                            'text' => 'Aumento geral dos preços',
                            'is_correct' => true,
                            'explanation' => 'Inflação é a subida continuada de preços.'
                        ],
                        [
                            'option_key' => 'B',
                            'text' => 'Queda do PIB',
                            'is_correct' => false,
                        ]
                    ]
                ]
            ]
        ];

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/quizzes', $payload);

        $response->assertStatus(201);
        $quizId = $response->json('data.id');

        $this->assertDatabaseHas('quizzes', [
            'id' => $quizId,
            'title' => 'Novo Quiz de Economia',
            'difficulty' => 'Intermédio',
        ]);

        $this->assertDatabaseHas('quiz_questions', [
            'quiz_id' => $quizId,
            'question_order' => 1,
            'title' => 'O que é inflação?',
        ]);

        $questionId = DB::table('quiz_questions')->where('quiz_id', $quizId)->value('id');

        $this->assertDatabaseHas('quiz_options', [
            'question_id' => $questionId,
            'option_key' => 'A',
            'is_correct' => true,
        ]);
    }

    public function test_student_cannot_create_quiz(): void
    {
        $token = $this->registerUser('student@example.com', 'student');

        $payload = [
            'title' => 'Quiz Proibido',
        ];

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/quizzes', $payload)
            ->assertStatus(403);
    }

    public function test_admin_or_professor_can_update_quiz_metadata_and_sync_questions(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($user);

        $quizId = (string) Str::uuid();
        $q1Id = (string) Str::uuid();
        $q2Id = (string) Str::uuid();

        // Seed initial quiz
        DB::table('quizzes')->insert([
            'id' => $quizId,
            'title' => 'Quiz Inicial',
            'created_by' => $user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('quiz_questions')->insert([
            [
                'id' => $q1Id,
                'quiz_id' => $quizId,
                'question_order' => 1,
                'title' => 'Pergunta 1',
            ],
            [
                'id' => $q2Id,
                'quiz_id' => $quizId,
                'question_order' => 2,
                'title' => 'Pergunta 2',
            ]
        ]);

        DB::table('quiz_options')->insert([
            [
                'id' => (string) Str::uuid(),
                'question_id' => $q1Id,
                'option_key' => 'A',
                'text' => 'Opcao A',
                'is_correct' => true,
            ],
            [
                'id' => (string) Str::uuid(),
                'question_id' => $q1Id,
                'option_key' => 'B',
                'text' => 'Opcao B',
                'is_correct' => false,
            ],
            [
                'id' => (string) Str::uuid(),
                'question_id' => $q2Id,
                'option_key' => 'A',
                'text' => 'Opcao A',
                'is_correct' => true,
            ],
            [
                'id' => (string) Str::uuid(),
                'question_id' => $q2Id,
                'option_key' => 'B',
                'text' => 'Opcao B',
                'is_correct' => false,
            ]
        ]);

        // Payload will modify Q1, remove Q2, and add Q3
        $payload = [
            'title' => 'Quiz Atualizado',
            'questions' => [
                [
                    'id' => $q1Id,
                    'question_order' => 1,
                    'title' => 'Pergunta 1 Atualizada',
                    'options' => [
                        [
                            'option_key' => 'A',
                            'text' => 'Nova Opcao A',
                            'is_correct' => true,
                        ],
                        [
                            'option_key' => 'B',
                            'text' => 'Opcao B',
                            'is_correct' => false,
                        ]
                    ]
                ],
                [
                    'question_order' => 2,
                    'title' => 'Pergunta 3 Nova',
                    'options' => [
                        [
                            'option_key' => 'A',
                            'text' => 'Opcao Nova A',
                            'is_correct' => true,
                        ],
                        [
                            'option_key' => 'B',
                            'text' => 'Opcao Nova B',
                            'is_correct' => false,
                        ]
                    ]
                ]
            ]
        ];

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/quizzes/{$quizId}", $payload);

        $response->assertStatus(200);

        $this->assertDatabaseHas('quizzes', [
            'id' => $quizId,
            'title' => 'Quiz Atualizado',
        ]);

        $this->assertDatabaseHas('quiz_questions', [
            'id' => $q1Id,
            'title' => 'Pergunta 1 Atualizada',
        ]);

        // Q2 should be deleted
        $this->assertDatabaseMissing('quiz_questions', [
            'id' => $q2Id,
        ]);

        // Q3 should exist
        $this->assertDatabaseHas('quiz_questions', [
            'quiz_id' => $quizId,
            'title' => 'Pergunta 3 Nova',
        ]);
    }

    public function test_admin_or_professor_can_delete_quiz(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($user);

        $quizId = (string) Str::uuid();

        DB::table('quizzes')->insert([
            'id' => $quizId,
            'title' => 'Quiz para Excluir',
            'created_by' => $user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/quizzes/{$quizId}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('quizzes', ['id' => $quizId]);
    }
}
