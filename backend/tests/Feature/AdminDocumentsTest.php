<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminDocumentsTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        DB::table('user_profiles')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $admin->id,
            'display_name' => 'Admin User',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $admin;
    }

    private function createStudent(): User
    {
        $student = User::factory()->create([
            'role' => 'estudante',
            'is_active' => true,
        ]);

        DB::table('user_profiles')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $student->id,
            'display_name' => 'Student User',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $student;
    }

    private function auth(User $user)
    {
        $token = Str::random(80);
        DB::table('user_sessions')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'refresh_token' => $token,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit',
            'expires_at' => now()->addDay(),
            'created_at' => now(),
        ]);

        return $this->withHeader('Authorization', "Bearer {$token}");
    }

    private function seedDocument(array $attributes = []): Document
    {
        $id = (string) Str::uuid();
        $title = $attributes['title'] ?? 'Test Document';
        $accessLevelId = $attributes['access_level_id'] ?? 'public';

        DB::table('access_levels')->updateOrInsert(
            ['id' => $accessLevelId],
            [
                'name' => ucfirst($accessLevelId),
                'color_bg' => '#000000',
                'color_text' => '#ffffff'
            ]
        );
        
        DB::table('documents')->insert(array_merge([
            'id' => $id,
            'title' => $title,
            'slug' => Str::slug($title) . '-' . Str::lower(Str::random(4)),
            'author' => 'Author Name',
            'summary' => 'Document Summary',
            'document_type' => 'article',
            'academic_level' => 'intro',
            'access_level_id' => $accessLevelId,
            'status' => 'draft',
            'created_by' => User::factory()->create()->id,
            'created_at' => now(),
            'updated_at' => now(),
        ], $attributes));

        return Document::find($id);
    }

    // --- PESQUISA ---

    public function test_search_documents()
    {
        $student = $this->createStudent();
        $doc = $this->seedDocument(['title' => 'Economia Angolana', 'status' => 'published']);

        $response = $this->auth($student)->getJson('/api/documents?q=Economia');

        $response->assertStatus(200)
                 ->assertJsonFragment(['title' => 'Economia Angolana']);
    }

    public function test_search_with_filters()
    {
        $student = $this->createStudent();
        $doc1 = $this->seedDocument(['title' => 'Document A', 'status' => 'published', 'academic_level' => 'intro']);
        $doc2 = $this->seedDocument(['title' => 'Document B', 'status' => 'published', 'academic_level' => 'advanced']);

        $response = $this->auth($student)->getJson('/api/documents?academic_level=advanced');

        $response->assertStatus(200)
                 ->assertJsonFragment(['title' => 'Document B'])
                 ->assertJsonMissing(['title' => 'Document A']);
    }

    public function test_search_by_tag()
    {
        $student = $this->createStudent();
        $tag = Tag::create(['name' => 'História', 'slug' => 'historia']);
        $doc = $this->seedDocument(['title' => 'Historia de Angola', 'status' => 'published']);
        
        DB::table('document_tags')->insert([
            'document_id' => $doc->id,
            'tag_id' => $tag->id
        ]);

        $response = $this->auth($student)->getJson('/api/documents?tag=História');

        $response->assertStatus(200)
                 ->assertJsonFragment(['title' => 'Historia de Angola']);
    }

    public function test_search_by_category()
    {
        $student = $this->createStudent();
        $category = DocumentCategory::create([
            'name' => 'Macroeconomia',
            'slug' => 'macroeconomia',
            'sort_order' => 1
        ]);
        $doc = $this->seedDocument(['title' => 'Macro Doc', 'status' => 'published', 'category_id' => $category->id]);

        $response = $this->auth($student)->getJson('/api/documents?category_id=' . $category->id);

        $response->assertStatus(200)
                 ->assertJsonFragment(['title' => 'Macro Doc']);
    }

    public function test_search_by_author()
    {
        $student = $this->createStudent();
        $doc = $this->seedDocument(['title' => 'Author Doc', 'status' => 'published', 'author' => 'Manuel Costa']);

        $response = $this->auth($student)->getJson('/api/documents?author=Manuel Costa');

        $response->assertStatus(200)
                 ->assertJsonFragment(['title' => 'Author Doc']);
    }

    public function test_search_respects_access_level()
    {
        $student = $this->createStudent();
        $doc = $this->seedDocument(['title' => 'Secret Doc', 'status' => 'published', 'access_level_id' => 'premium']);

        $response = $this->auth($student)->getJson('/api/documents');

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertNotContains($doc->id, $ids);
    }

    // --- CRUD ---

    public function test_admin_can_create_document()
    {
        $admin = $this->createAdmin();
        $category = DocumentCategory::create([
            'name' => 'Geral',
            'slug' => 'geral',
            'sort_order' => 1
        ]);

        $response = $this->auth($admin)->postJson('/api/admin/documents', [
            'title' => 'Novo Documento',
            'author' => 'Autor Teste',
            'summary' => 'Sumário do documento',
            'document_type' => 'article',
            'academic_level' => 'intro',
            'access_level_id' => 'public',
            'category_id' => $category->id,
            'tags' => ['Macroeconomia', 'Angola']
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['id', 'message']);

        $this->assertDatabaseHas('documents', ['title' => 'Novo Documento']);
        $this->assertDatabaseHas('tags', ['name' => 'Macroeconomia']);
        $this->assertDatabaseHas('tags', ['name' => 'Angola']);
    }

    public function test_admin_can_update_document()
    {
        $admin = $this->createAdmin();
        $doc = $this->seedDocument(['title' => 'Titulo Antigo']);

        $response = $this->auth($admin)->patchJson('/api/admin/documents/' . $doc->id, [
            'title' => 'Titulo Novo'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('documents', ['id' => $doc->id, 'title' => 'Titulo Novo']);
    }

    public function test_admin_can_delete_document()
    {
        $admin = $this->createAdmin();
        $doc = $this->seedDocument();

        $response = $this->auth($admin)->deleteJson('/api/admin/documents/' . $doc->id);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('documents', ['id' => $doc->id]);
    }

    // --- FAVORITOS ---

    public function test_user_can_favorite_document()
    {
        $student = $this->createStudent();
        $doc = $this->seedDocument(['status' => 'published']);

        $response = $this->auth($student)->postJson("/api/documents/{$doc->id}/favorite");

        $response->assertStatus(200);
        $this->assertDatabaseHas('user_favorites', ['user_id' => $student->id, 'document_id' => $doc->id]);
    }

    public function test_user_can_unfavorite_document()
    {
        $student = $this->createStudent();
        $doc = $this->seedDocument(['status' => 'published']);
        DB::table('user_favorites')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $student->id,
            'document_id' => $doc->id,
            'created_at' => now()
        ]);

        $response = $this->auth($student)->deleteJson("/api/documents/{$doc->id}/favorite");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('user_favorites', ['user_id' => $student->id, 'document_id' => $doc->id]);
    }

    // --- LIKES ---

    public function test_user_can_like_document()
    {
        $student = $this->createStudent();
        $doc = $this->seedDocument(['status' => 'published']);

        $response = $this->auth($student)->postJson("/api/documents/{$doc->id}/like");

        $response->assertStatus(200);
        $this->assertDatabaseHas('document_likes', ['user_id' => $student->id, 'document_id' => $doc->id]);
    }

    public function test_user_can_unlike_document()
    {
        $student = $this->createStudent();
        $doc = $this->seedDocument(['status' => 'published']);
        DB::table('document_likes')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $student->id,
            'document_id' => $doc->id,
            'created_at' => now()
        ]);

        $response = $this->auth($student)->deleteJson("/api/documents/{$doc->id}/like");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('document_likes', ['user_id' => $student->id, 'document_id' => $doc->id]);
    }

    // --- CITAÇÕES ---

    public function test_user_can_create_citation()
    {
        $student = $this->createStudent();
        $doc = $this->seedDocument(['status' => 'published']);

        $response = $this->auth($student)->postJson("/api/documents/{$doc->id}/citations", [
            'format' => 'apa'
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['citation']);
        
        $this->assertDatabaseHas('document_citations', ['user_id' => $student->id, 'document_id' => $doc->id]);
    }

    // --- PUBLICAÇÃO ---

    public function test_admin_can_publish_document()
    {
        $admin = $this->createAdmin();
        $doc = $this->seedDocument(['status' => 'draft']);

        $response = $this->auth($admin)->patchJson("/api/admin/documents/{$doc->id}/publish");

        $response->assertStatus(200);
        $this->assertDatabaseHas('documents', ['id' => $doc->id, 'status' => 'published']);
    }

    public function test_admin_can_unpublish_document()
    {
        $admin = $this->createAdmin();
        $doc = $this->seedDocument(['status' => 'published']);

        $response = $this->auth($admin)->patchJson("/api/admin/documents/{$doc->id}/unpublish");

        $response->assertStatus(200);
        $this->assertDatabaseHas('documents', ['id' => $doc->id, 'status' => 'draft']);
    }

    // --- DESTAQUE ---

    public function test_admin_can_pin_document()
    {
        $admin = $this->createAdmin();
        $doc = $this->seedDocument(['is_pinned' => false]);

        $response = $this->auth($admin)->patchJson("/api/admin/documents/{$doc->id}/pin");

        $response->assertStatus(200);
        $this->assertDatabaseHas('documents', ['id' => $doc->id, 'is_pinned' => true]);
    }

    public function test_admin_can_unpin_document()
    {
        $admin = $this->createAdmin();
        $doc = $this->seedDocument(['is_pinned' => true]);

        $response = $this->auth($admin)->patchJson("/api/admin/documents/{$doc->id}/unpin");

        $response->assertStatus(200);
        $this->assertDatabaseHas('documents', ['id' => $doc->id, 'is_pinned' => false]);
    }

    // --- SEGURANÇA ---

    public function test_non_admin_cannot_manage_documents()
    {
        $student = $this->createStudent();
        $doc = $this->seedDocument();

        $this->auth($student)->postJson('/api/admin/documents', [])->assertStatus(403);
        $this->auth($student)->patchJson('/api/admin/documents/' . $doc->id, [])->assertStatus(403);
        $this->auth($student)->deleteJson('/api/admin/documents/' . $doc->id)->assertStatus(403);
    }

    // --- CATEGORIAS ---

    public function test_admin_can_manage_categories()
    {
        $admin = $this->createAdmin();

        // 1. Create
        $response = $this->auth($admin)->postJson('/api/admin/document-categories', [
            'name' => 'Categoria Teste',
            'description' => 'Descricao'
        ]);
        $response->assertStatus(201);
        $catId = $response->json('data.id');
        $this->assertDatabaseHas('document_categories', ['id' => $catId, 'name' => 'Categoria Teste']);

        // 2. Read list
        $response = $this->auth($admin)->getJson('/api/admin/document-categories');
        $response->assertStatus(200)
                 ->assertJsonFragment(['name' => 'Categoria Teste']);

        // 3. Update
        $response = $this->auth($admin)->patchJson('/api/admin/document-categories/' . $catId, [
            'name' => 'Categoria Atualizada'
        ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('document_categories', ['id' => $catId, 'name' => 'Categoria Atualizada']);

        // 4. Delete with documents constraint (should succeed when no documents)
        $response = $this->auth($admin)->deleteJson('/api/admin/document-categories/' . $catId);
        $response->assertStatus(200);
        $this->assertDatabaseMissing('document_categories', ['id' => $catId]);

        // 5. Delete fails if documents exist
        $cat2 = DocumentCategory::create(['name' => 'Cat 2', 'slug' => 'cat-2', 'sort_order' => 1]);
        $this->seedDocument(['category_id' => $cat2->id]);
        $response = $this->auth($admin)->deleteJson('/api/admin/document-categories/' . $cat2->id);
        $response->assertStatus(409);
        $this->assertDatabaseHas('document_categories', ['id' => $cat2->id]);
    }

    // --- TAGS ---

    public function test_admin_can_manage_tags()
    {
        $admin = $this->createAdmin();

        // 1. Create
        $response = $this->auth($admin)->postJson('/api/admin/tags', [
            'name' => 'Tag Teste'
        ]);
        $response->assertStatus(201);
        $tagId = $response->json('data.id');
        $this->assertDatabaseHas('tags', ['id' => $tagId, 'name' => 'Tag Teste']);

        // 2. Read list
        $response = $this->auth($admin)->getJson('/api/admin/tags');
        $response->assertStatus(200)
                 ->assertJsonFragment(['name' => 'Tag Teste']);

        // 3. Update
        $response = $this->auth($admin)->patchJson('/api/admin/tags/' . $tagId, [
            'name' => 'Tag Atualizada'
        ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('tags', ['id' => $tagId, 'name' => 'Tag Atualizada']);

        // 4. Delete in use warning without confirm parameter
        $doc = $this->seedDocument();
        DB::table('document_tags')->insert([
            'document_id' => $doc->id,
            'tag_id' => $tagId
        ]);
        $response = $this->auth($admin)->deleteJson('/api/admin/tags/' . $tagId);
        $response->assertStatus(409)
                 ->assertJsonPath('in_use', true);
        $this->assertDatabaseHas('tags', ['id' => $tagId]);

        // 5. Delete in use success with confirm=true
        $response = $this->auth($admin)->deleteJson('/api/admin/tags/' . $tagId . '?confirm=true');
        $response->assertStatus(200);
        $this->assertDatabaseMissing('tags', ['id' => $tagId]);
    }
}
