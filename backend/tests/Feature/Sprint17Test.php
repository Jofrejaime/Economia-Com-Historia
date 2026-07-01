<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Sprint 17 — Consolidação do Domínio de Aprendizagem
 *
 * Cobre:
 *  - Relacionamento N:N entre Quizzes e Documentos (quiz_documents)
 *  - GET /documents/{id}/quizzes
 *  - GET /quizzes/{id}/documents (já existia; confirma funcionamento)
 *  - POST /quizzes com documents (criação com associações)
 *  - PATCH /quizzes/{id} com documents (sync de associações)
 *  - POST /quizzes/{id}/documents (sync admin)
 *  - DELETE /quizzes/{id}/documents/{documentId} (detach admin)
 *  - DELETE /quizzes/{id} limpa quiz_documents
 *  - Fluxo B: Quiz sem documento (categoria → quiz → tentativa)
 */
class Sprint17Test extends TestCase
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

    private function seedDocument(string $categoryId, string $status = 'published'): string
    {
        $author = User::factory()->create();
        $id     = (string) Str::uuid();

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
            'status'          => $status,
            'is_pinned'       => false,
            'created_by'      => $author->id,
            'published_at'    => $status === 'published' ? now() : null,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        return $id;
    }

    private function seedQuiz(string $categoryId, User $creator, string $status = 'published'): string
    {
        $id = (string) Str::uuid();

        DB::table('quizzes')->insert([
            'id'              => $id,
            'title'           => 'Quiz '.Str::random(6),
            'difficulty'      => 'Básico',
            'base_points'     => 50,
            'access_level_id' => 'public',
            'is_featured'     => false,
            'status'          => $status,
            'category_id'     => $categoryId,
            'created_by'      => $creator->id,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        return $id;
    }

    private function seedAccessLevel(string $id = 'public'): void
    {
        if (DB::table('access_levels')->where('id', $id)->doesntExist()) {
            DB::table('access_levels')->insert([
                'id'         => $id,
                'name'       => 'Public',
                'created_at' => now(),
            ]);
        }
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

    // ─── GET /documents/{id}/quizzes ─────────────────────────────────────────

    public function test_document_with_no_quizzes_returns_empty_array(): void
    {
        $this->seedAccessLevel();
        $user       = User::factory()->create(['role' => 'estudante']);
        $token      = $this->issueToken($user);
        $categoryId = $this->seedCategory();
        $docId      = $this->seedDocument($categoryId);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/documents/{$docId}/quizzes");

        $response->assertOk()
            ->assertJsonPath('data', []);
    }

    public function test_document_with_one_quiz_returns_that_quiz(): void
    {
        $this->seedAccessLevel();
        $user       = User::factory()->create(['role' => 'estudante']);
        $token      = $this->issueToken($user);
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $docId      = $this->seedDocument($categoryId);
        $quizId     = $this->seedQuiz($categoryId, $professor);
        $this->linkQuizDocument($quizId, $docId);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/documents/{$docId}/quizzes");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $quizId);
    }

    public function test_document_with_multiple_quizzes_returns_all(): void
    {
        $this->seedAccessLevel();
        $user       = User::factory()->create(['role' => 'estudante']);
        $token      = $this->issueToken($user);
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $docId      = $this->seedDocument($categoryId);
        $quiz1Id    = $this->seedQuiz($categoryId, $professor);
        $quiz2Id    = $this->seedQuiz($categoryId, $professor);
        $this->linkQuizDocument($quiz1Id, $docId, 0);
        $this->linkQuizDocument($quiz2Id, $docId, 1);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/documents/{$docId}/quizzes");

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_document_quizzes_only_returns_published_quizzes(): void
    {
        $this->seedAccessLevel();
        $user       = User::factory()->create(['role' => 'estudante']);
        $token      = $this->issueToken($user);
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $docId      = $this->seedDocument($categoryId);
        $pubQuizId  = $this->seedQuiz($categoryId, $professor, 'published');
        $draftQuizId = $this->seedQuiz($categoryId, $professor, 'draft');
        $this->linkQuizDocument($pubQuizId, $docId, 0);
        $this->linkQuizDocument($draftQuizId, $docId, 1);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/documents/{$docId}/quizzes");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $pubQuizId);
    }

    public function test_document_not_found_returns_404(): void
    {
        $user  = User::factory()->create(['role' => 'estudante']);
        $token = $this->issueToken($user);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/documents/'.Str::uuid().'/quizzes')
            ->assertNotFound();
    }

    // ─── GET /quizzes/{id}/documents ─────────────────────────────────────────

    public function test_quiz_with_no_documents_returns_empty_array(): void
    {
        $this->seedAccessLevel();
        $user       = User::factory()->create(['role' => 'estudante']);
        $token      = $this->issueToken($user);
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/quizzes/{$quizId}/documents");

        $response->assertOk()
            ->assertJsonPath('data', []);
    }

    public function test_quiz_with_multiple_documents_returns_ordered_by_sort_order(): void
    {
        $this->seedAccessLevel();
        $user       = User::factory()->create(['role' => 'estudante']);
        $token      = $this->issueToken($user);
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);
        $doc1Id     = $this->seedDocument($categoryId);
        $doc2Id     = $this->seedDocument($categoryId);
        $this->linkQuizDocument($quizId, $doc2Id, 1);
        $this->linkQuizDocument($quizId, $doc1Id, 0);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/quizzes/{$quizId}/documents");

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $doc1Id)
            ->assertJsonPath('data.1.id', $doc2Id);
    }

    // ─── N:N — uma relação pode ser shared ───────────────────────────────────

    public function test_one_document_can_belong_to_multiple_quizzes(): void
    {
        $this->seedAccessLevel();
        $user       = User::factory()->create(['role' => 'estudante']);
        $token      = $this->issueToken($user);
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $docId      = $this->seedDocument($categoryId);
        $quiz1Id    = $this->seedQuiz($categoryId, $professor);
        $quiz2Id    = $this->seedQuiz($categoryId, $professor);
        $this->linkQuizDocument($quiz1Id, $docId);
        $this->linkQuizDocument($quiz2Id, $docId);

        $res1 = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/documents/{$docId}/quizzes");
        $res1->assertOk()->assertJsonCount(2, 'data');

        $this->assertEquals(
            1,
            DB::table('quiz_documents')->where('quiz_id', $quiz1Id)->where('document_id', $docId)->count()
        );
        $this->assertEquals(
            1,
            DB::table('quiz_documents')->where('quiz_id', $quiz2Id)->where('document_id', $docId)->count()
        );
    }

    public function test_one_quiz_can_have_multiple_documents(): void
    {
        $this->seedAccessLevel();
        $user       = User::factory()->create(['role' => 'estudante']);
        $token      = $this->issueToken($user);
        $professor  = User::factory()->create(['role' => 'professor']);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);
        $doc1Id     = $this->seedDocument($categoryId);
        $doc2Id     = $this->seedDocument($categoryId);
        $doc3Id     = $this->seedDocument($categoryId);
        $this->linkQuizDocument($quizId, $doc1Id, 0);
        $this->linkQuizDocument($quizId, $doc2Id, 1);
        $this->linkQuizDocument($quizId, $doc3Id, 2);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/quizzes/{$quizId}/documents");

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    // ─── POST /quizzes com documents ─────────────────────────────────────────

    public function test_create_quiz_with_documents_syncs_quiz_documents(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $token      = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $doc1Id     = $this->seedDocument($categoryId);
        $doc2Id     = $this->seedDocument($categoryId);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/quizzes', [
                'title'           => 'Quiz com Documentos',
                'difficulty'      => 'Básico',
                'access_level_id' => 'public',
                'status'          => 'published',
                'category_id'     => $categoryId,
                'documents'       => [$doc1Id, $doc2Id],
            ]);

        $response->assertCreated();

        $quizId = $response->json('data.id');
        $this->assertDatabaseCount('quiz_documents', 2);
        $this->assertDatabaseHas('quiz_documents', ['quiz_id' => $quizId, 'document_id' => $doc1Id, 'sort_order' => 0]);
        $this->assertDatabaseHas('quiz_documents', ['quiz_id' => $quizId, 'document_id' => $doc2Id, 'sort_order' => 1]);
    }

    public function test_create_quiz_without_documents_creates_no_associations(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $token      = $this->issueToken($admin);
        $categoryId = $this->seedCategory();

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/quizzes', [
                'title'           => 'Quiz Standalone',
                'difficulty'      => 'Básico',
                'access_level_id' => 'public',
                'status'          => 'published',
                'category_id'     => $categoryId,
            ]);

        $response->assertCreated();
        $this->assertDatabaseCount('quiz_documents', 0);
    }

    // ─── PATCH /quizzes/{id} com documents ───────────────────────────────────

    public function test_update_quiz_replaces_document_associations(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $token      = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $admin);
        $doc1Id     = $this->seedDocument($categoryId);
        $doc2Id     = $this->seedDocument($categoryId);
        $doc3Id     = $this->seedDocument($categoryId);
        $this->linkQuizDocument($quizId, $doc1Id, 0);
        $this->linkQuizDocument($quizId, $doc2Id, 1);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->patchJson("/api/quizzes/{$quizId}", [
                'title'     => 'Quiz Actualizado',
                'documents' => [$doc3Id],
            ])
            ->assertOk();

        $this->assertDatabaseCount('quiz_documents', 1);
        $this->assertDatabaseHas('quiz_documents', ['quiz_id' => $quizId, 'document_id' => $doc3Id, 'sort_order' => 0]);
        $this->assertDatabaseMissing('quiz_documents', ['document_id' => $doc1Id]);
        $this->assertDatabaseMissing('quiz_documents', ['document_id' => $doc2Id]);
    }

    public function test_update_quiz_without_documents_key_preserves_associations(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $token      = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $admin);
        $doc1Id     = $this->seedDocument($categoryId);
        $this->linkQuizDocument($quizId, $doc1Id, 0);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->patchJson("/api/quizzes/{$quizId}", [
                'title' => 'Só titulo actualizado',
            ])
            ->assertOk();

        $this->assertDatabaseCount('quiz_documents', 1);
        $this->assertDatabaseHas('quiz_documents', ['quiz_id' => $quizId, 'document_id' => $doc1Id]);
    }

    // ─── POST /quizzes/{id}/documents (admin sync) ───────────────────────────

    public function test_admin_can_sync_documents_to_quiz(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);
        $doc1Id     = $this->seedDocument($categoryId);
        $doc2Id     = $this->seedDocument($categoryId);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/quizzes/{$quizId}/documents", [
                'documents' => [$doc1Id, $doc2Id],
            ]);

        $response->assertOk()
            ->assertJsonPath('count', 2);

        $this->assertDatabaseCount('quiz_documents', 2);
    }

    public function test_sync_replaces_existing_associations(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);
        $oldDocId   = $this->seedDocument($categoryId);
        $newDocId   = $this->seedDocument($categoryId);
        $this->linkQuizDocument($quizId, $oldDocId, 0);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/quizzes/{$quizId}/documents", [
                'documents' => [$newDocId],
            ])
            ->assertOk();

        $this->assertDatabaseCount('quiz_documents', 1);
        $this->assertDatabaseHas('quiz_documents', ['document_id' => $newDocId]);
        $this->assertDatabaseMissing('quiz_documents', ['document_id' => $oldDocId]);
    }

    public function test_sync_with_empty_array_clears_all_associations(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);
        $docId      = $this->seedDocument($categoryId);
        $this->linkQuizDocument($quizId, $docId, 0);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/quizzes/{$quizId}/documents", ['documents' => []])
            ->assertOk()
            ->assertJsonPath('count', 0);

        $this->assertDatabaseCount('quiz_documents', 0);
    }

    public function test_professor_cannot_sync_documents_returns_403(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($professor);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $admin);
        $docId      = $this->seedDocument($categoryId);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/quizzes/{$quizId}/documents", ['documents' => [$docId]])
            ->assertStatus(403);
    }

    // ─── DELETE /quizzes/{id}/documents/{documentId} ─────────────────────────

    public function test_admin_can_detach_document_from_quiz(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);
        $doc1Id     = $this->seedDocument($categoryId);
        $doc2Id     = $this->seedDocument($categoryId);
        $this->linkQuizDocument($quizId, $doc1Id, 0);
        $this->linkQuizDocument($quizId, $doc2Id, 1);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/quizzes/{$quizId}/documents/{$doc1Id}")
            ->assertOk();

        $this->assertDatabaseCount('quiz_documents', 1);
        $this->assertDatabaseHas('quiz_documents', ['document_id' => $doc2Id]);
    }

    public function test_detach_nonexistent_association_returns_404(): void
    {
        $this->seedAccessLevel();
        $admin     = User::factory()->create(['role' => 'admin']);
        $professor = User::factory()->create(['role' => 'professor']);
        $token     = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId    = $this->seedQuiz($categoryId, $professor);
        $docId     = $this->seedDocument($categoryId);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/quizzes/{$quizId}/documents/{$docId}")
            ->assertNotFound();
    }

    // ─── DELETE /quizzes/{id} limpa quiz_documents ───────────────────────────

    public function test_deleting_quiz_also_removes_quiz_documents(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $token      = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $admin);
        $docId      = $this->seedDocument($categoryId);
        $this->linkQuizDocument($quizId, $docId, 0);

        $this->assertDatabaseCount('quiz_documents', 1);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/quizzes/{$quizId}")
            ->assertOk();

        $this->assertDatabaseCount('quiz_documents', 0);
    }

    // ─── Fluxo B: quiz sem documentos pode ser tentado normalmente ────────────

    public function test_quiz_without_documents_can_still_be_listed_and_shown(): void
    {
        $this->seedAccessLevel();
        $user       = User::factory()->create(['role' => 'estudante']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($user);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/quizzes')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/quizzes/{$quizId}")
            ->assertOk()
            ->assertJsonPath('data.id', $quizId);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/quizzes/{$quizId}/documents")
            ->assertOk()
            ->assertJsonPath('data', []);
    }

    // ─── Acesso não autorizado ────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_access_document_quizzes(): void
    {
        $user       = User::factory()->create();
        $categoryId = $this->seedCategory();
        $docId      = $this->seedDocument($categoryId);

        $this->getJson("/api/documents/{$docId}/quizzes")
            ->assertUnauthorized();
    }

    public function test_estudante_cannot_sync_documents_to_quiz(): void
    {
        $this->seedAccessLevel();
        $estudante  = User::factory()->create(['role' => 'estudante']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($estudante);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $professor);
        $docId      = $this->seedDocument($categoryId);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/quizzes/{$quizId}/documents", ['documents' => [$docId]])
            ->assertForbidden();
    }
}
