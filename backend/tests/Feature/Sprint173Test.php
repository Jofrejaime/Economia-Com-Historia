<?php

namespace Tests\Feature;

use App\Models\DiscussionTopic;
use App\Models\Document;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;
use App\Models\CommunityCategory;

class Sprint173Test extends TestCase
{
    use RefreshDatabase;

    private function createAuthenticatedUser(string $role = 'estudante', string $name = 'Test User'): User
    {
        $user = User::factory()->create([
            'role' => $role,
            'email_verified' => true,
            'is_active' => true,
        ]);

        \DB::table('user_profiles')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'display_name' => $name,
            'full_name' => $name . ' Full',
            'institution' => 'ISPTEC',
            'province' => 'Luanda',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        \DB::table('user_levels')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'current_level' => 1,
            'total_points' => 0,
            'weekly_points' => 0,
            'monthly_points' => 0,
            'updated_at' => now(),
        ]);

        \DB::table('user_sessions')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'refresh_token' => Str::random(80),
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit',
            'expires_at' => now()->addDay(),
            'created_at' => now(),
        ]);

        return $user;
    }

    private function auth(User $user)
    {
        $token = \DB::table('user_sessions')
            ->where('user_id', $user->id)
            ->value('refresh_token');

        return $this->withHeader('Authorization', "Bearer {$token}");
    }

    public function test_document_without_discussions_has_zero_topics_count()
    {
        $admin = $this->createAuthenticatedUser('admin');
        $document = Document::factory()->create(['status' => 'published']);

        $response = $this->auth($admin)->getJson("/api/documents/{$document->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('data.topics_count', 0);
    }

    public function test_document_with_discussions_returns_only_its_discussions()
    {
        $admin = $this->createAuthenticatedUser('admin');
        $document = Document::factory()->create(['status' => 'published']);
        $category = CommunityCategory::factory()->create();

        $topic1 = DiscussionTopic::factory()->create([
            'document_id' => $document->id,
            'category_id' => $category->id,
            'author_id' => $admin->id,
            'status' => 'open',
            'created_at' => now()->subMinutes(5)
        ]);
        
        $topic2 = DiscussionTopic::factory()->create([
            'document_id' => $document->id,
            'category_id' => $category->id,
            'author_id' => $admin->id,
            'status' => 'open',
            'created_at' => now()
        ]);

        $otherDocument = Document::factory()->create(['status' => 'published']);
        DiscussionTopic::factory()->create([
            'document_id' => $otherDocument->id,
            'category_id' => $category->id,
            'author_id' => $admin->id,
            'status' => 'open'
        ]);

        $response = $this->auth($admin)->getJson("/api/documents/{$document->id}/topics");

        $response->assertStatus(200);
        
        $data = $response->json('data');
        $this->assertCount(2, $data);
        // Ordered by created_at DESC (default in documentTopics)
        $this->assertEquals($topic2->id, $data[0]['id']);
        $this->assertEquals($topic1->id, $data[1]['id']);
    }

    public function test_general_discussion_with_null_document_id_remains_functional()
    {
        $admin = $this->createAuthenticatedUser('admin');
        $category = CommunityCategory::factory()->create();
        
        $topic = DiscussionTopic::factory()->create([
            'document_id' => null,
            'category_id' => $category->id,
            'author_id' => $admin->id,
            'status' => 'open',
            'visibility' => 'PUBLIC'
        ]);


        $response = $this->auth($admin)->getJson("/api/topics?category_id={$category->id}");
        
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals($topic->id, $response->json('data.0.id'));
    }

    public function test_create_contextual_topic()
    {
        $user = $this->createAuthenticatedUser('estudante');
        $document = Document::factory()->create(['status' => 'published']);
        $category = CommunityCategory::factory()->create();

        $payload = [
            'category_id' => $category->id,
            'title' => 'Contextual topic title',
            'content' => 'Contextual topic content',
        ];

        $response = $this->auth($user)->postJson("/api/documents/{$document->id}/topics", $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('discussion_topics', [
            'document_id' => $document->id,
            'title' => 'Contextual topic title'
        ]);
    }

    public function test_create_general_topic()
    {
        $user = $this->createAuthenticatedUser('estudante');
        $category = CommunityCategory::factory()->create();

        $payload = [
            'category_id' => $category->id,
            'title' => 'General topic title',
            'content' => 'General topic content',
        ];

        $response = $this->auth($user)->postJson("/api/topics", $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('discussion_topics', [
            'document_id' => null,
            'title' => 'General topic title'
        ]);
    }

    public function test_deleting_document_preserves_topic_with_null_document_id()
    {
        $admin = $this->createAuthenticatedUser('admin');
        $document = Document::factory()->create(['status' => 'published']);
        $category = CommunityCategory::factory()->create();

        $topic = DiscussionTopic::factory()->create([
            'document_id' => $document->id,
            'category_id' => $category->id,
            'author_id' => $admin->id,
            'status' => 'open'
        ]);

        $this->assertDatabaseHas('discussion_topics', [
            'id' => $topic->id,
            'document_id' => $document->id
        ]);

        $document->delete();

        $this->assertDatabaseHas('discussion_topics', [
            'id' => $topic->id,
            'document_id' => null
        ]);
    }
}
