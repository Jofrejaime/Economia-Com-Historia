<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class DocumentAccessTest extends TestCase
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

    private function seedPublishedDocument(string $accessLevelId, ?string $createdBy = null): string
    {
        $authorId = $createdBy ?? User::factory()->create()->id;
        $id = (string) Str::uuid();

        DB::table('documents')->insert([
            'id' => $id,
            'title' => 'Test Document '.$accessLevelId,
            'slug' => 'test-'.$accessLevelId.'-'.Str::lower(Str::random(4)),
            'author' => 'Test Author',
            'summary' => 'Summary',
            'document_type' => 'article',
            'academic_level' => 'intro',
            'access_level_id' => $accessLevelId,
            'status' => 'published',
            'created_by' => $authorId,
            'published_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    public function test_public_document_is_accessible_without_grant(): void
    {
        $token = $this->registerStudent();
        $documentId = $this->seedPublishedDocument('public');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$documentId}")
            ->assertStatus(200);
    }

    public function test_restricted_document_returns_forbidden_without_grant(): void
    {
        $token = $this->registerStudent();
        $documentId = $this->seedPublishedDocument('jindungo');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$documentId}")
            ->assertStatus(403)
            ->assertJsonPath('required_access_level_id', 'jindungo');
    }

    public function test_restricted_document_is_accessible_with_grant(): void
    {
        $token = $this->registerStudent();
        $user = User::query()->where('email', 'student@example.com')->first();
        $documentId = $this->seedPublishedDocument('jindungo');

        DB::table('user_access_grants')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'access_level_id' => 'jindungo',
            'granted_at' => now(),
            'is_active' => true,
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$documentId}")
            ->assertStatus(200);
    }

    public function test_document_index_filters_by_access_gate(): void
    {
        $token = $this->registerStudent();
        $publicId = $this->seedPublishedDocument('public');
        $restrictedId = $this->seedPublishedDocument('jindungo');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/documents');

        $response->assertStatus(200);

        $ids = collect($response->json('data'))->pluck('id')->all();

        $this->assertContains($publicId, $ids);
        $this->assertNotContains($restrictedId, $ids);
    }

    public function test_download_requires_access(): void
    {
        $token = $this->registerStudent();
        $documentId = $this->seedPublishedDocument('restricted');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/documents/{$documentId}/download")
            ->assertStatus(403);
    }

    public function test_admin_can_access_any_document(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $adminToken = $this->issueToken($admin);
        $documentId = $this->seedPublishedDocument('restricted');

        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson("/api/documents/{$documentId}")
            ->assertStatus(200);
    }

    public function test_document_categories_endpoint(): void
    {
        $token = $this->registerStudent();

        DB::table('document_categories')->insert([
            'id' => (string) Str::uuid(),
            'slug' => 'test-category',
            'name' => 'Test Category',
            'sort_order' => 1,
            'created_at' => now(),
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/document-categories')
            ->assertStatus(200)
            ->assertJsonFragment(['slug' => 'test-category']);
    }
}
