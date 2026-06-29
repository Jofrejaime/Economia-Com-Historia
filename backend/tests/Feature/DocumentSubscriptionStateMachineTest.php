<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Covers:
 *  - State machine: all valid and all invalid transitions
 *  - Uniqueness enforcement (ACTIVE/PENDING deduplication)
 *  - Audit fields (approved_by, rejected_by, cancelled_by)
 */
class DocumentSubscriptionStateMachineTest extends TestCase
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

    // ─── Uniqueness ───────────────────────────────────────────────────────────

    public function test_second_subscribe_with_existing_active_returns_200(): void
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $token  = $this->issueToken($admin);
        $catId  = $this->seedCategory();
        $docId  = $this->seedDocument($catId);
        $this->seedSubscription($admin->id, $docId, 'ACTIVE');

        // A second subscribe call must not create a duplicate
        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/documents/{$docId}/subscribe")
            ->assertStatus(200)
            ->assertJsonPath('message', 'Already subscribed.');

        $this->assertSame(
            1,
            DB::table('document_subscriptions')
                ->where('user_id', $admin->id)
                ->where('document_id', $docId)
                ->count()
        );
    }

    public function test_second_subscribe_with_existing_pending_returns_200(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $token   = $this->issueToken($student);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);
        $this->seedSubscription($student->id, $docId, 'PENDING');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/documents/{$docId}/subscribe")
            ->assertStatus(200)
            ->assertJsonPath('message', 'Subscription request already pending.');

        $this->assertSame(
            1,
            DB::table('document_subscriptions')
                ->where('user_id', $student->id)
                ->where('document_id', $docId)
                ->count()
        );
    }

    public function test_subscribe_after_rejected_creates_new_pending(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $token   = $this->issueToken($student);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);
        $this->seedSubscription($student->id, $docId, 'REJECTED');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/documents/{$docId}/subscribe")
            ->assertStatus(201)
            ->assertJsonPath('message', 'Subscription request created.');

        $this->assertDatabaseHas('document_subscriptions', [
            'user_id'     => $student->id,
            'document_id' => $docId,
            'status'      => 'PENDING',
        ]);
    }

    public function test_subscribe_after_cancelled_creates_new_pending(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $token   = $this->issueToken($student);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);
        $this->seedSubscription($student->id, $docId, 'CANCELLED');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/documents/{$docId}/subscribe")
            ->assertStatus(201)
            ->assertJsonPath('message', 'Subscription request created.');

        $this->assertDatabaseHas('document_subscriptions', [
            'user_id'     => $student->id,
            'document_id' => $docId,
            'status'      => 'PENDING',
        ]);
    }

    // ─── Valid transitions ─────────────────────────────────────────────────────

    public function test_valid_pending_to_active(): void
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $token  = $this->issueToken($admin);
        $catId  = $this->seedCategory();
        $docId  = $this->seedDocument($catId);
        $subId  = $this->seedSubscription($admin->id, $docId, 'PENDING');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/approve")
            ->assertStatus(200);

        $this->assertDatabaseHas('document_subscriptions', ['id' => $subId, 'status' => 'ACTIVE']);
    }

    public function test_valid_pending_to_rejected(): void
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $token  = $this->issueToken($admin);
        $catId  = $this->seedCategory();
        $docId  = $this->seedDocument($catId);
        $subId  = $this->seedSubscription($admin->id, $docId, 'PENDING');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/reject")
            ->assertStatus(200);

        $this->assertDatabaseHas('document_subscriptions', ['id' => $subId, 'status' => 'REJECTED']);
    }

    public function test_valid_pending_to_cancelled_via_admin(): void
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $token  = $this->issueToken($admin);
        $catId  = $this->seedCategory();
        $docId  = $this->seedDocument($catId);
        $subId  = $this->seedSubscription($admin->id, $docId, 'PENDING');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/cancel")
            ->assertStatus(200);

        $this->assertDatabaseHas('document_subscriptions', ['id' => $subId, 'status' => 'CANCELLED']);
    }

    public function test_valid_active_to_cancelled_via_admin(): void
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $token  = $this->issueToken($admin);
        $catId  = $this->seedCategory();
        $docId  = $this->seedDocument($catId);
        $subId  = $this->seedSubscription($admin->id, $docId, 'ACTIVE');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/cancel")
            ->assertStatus(200);

        $this->assertDatabaseHas('document_subscriptions', ['id' => $subId, 'status' => 'CANCELLED']);
    }

    // ─── Invalid transitions (409) ─────────────────────────────────────────────

    public function test_cannot_approve_active_subscription(): void
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $token  = $this->issueToken($admin);
        $catId  = $this->seedCategory();
        $docId  = $this->seedDocument($catId);
        $subId  = $this->seedSubscription($admin->id, $docId, 'ACTIVE');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/approve")
            ->assertStatus(409)
            ->assertJsonPath('current_status', 'ACTIVE');
    }

    public function test_cannot_approve_rejected_subscription(): void
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $token  = $this->issueToken($admin);
        $catId  = $this->seedCategory();
        $docId  = $this->seedDocument($catId);
        $subId  = $this->seedSubscription($admin->id, $docId, 'REJECTED');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/approve")
            ->assertStatus(409)
            ->assertJsonPath('current_status', 'REJECTED');
    }

    public function test_cannot_approve_cancelled_subscription(): void
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $token  = $this->issueToken($admin);
        $catId  = $this->seedCategory();
        $docId  = $this->seedDocument($catId);
        $subId  = $this->seedSubscription($admin->id, $docId, 'CANCELLED');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/approve")
            ->assertStatus(409)
            ->assertJsonPath('current_status', 'CANCELLED');
    }

    public function test_cannot_reject_active_subscription(): void
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $token  = $this->issueToken($admin);
        $catId  = $this->seedCategory();
        $docId  = $this->seedDocument($catId);
        $subId  = $this->seedSubscription($admin->id, $docId, 'ACTIVE');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/reject")
            ->assertStatus(409)
            ->assertJsonPath('current_status', 'ACTIVE');
    }

    public function test_cannot_reject_rejected_subscription(): void
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $token  = $this->issueToken($admin);
        $catId  = $this->seedCategory();
        $docId  = $this->seedDocument($catId);
        $subId  = $this->seedSubscription($admin->id, $docId, 'REJECTED');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/reject")
            ->assertStatus(409)
            ->assertJsonPath('current_status', 'REJECTED');
    }

    public function test_cannot_reject_cancelled_subscription(): void
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $token  = $this->issueToken($admin);
        $catId  = $this->seedCategory();
        $docId  = $this->seedDocument($catId);
        $subId  = $this->seedSubscription($admin->id, $docId, 'CANCELLED');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/reject")
            ->assertStatus(409)
            ->assertJsonPath('current_status', 'CANCELLED');
    }

    public function test_cannot_admin_cancel_rejected_subscription(): void
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $token  = $this->issueToken($admin);
        $catId  = $this->seedCategory();
        $docId  = $this->seedDocument($catId);
        $subId  = $this->seedSubscription($admin->id, $docId, 'REJECTED');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/cancel")
            ->assertStatus(409)
            ->assertJsonPath('current_status', 'REJECTED');
    }

    public function test_cannot_admin_cancel_already_cancelled_subscription(): void
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $token  = $this->issueToken($admin);
        $catId  = $this->seedCategory();
        $docId  = $this->seedDocument($catId);
        $subId  = $this->seedSubscription($admin->id, $docId, 'CANCELLED');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/cancel")
            ->assertStatus(409)
            ->assertJsonPath('current_status', 'CANCELLED');
    }

    // ─── Audit fields ─────────────────────────────────────────────────────────

    public function test_approve_sets_approved_by(): void
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

        $this->assertDatabaseHas('document_subscriptions', [
            'id'          => $subId,
            'status'      => 'ACTIVE',
            'approved_by' => $admin->id,
            'rejected_by' => null,
            'cancelled_by' => null,
        ]);
    }

    public function test_reject_sets_rejected_by(): void
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

        $this->assertDatabaseHas('document_subscriptions', [
            'id'           => $subId,
            'status'       => 'REJECTED',
            'approved_by'  => null,
            'rejected_by'  => $admin->id,
            'cancelled_by' => null,
        ]);
    }

    public function test_admin_cancel_sets_cancelled_by(): void
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

        $this->assertDatabaseHas('document_subscriptions', [
            'id'           => $subId,
            'status'       => 'CANCELLED',
            'approved_by'  => null,
            'rejected_by'  => null,
            'cancelled_by' => $admin->id,
        ]);
    }

    public function test_user_cancel_leaves_cancelled_by_null(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $token   = $this->issueToken($student);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);
        $subId   = $this->seedSubscription($student->id, $docId, 'ACTIVE');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/documents/{$docId}/subscription")
            ->assertStatus(200);

        $this->assertDatabaseHas('document_subscriptions', [
            'id'           => $subId,
            'status'       => 'CANCELLED',
            'cancelled_by' => null,
        ]);
    }

    // ─── Audit in listing ─────────────────────────────────────────────────────

    public function test_admin_listing_includes_audit_fields(): void
    {
        $admin   = User::factory()->create(['role' => 'admin']);
        $token   = $this->issueToken($admin);
        $student = User::factory()->create(['role' => 'student']);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);
        $subId   = $this->seedSubscription($student->id, $docId, 'PENDING');

        // Approve so approved_by is set
        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/approve");

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/document-subscriptions')
            ->assertStatus(200);

        $item = collect($response->json('data'))->firstWhere('id', $subId);
        $this->assertNotNull($item);
        $this->assertArrayHasKey('approved_by', $item);
        $this->assertArrayHasKey('rejected_by', $item);
        $this->assertArrayHasKey('cancelled_by', $item);
        $this->assertSame($admin->id, $item['approved_by']);
        $this->assertNull($item['rejected_by']);
        $this->assertNull($item['cancelled_by']);
    }
}
