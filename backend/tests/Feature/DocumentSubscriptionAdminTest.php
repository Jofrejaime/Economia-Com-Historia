<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class DocumentSubscriptionAdminTest extends TestCase
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

    private function seedCategory(bool $requiresSubscription = true): string
    {
        $id = (string) Str::uuid();

        DB::table('document_categories')->insert([
            'id'                    => $id,
            'slug'                  => 'cat-'.Str::lower(Str::random(6)),
            'name'                  => 'Test Category',
            'requires_subscription' => $requiresSubscription,
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

    // ─── Admin list ────────────────────────────────────────────────────────────

    public function test_admin_can_list_all_subscriptions(): void
    {
        $admin      = User::factory()->create(['role' => 'admin']);
        $adminToken = $this->issueToken($admin);
        $student    = User::factory()->create(['role' => 'student']);
        $catId      = $this->seedCategory();
        $docId      = $this->seedDocument($catId);
        $this->seedSubscription($student->id, $docId, 'PENDING');

        $response = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/admin/document-subscriptions');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'meta']);

        $ids = collect($response->json('data'))->pluck('document_id')->all();
        $this->assertContains($docId, $ids);
    }

    public function test_admin_can_filter_subscriptions_by_status(): void
    {
        $admin      = User::factory()->create(['role' => 'admin']);
        $adminToken = $this->issueToken($admin);
        $student    = User::factory()->create(['role' => 'student']);
        $catId      = $this->seedCategory();
        $docId      = $this->seedDocument($catId);
        $this->seedSubscription($student->id, $docId, 'PENDING');

        $student2  = User::factory()->create(['role' => 'student']);
        $docId2    = $this->seedDocument($catId);
        $this->seedSubscription($student2->id, $docId2, 'ACTIVE');

        $response = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/admin/document-subscriptions?status=PENDING');

        $response->assertStatus(200);

        $statuses = collect($response->json('data'))->pluck('status')->unique()->values()->all();
        $this->assertEquals(['PENDING'], $statuses);
    }

    public function test_non_admin_cannot_access_admin_subscriptions_list(): void
    {
        $student      = User::factory()->create(['role' => 'student']);
        $studentToken = $this->issueToken($student);

        $this->withHeader('Authorization', "Bearer {$studentToken}")
            ->getJson('/api/admin/document-subscriptions')
            ->assertStatus(403);
    }

    // ─── Admin approve ─────────────────────────────────────────────────────────

    public function test_admin_can_approve_pending_subscription(): void
    {
        $admin      = User::factory()->create(['role' => 'admin']);
        $adminToken = $this->issueToken($admin);
        $student    = User::factory()->create(['role' => 'student']);
        $catId      = $this->seedCategory();
        $docId      = $this->seedDocument($catId);
        $subId      = $this->seedSubscription($student->id, $docId, 'PENDING');

        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/approve")
            ->assertStatus(200)
            ->assertJsonPath('message', 'Subscription approved.');

        $this->assertDatabaseHas('document_subscriptions', [
            'id'     => $subId,
            'status' => 'ACTIVE',
        ]);
    }

    public function test_approved_subscription_grants_access(): void
    {
        $admin      = User::factory()->create(['role' => 'admin']);
        $adminToken = $this->issueToken($admin);
        $student    = User::factory()->create(['role' => 'student']);
        $studentToken = $this->issueToken($student);
        $catId      = $this->seedCategory();
        $docId      = $this->seedDocument($catId);
        $subId      = $this->seedSubscription($student->id, $docId, 'PENDING');

        // Approve
        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/approve")
            ->assertStatus(200);

        // Student can now access the document
        $this->withHeader('Authorization', "Bearer {$studentToken}")
            ->getJson("/api/documents/{$docId}")
            ->assertStatus(200);
    }

    public function test_approve_fails_when_not_pending(): void
    {
        $admin      = User::factory()->create(['role' => 'admin']);
        $adminToken = $this->issueToken($admin);
        $student    = User::factory()->create(['role' => 'student']);
        $catId      = $this->seedCategory();
        $docId      = $this->seedDocument($catId);
        $subId      = $this->seedSubscription($student->id, $docId, 'ACTIVE');

        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/approve")
            ->assertStatus(409)
            ->assertJsonPath('current_status', 'ACTIVE');
    }

    public function test_approve_returns_404_for_unknown_subscription(): void
    {
        $admin      = User::factory()->create(['role' => 'admin']);
        $adminToken = $this->issueToken($admin);

        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->patchJson('/api/admin/document-subscriptions/'.Str::uuid().'/approve')
            ->assertStatus(404);
    }

    // ─── Admin reject ──────────────────────────────────────────────────────────

    public function test_admin_can_reject_pending_subscription(): void
    {
        $admin      = User::factory()->create(['role' => 'admin']);
        $adminToken = $this->issueToken($admin);
        $student    = User::factory()->create(['role' => 'student']);
        $catId      = $this->seedCategory();
        $docId      = $this->seedDocument($catId);
        $subId      = $this->seedSubscription($student->id, $docId, 'PENDING');

        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/reject")
            ->assertStatus(200)
            ->assertJsonPath('message', 'Subscription rejected.');

        $this->assertDatabaseHas('document_subscriptions', [
            'id'     => $subId,
            'status' => 'REJECTED',
        ]);
    }

    public function test_rejected_subscription_does_not_grant_access(): void
    {
        $admin        = User::factory()->create(['role' => 'admin']);
        $adminToken   = $this->issueToken($admin);
        $student      = User::factory()->create(['role' => 'student']);
        $studentToken = $this->issueToken($student);
        $catId        = $this->seedCategory();
        $docId        = $this->seedDocument($catId);
        $subId        = $this->seedSubscription($student->id, $docId, 'PENDING');

        // Reject
        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/reject")
            ->assertStatus(200);

        // Student cannot access the document
        $this->withHeader('Authorization', "Bearer {$studentToken}")
            ->getJson("/api/documents/{$docId}")
            ->assertStatus(403);
    }

    public function test_reject_fails_when_not_pending(): void
    {
        $admin      = User::factory()->create(['role' => 'admin']);
        $adminToken = $this->issueToken($admin);
        $student    = User::factory()->create(['role' => 'student']);
        $catId      = $this->seedCategory();
        $docId      = $this->seedDocument($catId);
        $subId      = $this->seedSubscription($student->id, $docId, 'REJECTED');

        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/reject")
            ->assertStatus(409)
            ->assertJsonPath('current_status', 'REJECTED');
    }

    // ─── Admin cancel ──────────────────────────────────────────────────────────

    public function test_admin_can_cancel_active_subscription(): void
    {
        $admin      = User::factory()->create(['role' => 'admin']);
        $adminToken = $this->issueToken($admin);
        $student    = User::factory()->create(['role' => 'student']);
        $catId      = $this->seedCategory();
        $docId      = $this->seedDocument($catId);
        $subId      = $this->seedSubscription($student->id, $docId, 'ACTIVE');

        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/cancel")
            ->assertStatus(200)
            ->assertJsonPath('message', 'Subscription cancelled.');

        $this->assertDatabaseHas('document_subscriptions', [
            'id'     => $subId,
            'status' => 'CANCELLED',
        ]);
    }

    public function test_admin_can_cancel_pending_subscription(): void
    {
        $admin      = User::factory()->create(['role' => 'admin']);
        $adminToken = $this->issueToken($admin);
        $student    = User::factory()->create(['role' => 'student']);
        $catId      = $this->seedCategory();
        $docId      = $this->seedDocument($catId);
        $subId      = $this->seedSubscription($student->id, $docId, 'PENDING');

        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/cancel")
            ->assertStatus(200)
            ->assertJsonPath('message', 'Subscription cancelled.');

        $this->assertDatabaseHas('document_subscriptions', [
            'id'     => $subId,
            'status' => 'CANCELLED',
        ]);
    }

    public function test_admin_cancel_fails_when_already_cancelled(): void
    {
        $admin      = User::factory()->create(['role' => 'admin']);
        $adminToken = $this->issueToken($admin);
        $student    = User::factory()->create(['role' => 'student']);
        $catId      = $this->seedCategory();
        $docId      = $this->seedDocument($catId);
        $subId      = $this->seedSubscription($student->id, $docId, 'CANCELLED');

        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/cancel")
            ->assertStatus(409)
            ->assertJsonPath('current_status', 'CANCELLED');
    }

    public function test_admin_cancel_fails_when_rejected(): void
    {
        $admin      = User::factory()->create(['role' => 'admin']);
        $adminToken = $this->issueToken($admin);
        $student    = User::factory()->create(['role' => 'student']);
        $catId      = $this->seedCategory();
        $docId      = $this->seedDocument($catId);
        $subId      = $this->seedSubscription($student->id, $docId, 'REJECTED');

        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/cancel")
            ->assertStatus(409)
            ->assertJsonPath('current_status', 'REJECTED');
    }

    // ─── Full flow ─────────────────────────────────────────────────────────────

    public function test_full_subscription_flow(): void
    {
        $admin        = User::factory()->create(['role' => 'admin']);
        $adminToken   = $this->issueToken($admin);
        $student      = User::factory()->create(['role' => 'student']);
        $studentToken = $this->issueToken($student);

        // 1. Student subscribes to a premium document
        $catId = $this->seedCategory(true);
        $docId = $this->seedDocument($catId);

        $response = $this->withHeader('Authorization', "Bearer {$studentToken}")
            ->postJson("/api/documents/{$docId}/subscribe")
            ->assertStatus(201);

        $subId = $response->json('id');

        // 2. Student cannot access yet (PENDING)
        $this->withHeader('Authorization', "Bearer {$studentToken}")
            ->getJson("/api/documents/{$docId}")
            ->assertStatus(403);

        // 3. Admin approves
        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/approve")
            ->assertStatus(200);

        // 4. Student can now access
        $this->withHeader('Authorization', "Bearer {$studentToken}")
            ->getJson("/api/documents/{$docId}")
            ->assertStatus(200);

        // 5. Admin cancels
        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->patchJson("/api/admin/document-subscriptions/{$subId}/cancel")
            ->assertStatus(200);

        // 6. Student loses access
        $this->withHeader('Authorization', "Bearer {$studentToken}")
            ->getJson("/api/documents/{$docId}")
            ->assertStatus(403);
    }
}
