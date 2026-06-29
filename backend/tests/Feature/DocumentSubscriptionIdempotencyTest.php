<?php

namespace Tests\Feature;

use App\Models\DocumentSubscription;
use App\Models\User;
use App\Services\DocumentSubscriptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Covers:
 *  - Idempotency: repeated admin actions return 409
 *  - Concurrency: sequential calls never create duplicate ACTIVE/PENDING records
 *  - Audit relations: approvedBy(), rejectedBy(), cancelledBy() via Eloquent
 *  - Structured response fields on POST /subscribe and GET /subscription
 */
class DocumentSubscriptionIdempotencyTest extends TestCase
{
    use RefreshDatabase;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function issueToken(User $user): string
    {
        $token = Str::random(80);

        DB::table('user_sessions')->insert([
            'id'            => (string) Str::uuid(),
            'user_id'       => $user->id,
            'refresh_token' => $token,
            'expires_at'    => now()->addDays(30),
            'created_at'    => now(),
        ]);

        return $token;
    }

    private function seedCategory(): string
    {
        $id = (string) Str::uuid();

        DB::table('document_categories')->insert([
            'id'                    => $id,
            'slug'                  => 'cat-'.Str::lower(Str::random(6)),
            'name'                  => 'Premium Category',
            'requires_subscription' => true,
            'created_at'            => now(),
        ]);

        return $id;
    }

    private function seedDocument(?string $categoryId = null): string
    {
        $author = User::factory()->create();
        $id     = (string) Str::uuid();

        DB::table('documents')->insert([
            'id'              => $id,
            'title'           => 'Test Document '.Str::random(6),
            'slug'            => 'test-'.Str::lower(Str::random(8)),
            'author'          => 'Test Author',
            'summary'         => 'Summary',
            'document_type'   => 'article',
            'academic_level'  => 'intro',
            'access_level_id' => 'public',
            'category_id'     => $categoryId,
            'status'          => 'published',
            'created_by'      => $author->id,
            'published_at'    => now(),
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        return $id;
    }

    private function seedSubscription(string $userId, string $documentId, string $status): string
    {
        $id = (string) Str::uuid();

        DB::table('document_subscriptions')->insert([
            'id'          => $id,
            'user_id'     => $userId,
            'document_id' => $documentId,
            'status'      => $status,
            'started_at'  => now(),
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        return $id;
    }

    // ─── Idempotency ─────────────────────────────────────────────────────────

    public function test_approve_twice_returns_409_on_second_call(): void
    {
        $admin   = User::factory()->create(['role' => 'admin']);
        $token   = $this->issueToken($admin);
        $student = User::factory()->create(['role' => 'student']);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);
        $subId   = $this->seedSubscription($student->id, $docId, 'PENDING');

        // First approve — must succeed
        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/approve")
            ->assertStatus(200);

        // Second approve on the same (now ACTIVE) subscription — must conflict
        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/approve")
            ->assertStatus(409)
            ->assertJsonPath('current_status', 'ACTIVE');
    }

    public function test_reject_twice_returns_409_on_second_call(): void
    {
        $admin   = User::factory()->create(['role' => 'admin']);
        $token   = $this->issueToken($admin);
        $student = User::factory()->create(['role' => 'student']);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);
        $subId   = $this->seedSubscription($student->id, $docId, 'PENDING');

        // First reject
        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/reject")
            ->assertStatus(200);

        // Second reject on the same (now REJECTED) subscription
        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/reject")
            ->assertStatus(409)
            ->assertJsonPath('current_status', 'REJECTED');
    }

    public function test_admin_cancel_twice_returns_409_on_second_call(): void
    {
        $admin   = User::factory()->create(['role' => 'admin']);
        $token   = $this->issueToken($admin);
        $student = User::factory()->create(['role' => 'student']);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);
        $subId   = $this->seedSubscription($student->id, $docId, 'ACTIVE');

        // First cancel
        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/cancel")
            ->assertStatus(200);

        // Second cancel on the same (now CANCELLED) subscription
        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/cancel")
            ->assertStatus(409)
            ->assertJsonPath('current_status', 'CANCELLED');
    }

    // ─── Concurrency ─────────────────────────────────────────────────────────

    public function test_sequential_subscribe_calls_create_only_one_pending(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);

        $service = app(DocumentSubscriptionService::class);

        $result1 = $service->requestSubscription($student->id, $docId);
        $result2 = $service->requestSubscription($student->id, $docId);

        $this->assertTrue($result1['created']);
        $this->assertFalse($result2['created']);
        $this->assertSame('PENDING', $result1['status']);
        $this->assertSame('PENDING', $result2['status']);

        $this->assertSame(1, DB::table('document_subscriptions')
            ->where('user_id', $student->id)
            ->where('document_id', $docId)
            ->count());
    }

    public function test_sequential_subscribe_calls_never_create_two_active_records(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);

        // Seed an ACTIVE subscription directly
        $this->seedSubscription($student->id, $docId, 'ACTIVE');

        $service = app(DocumentSubscriptionService::class);
        $result  = $service->requestSubscription($student->id, $docId);

