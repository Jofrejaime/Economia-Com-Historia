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
            'access_level_id' => $accessLevelId,
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

    public function test_favorites_are_filtered_by_access_gate(): void
    {
        $student = $this->registerStudent();

        $publicDoc = $this->seedPublishedDocument('Public Doc', 'public');
        $restrictedDoc = $this->seedPublishedDocument('Restricted Doc', 'jindungo');

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
        $this->assertNotContains($restrictedDoc, $ids);

        DB::table('user_access_grants')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $student['user']->id,
            'access_level_id' => 'jindungo',
            'granted_at' => now(),
            'is_active' => true,
        ]);

        $response2 = $this->withHeader('Authorization', "Bearer {$student['token']}")
            ->getJson('/api/me/favorites')
            ->assertOk();

        $ids2 = collect($response2->json('data'))->pluck('id')->all();
        $this->assertContains($publicDoc, $ids2);
        $this->assertContains($restrictedDoc, $ids2);
    }
}
