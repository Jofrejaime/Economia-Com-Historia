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

    protected function setUp(): void
    {
        parent::setUp();
        // Database is seeded by default in this project's TestCase if $seed = true
        // But we'll create our specific test data here.
    }

    public function test_document_without_discussions_has_zero_topics_count()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $document = Document::factory()->create(['status' => 'published']);

        $response = $this->actingAs($admin)->getJson("/api/documents/{$document->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('data.topics_count', 0);
    }

    public function test_document_with_discussions_returns_only_its_discussions()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $document = Document::factory()->create(['status' => 'published']);
        $category = CommunityCategory::factory()->create();

        $topic1 = DiscussionTopic::factory()->create([
            'document_id' => $document->id,
            'category_id' => $category->id,
            'status' => 'open'
        ]);
        
        $topic2 = DiscussionTopic::factory()->create([
            'document_id' => $document->id,
            'category_id' => $category->id,
            'status' => 'open'
        ]);

        $otherDocument = Document::factory()->create(['status' => 'published']);
        $topic3 = DiscussionTopic::factory()->create([
            'document_id' => $otherDocument->id,
            'category_id' => $category->id,
            'status' => 'open'
        ]);

        $response = $this->actingAs($admin)->getJson("/api/documents/{$document->id}/topics");

        $response->assertStatus(200);
        
        $data = $response->json('data');
        $this->assertCount(2, $data);
        $this->assertEquals($topic1->id, $data[1]['id']); // Ordered by created_at DESC, so topic2 is first
        $this->assertEquals($topic2->id, $data[0]['id']);
    }

    public function test_general_discussion_with_null_document_id_remains_functional()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = CommunityCategory::factory()->create();
        
        $topic = DiscussionTopic::factory()->create([
            'document_id' => null,
            'category_id' => $category->id,
            'status' => 'open'
        ]);

        $response = $this->actingAs($admin)->getJson("/api/community/topics?category_id={$category->id}");
        
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals($topic->id, $response->json('data.0.id'));
    }

    public function test_create_contextual_topic()
    {
        $user = User::factory()->create(['role' => 'estudante']);
        $document = Document::factory()->create(['status' => 'published']);
        $category = CommunityCategory::factory()->create();
        // Assuming category has no visibility restrictions or user is a member
        \DB::table('category_members')->insert([
            'id' => (string) Str::uuid(),
            'category_id' => $category->id,
            'user_id' => $user->id,
            'joined_at' => now(),
        ]);

        $payload = [
            'category_id' => $category->id,
            'title' => 'Contextual topic title',
            'content' => 'Contextual topic content',
        ];

        $response = $this->actingAs($user)->postJson("/api/documents/{$document->id}/topics", $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('discussion_topics', [
            'document_id' => $document->id,
            'title' => 'Contextual topic title'
        ]);
    }

    public function test_create_general_topic()
    {
        $user = User::factory()->create(['role' => 'estudante']);
        $category = CommunityCategory::factory()->create();
        \DB::table('category_members')->insert([
            'id' => (string) Str::uuid(),
            'category_id' => $category->id,
            'user_id' => $user->id,
            'joined_at' => now(),
        ]);

        $payload = [
            'category_id' => $category->id,
            'title' => 'General topic title',
            'content' => 'General topic content',
        ];

        $response = $this->actingAs($user)->postJson("/api/community/topics", $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('discussion_topics', [
            'document_id' => null,
            'title' => 'General topic title'
        ]);
    }

    public function test_deleting_document_preserves_topic_with_null_document_id()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $document = Document::factory()->create(['status' => 'published']);
        $category = CommunityCategory::factory()->create();

        $topic = DiscussionTopic::factory()->create([
            'document_id' => $document->id,
            'category_id' => $category->id,
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
