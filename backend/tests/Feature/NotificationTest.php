<?php

use App\Models\AccessRequest;
use App\Models\DiscussionTopic;
use App\Models\TopicReply;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $admin;
    private string $userToken;
    private string $adminToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['role' => 'estudante']);
        $this->admin = User::factory()->create(['role' => 'admin']);

        $userResponse = $this->postJson('/api/auth/login', [
            'email' => $this->user->email,
            'password' => 'password',
        ]);
        $this->userToken = $userResponse->json('token');

        $adminResponse = $this->postJson('/api/auth/login', [
            'email' => $this->admin->email,
            'password' => 'password',
        ]);
        $this->adminToken = $adminResponse->json('token');
    }

    // ─── LIST NOTIFICATIONS ────────────────────────────────────────────────

    public function test_user_can_list_own_notifications(): void
    {
        DB::table('notifications')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $this->user->id,
            'type' => 'system_announcement',
            'title' => 'Test',
            'message' => 'Test message',
            'is_read' => false,
            'created_at' => now(),
        ]);

        DB::table('notifications')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $this->admin->id,
            'type' => 'system_announcement',
            'title' => 'Admin',
            'message' => 'Admin message',
            'is_read' => false,
            'created_at' => now(),
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->getJson('/api/notifications');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    // ─── MARK AS READ ──────────────────────────────────────────────────────

    public function test_user_can_mark_notification_as_read(): void
    {
        DB::table('notifications')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $this->user->id,
            'type' => 'system_announcement',
            'title' => 'Test',
            'message' => 'Test',
            'is_read' => false,
            'created_at' => now(),
        ]);

        $notificationId = DB::table('notifications')->where('user_id', $this->user->id)->first()->id;

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->patchJson("/api/notifications/{$notificationId}/read");

        $response->assertOk()
            ->assertJson(['id' => $notificationId]);

        $this->assertDatabaseHas('notifications', [
            'id' => $notificationId,
            'is_read' => true,
        ]);
    }

    public function test_user_cannot_mark_other_users_notification_as_read(): void
    {
        DB::table('notifications')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $this->admin->id,
            'type' => 'system_announcement',
            'title' => 'Test',
            'message' => 'Test',
            'is_read' => false,
            'created_at' => now(),
        ]);

        $notificationId = DB::table('notifications')->where('user_id', $this->admin->id)->first()->id;

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->patchJson("/api/notifications/{$notificationId}/read");

        $response->assertStatus(404);
    }

    // ─── MARK ALL AS READ ──────────────────────────────────────────────────

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        DB::table('notifications')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $this->user->id,
            'type' => 'system_announcement',
            'title' => '1',
            'message' => '1',
            'is_read' => false,
            'created_at' => now(),
        ]);

        DB::table('notifications')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $this->user->id,
            'type' => 'system_announcement',
            'title' => '2',
            'message' => '2',
            'is_read' => false,
            'created_at' => now(),
        ]);

        DB::table('notifications')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $this->user->id,
            'type' => 'system_announcement',
            'title' => '3',
            'message' => '3',
            'is_read' => false,
            'created_at' => now(),
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->patchJson('/api/notifications/read-all');

        $response->assertOk();

        $this->assertEquals(3, DB::table('notifications')->where('user_id', $this->user->id)->where('is_read', true)->count());
    }

    // ─── DELETE NOTIFICATION ───────────────────────────────────────────────

    public function test_user_can_delete_notification(): void
    {
        DB::table('notifications')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $this->user->id,
            'type' => 'system_announcement',
            'title' => 'Test',
            'message' => 'Test',
            'is_read' => false,
            'created_at' => now(),
        ]);

        $notificationId = DB::table('notifications')->where('user_id', $this->user->id)->first()->id;

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->deleteJson("/api/notifications/{$notificationId}");

        $response->assertOk()
            ->assertJson(['id' => $notificationId]);

        $this->assertDatabaseMissing('notifications', ['id' => $notificationId]);
    }

    public function test_user_cannot_delete_other_users_notification(): void
    {
        DB::table('notifications')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $this->admin->id,
            'type' => 'system_announcement',
            'title' => 'Test',
            'message' => 'Test',
            'is_read' => false,
            'created_at' => now(),
        ]);

        $notificationId = DB::table('notifications')->where('user_id', $this->admin->id)->first()->id;

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->deleteJson("/api/notifications/{$notificationId}");

        $response->assertStatus(404);

        $this->assertDatabaseHas('notifications', ['id' => $notificationId]);
    }

    // ─── ADMIN SEND NOTIFICATION ───────────────────────────────────────────

    public function test_admin_can_send_notification_to_user(): void
    {
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->postJson('/api/notifications/send', [
                'user_id' => $this->user->id,
                'title' => 'Test Notification',
                'message' => 'This is a test message.',
                'send_email' => false,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Notification sent.',
                'notification' => [
                    'title' => 'Test Notification',
                    'message' => 'This is a test message.',
                ],
            ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->user->id,
            'title' => 'Test Notification',
            'type' => 'content_notification',
        ]);
    }

    public function test_admin_can_send_notification_to_email(): void
    {
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->postJson('/api/notifications/send', [
                'email' => $this->user->email,
                'title' => 'Notification by Email',
                'message' => 'Message content.',
                'send_email' => false,
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->user->id,
            'title' => 'Notification by Email',
        ]);
    }

    public function test_admin_can_send_notification_to_self(): void
    {
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->postJson('/api/notifications/send', [
                'title' => 'Self Notification',
                'message' => 'Sending to self.',
                'send_email' => false,
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->admin->id,
            'title' => 'Self Notification',
        ]);
    }

    // ─── ADMIN SEND INVITE ─────────────────────────────────────────────────

    public function test_admin_can_send_invite_email(): void
    {
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->postJson('/api/notifications/invite', [
                'email' => 'jofredenovais@gmail.com',
                'recipient_name' => 'Test User',
                'subject' => 'Invitation',
                'message' => 'You are invited.',
            ]);

        $response->assertOk()
            ->assertJson(['message' => 'Invite email sent.']);
    }

    // ─── INTEGRATION: COMMUNITY ────────────────────────────────────────────

    public function test_topic_reply_creates_notification_for_topic_author(): void
    {
        $category = \App\Models\CommunityCategory::factory()->create();

        $topic = DiscussionTopic::factory()->create([
            'category_id' => $category->id,
            'author_id' => $this->admin->id,
            'visibility' => 'PUBLIC',
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson("/api/topics/{$topic->id}/replies", [
                'content' => 'This is a reply.',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->admin->id,
            'type' => 'topic_reply',
            'title' => 'New reply on your topic',
        ]);
    }

    public function test_topic_reply_does_not_notify_own_topic(): void
    {
        $category = \App\Models\CommunityCategory::factory()->create();

        $topic = DiscussionTopic::factory()->create([
            'category_id' => $category->id,
            'author_id' => $this->user->id,
            'visibility' => 'PUBLIC',
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson("/api/topics/{$topic->id}/replies", [
                'content' => 'Replying to own topic.',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseMissing('notifications', [
            'user_id' => $this->user->id,
            'type' => 'topic_reply',
        ]);
    }

    public function test_reply_accepted_creates_notification_for_reply_author(): void
    {
        $category = \App\Models\CommunityCategory::factory()->create();

        $topic = DiscussionTopic::factory()->create([
            'category_id' => $category->id,
            'author_id' => $this->admin->id,
            'visibility' => 'PUBLIC',
        ]);

        $reply = TopicReply::factory()->create([
            'topic_id' => $topic->id,
            'author_id' => $this->user->id,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->postJson("/api/replies/{$reply->id}/accept");

        $response->assertStatus(200);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->user->id,
            'type' => 'reply_accepted',
            'title' => 'Your reply was accepted',
        ]);
    }

    // ─── INTEGRATION: ACCESS ───────────────────────────────────────────────

    public function test_access_request_approved_sends_notification(): void
    {
        DB::table('user_access_requests')->insertGetId([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $this->user->id,
            'access_level_id' => 'jindungo',
            'status' => 'pending',
            'justification' => 'Please grant access',
            'created_at' => now(),
        ]);

        $requestId = DB::table('user_access_requests')->where('user_id', $this->user->id)->first()->id;

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->patchJson("/api/access-requests/{$requestId}", [
                'status' => 'approved',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->user->id,
            'type' => 'access_request_approved',
            'title' => 'Access Request Approved',
        ]);
    }

    public function test_access_request_rejected_sends_notification(): void
    {
        DB::table('user_access_requests')->insertGetId([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $this->user->id,
            'access_level_id' => 'jindungo',
            'status' => 'pending',
            'justification' => 'Please grant access',
            'created_at' => now(),
        ]);

        $requestId = DB::table('user_access_requests')->where('user_id', $this->user->id)->first()->id;

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->patchJson("/api/access-requests/{$requestId}", [
                'status' => 'rejected',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->user->id,
            'type' => 'access_request_rejected',
            'title' => 'Access Request Rejected',
        ]);
    }
}
