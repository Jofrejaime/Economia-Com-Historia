<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Sprint 16 — Admin Backoffice: Documents & Subscriptions
 *
 * Covers:
 *  - Pinned documents appear first in listing (Module 2)
 *  - Subscription listing filters: category_id, date_from, date_to, search (Module 1)
 *  - Subscription listing sort (Module 1)
 *  - Admin dashboard stats: documents, categories, subscriptions (Module 3)
 */
class Sprint16Test extends TestCase
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

    private function seedCategory(bool $requiresSubscription = false, string $prefix = 'cat'): string
    {
        $id = (string) Str::uuid();

        DB::table('document_categories')->insert([
            'id'                    => $id,
            'slug'                  => $prefix.'-'.Str::lower(Str::random(6)),
            'name'                  => 'Category '.Str::random(4),
            'requires_subscription' => $requiresSubscription,
            'created_at'            => now(),
        ]);

        return $id;
    }

    private function seedDocument(string $categoryId, bool $isPublished = true, bool $isPinned = false): string
    {
        $author = User::factory()->create();
        $id     = (string) Str::uuid();

        DB::table('documents')->insert([
            'id'              => $id,
            'title'           => 'Doc '.Str::random(6),
            'slug'            => 'doc-'.Str::lower(Str::random(8)),
            'author'          => 'Author',
            'summary'         => 'Summary',
            'document_type'   => 'article',
            'academic_level'  => 'intro',
            'category_id'     => $categoryId,
            'status'          => $isPublished ? 'published' : 'draft',
            'is_pinned'       => $isPinned,
            'created_by'      => $author->id,
            'published_at'    => $isPublished ? now() : null,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        return $id;
    }

    private function seedSubscription(string $userId, string $documentId, string $status, ?string $createdAt = null): string
    {
        $id = (string) Str::uuid();

        DB::table('document_subscriptions')->insert([
            'id'          => $id,
            'user_id'     => $userId,
            'document_id' => $documentId,
            'status'      => $status,
            'started_at'  => now(),
            'created_at'  => $createdAt ?? now(),
            'updated_at'  => now(),
        ]);

        return $id;
    }

    // ─── Module 2: Pinned-first ordering ──────────────────────────────────────

    public function test_pinned_documents_appear_first_in_listing(): void
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $token  = $this->issueToken($admin);
        $catId  = $this->seedCategory();

        $unpinnedId = $this->seedDocument($catId, true, false);
        $pinnedId   = $this->seedDocument($catId, true, true);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/documents')
            ->assertStatus(200);

        $ids = collect($response->json('data'))->pluck('id')->values()->all();

        $pinnedIndex   = array_search($pinnedId, $ids);
        $unpinnedIndex = array_search($unpinnedId, $ids);

        $this->assertNotFalse($pinnedIndex);
        $this->assertNotFalse($unpinnedIndex);
        $this->assertLessThan($unpinnedIndex, $pinnedIndex, 'Pinned document should appear before unpinned.');
    }

    public function test_pinned_documents_appear_first_when_sorted_by_popular(): void
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $token  = $this->issueToken($admin);
        $catId  = $this->seedCategory();

        $unpinnedId = $this->seedDocument($catId, true, false);
        $pinnedId   = $this->seedDocument($catId, true, true);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/documents?sort=popular')
            ->assertStatus(200);

        $ids = collect($response->json('data'))->pluck('id')->values()->all();

        $pinnedIndex   = array_search($pinnedId, $ids);
        $unpinnedIndex = array_search($unpinnedId, $ids);

        $this->assertNotFalse($pinnedIndex);
        $this->assertLessThan($unpinnedIndex, $pinnedIndex);
    }

    // ─── Module 1: Subscription listing filters ───────────────────────────────

    public function test_subscription_listing_filter_by_category_id(): void
    {
        $admin   = User::factory()->create(['role' => 'admin']);
        $token   = $this->issueToken($admin);
        $student = User::factory()->create(['role' => 'student']);

        $catA = $this->seedCategory(true, 'cat-a');
        $catB = $this->seedCategory(true, 'cat-b');

        $docA = $this->seedDocument($catA);
        $docB = $this->seedDocument($catB);

        $subA = $this->seedSubscription($student->id, $docA, 'PENDING');
        $this->seedSubscription($student->id, $docB, 'PENDING');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/admin/document-subscriptions?category_id={$catA}")
            ->assertStatus(200);

        $ids = collect($response->json('data'))->pluck('id')->all();

        $this->assertContains($subA, $ids);
        $this->assertSame(1, count($ids));
    }

    public function test_subscription_listing_filter_by_date_from(): void
    {
        $admin   = User::factory()->create(['role' => 'admin']);
        $token   = $this->issueToken($admin);
        $student = User::factory()->create(['role' => 'student']);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);

        $oldSub = $this->seedSubscription($student->id, $docId, 'PENDING', '2025-01-01 00:00:00');

        $student2 = User::factory()->create(['role' => 'student']);
        $newSub   = $this->seedSubscription($student2->id, $docId, 'PENDING', now()->toDateTimeString());

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/document-subscriptions?date_from='.now()->toDateString())
            ->assertStatus(200);

        $ids = collect($response->json('data'))->pluck('id')->all();

        $this->assertContains($newSub, $ids);
        $this->assertNotContains($oldSub, $ids);
    }

    public function test_subscription_listing_filter_by_date_to(): void
    {
        $admin   = User::factory()->create(['role' => 'admin']);
        $token   = $this->issueToken($admin);
        $student = User::factory()->create(['role' => 'student']);
        $catId   = $this->seedCategory();
        $docId   = $this->seedDocument($catId);

        $oldSub = $this->seedSubscription($student->id, $docId, 'PENDING', '2025-01-01 00:00:00');

        $student2 = User::factory()->create(['role' => 'student']);
        $newSub   = $this->seedSubscription($student2->id, $docId, 'PENDING', now()->toDateTimeString());

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/document-subscriptions?date_to=2025-12-31')
            ->assertStatus(200);

        $ids = collect($response->json('data'))->pluck('id')->all();

        $this->assertContains($oldSub, $ids);
        $this->assertNotContains($newSub, $ids);
    }

    public function test_subscription_listing_search_by_user_email(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($admin);

        $targetUser  = User::factory()->create(['email' => 'target-sprint16@example.com']);
        $otherUser   = User::factory()->create(['email' => 'other-sprint16@example.com']);
        $catId       = $this->seedCategory();
        $docId       = $this->seedDocument($catId);

        $targetSub = $this->seedSubscription($targetUser->id, $docId, 'PENDING');

        $docId2    = $this->seedDocument($catId);
        $this->seedSubscription($otherUser->id, $docId2, 'PENDING');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/document-subscriptions?search=target-sprint16')
            ->assertStatus(200);

        $ids = collect($response->json('data'))->pluck('id')->all();

        $this->assertContains($targetSub, $ids);
        $this->assertCount(1, $ids);
    }

    public function test_subscription_listing_search_by_document_title(): void
    {
        $admin   = User::factory()->create(['role' => 'admin']);
        $token   = $this->issueToken($admin);
        $student = User::factory()->create(['role' => 'student']);
        $catId   = $this->seedCategory();

        $authorId = (string) Str::uuid();
        $author   = User::factory()->create();

        $docMatchId = (string) Str::uuid();
        DB::table('documents')->insert([
            'id'              => $docMatchId,
            'title'           => 'UniqueSearchTitle_Sprint16',
            'slug'            => 'unique-search-sprint16',
            'author'          => 'Author',
            'summary'         => 'Summary',
            'document_type'   => 'article',
            'academic_level'  => 'intro',
            'category_id'     => $catId,
            'status'          => 'published',
            'created_by'      => $author->id,
            'published_at'    => now(),
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        $docOtherId = $this->seedDocument($catId);

        $matchSub = $this->seedSubscription($student->id, $docMatchId, 'PENDING');
        $student2 = User::factory()->create(['role' => 'student']);
        $this->seedSubscription($student2->id, $docOtherId, 'PENDING');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/document-subscriptions?search=UniqueSearchTitle_Sprint16')
            ->assertStatus(200);

        $ids = collect($response->json('data'))->pluck('id')->all();

        $this->assertContains($matchSub, $ids);
        $this->assertCount(1, $ids);
    }

    public function test_subscription_listing_sort_ascending_by_created_at(): void
    {
        $admin    = User::factory()->create(['role' => 'admin']);
        $token    = $this->issueToken($admin);
        $student1 = User::factory()->create(['role' => 'student']);
        $student2 = User::factory()->create(['role' => 'student']);
        $catId    = $this->seedCategory();
        $docId    = $this->seedDocument($catId);
        $docId2   = $this->seedDocument($catId);

        $older = $this->seedSubscription($student1->id, $docId, 'PENDING', '2025-06-01 00:00:00');
        $newer = $this->seedSubscription($student2->id, $docId2, 'PENDING', '2025-12-01 00:00:00');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/document-subscriptions?sort_by=created_at&sort_direction=asc')
            ->assertStatus(200);

        $ids = collect($response->json('data'))->pluck('id')->values()->all();

        $olderIdx = array_search($older, $ids);
        $newerIdx = array_search($newer, $ids);

        $this->assertNotFalse($olderIdx);
        $this->assertNotFalse($newerIdx);
        $this->assertLessThan($newerIdx, $olderIdx, 'Older subscription should appear before newer when sorted asc.');
    }

    // ─── Module 3: Admin dashboard stats ──────────────────────────────────────

    public function test_admin_summary_includes_document_stats(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($admin);
        $catId = $this->seedCategory();

        $this->seedDocument($catId, true, true);  // published + pinned
        $this->seedDocument($catId, false, false); // draft

        $author = User::factory()->create();
        $archivedId = (string) Str::uuid();
        DB::table('documents')->insert([
            'id'              => $archivedId,
            'title'           => 'Archived Doc',
            'slug'            => 'archived-'.Str::random(6),
            'author'          => 'Author',
            'summary'         => 'Summary',
            'document_type'   => 'article',
            'academic_level'  => 'intro',
            'category_id'     => $catId,
            'status'          => 'archived',
            'created_by'      => $author->id,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/dashboard/summary')
            ->assertStatus(200);

        $docs = $response->json('data.documents');

        $this->assertArrayHasKey('total', $docs);
        $this->assertArrayHasKey('published', $docs);
        $this->assertArrayHasKey('draft', $docs);
        $this->assertArrayHasKey('archived', $docs);
        $this->assertArrayHasKey('pinned', $docs);

        $this->assertGreaterThanOrEqual(1, $docs['published']);
        $this->assertGreaterThanOrEqual(1, $docs['draft']);
        $this->assertGreaterThanOrEqual(1, $docs['archived']);
        $this->assertGreaterThanOrEqual(1, $docs['pinned']);
        $this->assertGreaterThanOrEqual(3, $docs['total']);
    }

    public function test_admin_summary_includes_category_stats(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $this->issueToken($admin);

        $this->seedCategory(false, 'free');
        $this->seedCategory(true, 'sub');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/dashboard/summary')
            ->assertStatus(200);

        $cats = $response->json('data.categories');

        $this->assertArrayHasKey('total', $cats);
        $this->assertArrayHasKey('free', $cats);
        $this->assertArrayHasKey('requires_subscription', $cats);

        $this->assertGreaterThanOrEqual(1, $cats['free']);
        $this->assertGreaterThanOrEqual(1, $cats['requires_subscription']);
        $this->assertSame($cats['free'] + $cats['requires_subscription'], $cats['total']);
    }

    public function test_admin_summary_includes_subscription_stats(): void
    {
        $admin   = User::factory()->create(['role' => 'admin']);
        $token   = $this->issueToken($admin);
        $student = User::factory()->create(['role' => 'student']);
        $catId   = $this->seedCategory(true);
        $docId   = $this->seedDocument($catId);

        $this->seedSubscription($student->id, $docId, 'PENDING');

        $student2 = User::factory()->create(['role' => 'student']);
        $docId2   = $this->seedDocument($catId);
        $this->seedSubscription($student2->id, $docId2, 'ACTIVE');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/dashboard/summary')
            ->assertStatus(200);

        $subs = $response->json('data.subscriptions');

        $this->assertArrayHasKey('total', $subs);
        $this->assertArrayHasKey('pending', $subs);
        $this->assertArrayHasKey('active', $subs);
        $this->assertArrayHasKey('rejected', $subs);
        $this->assertArrayHasKey('cancelled', $subs);

        $this->assertGreaterThanOrEqual(1, $subs['pending']);
        $this->assertGreaterThanOrEqual(1, $subs['active']);
        $this->assertGreaterThanOrEqual(2, $subs['total']);
    }
}
