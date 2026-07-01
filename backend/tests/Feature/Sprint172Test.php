<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Sprint 17.2 — Consolidação Administrativa do Domínio de Quizzes
 *
 * Cobre:
 *  - Apenas admin pode: criar, editar, eliminar quizzes, sync e detach documentos
 *  - Professor recebe 403 em todos os endpoints de gestão de quizzes
 *  - Student recebe 403 em todos os endpoints de gestão de quizzes
 *  - Utilizador não autenticado recebe 401 em todos os endpoints de quizzes
 *  - Qualquer utilizador autenticado pode ler quizzes publicados
 *  - Filtro published-only nos endpoints públicos de listagem
 */
class Sprint172Test extends TestCase
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
            'published_at'    => $status === 'published' ? now() : null,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        return $id;
    }

    private function seedDocument(string $categoryId): string
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
            'status'          => 'published',
            'is_pinned'       => false,
            'created_by'      => $author->id,
            'published_at'    => now(),
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        return $id;
    }

    private function quizPayload(): array
    {
        return [
            'title'      => 'Quiz de Teste',
            'difficulty' => 'Básico',
            'status'     => 'draft',
        ];
    }

    // ─── Admin: criação ───────────────────────────────────────────────────────

    public function test_admin_can_create_quiz(): void
    {
        $this->seedAccessLevel();
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($admin);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/quizzes', $this->quizPayload());

        $response->assertStatus(201);
        $this->assertDatabaseHas('quizzes', ['title' => 'Quiz de Teste']);
    }

    public function test_professor_cannot_create_quiz_returns_403(): void
    {
        $this->seedAccessLevel();
        $professor = User::factory()->create(['role' => 'professor']);
        $token     = $this->issueToken($professor);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/quizzes', $this->quizPayload());

        $response->assertStatus(403);
        $this->assertDatabaseCount('quizzes', 0);
    }

    public function test_student_cannot_create_quiz_returns_403(): void
    {
        $this->seedAccessLevel();
        $student = User::factory()->create(['role' => 'student']);
        $token   = $this->issueToken($student);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/quizzes', $this->quizPayload());

        $response->assertStatus(403);
        $this->assertDatabaseCount('quizzes', 0);
    }

    public function test_unauthenticated_cannot_create_quiz_returns_401(): void
    {
        $response = $this->postJson('/api/quizzes', $this->quizPayload());

        $response->assertStatus(401);
        $this->assertDatabaseCount('quizzes', 0);
    }

    // ─── Admin: edição ────────────────────────────────────────────────────────

    public function test_admin_can_update_quiz(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $token      = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $admin);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->patchJson("/api/quizzes/{$quizId}", ['title' => 'Título Actualizado']);

        $response->assertStatus(200);
        $this->assertDatabaseHas('quizzes', ['id' => $quizId, 'title' => 'Título Actualizado']);
    }

    public function test_professor_cannot_update_quiz_returns_403(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($professor);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $admin);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->patchJson("/api/quizzes/{$quizId}", ['title' => 'Tentativa Professor']);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('quizzes', ['id' => $quizId, 'title' => 'Tentativa Professor']);
    }

    public function test_student_cannot_update_quiz_returns_403(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $student    = User::factory()->create(['role' => 'student']);
        $token      = $this->issueToken($student);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $admin);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->patchJson("/api/quizzes/{$quizId}", ['title' => 'Tentativa Student']);

        $response->assertStatus(403);
    }

    // ─── Admin: eliminação ────────────────────────────────────────────────────

    public function test_admin_can_delete_quiz(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $token      = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $admin);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/quizzes/{$quizId}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('quizzes', ['id' => $quizId]);
    }

    public function test_professor_cannot_delete_quiz_returns_403(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($professor);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $admin);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/quizzes/{$quizId}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('quizzes', ['id' => $quizId]);
    }

    public function test_student_cannot_delete_quiz_returns_403(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $student    = User::factory()->create(['role' => 'student']);
        $token      = $this->issueToken($student);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $admin);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/quizzes/{$quizId}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('quizzes', ['id' => $quizId]);
    }

    // ─── Admin: sync documentos ───────────────────────────────────────────────

    public function test_admin_can_sync_documents(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $token      = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $admin);
        $docId      = $this->seedDocument($categoryId);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/quizzes/{$quizId}/documents", ['documents' => [$docId]]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('quiz_documents', ['quiz_id' => $quizId, 'document_id' => $docId]);
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

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/quizzes/{$quizId}/documents", ['documents' => [$docId]]);

        $response->assertStatus(403);
        $this->assertDatabaseCount('quiz_documents', 0);
    }

    public function test_student_cannot_sync_documents_returns_403(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $student    = User::factory()->create(['role' => 'student']);
        $token      = $this->issueToken($student);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $admin);
        $docId      = $this->seedDocument($categoryId);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/quizzes/{$quizId}/documents", ['documents' => [$docId]]);

        $response->assertStatus(403);
        $this->assertDatabaseCount('quiz_documents', 0);
    }

    // ─── Admin: detach documento ──────────────────────────────────────────────

    public function test_admin_can_detach_document(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $token      = $this->issueToken($admin);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $admin);
        $docId      = $this->seedDocument($categoryId);

        DB::table('quiz_documents')->insert([
            'quiz_id'     => $quizId,
            'document_id' => $docId,
            'sort_order'  => 0,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/quizzes/{$quizId}/documents/{$docId}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('quiz_documents', ['quiz_id' => $quizId, 'document_id' => $docId]);
    }

    public function test_professor_cannot_detach_document_returns_403(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($professor);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $admin);
        $docId      = $this->seedDocument($categoryId);

        DB::table('quiz_documents')->insert([
            'quiz_id'     => $quizId,
            'document_id' => $docId,
            'sort_order'  => 0,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/quizzes/{$quizId}/documents/{$docId}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('quiz_documents', ['quiz_id' => $quizId, 'document_id' => $docId]);
    }

    // ─── Leitura: qualquer utilizador autenticado ─────────────────────────────

    public function test_authenticated_student_can_list_quizzes(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $student    = User::factory()->create(['role' => 'student']);
        $token      = $this->issueToken($student);
        $categoryId = $this->seedCategory();
        $this->seedQuiz($categoryId, $admin, 'published');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/quizzes');

        $response->assertStatus(200)->assertJsonStructure(['data', 'meta']);
    }

    public function test_authenticated_professor_can_list_quizzes(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $professor  = User::factory()->create(['role' => 'professor']);
        $token      = $this->issueToken($professor);
        $categoryId = $this->seedCategory();
        $this->seedQuiz($categoryId, $admin, 'published');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/quizzes');

        $response->assertStatus(200)->assertJsonStructure(['data', 'meta']);
    }

    public function test_authenticated_user_can_view_published_quiz(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $student    = User::factory()->create(['role' => 'student']);
        $token      = $this->issueToken($student);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $admin, 'published');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/quizzes/{$quizId}");

        $response->assertStatus(200)->assertJsonPath('data.id', $quizId);
    }

    public function test_authenticated_user_can_get_quiz_documents(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $student    = User::factory()->create(['role' => 'student']);
        $token      = $this->issueToken($student);
        $categoryId = $this->seedCategory();
        $quizId     = $this->seedQuiz($categoryId, $admin, 'published');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/quizzes/{$quizId}/documents");

        $response->assertStatus(200)->assertJsonStructure(['data', 'meta']);
    }

    public function test_authenticated_user_can_get_document_quizzes(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $student    = User::factory()->create(['role' => 'student']);
        $token      = $this->issueToken($student);
        $categoryId = $this->seedCategory();
        $docId      = $this->seedDocument($categoryId);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/documents/{$docId}/quizzes");

        $response->assertStatus(200)->assertJsonStructure(['data', 'meta']);
    }

    // ─── Unauthenticated: 401 em todos os endpoints ───────────────────────────

    public function test_unauthenticated_cannot_list_quizzes(): void
    {
        $this->getJson('/api/quizzes')->assertStatus(401);
    }

    public function test_unauthenticated_cannot_view_quiz(): void
    {
        $id = (string) Str::uuid();
        $this->getJson("/api/quizzes/{$id}")->assertStatus(401);
    }

    public function test_unauthenticated_cannot_sync_documents(): void
    {
        $id = (string) Str::uuid();
        $this->postJson("/api/quizzes/{$id}/documents", ['documents' => []])->assertStatus(401);
    }

    public function test_unauthenticated_cannot_delete_quiz(): void
    {
        $id = (string) Str::uuid();
        $this->deleteJson("/api/quizzes/{$id}")->assertStatus(401);
    }

    // ─── Published-only filter ────────────────────────────────────────────────

    public function test_index_returns_only_published_quizzes(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $student    = User::factory()->create(['role' => 'student']);
        $token      = $this->issueToken($student);
        $categoryId = $this->seedCategory();

        $publishedId = $this->seedQuiz($categoryId, $admin, 'published');
        $this->seedQuiz($categoryId, $admin, 'draft');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/quizzes');

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($publishedId));
        $this->assertCount(1, $ids);
    }

    public function test_document_quizzes_endpoint_returns_only_published(): void
    {
        $this->seedAccessLevel();
        $admin      = User::factory()->create(['role' => 'admin']);
        $student    = User::factory()->create(['role' => 'student']);
        $token      = $this->issueToken($student);
        $categoryId = $this->seedCategory();
        $docId      = $this->seedDocument($categoryId);

        $publishedQuizId = $this->seedQuiz($categoryId, $admin, 'published');
        $draftQuizId     = $this->seedQuiz($categoryId, $admin, 'draft');

        DB::table('quiz_documents')->insert([
            ['quiz_id' => $publishedQuizId, 'document_id' => $docId, 'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['quiz_id' => $draftQuizId,     'document_id' => $docId, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/documents/{$docId}/quizzes");

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertCount(1, $ids);
        $this->assertTrue($ids->contains($publishedQuizId));
        $this->assertFalse($ids->contains($draftQuizId));
    }
}
