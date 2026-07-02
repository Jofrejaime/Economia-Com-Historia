<?php

namespace Tests\Feature;

use App\Models\DiscussionTopic;
use App\Models\Document;
use App\Models\Quiz;
use App\Models\User;
use App\Models\DocumentCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class Sprint1731Test extends TestCase
{
    use RefreshDatabase;

    public function test_document_without_learning_relations()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $categoryId = (string) Str::uuid();
        \DB::table('document_categories')->insert([
            'id' => $categoryId,
            'slug' => 'cat-1',
            'name' => 'Cat 1'
        ]);
        
        $documentId = (string) Str::uuid();
        \DB::table('documents')->insert([
            'id' => $documentId,
            'title' => 'Test Document 1',
            'slug' => 'test-document-1',
            'author' => 'Author',
            'summary' => 'Test summary',
            'created_by' => $admin->id,
            'category_id' => $categoryId,
            'document_type' => 'article',
            'academic_level' => 'intro',
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $response = $this->actingAs($admin)->getJson("/api/documents/{$documentId}");

        $response->assertStatus(200)
                 ->assertJsonPath('data.topics_count', 0)
                 ->assertJsonPath('data.quizzes_count', 0)
                 ->assertJsonPath('data.topics_preview', [])
                 ->assertJsonPath('data.quizzes', [])
                 ->assertJsonPath('data.learning.documents_in_category', 1)
                 ->assertJsonPath('data.learning.related_quizzes', 0)
                 ->assertJsonPath('data.learning.related_topics', 0);
    }

    public function test_document_with_only_quizzes()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $categoryId = (string) Str::uuid();
        \DB::table('document_categories')->insert([
            'id' => $categoryId,
            'slug' => 'cat-2',
            'name' => 'Cat 2'
        ]);
        
        $documentId = (string) Str::uuid();
        \DB::table('documents')->insert([
            'id' => $documentId,
            'title' => 'Test Document 2',
            'slug' => 'test-document-2',
            'author' => 'Author 2',
            'summary' => 'Test summary',
            'created_by' => $admin->id,
            'category_id' => $categoryId,
            'document_type' => 'article',
            'academic_level' => 'intro',
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        $quiz1Id = (string) Str::uuid();
        $quiz2Id = (string) Str::uuid();
        
        \DB::table('quizzes')->insert([
            ['id' => $quiz1Id, 'title' => 'Q1', 'description' => 'desc', 'category_id' => $categoryId, 'created_by' => $admin->id, 'time_limit_secs' => 600, 'status' => 'published'],
            ['id' => $quiz2Id, 'title' => 'Q2', 'description' => 'desc', 'category_id' => $categoryId, 'created_by' => $admin->id, 'time_limit_secs' => 600, 'status' => 'published']
        ]);
        
        \DB::table('quiz_documents')->insert([
            ['quiz_id' => $quiz1Id, 'document_id' => $documentId, 'created_at' => now(), 'updated_at' => now()],
            ['quiz_id' => $quiz2Id, 'document_id' => $documentId, 'created_at' => now(), 'updated_at' => now()]
        ]);

        $response = $this->actingAs($admin)->getJson("/api/documents/{$documentId}");

        $response->assertStatus(200)
                 ->assertJsonPath('data.topics_count', 0)
                 ->assertJsonPath('data.quizzes_count', 2)
                 ->assertJsonPath('data.learning.related_quizzes', 2)
                 ->assertJsonPath('data.topics_preview', []);
                 
        $this->assertCount(2, $response->json('data.quizzes'));
        $this->assertEquals($quiz1Id, $response->json('data.quizzes.0.id'));
    }

    public function test_document_with_only_discussions_and_preview_limit()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $categoryId = (string) Str::uuid();
        \DB::table('document_categories')->insert([
            'id' => $categoryId,
            'slug' => 'cat-3',
            'name' => 'Cat 3'
        ]);
        
        $documentId = (string) Str::uuid();
        \DB::table('documents')->insert([
            'id' => $documentId,
            'title' => 'Test Document 3',
            'slug' => 'test-document-3',
            'author' => 'Author 3',
            'summary' => 'Test summary',
            'created_by' => $admin->id,
            'category_id' => $categoryId,
            'document_type' => 'article',
            'academic_level' => 'intro',
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        $topic1Id = (string) Str::uuid();
        $topic2Id = (string) Str::uuid();
        $topic3Id = (string) Str::uuid();
        $topic4Id = (string) Str::uuid();

        $communityCategoryId = (string) Str::uuid();
        \DB::table('community_categories')->insert([
            'id' => $communityCategoryId,
            'name' => 'Community Cat 3',
            'slug' => 'community-cat-3'
        ]);

        \DB::table('discussion_topics')->insert([
            ['id' => $topic1Id, 'title' => 'T1', 'content' => '...', 'category_id' => $communityCategoryId, 'author_id' => $admin->id, 'visibility' => 'PUBLIC', 'status' => 'published', 'document_id' => $documentId, 'created_at' => now()->subDays(4), 'updated_at' => now()],
            ['id' => $topic2Id, 'title' => 'T2', 'content' => '...', 'category_id' => $communityCategoryId, 'author_id' => $admin->id, 'visibility' => 'PUBLIC', 'status' => 'published', 'document_id' => $documentId, 'created_at' => now()->subDays(3), 'updated_at' => now()],
            ['id' => $topic3Id, 'title' => 'T3', 'content' => '...', 'category_id' => $communityCategoryId, 'author_id' => $admin->id, 'visibility' => 'PUBLIC', 'status' => 'published', 'document_id' => $documentId, 'created_at' => now()->subDays(2), 'updated_at' => now()],
            ['id' => $topic4Id, 'title' => 'T4', 'content' => '...', 'category_id' => $communityCategoryId, 'author_id' => $admin->id, 'visibility' => 'PUBLIC', 'status' => 'published', 'document_id' => $documentId, 'created_at' => now()->subDays(1), 'updated_at' => now()]
        ]);

        $response = $this->actingAs($admin)->getJson("/api/documents/{$documentId}");

        $response->assertStatus(200)
                 ->assertJsonPath('data.topics_count', 4)
                 ->assertJsonPath('data.quizzes_count', 0)
                 ->assertJsonPath('data.learning.related_topics', 4);
                 
        $this->assertCount(3, $response->json('data.topics_preview'));
        // ordered by created_at DESC, so topic4 should be first, then topic3, then topic2
        $this->assertEquals($topic4Id, $response->json('data.topics_preview.0.id'));
        $this->assertEquals($topic3Id, $response->json('data.topics_preview.1.id'));
        $this->assertEquals($topic2Id, $response->json('data.topics_preview.2.id'));
    }
}
