<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Quiz;
use App\Models\Document;
use App\Enums\QuizStatus;
use App\Enums\DocumentStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class QuizAdminTest extends TestCase
{
    use RefreshDatabase;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function issueToken(User $user): string
    {
        $token = Str::random(80);

        DB::table('user_sessions')->insert([
            'id'            => (string) Str::uuid(),
            'user_id'       => $user->id,
            'refresh_token' => $token,
            'expires_at'    => now()->addDays(30),
            'created_at'    => now(),
        ]);

        return $token;
    }

    private function seedAccessLevel(string $id = 'public'): void
    {
        if (DB::table('access_levels')->where('id', $id)->doesntExist()) {
            DB::table('access_levels')->insert([
                'id' => $id, 'name' => 'Public', 'created_at' => now(),
            ]);
        }
    }

    private function seedCategory(): string
    {
        $id = (string) Str::uuid();

        DB::table('document_categories')->insert([
            'id'                    => $id,
            'slug'                  => 'cat-'.Str::lower(Str::random(6)),
            'name'                  => 'Category '.Str::random(4),
            'requires_subscription' => false,
            'created_at'            => now(),
        ]);

        return $id;
    }

    private function seedQuiz(string $categoryId, User $creator, string $status = 'published', bool $featured = false): string
    {
        $id = (string) Str::uuid();

        DB::table('quizzes')->insert([
            'id'              => $id,
            'title'           => 'Quiz '.Str::random(6),
            'difficulty'      => 'Básico',
            'base_points'     => 50,
            'access_level_id' => 'public',
            'is_featured'     => $featured,
            'status'          => $status,
            'category_id'     => $categoryId,
            'created_by'      => $creator->id,
            'published_at'    => $status === 'published' ? now() : null,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        return $id;
    }

    private function seedDocument(string $categoryId, User $creator): string
    {
        $id = (string) Str::uuid();

        DB::table('documents')->insert([
            'id'              => $id,
            'title'           => 'Doc '.Str::random(6),
            'slug'            => 'doc-'.Str::lower(Str::random(8)),
            'author'          => 'Author',
            'summary'         => 'Summary',
            'document_type'   => 'article',
            'academic_level'  => 'intro',
            'access_level_id' => 'public',
            'category_id'     => $categoryId,
            'status'          => 'published',
            'is_pinned'       => false,
            'created_by'      => $creator->id,
            'published_at'    => now(),
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        return $id;
    }

    // ─── Permissões ────────────────────────────────────────────────────────────

    public function test_non_admin_cannot_access_admin_endpoints(): void
    {
        $this->seedAccessLevel();
        $student = User::factory()->create(['role' => 'student']);
        $token = $this->issueToken($student);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/quizzes');

        $response->assertStatus(403);
    }

    // ─── CRUD ──────────────────────────────────────────────────────────────────

    public function test_admin_can_list_quizzes_with_pagination(): void
    {
        $this->seedAccessLevel();
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($admin);
        $categoryId = $this->seedCategory();

        for ($i = 0; $i < 5; $i++) {
            $this->seedQuiz($categoryId, $admin);
        }

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/quizzes?per_page=2');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id', 'title', 'description', 'module', 'difficulty', 'status',
                        'category_id', 'category_name', 'creator_id', 'creator_name',
                        'published_at', 'created_at', 'updated_at', 'attempts_count',
                        'completed_attempts', 'completion_rate', 'avg_score',
                        'questions_count', 'documents_count', 'is_featured',
                        'is_standalone', 'has_documents'
                    ]
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total']
            ]);
    }

    public function test_admin_can_retrieve_single_quiz(): void
    {
        $this->seedAccessLevel();
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId = $this->seedQuiz($categoryId, $admin);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/admin/quizzes/{$quizId}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $quizId);
    }

    public function test_admin_can_create_quiz(): void
    {
        $this->seedAccessLevel();
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($admin);
        $categoryId = $this->seedCategory();

        $payload = [
            'title' => 'Novo Quiz Admin',
            'description' => 'Descrição do Quiz',
            'difficulty' => 'Básico',
            'category_id' => $categoryId,
            'status' => 'draft',
            'questions' => [
                [
                    'question_order' => 1,
                    'title' => 'Pergunta 1',
                    'options' => [
                        ['option_key' => 'A', 'text' => 'Opção A', 'is_correct' => true],
                        ['option_key' => 'B', 'text' => 'Opção B', 'is_correct' => false],
                    ]
                ]
            ]
        ];

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/admin/quizzes', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('quizzes', ['title' => 'Novo Quiz Admin', 'status' => 'draft']);
    }

    public function test_admin_can_update_quiz(): void
    {
        $this->seedAccessLevel();
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId = $this->seedQuiz($categoryId, $admin);

        $payload = [
            'title' => 'Quiz Atualizado Pelo Admin',
            'description' => 'Nova Descrição',
            'difficulty' => 'Avançado',
            'status' => 'review',
        ];

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->patchJson("/api/admin/quizzes/{$quizId}", $payload);

        $response->assertStatus(200);
        $this->assertDatabaseHas('quizzes', [
            'id' => $quizId,
            'title' => 'Quiz Atualizado Pelo Admin',
            'status' => 'review'
        ]);
    }

    public function test_admin_can_delete_quiz(): void
    {
        $this->seedAccessLevel();
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId = $this->seedQuiz($categoryId, $admin);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/admin/quizzes/{$quizId}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('quizzes', ['id' => $quizId]);
    }

    // ─── Filtros & Pesquisa ────────────────────────────────────────────────────

    public function test_admin_can_filter_quizzes(): void
    {
        $this->seedAccessLevel();
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($admin);
        $categoryId = $this->seedCategory();

        $q1 = $this->seedQuiz($categoryId, $admin, 'draft', true);
        $q2 = $this->seedQuiz($categoryId, $admin, 'published', false);

        // Filter by status
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/quizzes?status=draft');
        $response->assertStatus(200)->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $q1);

        // Filter by featured
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/quizzes?featured=true');
        $response->assertStatus(200)->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $q1);
    }

    public function test_admin_can_search_quizzes(): void
    {
        $this->seedAccessLevel();
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($admin);
        $categoryId = $this->seedCategory();

        // Seed quizzes with distinct fields
        DB::table('quizzes')->insert([
            'id' => (string) Str::uuid(),
            'title' => 'Matemática Financeira',
            'description' => 'Quiz de finanças',
            'module' => 'Módulo 1',
            'created_by' => $admin->id,
            'access_level_id' => 'public',
        ]);

        DB::table('quizzes')->insert([
            'id' => (string) Str::uuid(),
            'title' => 'História Geral',
            'description' => 'Quiz de história',
            'module' => 'Módulo 2',
            'created_by' => $admin->id,
            'access_level_id' => 'public',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/quizzes?search=Financeira');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Matemática Financeira');
    }

    public function test_admin_can_sort_quizzes(): void
    {
        $this->seedAccessLevel();
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($admin);
        $categoryId = $this->seedCategory();

        $quizA = (string) Str::uuid();
        DB::table('quizzes')->insert([
            'id' => $quizA, 'title' => 'A Quiz', 'created_by' => $admin->id, 'access_level_id' => 'public', 'created_at' => now()->subDays(2),
        ]);

        $quizB = (string) Str::uuid();
        DB::table('quizzes')->insert([
            'id' => $quizB, 'title' => 'B Quiz', 'created_by' => $admin->id, 'access_level_id' => 'public', 'created_at' => now(),
        ]);

        // Order by created_at desc
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/quizzes?sort_by=created_at&sort_direction=desc');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.id', $quizB);
    }

    // ─── Máquina de Estados & Auditoria ───────────────────────────────────────

    public function test_admin_can_perform_valid_state_transitions_with_audit_logging(): void
    {
        $this->seedAccessLevel();
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId = $this->seedQuiz($categoryId, $admin, 'draft');

        // Transition 1: DRAFT -> REVIEW
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->patchJson("/api/admin/quizzes/{$quizId}/review");
        $response->assertStatus(200);
        $this->assertDatabaseHas('quizzes', ['id' => $quizId, 'status' => 'review', 'reviewed_by' => $admin->id]);

        // Transition 2: REVIEW -> PUBLISHED
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->patchJson("/api/admin/quizzes/{$quizId}/publish");
        $response->assertStatus(200);
        $this->assertDatabaseHas('quizzes', ['id' => $quizId, 'status' => 'published', 'published_by' => $admin->id]);

        // Transition 3: PUBLISHED -> ARCHIVED
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->patchJson("/api/admin/quizzes/{$quizId}/archive");
        $response->assertStatus(200);
        $this->assertDatabaseHas('quizzes', ['id' => $quizId, 'status' => 'archived', 'archived_by' => $admin->id]);
    }

    public function test_admin_cannot_perform_invalid_state_transitions(): void
    {
        $this->seedAccessLevel();
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId = $this->seedQuiz($categoryId, $admin, 'draft');

        // Invalid: DRAFT -> ARCHIVED directly (requires draft -> review -> published -> archived)
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->patchJson("/api/admin/quizzes/{$quizId}/archive");

        $response->assertStatus(409);
    }

    // ─── Dashboard ─────────────────────────────────────────────────────────────

    public function test_admin_can_retrieve_dashboard_statistics(): void
    {
        $this->seedAccessLevel();
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($admin);
        $categoryId = $this->seedCategory();

        $this->seedQuiz($categoryId, $admin, 'published', true);
        $this->seedQuiz($categoryId, $admin, 'draft', false);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/quizzes/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'quizzes' => [
                    'total', 'published', 'draft', 'review', 'archived',
                    'featured', 'standalone', 'with_documents', 'without_documents'
                ],
                'attempts' => [
                    'total', 'completed', 'completion_rate', 'average_score'
                ],
                'most_attempted', 'highest_score', 'lowest_score'
            ]);
    }

    // ─── Document × Quiz Relations ─────────────────────────────────────────────

    public function test_admin_can_manage_quiz_document_relations(): void
    {
        $this->seedAccessLevel();
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId = $this->seedQuiz($categoryId, $admin);
        $docId = $this->seedDocument($categoryId, $admin);

        // 1. Sync Document to Quiz
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/admin/quizzes/{$quizId}/documents", ['documents' => [$docId]]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('quiz_documents', ['quiz_id' => $quizId, 'document_id' => $docId]);

        // 2. List Documents of Quiz
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/admin/quizzes/{$quizId}/documents");
        $response->assertStatus(200)->assertJsonCount(1, 'data');

        // 3. Detach Document from Quiz
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/admin/quizzes/{$quizId}/documents/{$docId}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('quiz_documents', ['quiz_id' => $quizId, 'document_id' => $docId]);
    }

    public function test_admin_can_list_quizzes_for_document_including_draft_review_archived(): void
    {
        $this->seedAccessLevel();
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizDraftId = $this->seedQuiz($categoryId, $admin, 'draft');
        $docId = $this->seedDocument($categoryId, $admin);

        // Associate draft quiz with the document
        DB::table('quiz_documents')->insert([
            'quiz_id' => $quizDraftId,
            'document_id' => $docId,
            'sort_order' => 0
        ]);

        // Access via administrative quizzes of document endpoint
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/admin/documents/{$docId}/quizzes");

        // The administrative endpoint should return it (even though it's draft!)
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $quizDraftId);
    }
}
