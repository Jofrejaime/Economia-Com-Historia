<?php

namespace Tests\Feature;

use App\Models\CommunityCategory;
use App\Models\DiscussionTopic;
use App\Models\DiscussionTopicMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * CommunityHardeningTest — Sprint 18.5.1
 *
 * Contrato de autorização consolidado: a visibilidade do tópico decide tudo.
 *
 *   PUBLIC      — qualquer utilizador autenticado pode ver e responder
 *   INVITE_ONLY — apenas autor, admin e membros (discussion_topic_members)
 *
 * Categorias apenas organizam tópicos — nunca participam na autorização.
 */
class CommunityHardeningTest extends TestCase
{
    use RefreshDatabase;

    // ── Authorization ────────────────────────────────────────────────────────

    public function test_public_topic_is_visible(): void
    {
        $viewer   = $this->createAuthenticatedUser('Viewer User');
        $author   = $this->createAuthenticatedUser('Author User');
        $topic    = $this->createTopic($author, ['visibility' => 'PUBLIC']);

        $list = $this->auth($viewer)->getJson('/api/topics');
        $list->assertOk();
        $this->assertTrue(collect($list->json('data'))->contains(fn (array $item): bool => $item['id'] === $topic->id));

        $show = $this->auth($viewer)->getJson("/api/topics/{$topic->id}");
        $show->assertOk();
    }

    public function test_private_topic_requires_membership(): void
    {
        $viewer = $this->createAuthenticatedUser('External Viewer');
        $author = $this->createAuthenticatedUser('Private Author');
        $topic  = $this->createTopic($author, ['visibility' => 'INVITE_ONLY']);

        $show = $this->auth($viewer)->getJson("/api/topics/{$topic->id}");
        $show->assertNotFound();

        $members = $this->auth($viewer)->getJson("/api/topics/{$topic->id}/members");
        $members->assertNotFound();

        $this->addMember($topic, $viewer);

        $granted = $this->auth($viewer)->getJson("/api/topics/{$topic->id}");
        $granted->assertOk();
    }

    public function test_author_can_always_view(): void
    {
        $author = $this->createAuthenticatedUser('Topic Author');
        $topic  = $this->createTopic($author, ['visibility' => 'INVITE_ONLY']);

        $show = $this->auth($author)->getJson("/api/topics/{$topic->id}");
        $show->assertOk();
    }

    public function test_admin_bypasses_authorization(): void
    {
        $admin  = $this->createAuthenticatedUser('Admin User', 'admin');
        $author = $this->createAuthenticatedUser('Private Author');
        $topic  = $this->createTopic($author, ['visibility' => 'INVITE_ONLY']);

        $show = $this->auth($admin)->getJson("/api/topics/{$topic->id}");
        $show->assertOk();

        $reply = $this->auth($admin)->postJson("/api/topics/{$topic->id}/replies", [
            'content' => 'Resposta de admin',
        ]);
        $reply->assertCreated();
    }

    public function test_member_can_reply(): void
    {
        $member = $this->createAuthenticatedUser('Private Member');
        $author = $this->createAuthenticatedUser('Private Author');
        $topic  = $this->createTopic($author, ['visibility' => 'INVITE_ONLY']);
        $this->addMember($topic, $member);

        $reply = $this->auth($member)->postJson("/api/topics/{$topic->id}/replies", [
            'content' => 'Resposta de membro',
        ]);
        $reply->assertCreated();
    }

    public function test_non_member_cannot_reply(): void
    {
        $outsider = $this->createAuthenticatedUser('Outsider User');
        $author   = $this->createAuthenticatedUser('Private Author');
        $topic    = $this->createTopic($author, ['visibility' => 'INVITE_ONLY']);

        $reply = $this->auth($outsider)->postJson("/api/topics/{$topic->id}/replies", [
            'content' => 'Tentativa externa',
        ]);
        $reply->assertNotFound();
    }

    // ── Search / applyVisibleTopicsFilter ────────────────────────────────────

    public function test_visible_topics_filter_public(): void
    {
        $viewer = $this->createAuthenticatedUser('Filter Viewer');
        $author = $this->createAuthenticatedUser('Filter Author');
        $public = $this->createTopic($author, ['visibility' => 'PUBLIC']);

        $list = $this->auth($viewer)->getJson('/api/topics');
        $list->assertOk();
        $this->assertTrue(collect($list->json('data'))->contains(fn (array $item): bool => $item['id'] === $public->id));
    }

