<?php

namespace Tests\Feature;

use App\Models\DiscussionTopic;
use App\Models\TopicReply;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportsTest extends TestCase
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

        // Login para obter tokens
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

    // ─── CREATE REPORT ─────────────────────────────────────────────────────

    public function test_user_can_report_topic(): void
    {
        $topic = DiscussionTopic::factory()->create();

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson('/api/reports', [
                'content_type' => 'topic',
                'content_id' => $topic->id,
                'reason' => 'inappropriate',
                'description' => 'This topic contains inappropriate content.',
            ]);

        $response->assertCreated()
            ->assertJson([
                'message' => 'Report submitted successfully.',
                'data' => [
                    'content_type' => 'topic',
                    'reason' => 'inappropriate',
                    'status' => 'pending',
                ],
            ]);

        $this->assertDatabaseHas('content_reports', [
            'reporter_id' => $this->user->id,
            'content_type' => 'topic',
            'content_id' => $topic->id,
        ]);
    }

    public function test_user_can_report_reply(): void
    {
        $reply = TopicReply::factory()->create();

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson('/api/reports', [
                'content_type' => 'reply',
                'content_id' => $reply->id,
                'reason' => 'spam',
                'description' => 'This is spam.',
            ]);

        $response->assertCreated()
            ->assertJson([
                'data' => [
                    'content_type' => 'reply',
                    'reason' => 'spam',
                ],
            ]);
    }

    public function test_invalid_reason_rejected(): void
    {
        $topic = DiscussionTopic::factory()->create();

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson('/api/reports', [
                'content_type' => 'topic',
                'content_id' => $topic->id,
                'reason' => 'invalid_reason',
            ]);

        $response->assertUnprocessable();
    }

    // ─── LIST REPORTS ──────────────────────────────────────────────────────

    public function test_user_can_list_own_reports(): void
    {
        DiscussionTopic::factory()->create()->each(function ($topic) {
            $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
                ->postJson('/api/reports', [
                    'content_type' => 'topic',
                    'content_id' => $topic->id,
                    'reason' => 'spam',
                ]);
        });

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->getJson('/api/reports');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    // ─── VIEW REPORT ───────────────────────────────────────────────────────

    public function test_can_view_report(): void
    {
        $topic = DiscussionTopic::factory()->create();

        $report = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson('/api/reports', [
                'content_type' => 'topic',
                'content_id' => $topic->id,
                'reason' => 'inappropriate',
            ])
            ->json('data');

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->getJson("/api/reports/{$report['id']}");

        $response->assertOk()
            ->assertJson(['data' => ['id' => $report['id']]]);
    }

    // ─── UPDATE REPORT (ADMIN) ─────────────────────────────────────────────

    public function test_admin_can_update_report_status(): void
    {
        $topic = DiscussionTopic::factory()->create();

        $report = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson('/api/reports', [
                'content_type' => 'topic',
                'content_id' => $topic->id,
                'reason' => 'spam',
            ])
            ->json('data');

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->patchJson("/api/reports/{$report['id']}", [
                'status' => 'reviewed',
                'action_taken' => 'Reviewing report.',
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Report updated successfully.',
                'data' => [
                    'status' => 'reviewed',
                    'action_taken' => 'Reviewing report.',
                ],
            ]);
    }

    // ─── REPORT ACTIONS (ADMIN) ────────────────────────────────────────────

    public function test_admin_can_flag_content(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'status' => 'open',
        ]);

        $report = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson('/api/reports', [
                'content_type' => 'topic',
                'content_id' => $topic->id,
                'reason' => 'inappropriate',
            ])
            ->json('data');

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->postJson("/api/reports/{$report['id']}/action", [
                'action' => 'flag',
                'reason' => 'Violates community guidelines.',
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Action executed successfully.',
                'action' => 'flag',
            ]);

        $this->assertEquals('flagged', $topic->fresh()->status);
    }

    public function test_admin_can_delete_content(): void
    {
        $topic = DiscussionTopic::factory()->create();

        $report = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson('/api/reports', [
                'content_type' => 'topic',
                'content_id' => $topic->id,
                'reason' => 'spam',
            ])
            ->json('data');

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->postJson("/api/reports/{$report['id']}/action", [
                'action' => 'delete',
                'reason' => 'Spam content removed.',
            ]);

        $response->assertOk()
            ->assertJson(['action' => 'delete']);

        $this->assertDatabaseMissing('discussion_topics', ['id' => $topic->id]);
    }

    public function test_admin_can_dismiss_report(): void
    {
        $topic = DiscussionTopic::factory()->create();

        $report = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson('/api/reports', [
                'content_type' => 'topic',
                'content_id' => $topic->id,
                'reason' => 'other',
                'description' => 'Minor concern.',
            ])
            ->json('data');

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->postJson("/api/reports/{$report['id']}/action", [
                'action' => 'dismiss',
                'reason' => 'No violation found.',
            ]);

        $response->assertOk()
            ->assertJson(['action' => 'dismiss']);

        $updatedReport = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->getJson("/api/reports/{$report['id']}")
            ->json('data');

        $this->assertEquals('actioned', $updatedReport['status']);
    }

    public function test_admin_can_warn_user(): void
    {
        $reply = TopicReply::factory()->create();

        $report = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson('/api/reports', [
                'content_type' => 'reply',
                'content_id' => $reply->id,
                'reason' => 'inappropriate',
            ])
            ->json('data');

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->postJson("/api/reports/{$report['id']}/action", [
                'action' => 'warn',
                'reason' => 'Harassment warning.',
            ]);

        $response->assertOk()
            ->assertJson(['action' => 'warn']);
    }

    public function test_non_admin_cannot_take_actions(): void
    {
        $topic = DiscussionTopic::factory()->create();

        $report = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson('/api/reports', [
                'content_type' => 'topic',
                'content_id' => $topic->id,
                'reason' => 'spam',
            ])
            ->json('data');

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson("/api/reports/{$report['id']}/action", [
                'action' => 'flag',
            ]);

        // Should be forbidden or unauthorized
        $this->assertTrue($response->status() >= 400);
    }

    // ─── NEW TESTS FOR SPRINT 8 ─────────────────────────────────────────

    public function test_admin_can_list_pending_reports(): void
    {
        // Create some pending reports
        $topic1 = DiscussionTopic::factory()->create();
        $topic2 = DiscussionTopic::factory()->create();

        $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson('/api/reports', [
                'content_type' => 'topic',
                'content_id' => $topic1->id,
                'reason' => 'spam',
            ]);

        $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson('/api/reports', [
                'content_type' => 'topic',
                'content_id' => $topic2->id,
                'reason' => 'inappropriate',
            ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->getJson('/api/reports/pending');

        $response->assertOk()
            ->assertJsonCount(2, 'data');

        // Verify all returned reports are pending
        collect($response->json('data'))->each(function ($report) {
            $this->assertEquals('pending', $report['status']);
        });
    }

    public function test_cannot_report_same_content_twice_while_pending(): void
    {
        $topic = DiscussionTopic::factory()->create();

        // First report should succeed
        $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson('/api/reports', [
                'content_type' => 'topic',
                'content_id' => $topic->id,
                'reason' => 'spam',
            ])
            ->assertCreated();

        // Second report for same content should fail
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson('/api/reports', [
                'content_type' => 'topic',
                'content_id' => $topic->id,
                'reason' => 'inappropriate',
            ]);

        $response->assertStatus(409)
            ->assertJson([
                'message' => 'You already have a pending report for this content.',
            ]);
    }

    public function test_validates_content_exists(): void
    {
        $nonExistentId = '00000000-0000-0000-0000-000000000000';

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson('/api/reports', [
                'content_type' => 'topic',
                'content_id' => $nonExistentId,
                'reason' => 'spam',
            ]);

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'The specified content does not exist.',
            ]);
    }

    public function test_reason_validation_matches_schema(): void
    {
        // Create multiple topics for testing different reasons
        collect(['spam', 'inappropriate', 'misinformation', 'copyright', 'off_topic', 'other'])
            ->each(function ($reason, $index) {
                $topic = DiscussionTopic::factory()->create();

                $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
                    ->postJson('/api/reports', [
                        'content_type' => 'topic',
                        'content_id' => $topic->id,
                        'reason' => $reason,
                    ])
                    ->assertCreated();
            });

        // Create one more topic for invalid reason test
        $topic = DiscussionTopic::factory()->create();

        // Invalid reason should be rejected
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->userToken}"])
            ->postJson('/api/reports', [
                'content_type' => 'topic',
                'content_id' => $topic->id,
                'reason' => 'harassment',
            ]);

        $response->assertUnprocessable();
    }
}
