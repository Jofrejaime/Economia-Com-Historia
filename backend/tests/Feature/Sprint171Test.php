<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\QuizDocumentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Sprint 17.1 — Refinamento Arquitetural do Domínio de Aprendizagem
 *
 * Cobre:
 *  - QuizDocumentService: attach, sync, detach, list, has, count
 *  - Paginação em GET /documents/{id}/quizzes e GET /quizzes/{id}/documents
 *  - Ordenação em ambos os endpoints
 *  - Formato do QuizSummaryResource
 *  - Desacoplamento: serviço sem subscrições / controlo de acesso
 *  - Respostas incluem meta wrapper de paginação
 */
class Sprint171Test extends TestCase
{
    use RefreshDatabase;

    private QuizDocumentService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(QuizDocumentService::class);
    }

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

    private function seedDocument(string $categoryId, string $status = 'published', string $title = ''): string
    {
        $author = User::factory()->create();
        $id     = (string) Str::uuid();
        DB::table('documents')->insert([
            'id'              => $id,
            'title'           => $title ?: 'Doc '.Str::random(6),
            'slug'            => 'doc-'.Str::lower(Str::random(8)),
            'author'          => 'Author',
            'summary'         => 'Summary',
            'document_type'   => 'article',
            'academic_level'  => 'intro',
            'access_level_id' => 'public',
            'category_id'     => $categoryId,
            'status'          => $status,
            'is_pinned'       => false,
            'created_by'      => $author->id,
            'published_at'    => $status === 'published' ? now() : null,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);
        return $id;
    }

    private function seedQuiz(string $categoryId, User $creator, string $status = 'published', string $title = '', string $difficulty = 'Básico'): string
    {
        $id = (string) Str::uuid();
        DB::table('quizzes')->insert([
            'id'              => $id,
            'title'           => $title ?: 'Quiz '.Str::random(6),
            'difficulty'      => $difficulty,
            'base_points'     => 50,
            'access_level_id' => 'public',
            'is_featured'     => false,
            'status'          => $status,
            'category_id'     => $categoryId,
            'created_by'      => $creator->id,
            'published_at'    => $status === 'published' ? now() : null,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);
        return $id;
    }

    private function linkQuizDocument(string $quizId, string $documentId, int $sortOrder = 0): void
    {
        DB::table('quiz_documents')->insert([
            'quiz_id'     => $quizId,
            'document_id' => $documentId,
            'sort_order'  => $sortOrder,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
    }

    // ─── QuizDocumentService::attachDocuments() ───────────────────────────────

    public function test_service_attach_creates_pivot_rows(): void
    {
        $this->seedAccessLevel();
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);
        $doc1Id     = $this->seedDocument($categoryId);
        $doc2Id     = $this->seedDocument($categoryId);

        $this->service->attachDocuments($quizId, [$doc1Id, $doc2Id]);

        $this->assertDatabaseCount('quiz_documents', 2);
        $this->assertDatabaseHas('quiz_documents', ['quiz_id' => $quizId, 'document_id' => $doc1Id, 'sort_order' => 0]);
        $this->assertDatabaseHas('quiz_documents', ['quiz_id' => $quizId, 'document_id' => $doc2Id, 'sort_order' => 1]);
    }

    public function test_service_attach_with_empty_array_inserts_nothing(): void
    {
        $this->seedAccessLevel();
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);

        $this->service->attachDocuments($quizId, []);

        $this->assertDatabaseCount('quiz_documents', 0);
    }

    // ─── QuizDocumentService::syncDocuments() ────────────────────────────────

    public function test_service_sync_replaces_existing_associations(): void
    {
        $this->seedAccessLevel();
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);
        $oldDocId   = $this->seedDocument($categoryId);
        $newDoc1Id  = $this->seedDocument($categoryId);
        $newDoc2Id  = $this->seedDocument($categoryId);
        $this->linkQuizDocument($quizId, $oldDocId, 0);

        $this->service->syncDocuments($quizId, [$newDoc1Id, $newDoc2Id]);

        $this->assertDatabaseCount('quiz_documents', 2);
        $this->assertDatabaseHas('quiz_documents', ['quiz_id' => $quizId, 'document_id' => $newDoc1Id, 'sort_order' => 0]);
        $this->assertDatabaseHas('quiz_documents', ['quiz_id' => $quizId, 'document_id' => $newDoc2Id, 'sort_order' => 1]);
        $this->assertDatabaseMissing('quiz_documents', ['document_id' => $oldDocId]);
    }

    public function test_service_sync_with_empty_clears_all(): void
    {
        $this->seedAccessLevel();
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);
        $docId      = $this->seedDocument($categoryId);
        $this->linkQuizDocument($quizId, $docId, 0);

        $this->service->syncDocuments($quizId, []);

        $this->assertDatabaseCount('quiz_documents', 0);
    }

    public function test_service_sync_updates_sort_order_for_existing_association(): void
    {
        $this->seedAccessLevel();
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);
        $docId      = $this->seedDocument($categoryId);
        $this->linkQuizDocument($quizId, $docId, 5);

        $this->service->syncDocuments($quizId, [$docId]);

        $this->assertDatabaseHas('quiz_documents', ['quiz_id' => $quizId, 'document_id' => $docId, 'sort_order' => 0]);
    }

    // ─── QuizDocumentService::detachDocument() ────────────────────────────────

    public function test_service_detach_removes_specific_association(): void
    {
        $this->seedAccessLevel();
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);
        $doc1Id     = $this->seedDocument($categoryId);
        $doc2Id     = $this->seedDocument($categoryId);
        $this->linkQuizDocument($quizId, $doc1Id, 0);
        $this->linkQuizDocument($quizId, $doc2Id, 1);

        $result = $this->service->detachDocument($quizId, $doc1Id);

        $this->assertTrue($result);
        $this->assertDatabaseCount('quiz_documents', 1);
        $this->assertDatabaseHas('quiz_documents', ['document_id' => $doc2Id]);
    }

    public function test_service_detach_returns_false_when_not_associated(): void
    {
        $this->seedAccessLevel();
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);
        $docId      = $this->seedDocument($categoryId);

        $result = $this->service->detachDocument($quizId, $docId);

        $this->assertFalse($result);
    }

    // ─── QuizDocumentService::documentsOfQuiz() ───────────────────────────────

    public function test_service_documents_of_quiz_returns_empty_for_no_associations(): void
    {
        $this->seedAccessLevel();
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);

        $result = $this->service->documentsOfQuiz($quizId);

        $this->assertCount(0, $result['data']);
        $this->assertEquals(0, $result['meta']['total']);
    }

    public function test_service_documents_of_quiz_excludes_drafts(): void
    {
        $this->seedAccessLevel();
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);
        $pubDocId   = $this->seedDocument($categoryId, 'published');
        $draftDocId = $this->seedDocument($categoryId, 'draft');
        $this->linkQuizDocument($quizId, $pubDocId, 0);
        $this->linkQuizDocument($quizId, $draftDocId, 1);

        $result = $this->service->documentsOfQuiz($quizId);

        $this->assertCount(1, $result['data']);
        $this->assertEquals($pubDocId, $result['data']->first()->id);
    }

    // ─── QuizDocumentService::quizzesOfDocument() ────────────────────────────

    public function test_service_quizzes_of_document_returns_empty_for_no_associations(): void
    {
        $this->seedAccessLevel();
        $categoryId = $this->seedCategory();
        $docId      = $this->seedDocument($categoryId);

        $result = $this->service->quizzesOfDocument($docId);

        $this->assertCount(0, $result['data']);
        $this->assertEquals(0, $result['meta']['total']);
    }

    public function test_service_quizzes_of_document_excludes_drafts(): void
    {
        $this->seedAccessLevel();
        $professor   = User::factory()->create(['role' => 'professor']);
        $categoryId  = $this->seedCategory();
        $docId       = $this->seedDocument($categoryId);
        $pubQuizId   = $this->seedQuiz($categoryId, $professor, 'published');
        $draftQuizId = $this->seedQuiz($categoryId, $professor, 'draft');
        $this->linkQuizDocument($pubQuizId, $docId, 0);
        $this->linkQuizDocument($draftQuizId, $docId, 1);

        $result = $this->service->quizzesOfDocument($docId);

        $this->assertCount(1, $result['data']);
        $this->assertEquals($pubQuizId, $result['data']->first()->id);
    }

    // ─── QuizDocumentService::hasDocuments() / countDocuments() ──────────────

    public function test_service_has_documents_returns_false_when_empty(): void
    {
        $this->seedAccessLevel();
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);

        $this->assertFalse($this->service->hasDocuments($quizId));
    }

    public function test_service_has_documents_returns_true_when_associated(): void
    {
        $this->seedAccessLevel();
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);
        $docId      = $this->seedDocument($categoryId);
        $this->linkQuizDocument($quizId, $docId, 0);

        $this->assertTrue($this->service->hasDocuments($quizId));
    }

    public function test_service_count_documents_returns_correct_count(): void
    {
        $this->seedAccessLevel();
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);
        $doc1Id     = $this->seedDocument($categoryId);
        $doc2Id     = $this->seedDocument($categoryId);
        $doc3Id     = $this->seedDocument($categoryId);
        $this->linkQuizDocument($quizId, $doc1Id, 0);
        $this->linkQuizDocument($quizId, $doc2Id, 1);
        $this->linkQuizDocument($quizId, $doc3Id, 2);

        $this->assertEquals(3, $this->service->countDocuments($quizId));
    }

    public function test_service_count_documents_returns_zero_for_nonexistent_quiz(): void
    {
        $this->assertEquals(0, $this->service->countDocuments((string) Str::uuid()));
    }

    // ─── Paginação — GET /documents/{id}/quizzes ─────────────────────────────

    public function test_document_quizzes_pagination_meta_is_present(): void
    {
        $this->seedAccessLevel();
        $user       = User::factory()->create(['role' => 'estudante']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($user);
        $categoryId = $this->seedCategory();
        $docId      = $this->seedDocument($categoryId);

        for ($i = 0; $i < 3; $i++) {
            $quizId = $this->seedQuiz($categoryId, $professor);
            $this->linkQuizDocument($quizId, $docId, $i);
        }

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/documents/{$docId}/quizzes?per_page=2&page=1");

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.total', 3);
    }

    public function test_document_quizzes_second_page_returns_remainder(): void
    {
        $this->seedAccessLevel();
        $user       = User::factory()->create(['role' => 'estudante']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($user);
        $categoryId = $this->seedCategory();
        $docId      = $this->seedDocument($categoryId);

        for ($i = 0; $i < 3; $i++) {
            $quizId = $this->seedQuiz($categoryId, $professor);
            $this->linkQuizDocument($quizId, $docId, $i);
        }

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/documents/{$docId}/quizzes?per_page=2&page=2");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.current_page', 2);
    }

    // ─── Paginação — GET /quizzes/{id}/documents ─────────────────────────────

    public function test_quiz_documents_pagination_meta_is_present(): void
    {
        $this->seedAccessLevel();
        $user       = User::factory()->create(['role' => 'estudante']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($user);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);

        for ($i = 0; $i < 5; $i++) {
            $docId = $this->seedDocument($categoryId);
            $this->linkQuizDocument($quizId, $docId, $i);
        }

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/quizzes/{$quizId}/documents?per_page=3&page=1");

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonPath('meta.per_page', 3)
            ->assertJsonPath('meta.total', 5);
    }

    // ─── Ordenação — GET /documents/{id}/quizzes ─────────────────────────────

    public function test_document_quizzes_sorted_by_title_ascending(): void
    {
        $this->seedAccessLevel();
        $user       = User::factory()->create(['role' => 'estudante']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($user);
        $categoryId = $this->seedCategory();
        $docId      = $this->seedDocument($categoryId);

        $quizCId = $this->seedQuiz($categoryId, $professor, 'published', 'C Quiz');
        $quizAId = $this->seedQuiz($categoryId, $professor, 'published', 'A Quiz');
        $quizBId = $this->seedQuiz($categoryId, $professor, 'published', 'B Quiz');
        $this->linkQuizDocument($quizCId, $docId, 2);
        $this->linkQuizDocument($quizAId, $docId, 0);
        $this->linkQuizDocument($quizBId, $docId, 1);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/documents/{$docId}/quizzes?sort_by=title&sort_direction=asc");

        $response->assertOk()
            ->assertJsonPath('data.0.id', $quizAId)
            ->assertJsonPath('data.1.id', $quizBId)
            ->assertJsonPath('data.2.id', $quizCId);
    }

    public function test_document_quizzes_sorted_by_sort_order_default(): void
    {
        $this->seedAccessLevel();
        $user       = User::factory()->create(['role' => 'estudante']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($user);
        $categoryId = $this->seedCategory();
        $docId      = $this->seedDocument($categoryId);

        $quiz1Id = $this->seedQuiz($categoryId, $professor);
        $quiz2Id = $this->seedQuiz($categoryId, $professor);
        $quiz3Id = $this->seedQuiz($categoryId, $professor);
        $this->linkQuizDocument($quiz3Id, $docId, 2);
        $this->linkQuizDocument($quiz1Id, $docId, 0);
        $this->linkQuizDocument($quiz2Id, $docId, 1);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/documents/{$docId}/quizzes");

        $response->assertOk()
            ->assertJsonPath('data.0.id', $quiz1Id)
            ->assertJsonPath('data.1.id', $quiz2Id)
            ->assertJsonPath('data.2.id', $quiz3Id);
    }

    // ─── Ordenação — GET /quizzes/{id}/documents ─────────────────────────────

    public function test_quiz_documents_sorted_by_title_ascending(): void
    {
        $this->seedAccessLevel();
        $user       = User::factory()->create(['role' => 'estudante']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($user);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);

        $docCId = $this->seedDocument($categoryId, 'published', 'C Document');
        $docAId = $this->seedDocument($categoryId, 'published', 'A Document');
        $docBId = $this->seedDocument($categoryId, 'published', 'B Document');
        $this->linkQuizDocument($quizId, $docCId, 2);
        $this->linkQuizDocument($quizId, $docAId, 0);
        $this->linkQuizDocument($quizId, $docBId, 1);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/quizzes/{$quizId}/documents?sort_by=title&sort_direction=asc");

        $response->assertOk()
            ->assertJsonPath('data.0.id', $docAId)
            ->assertJsonPath('data.1.id', $docBId)
            ->assertJsonPath('data.2.id', $docCId);
    }

    public function test_quiz_documents_sorted_by_sort_order_default(): void
    {
        $this->seedAccessLevel();
        $user       = User::factory()->create(['role' => 'estudante']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($user);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);

        $doc1Id = $this->seedDocument($categoryId);
        $doc2Id = $this->seedDocument($categoryId);
        $doc3Id = $this->seedDocument($categoryId);
        $this->linkQuizDocument($quizId, $doc3Id, 2);
        $this->linkQuizDocument($quizId, $doc1Id, 0);
        $this->linkQuizDocument($quizId, $doc2Id, 1);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/quizzes/{$quizId}/documents");

        $response->assertOk()
            ->assertJsonPath('data.0.id', $doc1Id)
            ->assertJsonPath('data.1.id', $doc2Id)
            ->assertJsonPath('data.2.id', $doc3Id);
    }

    // ─── Formato do QuizSummaryResource ──────────────────────────────────────

    public function test_document_quizzes_response_has_expected_resource_fields(): void
    {
        $this->seedAccessLevel();
        $user       = User::factory()->create(['role' => 'estudante']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($user);
        $categoryId = $this->seedCategory();
        $docId      = $this->seedDocument($categoryId);
        $quizId     = $this->seedQuiz($categoryId, $professor, 'published', 'Quiz Específico', 'Intermédio');
        $this->linkQuizDocument($quizId, $docId, 3);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/documents/{$docId}/quizzes");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $quizId)
            ->assertJsonPath('data.0.title', 'Quiz Específico')
            ->assertJsonPath('data.0.difficulty', 'Intermédio')
            ->assertJsonPath('data.0.sort_order', 3)
            ->assertJsonStructure([
                'data' => [['id', 'title', 'description', 'difficulty', 'category_id', 'published_at', 'sort_order']],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    // ─── Resposta sem meta quando data está vazia ─────────────────────────────

    public function test_empty_result_still_returns_meta(): void
    {
        $this->seedAccessLevel();
        $user       = User::factory()->create(['role' => 'estudante']);
        $token      = $this->issueToken($user);
        $categoryId = $this->seedCategory();
        $docId      = $this->seedDocument($categoryId);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/documents/{$docId}/quizzes");

        $response->assertOk()
            ->assertJsonPath('data', [])
            ->assertJsonPath('meta.total', 0)
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 1);
    }

    // ─── Desacoplamento do serviço ────────────────────────────────────────────

    public function test_service_has_no_dependency_on_access_gate(): void
    {
        $reflection = new \ReflectionClass(QuizDocumentService::class);

        $imports = file_get_contents(
            $reflection->getFileName()
        );

        $this->assertStringNotContainsString('AccessGateService', $imports);
        $this->assertStringNotContainsString('DocumentSubscriptionService', $imports);
        $this->assertStringNotContainsString('SubscriptionStatus', $imports);
    }

    // ─── Cascade / cleanup ───────────────────────────────────────────────────

    public function test_quiz_documents_cleanup_on_quiz_delete(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $token      = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $admin);
        $doc1Id     = $this->seedDocument($categoryId);
        $doc2Id     = $this->seedDocument($categoryId);
        $this->linkQuizDocument($quizId, $doc1Id, 0);
        $this->linkQuizDocument($quizId, $doc2Id, 1);

        $this->assertDatabaseCount('quiz_documents', 2);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/admin/quizzes/{$quizId}")
            ->assertOk();

        $this->assertDatabaseCount('quiz_documents', 0);
        $this->assertDatabaseMissing('quizzes', ['id' => $quizId]);
    }
}
