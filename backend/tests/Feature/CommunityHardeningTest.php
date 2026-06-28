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

/**
 * CommunityHardeningTest — Sprint 13
 *
 * Testa o novo contrato de autorização baseado em visibility do tópico.
 * As categorias NÃO controlam acesso. O acesso é determinado pelo visibility:
 *
 *   PUBLIC      — qualquer membro autenticado pode ver e responder
 *   CATEGORY    — apenas membros da categoria (category_members) podem ver e responder
 *   INVITE_ONLY — apenas owner, moderadores e membros convidados (discussion_topic_members)
 */
class CommunityHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_topic_is_visible_and_replyable(): void
    {
        $viewer   = $this->createAuthenticatedUser('Viewer User');
        $category = $this->createCategory();
        $author   = $this->createAuthenticatedUser('Author User');
        $topic    = $this->createTopic($author, $category, ['visibility' => 'PUBLIC']);

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

    /**
     * Sprint 13 — tópico CATEGORY só é visível a membros da categoria.
     * A visibilidade não depende de AccessGrant — depende de category_members.
     */
    public function test_category_topic_requires_category_membership(): void
    {
        $viewer   = $this->createAuthenticatedUser('Category Viewer');
        $category = $this->createCategory();
        $author   = $this->createAuthenticatedUser('Category Author');
        $topic    = $this->createTopic($author, $category, ['visibility' => 'CATEGORY']);

        // O author é membro da categoria (criou o tópico); o viewer não é.
        $list = $this->auth($viewer)->getJson('/api/topics');
        $list->assertOk();
        // viewer não é membro da categoria → não vê o tópico
        $this->assertFalse(collect($list->json('data'))->contains(fn (array $item): bool => $item['id'] === $topic->id));

        // Adicionar viewer como membro da categoria
        $this->joinCategory($viewer, $category);

        $grantedList = $this->auth($viewer)->getJson('/api/topics');
        $grantedList->assertOk();
        // agora vê o tópico
        $this->assertTrue(collect($grantedList->json('data'))->contains(fn (array $item): bool => $item['id'] === $topic->id));

        $show = $this->auth($viewer)->getJson("/api/topics/{$topic->id}");
        $show->assertOk();

        $reply = $this->auth($viewer)->postJson("/api/topics/{$topic->id}/replies", [
            'content' => 'Resposta de membro da categoria',
        ]);
        $reply->assertCreated();
    }

    public function test_invite_only_topic_is_hidden_from_external_users(): void
    {
        $viewer   = $this->createAuthenticatedUser('External Viewer');
        $owner    = $this->createAuthenticatedUser('Private Owner');
        $category = $this->createCategory();
        $topic    = $this->createTopic($owner, $category, ['visibility' => 'INVITE_ONLY']);

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

    public function test_invite_only_topic_owner_can_invite_and_block_duplicates(): void
    {
        $owner    = $this->createAuthenticatedUser('Invite Owner');
        $category = $this->createCategory();
        $topic    = $this->createTopic($owner, $category, ['visibility' => 'INVITE_ONLY']);
        $this->addMember($topic, $owner, 'owner', now());

        $invitee = $this->createAuthenticatedUser('Invitee User');

        $first = $this->auth($owner)->postJson("/api/topics/{$topic->id}/members", [
            'user_id' => $invitee->id,
            'role'    => 'member',
        ]);

        $first->assertCreated();

        $duplicate = $this->auth($owner)->postJson("/api/topics/{$topic->id}/members", [
            'user_id' => $invitee->id,
            'role'    => 'member',
        ]);

        $duplicate->assertStatus(409);
    }

    public function test_invite_only_topic_moderator_cannot_promote_owner_but_can_remove_members(): void
    {
        $owner     = $this->createAuthenticatedUser('Owner User');
        $moderator = $this->createAuthenticatedUser('Moderator User');
        $member    = $this->createAuthenticatedUser('Member User');
        $category  = $this->createCategory();
        $topic     = $this->createTopic($owner, $category, ['visibility' => 'INVITE_ONLY']);

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

    // ── Helpers ─────────────────────────────────────────────────────────────

    private function createAuthenticatedUser(string $name): User
    {
        $user = User::factory()->create([
            'email_verified' => true,
            'is_active'      => true,
        ]);

        DB::table('user_profiles')->insert([
            'id'             => (string) Str::uuid(),
            'user_id'        => $user->id,
            'display_name'   => $name,
            'full_name'      => $name.' Full',
            'institution'    => 'ISPTEC',
            'province'       => 'Luanda',
            'avatar_url'     => null,
            'bio'            => null,
            'website_url'    => null,
            'research_areas' => null,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        DB::table('user_sessions')->insert([
            'id'            => (string) Str::uuid(),
            'user_id'       => $user->id,
            'refresh_token' => Str::random(80),
            'ip_address'    => '127.0.0.1',
            'user_agent'    => 'PHPUnit',
            'expires_at'    => now()->addDay(),
            'created_at'    => now(),
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

    /**
     * Sprint 13 — categorias são apenas organização; não aceitam access_level_id.
     */
    private function createCategory(): CommunityCategory
    {
        return CommunityCategory::factory()->create([
            'is_active' => true,
        ]);
    }

    private function createTopic(User $author, CommunityCategory $category, array $overrides = []): DiscussionTopic
    {
        return DiscussionTopic::factory()->create(array_merge([
            'author_id'  => $author->id,
            'category_id' => $category->id,
            'status'     => 'published',
            'visibility' => 'CATEGORY',
        ], $overrides));
    }

    private function addMember(DiscussionTopic $topic, User $user, string $role, ?\DateTimeInterface $acceptedAt): DiscussionTopicMember
    {
        return DiscussionTopicMember::query()->create([
            'id'          => (string) Str::uuid(),
            'topic_id'    => $topic->id,
            'user_id'     => $user->id,
            'role'        => $role,
            'invited_by'  => $topic->author_id,
            'accepted_at' => $acceptedAt,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
    }

    /**
     * Sprint 13 — adiciona utilizador como membro da categoria (não usa AccessGrant).
     */
    private function joinCategory(User $user, CommunityCategory $category): void
    {
        DB::table('category_members')->insert([
            'id'          => (string) Str::uuid(),
            'category_id' => $category->id,
            'user_id'     => $user->id,
            'joined_at'   => now(),
        ]);
    }
}
