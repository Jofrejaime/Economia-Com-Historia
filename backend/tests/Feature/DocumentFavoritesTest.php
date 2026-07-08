<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class DocumentFavoritesTest extends TestCase
{
    use RefreshDatabase;

    private function registerStudent(string $email = 'student@example.com'): array
    {
        Mail::fake();

        $response = $this->postJson('/api/auth/register', [
            'email' => $email,
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Student User',
        ]);

        return [
            'token' => $response->json('token'),
            'user' => User::query()->where('email', $email)->first(),
        ];
    }

    private function seedPublishedDocument(string $title, string $accessLevelId): string
    {
        $id = (string) Str::uuid();

        DB::table('documents')->insert([
            'id' => $id,
            'title' => $title,
            'slug' => Str::slug($title).'-'.Str::lower(Str::random(4)),
            'author' => 'Test Author',
            'summary' => 'Summary',
            'document_type' => 'article',
            'academic_level' => 'intro',
            'status' => 'published',
            'created_by' => User::factory()->create()->id,
            'published_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    public function test_get_my_favorites_lists_only_users_favorites(): void
    {
        $student1 = $this->registerStudent('student1@example.com');
        $student2 = $this->registerStudent('student2@example.com');

        $doc1 = $this->seedPublishedDocument('Doc 1', 'public');
        $doc2 = $this->seedPublishedDocument('Doc 2', 'public');

        DB::table('user_favorites')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $student1['user']->id,
            'document_id' => $doc1,
            'created_at' => now(),
        ]);

        DB::table('user_favorites')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $student2['user']->id,
            'document_id' => $doc2,
            'created_at' => now(),
        ]);

        $response1 = $this->withHeader('Authorization', "Bearer {$student1['token']}")
            ->getJson('/api/me/favorites')
            ->assertOk();

        $response1Ids = collect($response1->json('data'))->pluck('id')->all();
        $this->assertContains($doc1, $response1Ids);
        $this->assertNotContains($doc2, $response1Ids);
    }

    public function test_favorites_are_ordered_by_most_recent_favorited(): void
    {
        $student = $this->registerStudent();

        $doc1 = $this->seedPublishedDocument('Doc 1', 'public');
        $doc2 = $this->seedPublishedDocument('Doc 2', 'public');

        DB::table('user_favorites')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $student['user']->id,
            'document_id' => $doc1,
            'created_at' => now()->subMinutes(10),
        ]);

        DB::table('user_favorites')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $student['user']->id,
            'document_id' => $doc2,
            'created_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$student['token']}")
            ->getJson('/api/me/favorites')
            ->assertOk();

        $data = $response->json('data');
        $this->assertCount(2, $data);
        $this->assertSame($doc2, $data[0]['id']);
        $this->assertSame($doc1, $data[1]['id']);
    }

    public function test_favorites_list_all_documents_regardless_of_subscription(): void
    {
        // As listagens mostram todos os documentos (o acesso ao conteúdo é
        // controlado no detalhe), pelo que os favoritos listam tanto públicos
        // como restritos.
        $student = $this->registerStudent();

        $publicDoc = $this->seedPublishedDocument('Public Doc', 'public');
        $restrictedDoc = $this->seedPublishedDocument('Restricted Doc', 'restricted');

        DB::table('user_favorites')->insert([
            [
                'id' => (string) Str::uuid(),
                'user_id' => $student['user']->id,
                'document_id' => $publicDoc,
                'created_at' => now()->subMinutes(5),
            ],
            [
                'id' => (string) Str::uuid(),
                'user_id' => $student['user']->id,
                'document_id' => $restrictedDoc,
                'created_at' => now(),
            ],
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$student['token']}")
            ->getJson('/api/me/favorites')
            ->assertOk();

        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertContains($publicDoc, $ids);
        $this->assertContains($restrictedDoc, $ids);
    }
}
