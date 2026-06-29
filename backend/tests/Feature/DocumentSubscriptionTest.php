<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class DocumentSubscriptionTest extends TestCase
{
    use RefreshDatabase;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function registerStudent(): string
    {
        Mail::fake();

        $response = $this->postJson('/api/auth/register', [
            'email'                 => 'student@example.com',
            'password'              => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name'          => 'Student User',
        ]);

        return $response->json('token');
    }

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

    private function seedCategory(bool $requiresSubscription): string
    {
        $id = (string) Str::uuid();

        DB::table('document_categories')->insert([
            'id'                     => $id,
            'slug'                   => 'cat-'.Str::lower(Str::random(6)),
            'name'                   => $requiresSubscription ? 'Premium Category' : 'Free Category',
            'requires_subscription'  => $requiresSubscription,
            'created_at'             => now(),
        ]);

        return $id;
    }

    private function seedPublishedDocument(string $accessLevelId = 'public', ?string $categoryId = null, ?string $createdBy = null): string
    {
        $authorId = $createdBy ?? User::factory()->create()->id;
        $id = (string) Str::uuid();

        DB::table('documents')->insert([
            'id'              => $id,
            'title'           => 'Test Document '.Str::random(6),
            'slug'            => 'test-'.Str::lower(Str::random(8)),
            'author'          => 'Test Author',
            'summary'         => 'Summary',
            'document_type'   => 'article',
            'academic_level'  => 'intro',
            'access_level_id' => $accessLevelId,
            'category_id'     => $categoryId,
            'status'          => 'published',
            'created_by'      => $authorId,
            'published_at'    => now(),
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        return $id;
    }

    private function seedActiveSubscription(string $userId, string $documentId): string
    {
        $id = (string) Str::uuid();

        DB::table('document_subscriptions')->insert([
            'id'          => $id,
            'user_id'     => $userId,
            'document_id' => $documentId,
            'status'      => 'ACTIVE',
            'started_at'  => now(),
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        return $id;
    }

    private function seedCancelledSubscription(string $userId, string $documentId): string
    {
        $id = (string) Str::uuid();

        DB::table('document_subscriptions')->insert([
            'id'          => $id,
            'user_id'     => $userId,
            'document_id' => $documentId,
            'status'      => 'CANCELLED',
            'started_at'  => now()->subDays(10),
            'created_at'  => now()->subDays(10),
            'updated_at'  => now(),
        ]);

        return $id;
    }

    // ─── Access: show endpoint ─────────────────────────────────────────────────

    public function test_free_category_document_is_accessible_without_subscription(): void
    {
        $token      = $this->registerStudent();
        $categoryId = $this->seedCategory(false);
        $documentId = $this->seedPublishedDocument('public', $categoryId);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$documentId}")
            ->assertStatus(200);
    }

    public function test_premium_category_document_returns_403_without_subscription(): void
    {
        $token      = $this->registerStudent();
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$documentId}")
            ->assertStatus(403)
            ->assertJsonPath('subscription_required', true);
    }

    public function test_premium_category_document_accessible_with_active_subscription(): void
    {
        $token      = $this->registerStudent();
        $user       = User::query()->where('email', 'student@example.com')->first();
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);
        $this->seedActiveSubscription($user->id, $documentId);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$documentId}")
            ->assertStatus(200);
    }

    public function test_premium_category_document_denied_with_cancelled_subscription(): void
    {
        $token      = $this->registerStudent();
        $user       = User::query()->where('email', 'student@example.com')->first();
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);
        $this->seedCancelledSubscription($user->id, $documentId);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$documentId}")
            ->assertStatus(403)
            ->assertJsonPath('subscription_required', true);
    }

    public function test_admin_can_always_access_premium_document(): void
    {
        $admin      = User::factory()->create(['role' => 'admin']);
        $adminToken = $this->issueToken($admin);
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);

        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson("/api/documents/{$documentId}")
            ->assertStatus(200);
    }

    // ─── Subscription endpoints ────────────────────────────────────────────────

    public function test_user_can_subscribe_to_document(): void
    {
        $token      = $this->registerStudent();
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/documents/{$documentId}/subscribe")
            ->assertStatus(201)
            ->assertJsonPath('message', 'Subscription request created.');
    }

    public function test_subscribe_again_returns_200_when_already_active(): void
    {
        $token      = $this->registerStudent();
        $user       = User::query()->where('email', 'student@example.com')->first();
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);
        $this->seedActiveSubscription($user->id, $documentId);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/documents/{$documentId}/subscribe")
            ->assertStatus(200)
            ->assertJsonPath('message', 'Already subscribed.');
    }

    public function test_admin_can_subscribe_another_user_to_document(): void
    {
        $admin       = User::factory()->create(['role' => 'admin']);
        $adminToken  = $this->issueToken($admin);
        $student     = User::factory()->create(['role' => 'student']);
        $categoryId  = $this->seedCategory(true);
        $documentId  = $this->seedPublishedDocument('public', $categoryId);

        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->postJson("/api/documents/{$documentId}/subscribe", [
                'user_id' => $student->id,
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('document_subscriptions', [
            'user_id'     => $student->id,
            'document_id' => $documentId,
            'status'      => 'PENDING',
        ]);
    }

    public function test_user_can_cancel_own_subscription(): void
    {
        $token      = $this->registerStudent();
        $user       = User::query()->where('email', 'student@example.com')->first();
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);
        $this->seedActiveSubscription($user->id, $documentId);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/documents/{$documentId}/subscription")
            ->assertStatus(200)
            ->assertJsonPath('message', 'Subscription cancelled.');

        $this->assertDatabaseHas('document_subscriptions', [
            'user_id'     => $user->id,
            'document_id' => $documentId,
            'status'      => 'CANCELLED',
        ]);
    }

    public function test_cancel_without_active_subscription_returns_404(): void
    {
        $token      = $this->registerStudent();
        $documentId = $this->seedPublishedDocument('public');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/documents/{$documentId}/subscription")
            ->assertStatus(404);
    }

    // ─── Subscription status endpoint ─────────────────────────────────────────

    public function test_subscription_status_not_required_for_free_category(): void
    {
        $token      = $this->registerStudent();
        $categoryId = $this->seedCategory(false);
        $documentId = $this->seedPublishedDocument('public', $categoryId);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$documentId}/subscription")
            ->assertStatus(200)
            ->assertJsonPath('required', false)
            ->assertJsonPath('status', null);
    }

    public function test_subscription_status_required_without_subscription(): void
    {
        $token      = $this->registerStudent();
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$documentId}/subscription")
            ->assertStatus(200)
            ->assertJsonPath('required', true)
            ->assertJsonPath('status', null);
    }

    public function test_subscription_status_active_with_valid_subscription(): void
    {
        $token      = $this->registerStudent();
        $user       = User::query()->where('email', 'student@example.com')->first();
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);
        $this->seedActiveSubscription($user->id, $documentId);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$documentId}/subscription")
            ->assertStatus(200)
            ->assertJsonPath('required', true)
            ->assertJsonPath('status', 'ACTIVE');
    }

    // ─── Listing filter ────────────────────────────────────────────────────────

    public function test_listing_shows_free_category_documents(): void
    {
        $token      = $this->registerStudent();
        $categoryId = $this->seedCategory(false);
        $documentId = $this->seedPublishedDocument('public', $categoryId);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/documents');

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertContains($documentId, $ids);
    }

    public function test_listing_hides_premium_documents_without_subscription(): void
    {
        $token      = $this->registerStudent();
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/documents');

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertNotContains($documentId, $ids);
    }

    public function test_listing_shows_premium_documents_with_active_subscription(): void
    {
        $token      = $this->registerStudent();
        $user       = User::query()->where('email', 'student@example.com')->first();
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);
        $this->seedActiveSubscription($user->id, $documentId);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/documents');

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertContains($documentId, $ids);
    }

    public function test_admin_sees_all_documents_in_listing_including_premium(): void
    {
        $admin      = User::factory()->create(['role' => 'admin']);
        $adminToken = $this->issueToken($admin);
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);

        $response = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/documents');

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertContains($documentId, $ids);
    }

    // ─── New Sprint 15.1: PENDING state and state machine ─────────────────────

    public function test_subscribe_when_pending_returns_200(): void
    {
        $token      = $this->registerStudent();
        $user       = User::query()->where('email', 'student@example.com')->first();
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);

        // Seed a PENDING subscription (as created by subscribe endpoint)
        DB::table('document_subscriptions')->insert([
            'id'          => \Illuminate\Support\Str::uuid(),
            'user_id'     => $user->id,
            'document_id' => $documentId,
            'status'      => 'PENDING',
            'started_at'  => now(),
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/documents/{$documentId}/subscribe")
            ->assertStatus(200)
            ->assertJsonPath('message', 'Subscription request already pending.');
    }

    public function test_pending_subscription_does_not_grant_document_access(): void
    {
        $token      = $this->registerStudent();
        $user       = User::query()->where('email', 'student@example.com')->first();
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);

        DB::table('document_subscriptions')->insert([
            'id'          => \Illuminate\Support\Str::uuid(),
            'user_id'     => $user->id,
            'document_id' => $documentId,
            'status'      => 'PENDING',
            'started_at'  => now(),
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$documentId}")
            ->assertStatus(403)
            ->assertJsonPath('subscription_required', true);
    }

    public function test_rejected_subscription_does_not_grant_document_access(): void
    {
        $token      = $this->registerStudent();
        $user       = User::query()->where('email', 'student@example.com')->first();
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);

        DB::table('document_subscriptions')->insert([
            'id'          => \Illuminate\Support\Str::uuid(),
            'user_id'     => $user->id,
            'document_id' => $documentId,
            'status'      => 'REJECTED',
            'started_at'  => now(),
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$documentId}")
            ->assertStatus(403)
            ->assertJsonPath('subscription_required', true);
    }

    public function test_subscribe_when_rejected_creates_new_pending(): void
    {
        $token      = $this->registerStudent();
        $user       = User::query()->where('email', 'student@example.com')->first();
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);

        DB::table('document_subscriptions')->insert([
            'id'          => \Illuminate\Support\Str::uuid(),
            'user_id'     => $user->id,
            'document_id' => $documentId,
            'status'      => 'REJECTED',
            'started_at'  => now()->subDays(5),
            'created_at'  => now()->subDays(5),
            'updated_at'  => now(),
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/documents/{$documentId}/subscribe")
            ->assertStatus(201)
            ->assertJsonPath('message', 'Subscription request created.');

        $this->assertDatabaseHas('document_subscriptions', [
            'user_id'     => $user->id,
            'document_id' => $documentId,
            'status'      => 'PENDING',
        ]);
    }

    public function test_subscribe_when_cancelled_creates_new_pending(): void
    {
        $token      = $this->registerStudent();
        $user       = User::query()->where('email', 'student@example.com')->first();
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);
        $this->seedCancelledSubscription($user->id, $documentId);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/documents/{$documentId}/subscribe")
            ->assertStatus(201)
            ->assertJsonPath('message', 'Subscription request created.');

        $this->assertDatabaseHas('document_subscriptions', [
            'user_id'     => $user->id,
            'document_id' => $documentId,
            'status'      => 'PENDING',
        ]);
    }

    public function test_user_can_cancel_pending_subscription(): void
    {
        $token      = $this->registerStudent();
        $user       = User::query()->where('email', 'student@example.com')->first();
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);

        DB::table('document_subscriptions')->insert([
            'id'          => \Illuminate\Support\Str::uuid(),
            'user_id'     => $user->id,
            'document_id' => $documentId,
            'status'      => 'PENDING',
            'started_at'  => now(),
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/documents/{$documentId}/subscription")
            ->assertStatus(200)
            ->assertJsonPath('message', 'Subscription cancelled.');

        $this->assertDatabaseHas('document_subscriptions', [
            'user_id'     => $user->id,
            'document_id' => $documentId,
            'status'      => 'CANCELLED',
        ]);
    }

    public function test_subscription_status_shows_pending(): void
    {
        $token      = $this->registerStudent();
        $user       = User::query()->where('email', 'student@example.com')->first();
        $categoryId = $this->seedCategory(true);
        $documentId = $this->seedPublishedDocument('public', $categoryId);

        DB::table('document_subscriptions')->insert([
            'id'          => \Illuminate\Support\Str::uuid(),
            'user_id'     => $user->id,
            'document_id' => $documentId,
            'status'      => 'PENDING',
            'started_at'  => now(),
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$documentId}/subscription")
            ->assertStatus(200)
            ->assertJsonPath('required', true)
            ->assertJsonPath('status', 'PENDING');
    }
}