    public function test_visible_topics_filter_private(): void
    {
        $viewer  = $this->createAuthenticatedUser('Filter Viewer');
        $author  = $this->createAuthenticatedUser('Filter Author');
        $private = $this->createTopic($author, ['visibility' => 'INVITE_ONLY']);

        $list = $this->auth($viewer)->getJson('/api/topics');
        $list->assertOk();
        $this->assertFalse(collect($list->json('data'))->contains(fn (array $item): bool => $item['id'] === $private->id));

        $this->addMember($private, $viewer);

        $granted = $this->auth($viewer)->getJson('/api/topics');
        $granted->assertOk();
        $this->assertTrue(collect($granted->json('data'))->contains(fn (array $item): bool => $item['id'] === $private->id));
    }

    public function test_visible_topics_filter_author(): void
    {
        $author  = $this->createAuthenticatedUser('Filter Author');
        $private = $this->createTopic($author, ['visibility' => 'INVITE_ONLY']);

        $list = $this->auth($author)->getJson('/api/topics');
        $list->assertOk();
        $this->assertTrue(collect($list->json('data'))->contains(fn (array $item): bool => $item['id'] === $private->id));
    }

    public function test_visible_topics_filter_admin(): void
    {
        $admin   = $this->createAuthenticatedUser('Filter Admin', 'admin');
        $author  = $this->createAuthenticatedUser('Filter Author');
        $private = $this->createTopic($author, ['visibility' => 'INVITE_ONLY']);

        $list = $this->auth($admin)->getJson('/api/topics');
        $list->assertOk();
        $this->assertTrue(collect($list->json('data'))->contains(fn (array $item): bool => $item['id'] === $private->id));
    }

    // ── Membros: convites geridos pelo autor ─────────────────────────────────

    public function test_invite_only_topic_author_can_invite_and_block_duplicates(): void
    {
        $author = $this->createAuthenticatedUser('Invite Author');
        $topic  = $this->createTopic($author, ['visibility' => 'INVITE_ONLY']);

        $invitee = $this->createAuthenticatedUser('Invitee User');

        $first = $this->auth($author)->postJson("/api/topics/{$topic->id}/members", [
            'user_id' => $invitee->id,
        ]);
        $first->assertCreated();

        $duplicate = $this->auth($author)->postJson("/api/topics/{$topic->id}/members", [
            'user_id' => $invitee->id,
        ]);
        $duplicate->assertStatus(409);
    }

    public function test_member_cannot_invite_or_remove_other_members(): void
    {
        $author = $this->createAuthenticatedUser('Author User');
        $member = $this->createAuthenticatedUser('Member User');
        $other  = $this->createAuthenticatedUser('Other Member');
        $topic  = $this->createTopic($author, ['visibility' => 'INVITE_ONLY']);

        $this->addMember($topic, $member);
        $this->addMember($topic, $other);

        $invitee = $this->createAuthenticatedUser('Invitee User');

        $invite = $this->auth($member)->postJson("/api/topics/{$topic->id}/members", [
            'user_id' => $invitee->id,
        ]);
        $invite->assertForbidden();

        $remove = $this->auth($member)->deleteJson("/api/topics/{$topic->id}/members/{$other->id}");
        $remove->assertForbidden();
    }

    public function test_author_cannot_be_removed_from_topic(): void
    {
        $admin  = $this->createAuthenticatedUser('Admin User', 'admin');
        $author = $this->createAuthenticatedUser('Author User');
        $topic  = $this->createTopic($author, ['visibility' => 'INVITE_ONLY'], withAuthorMember: true);

        $remove = $this->auth($admin)->deleteJson("/api/topics/{$topic->id}/members/{$author->id}");
        $remove->assertStatus(422);
    }

    // ── Join / Leave ─────────────────────────────────────────────────────────

    public function test_join_private_topic(): void
    {
        $author = $this->createAuthenticatedUser('Join Author');
        $member = $this->createAuthenticatedUser('Join Member');
        $topic  = $this->createTopic($author, ['visibility' => 'INVITE_ONLY']);
        $this->addMember($topic, $member);

        $join = $this->auth($member)->postJson("/api/topics/{$topic->id}/join");
        $join->assertOk()
            ->assertJsonPath('message', 'Topic joined successfully.');
    }

    public function test_leave_private_topic(): void
    {
        $author = $this->createAuthenticatedUser('Leave Author');
        $member = $this->createAuthenticatedUser('Leave Member');
        $topic  = $this->createTopic($author, ['visibility' => 'INVITE_ONLY']);
        $this->addMember($topic, $member);

        $leave = $this->auth($member)->postJson("/api/topics/{$topic->id}/leave");
        $leave->assertOk();

        $this->assertDatabaseMissing('discussion_topic_members', [
            'topic_id' => $topic->id,
            'user_id'  => $member->id,
        ]);
    }

