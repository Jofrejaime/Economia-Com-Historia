<?php

namespace Tests\Feature;

use App\Models\CommunityCategory;
use App\Models\DiscussionTopic;
use App\Models\TopicReply;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommunityTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private CommunityCategory $category;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['role' => 'estudante']);
        $this->category = CommunityCategory::factory()->create([
            'is_active' => true,
        ]);

        // Login para obter token
        $response = $this->postJson('/api/auth/login', [
            'email' => $this->user->email,
            'password' => 'password',
        ]);

        $this->token = $response->json('token');
    }

    // ─── CATEGORIES ────────────────────────────────────────────────────────

    public function test_list_active_categories(): void
    {
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->getJson('/api/community/categories');

        $response->assertOk()
            ->assertJsonStructure(['data' => [['id', 'name', 'slug', 'is_active']]]);
    }

    public function test_create_category_as_admin(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $adminToken = $loginResponse->json('token');

        $response = $this->withHeaders(['Authorization' => "Bearer {$adminToken}"])
            ->postJson('/api/admin/community/categories', [
                'slug' => 'test-category',
                'name' => 'Test Category',
                'description' => 'A test category',
                'color_bg' => '#800020',
                'sort_order' => 1,
            ]);

        $response->assertCreated()
            ->assertJson([
                'message' => 'Category created successfully.',
                'data' => [
                    'slug' => 'test-category',
                    'name' => 'Test Category',
                    'is_active' => true,
                ],
            ]);

        $this->assertDatabaseHas('community_categories', [
            'slug' => 'test-category',
        ]);
    }

    // ─── TOPICS ────────────────────────────────────────────────────────────

    public function test_list_published_topics(): void
    {
        DiscussionTopic::factory()->count(3)->create([
            'category_id' => $this->category->id,
            'status' => 'published',
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->getJson('/api/topics');

        $response->assertOk()
            ->assertJsonStructure(['data' => [['id', 'title', 'content', 'author_id']]]);
    }

    public function test_create_topic(): void
    {
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson('/api/topics', [
                'category_id' => $this->category->id,
                'title' => 'My First Topic',
                'content' => 'This is my first topic content.',
            ]);

        $response->assertCreated()
            ->assertJson([
                'message' => 'Topic created successfully.',
                'data' => [
                    'title' => 'My First Topic',
                    'author_id' => $this->user->id,
                    'status' => 'published',
                ],
            ]);

        $this->assertDatabaseHas('discussion_topics', [
            'title' => 'My First Topic',
            'author_id' => $this->user->id,
        ]);
    }

    public function test_get_topic_details(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
        ]);

        $viewsBefore = $topic->views_count;

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->getJson("/api/topics/{$topic->id}");

        $response->assertOk()
            ->assertJson(['data' => ['id' => $topic->id]]);

        // Verify views incremented
        $this->assertEquals($viewsBefore + 1, $topic->fresh()->views_count);
    }

    public function test_update_own_topic(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->user->id,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->patchJson("/api/topics/{$topic->id}", [
                'title' => 'Updated Title',
                'content' => 'Updated content',
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Topic updated successfully.',
                'data' => ['title' => 'Updated Title'],
            ]);
    }

    public function test_cannot_update_others_topic(): void
    {
        $other = User::factory()->create();
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $other->id,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->patchJson("/api/topics/{$topic->id}", [
                'title' => 'Hacked Title',
                'content' => 'Hacked',
            ]);

        $response->assertForbidden();
    }

    public function test_delete_own_topic(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->user->id,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->deleteJson("/api/topics/{$topic->id}");

        $response->assertOk()
            ->assertJson(['message' => 'Topic deleted successfully.']);

        $this->assertDatabaseMissing('discussion_topics', ['id' => $topic->id]);
    }

    // ─── TOPIC LIKES ────────────────────────────────────────────────────────

    public function test_like_topic(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'likes_count' => 0,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson("/api/topics/{$topic->id}/like");

        $response->assertCreated()
            ->assertJson(['message' => 'Topic liked.']);

        $this->assertEquals(1, $topic->fresh()->likes_count);
    }

    public function test_cannot_like_topic_twice(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
        ]);

        $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson("/api/topics/{$topic->id}/like");

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson("/api/topics/{$topic->id}/like");

        $response->assertConflict();
    }

    public function test_unlike_topic(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'likes_count' => 1,
        ]);

        \App\Models\TopicLike::create([
            'id' => \Illuminate\Support\Str::uuid(),
            'topic_id' => $topic->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->deleteJson("/api/topics/{$topic->id}/like");

        $response->assertOk()
            ->assertJson(['message' => 'Topic unliked.']);

        $this->assertEquals(0, $topic->fresh()->likes_count);
    }

    // ─── TOPIC FOLLOWERS ────────────────────────────────────────────────────

    public function test_follow_topic(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'followers_count' => 0,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson("/api/topics/{$topic->id}/follow");

        $response->assertCreated()
            ->assertJson(['message' => 'Topic followed.']);

        $this->assertEquals(1, $topic->fresh()->followers_count);
    }

    public function test_unfollow_topic(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'followers_count' => 1,
        ]);

        \App\Models\TopicFollower::create([
            'id' => \Illuminate\Support\Str::uuid(),
            'topic_id' => $topic->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->deleteJson("/api/topics/{$topic->id}/follow");

        $response->assertOk()
            ->assertJson(['message' => 'Topic unfollowed.']);

        $this->assertEquals(0, $topic->fresh()->followers_count);
    }

    // ─── REPLIES ────────────────────────────────────────────────────────────

    public function test_get_topic_replies(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
        ]);

        TopicReply::factory()->count(2)->create([
            'topic_id' => $topic->id,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->getJson("/api/topics/{$topic->id}/replies");

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_create_reply(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'replies_count' => 0,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson("/api/topics/{$topic->id}/replies", [
                'content' => 'This is my reply.',
            ]);

        $response->assertCreated()
            ->assertJson([
                'message' => 'Reply created successfully.',
                'data' => ['content' => 'This is my reply.'],
            ]);

        $this->assertEquals(1, $topic->fresh()->replies_count);
    }

    public function test_update_own_reply(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
        ]);
        $reply = TopicReply::factory()->create([
            'topic_id' => $topic->id,
            'author_id' => $this->user->id,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->patchJson("/api/replies/{$reply->id}", [
                'content' => 'Updated reply content',
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Reply updated successfully.',
                'data' => ['content' => 'Updated reply content'],
            ]);
    }

    public function test_delete_own_reply(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
        ]);
        $reply = TopicReply::factory()->create([
            'topic_id' => $topic->id,
            'author_id' => $this->user->id,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->deleteJson("/api/replies/{$reply->id}");

        $response->assertOk()
            ->assertJson(['message' => 'Reply deleted successfully.']);
    }

    // ─── REPLY LIKES ────────────────────────────────────────────────────────

    public function test_like_reply(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
        ]);
        $reply = TopicReply::factory()->create([
            'topic_id' => $topic->id,
            'likes_count' => 0,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson("/api/replies/{$reply->id}/like");

        $response->assertCreated()
            ->assertJson(['message' => 'Reply liked.']);

        $this->assertEquals(1, $reply->fresh()->likes_count);
    }

    public function test_unlike_reply(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
        ]);
        $reply = TopicReply::factory()->create([
            'topic_id' => $topic->id,
            'likes_count' => 1,
        ]);

        \App\Models\ReplyLike::create([
            'id' => \Illuminate\Support\Str::uuid(),
            'reply_id' => $reply->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->deleteJson("/api/replies/{$reply->id}/like");

        $response->assertOk()
            ->assertJson(['message' => 'Reply unliked.']);

        $this->assertEquals(0, $reply->fresh()->likes_count);
    }

    // ─── ACCEPT REPLY ───────────────────────────────────────────────────────

    public function test_topic_author_can_accept_reply(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'author_id' => $this->user->id,
            'category_id' => $this->category->id,
        ]);

        $reply = TopicReply::factory()->create([
            'topic_id' => $topic->id,
            'is_accepted' => false,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson("/api/replies/{$reply->id}/accept");

        $response->assertOk()
            ->assertJson(['message' => 'Reply marked as accepted.']);

        $this->assertTrue($reply->fresh()->is_accepted);
    }

    public function test_non_author_cannot_accept_reply(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
        ]);

        $reply = TopicReply::factory()->create([
            'topic_id' => $topic->id,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson("/api/replies/{$reply->id}/accept");

        $response->assertForbidden();
    }

    public function test_cannot_reply_to_closed_topic(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'status' => 'closed',
            'visibility' => 'PUBLIC',
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson("/api/topics/{$topic->id}/replies", [
                'content' => 'Tentativa de comentário em tópico fechado',
            ]);

        $response->assertForbidden();
    }

    public function test_can_update_topic_status_to_closed(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->user->id,
            'status' => 'open',
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->patchJson("/api/topics/{$topic->id}", [
                'title' => $topic->title,
                'content' => $topic->content,
                'status' => 'closed',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'closed');

        $this->assertEquals('closed', $topic->fresh()->status);
    }

    public function test_create_private_topic_sends_correct_notification_with_reference_id(): void
    {
        $invitedUser = User::factory()->create();

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson('/api/topics', [
                'category_id' => $this->category->id,
                'title' => 'Private Debate',
                'content' => 'Content for private debate',
                'visibility' => 'INVITE_ONLY',
                'member_ids' => [$invitedUser->id],
            ]);

        $response->assertCreated();
        $topicId = $response->json('data.id');

        $this->assertDatabaseHas('discussion_topic_members', [
            'topic_id' => $topicId,
            'user_id' => $invitedUser->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $invitedUser->id,
            'type' => 'topic_invitation',
            'reference_id' => $topicId,
            'reference_type' => 'discussion_topic',
        ]);

        $notification = \Illuminate\Support\Facades\DB::table('notifications')
            ->where('user_id', $invitedUser->id)
            ->where('type', 'topic_invitation')
            ->first();

        $this->assertStringContainsString($this->user->display_name, $notification->message);
        $this->assertStringNotContainsString($topicId, $notification->message);
    }
}