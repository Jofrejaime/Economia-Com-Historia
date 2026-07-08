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

    private function seedCategory(bool $requiresSubscription): string
    {
        $id = (string) Str::uuid();

        DB::table('document_categories')->insert([
            'id' => $id,
            'slug' => 'cat-'.Str::lower(Str::random(6)),
            'name' => 'Category '.Str::random(4),
            'requires_subscription' => $requiresSubscription,
            'sort_order' => 1,
            'created_at' => now(),
        ]);

        return $id;
    }

    /**
     * Semeia um documento publicado. O acesso é decidido pela categoria:
     * categoria restrita (requires_subscription) → exige subscrição por-documento.
     */
    private function seedPublishedDocument(bool $restricted = false, ?string $createdBy = null): string
    {
        $authorId = $createdBy ?? User::factory()->create()->id;
        $id = (string) Str::uuid();

        DB::table('documents')->insert([
            'id' => $id,
            'title' => 'Test Document '.($restricted ? 'restricted' : 'public'),
            'slug' => 'test-'.Str::lower(Str::random(6)),
            'author' => 'Test Author',
            'summary' => 'Summary',
            'document_type' => 'article',
            'academic_level' => 'intro',
            'category_id' => $this->seedCategory($restricted),
            'status' => 'published',
            'created_by' => $authorId,
            'published_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    public function test_public_document_is_accessible(): void
    {
        $token = $this->registerStudent();
        $documentId = $this->seedPublishedDocument(restricted: false);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$documentId}")
            ->assertStatus(200);
    }

    public function test_restricted_document_returns_forbidden_and_signals_subscription(): void
    {
        $token = $this->registerStudent();
        $documentId = $this->seedPublishedDocument(restricted: true);

        // O acesso a documentos é por-documento (subscrição), decidido pela
        // categoria — o 403 sinaliza subscription_required.
        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$documentId}")
            ->assertStatus(403)
            ->assertJsonPath('subscription_required', true);
    }

    public function test_restricted_document_is_accessible_with_active_subscription(): void
    {
        $token = $this->registerStudent();
        $user = User::query()->where('email', 'student@example.com')->first();
        $documentId = $this->seedPublishedDocument(restricted: true);

        DB::table('document_subscriptions')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'document_id' => $documentId,
            'status' => 'ACTIVE',
            'started_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$documentId}")
            ->assertStatus(200);
    }

    public function test_subscription_to_one_document_does_not_unlock_another_in_same_category(): void
    {
        // A subscrição é por-documento: subscrever um documento restrito não
        // abre os restantes documentos da mesma categoria restrita.
        $token = $this->registerStudent();
        $user = User::query()->where('email', 'student@example.com')->first();
        $categoryId = $this->seedCategory(requiresSubscription: true);

        $subscribedDoc = (string) Str::uuid();
        $otherDoc = (string) Str::uuid();
        foreach ([$subscribedDoc, $otherDoc] as $docId) {
            DB::table('documents')->insert([
                'id' => $docId,
                'title' => 'Doc '.Str::random(4),
                'slug' => 'doc-'.Str::lower(Str::random(6)),
                'author' => 'Author',
                'summary' => 'Summary',
                'document_type' => 'article',
                'academic_level' => 'intro',
                'category_id' => $categoryId,
                'status' => 'published',
                'created_by' => User::factory()->create()->id,
                'published_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('document_subscriptions')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'document_id' => $subscribedDoc,
            'status' => 'ACTIVE',
            'started_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$subscribedDoc}")
            ->assertStatus(200);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$otherDoc}")
            ->assertStatus(403);
    }


    public function test_admin_can_access_any_document(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $adminToken = $this->issueToken($admin);
        $documentId = $this->seedPublishedDocument(restricted: true);

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