    public function test_cannot_join_public_topic(): void
    {
        $author = $this->createAuthenticatedUser('Public Author');
        $viewer = $this->createAuthenticatedUser('Public Viewer');
        $topic  = $this->createTopic($author, ['visibility' => 'PUBLIC']);

        $join = $this->auth($viewer)->postJson("/api/topics/{$topic->id}/join");
        $join->assertForbidden();
    }

    public function test_author_cannot_join_own_topic(): void
    {
        $author = $this->createAuthenticatedUser('Self Author');
        $topic  = $this->createTopic($author, ['visibility' => 'INVITE_ONLY'], withAuthorMember: true);

        $join = $this->auth($author)->postJson("/api/topics/{$topic->id}/join");
        $join->assertForbidden();
    }

    // ── Visitantes (sem sessão) ──────────────────────────────────────────────

    public function test_guest_can_list_only_public_topics(): void
    {
        $author  = $this->createAuthenticatedUser('Guest Author');
        $public  = $this->createTopic($author, ['visibility' => 'PUBLIC']);
        $private = $this->createTopic($author, ['visibility' => 'INVITE_ONLY']);

        $list = $this->getJson('/api/topics');
        $list->assertOk();

        $ids = collect($list->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($public->id));
        $this->assertFalse($ids->contains($private->id));
    }

    public function test_guest_can_view_public_topic_and_replies(): void
    {
        $author = $this->createAuthenticatedUser('Guest Author');
        $topic  = $this->createTopic($author, ['visibility' => 'PUBLIC']);

        $show = $this->getJson("/api/topics/{$topic->id}");
        $show->assertOk()
            ->assertJsonPath('data.id', $topic->id);

        $replies = $this->getJson("/api/topics/{$topic->id}/replies");
        $replies->assertOk();
    }

    public function test_guest_cannot_view_private_topic(): void
    {
        $author = $this->createAuthenticatedUser('Guest Author');
        $topic  = $this->createTopic($author, ['visibility' => 'INVITE_ONLY']);

        $show = $this->getJson("/api/topics/{$topic->id}");
        $show->assertNotFound();
    }

    public function test_guest_cannot_reply_or_react(): void
    {
        $author = $this->createAuthenticatedUser('Guest Author');
        $topic  = $this->createTopic($author, ['visibility' => 'PUBLIC']);

        $this->postJson("/api/topics/{$topic->id}/replies", ['content' => 'Tentativa de visitante'])
            ->assertUnauthorized();

        $this->postJson("/api/topics/{$topic->id}/like")->assertUnauthorized();
        $this->postJson("/api/topics/{$topic->id}/follow")->assertUnauthorized();
    }

    // ── Categories ───────────────────────────────────────────────────────────

    public function test_category_has_no_authorization_logic(): void
    {
        // A tabela category_members deixou de existir — categorias não têm membros.
        $this->assertFalse(\Illuminate\Support\Facades\Schema::hasTable('category_members'));

        // Um tópico PUBLIC é visível a qualquer autenticado, independentemente
        // de qualquer relação do utilizador com a categoria.
        $viewer = $this->createAuthenticatedUser('Category Viewer');
        $author = $this->createAuthenticatedUser('Category Author');
        $topic  = $this->createTopic($author, ['visibility' => 'PUBLIC']);

        $show = $this->auth($viewer)->getJson("/api/topics/{$topic->id}");
        $show->assertOk();
    }

    public function test_category_visibility_value_is_rejected(): void
    {
        $author = $this->createAuthenticatedUser('Legacy Author');
        $category = CommunityCategory::factory()->create(['is_active' => true]);

        $response = $this->auth($author)->postJson('/api/topics', [
            'category_id' => $category->id,
            'title'       => 'Tópico legado',
            'content'     => 'CATEGORY já não é um valor válido',
            'visibility'  => 'CATEGORY',
        ]);

        $response->assertStatus(422);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private function createAuthenticatedUser(string $name, string $role = 'estudante'): User
    {
        $user = User::factory()->create([
            'role'           => $role,
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

    private function createTopic(User $author, array $overrides = [], bool $withAuthorMember = false): DiscussionTopic
    {
        $topic = DiscussionTopic::factory()->create(array_merge([
            'author_id'   => $author->id,
            'category_id' => CommunityCategory::factory()->create(['is_active' => true])->id,
            'status'      => 'published',
            'visibility'  => 'PUBLIC',
        ], $overrides));

        if ($withAuthorMember) {
            $this->addMember($topic, $author);
        }

        return $topic;
    }

    private function addMember(DiscussionTopic $topic, User $user): DiscussionTopicMember
    {
        return DiscussionTopicMember::query()->create([
            'id'         => (string) Str::uuid(),
            'topic_id'   => $topic->id,
            'user_id'    => $user->id,
            'joined_at'  => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
