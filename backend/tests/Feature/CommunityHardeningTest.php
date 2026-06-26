<?php

namespace Tests\Feature;

use App\Models\CommunityCategory;
use App\Models\DiscussionTopic;
use App\Models\DiscussionTopicMember;
use App\Models\TopicReply;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class CommunityHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_topic_is_visible_and_replyable(): void
    {
        $viewer = $this->createAuthenticatedUser('Viewer User');
        $category = $this->createCategory('public');
        $author = $this->createAuthenticatedUser('Author User');
        $topic = $this->createTopic($author, $category, ['visibility' => 'PUBLIC']);

        $list = $this->auth($viewer)->getJson('/api/topics');
        $list->assertOk();
        $this->assertTrue(collect($list->json('data'))->contains(fn (array $item): bool => $item['id'] === $topic->id));

        $show = $this->auth($viewer)->getJson("/api/topics/{$topic->id}");
        $show->assertOk();

        $reply = $this->auth($viewer)->postJson("/api/topics/{$topic->id}/replies", [
            'content' => 'Resposta pública',
        ]);
        $reply->assertCreated();
    }

    public function test_restricted_topic_requires_access_grant(): void
    {
        $viewer = $this->createAuthenticatedUser('Restricted Viewer');
        $category = $this->createCategory('restricted');
        $author = $this->createAuthenticatedUser('Restricted Author');
        $topic = $this->createTopic($author, $category, ['visibility' => 'RESTRICTED']);

        $list = $this->auth($viewer)->getJson('/api/topics');
        $list->assertOk();
        $this->assertFalse(collect($list->json('data'))->contains(fn (array $item): bool => $item['id'] === $topic->id));

        $this->grantAccess($viewer, 'restricted');

        $grantedList = $this->auth($viewer)->getJson('/api/topics');
        $grantedList->assertOk();
        $this->assertTrue(collect($grantedList->json('data'))->contains(fn (array $item): bool => $item['id'] === $topic->id));

        $show = $this->auth($viewer)->getJson("/api/topics/{$topic->id}");
        $show->assertOk();

        $reply = $this->auth($viewer)->postJson("/api/topics/{$topic->id}/replies", [
            'content' => 'Resposta restrita',
        ]);
        $reply->assertCreated();
    }

    public function test_private_topic_is_hidden_from_external_users(): void
    {
        $viewer = $this->createAuthenticatedUser('External Viewer');
        $owner = $this->createAuthenticatedUser('Private Owner');
        $category = $this->createCategory('public');
        $topic = $this->createTopic($owner, $category, ['visibility' => 'PRIVATE']);

        $this->addMember($topic, $owner, 'owner', now());
        $member = $this->createAuthenticatedUser('Private Member');
        $this->addMember($topic, $member, 'member', null);

        $list = $this->auth($viewer)->getJson('/api/topics');
        $list->assertOk();
        $this->assertFalse(collect($list->json('data'))->contains(fn (array $item): bool => $item['id'] === $topic->id));

        $show = $this->auth($viewer)->getJson("/api/topics/{$topic->id}");
        $show->assertNotFound();

        $members = $this->auth($viewer)->getJson("/api/topics/{$topic->id}/members");
        $members->assertNotFound();

        $reply = $this->auth($viewer)->postJson("/api/topics/{$topic->id}/replies", [
            'content' => 'Tentativa externa',
        ]);
        $reply->assertNotFound();
    }

    public function test_private_topic_owner_can_invite_and_block_duplicates(): void
    {
        $owner = $this->createAuthenticatedUser('Invite Owner');
        $category = $this->createCategory('public');
        $topic = $this->createTopic($owner, $category, ['visibility' => 'PRIVATE']);
        $this->addMember($topic, $owner, 'owner', now());

        $invitee = $this->createAuthenticatedUser('Invitee User');

        $first = $this->auth($owner)->postJson("/api/topics/{$topic->id}/members", [
            'user_id' => $invitee->id,
            'role' => 'member',
        ]);

        $first->assertCreated();

        $duplicate = $this->auth($owner)->postJson("/api/topics/{$topic->id}/members", [
            'user_id' => $invitee->id,
            'role' => 'member',
        ]);

        $duplicate->assertStatus(409);
    }

    public function test_private_topic_moderator_cannot_promote_owner_but_can_remove_members(): void
    {
        $owner = $this->createAuthenticatedUser('Owner User');
        $moderator = $this->createAuthenticatedUser('Moderator User');
        $member = $this->createAuthenticatedUser('Member User');
        $category = $this->createCategory('public');
        $topic = $this->createTopic($owner, $category, ['visibility' => 'PRIVATE']);

        $this->addMember($topic, $owner, 'owner', now());
        $this->addMember($topic, $moderator, 'moderator', now());
        $this->addMember($topic, $member, 'member', null);

        $forbiddenPromotion = $this->auth($moderator)->patchJson("/api/topics/{$topic->id}/members/{$member->id}", [
            'role' => 'moderator',
        ]);

        $forbiddenPromotion->assertForbidden();

        $remove = $this->auth($moderator)->deleteJson("/api/topics/{$topic->id}/members/{$member->id}");
        $remove->assertOk();
    }

    private function createAuthenticatedUser(string $name): User
    {
        $user = User::factory()->create([
            'email_verified' => true,
            'is_active' => true,
        ]);

        DB::table('user_profiles')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'display_name' => $name,
            'full_name' => $name.' Full',
            'institution' => 'ISPTEC',
            'province' => 'Luanda',
            'avatar_url' => null,
            'bio' => null,
            'website_url' => null,
            'research_areas' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('user_sessions')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'refresh_token' => Str::random(80),
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit',
            'expires_at' => now()->addDay(),
            'created_at' => now(),
        ]);

        return $user;
    }

    private function auth(User $user)
    {
        $token = DB::table('user_sessions')
            ->where('user_id', $user->id)
            ->value('refresh_token');

        return $this->withHeader('Authorization', "Bearer {$token}");
    }

    private function createCategory(string $accessLevelId): CommunityCategory
    {
        return CommunityCategory::factory()->create([
            'is_active' => true,
            'access_level_id' => $accessLevelId,
        ]);
    }

    private function createTopic(User $author, CommunityCategory $category, array $overrides = []): DiscussionTopic
    {
        return DiscussionTopic::factory()->create(array_merge([
            'author_id' => $author->id,
            'category_id' => $category->id,
            'status' => 'published',
            'visibility' => 'RESTRICTED',
        ], $overrides));
    }

    private function addMember(DiscussionTopic $topic, User $user, string $role, ?\DateTimeInterface $acceptedAt): DiscussionTopicMember
    {
        return DiscussionTopicMember::query()->create([
            'id' => (string) Str::uuid(),
            'topic_id' => $topic->id,
            'user_id' => $user->id,
            'role' => $role,
            'invited_by' => $topic->author_id,
            'accepted_at' => $acceptedAt,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function grantAccess(User $user, string $accessLevelId): void
    {
        DB::table('user_access_grants')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'access_level_id' => $accessLevelId,
            'granted_at' => now(),
            'is_active' => true,
        ]);
    }
}