        $this->assertFalse($result['created']);
        $this->assertSame('ACTIVE', $result['status']);

        $this->assertSame(1, DB::table('document_subscriptions')
            ->where('user_id', $student->id)
            ->where('document_id', $docId)
            ->where('status', 'ACTIVE')
            ->count());
    }

    // ─── Audit relations ─────────────────────────────────────────────────────

    public function test_approved_by_relation_returns_approving_admin(): void
    {
        $admin   = User::factory()->create(['role' => 'admin']);
        $token   = $this->issueToken($admin);
        $student = User::factory()->create(['role' => 'student']);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);
        $subId   = $this->seedSubscription($student->id, $docId, 'PENDING');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/approve")
            ->assertStatus(200);

        $sub = DocumentSubscription::find($subId);
        $this->assertNotNull($sub->approvedBy);
        $this->assertSame($admin->id, $sub->approvedBy->id);
        $this->assertNull($sub->rejectedBy);
        $this->assertNull($sub->cancelledBy);
    }

    public function test_rejected_by_relation_returns_rejecting_admin(): void
    {
        $admin   = User::factory()->create(['role' => 'admin']);
        $token   = $this->issueToken($admin);
        $student = User::factory()->create(['role' => 'student']);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);
        $subId   = $this->seedSubscription($student->id, $docId, 'PENDING');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/reject")
            ->assertStatus(200);

        $sub = DocumentSubscription::find($subId);
        $this->assertNotNull($sub->rejectedBy);
        $this->assertSame($admin->id, $sub->rejectedBy->id);
        $this->assertNull($sub->approvedBy);
        $this->assertNull($sub->cancelledBy);
    }

    public function test_cancelled_by_relation_returns_cancelling_admin(): void
    {
        $admin   = User::factory()->create(['role' => 'admin']);
        $token   = $this->issueToken($admin);
        $student = User::factory()->create(['role' => 'student']);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);
        $subId   = $this->seedSubscription($student->id, $docId, 'ACTIVE');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/cancel")
            ->assertStatus(200);

        $sub = DocumentSubscription::find($subId);
        $this->assertNotNull($sub->cancelledBy);
        $this->assertSame($admin->id, $sub->cancelledBy->id);
        $this->assertNull($sub->approvedBy);
        $this->assertNull($sub->rejectedBy);
    }

    public function test_user_cancel_leaves_cancelled_by_relation_null(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $token   = $this->issueToken($student);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);
        $subId   = $this->seedSubscription($student->id, $docId, 'ACTIVE');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/documents/{$docId}/subscription")
            ->assertStatus(200);

        $sub = DocumentSubscription::find($subId);
        $this->assertNull($sub->cancelledBy);
        $this->assertNull($sub->approvedBy);
        $this->assertNull($sub->rejectedBy);
    }

    // ─── Structured response ──────────────────────────────────────────────────

    public function test_subscribe_response_includes_status_and_already_exists_when_new(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $token   = $this->issueToken($student);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/documents/{$docId}/subscribe")
            ->assertStatus(201);

        $response->assertJsonPath('status', 'PENDING');
        $response->assertJsonPath('already_exists', false);
        $response->assertJsonPath('message', 'Subscription request created.');
        $this->assertArrayHasKey('id', $response->json());
    }

    public function test_subscribe_response_includes_status_and_already_exists_when_duplicate(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $token   = $this->issueToken($student);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);
        $this->seedSubscription($student->id, $docId, 'PENDING');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/documents/{$docId}/subscribe")
            ->assertStatus(200);

        $response->assertJsonPath('status', 'PENDING');
        $response->assertJsonPath('already_exists', true);
        $response->assertJsonPath('message', 'Subscription request already pending.');
    }

    public function test_subscription_status_response_includes_has_subscription_when_required(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $token   = $this->issueToken($student);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);
        $this->seedSubscription($student->id, $docId, 'ACTIVE');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$docId}/subscription")
            ->assertStatus(200);

        $response->assertJsonPath('required', true);
        $response->assertJsonPath('has_subscription', true);
        $response->assertJsonPath('status', 'ACTIVE');
    }

    public function test_subscription_status_response_has_subscription_false_when_no_record(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $token   = $this->issueToken($student);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$docId}/subscription")
            ->assertStatus(200);

        $response->assertJsonPath('required', true);
        $response->assertJsonPath('has_subscription', false);
        $response->assertJsonPath('status', null);
    }

    public function test_subscription_status_has_subscription_false_for_free_category(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $token   = $this->issueToken($student);

        $catId = (string) Str::uuid();
        DB::table('document_categories')->insert([
            'id'                    => $catId,
            'slug'                  => 'free-'.Str::lower(Str::random(6)),
            'name'                  => 'Free Category',
            'requires_subscription' => false,
            'created_at'            => now(),
        ]);
        $docId = $this->seedDocument($catId);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$docId}/subscription")
            ->assertStatus(200)
            ->assertJsonPath('required', false)
            ->assertJsonPath('has_subscription', false);
    }
}
