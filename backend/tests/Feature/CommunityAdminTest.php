<?php

namespace Tests\Feature;

use App\Models\CommunityCategory;
use App\Models\DiscussionTopic;
use App\Models\DiscussionTopicMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommunityAdminTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $student;
    private string $adminToken;
    private string $studentToken;
    private CommunityCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->student = User::factory()->create(['role' => 'estudante']);

        // Logins
        $responseAdmin = $this->postJson('/api/auth/login', [
            'email' => $this->admin->email,
            'password' => 'password',
        ]);
        $this->adminToken = $responseAdmin->json('token');

        $responseStudent = $this->postJson('/api/auth/login', [
            'email' => $this->student->email,
            'password' => 'password',
        ]);
        $this->studentToken = $responseStudent->json('token');

        $this->category = CommunityCategory::factory()->create([
            'is_active' => true,
        ]);
    }

    public function test_user_can_join_topic(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->admin->id,
            'visibility' => 'INVITE_ONLY',
        ]);

        // Convite = membro imediato (Sprint 18.5.1); join confirma a participação.
        DiscussionTopicMember::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'topic_id' => $topic->id,
            'user_id' => $this->student->id,
            'joined_at' => now(),
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->studentToken}"])
            ->postJson("/api/topics/{$topic->id}/join");

        $response->assertOk()
            ->assertJsonPath('message', 'Topic joined successfully.');

        $this->assertDatabaseHas('discussion_topic_members', [
            'topic_id' => $topic->id,
            'user_id' => $this->student->id,
        ]);
    }

    public function test_user_can_leave_topic(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->admin->id,
            'visibility' => 'INVITE_ONLY',
        ]);

        DiscussionTopicMember::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'topic_id' => $topic->id,
            'user_id' => $this->student->id,
            'joined_at' => now(),
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->studentToken}"])
            ->postJson("/api/topics/{$topic->id}/leave");

        $response->assertOk()
            ->assertJsonPath('message', 'Topic left successfully.');

        $this->assertDatabaseMissing('discussion_topic_members', [
            'topic_id' => $topic->id,
            'user_id' => $this->student->id,
        ]);
    }

    public function test_admin_can_list_topics(): void
    {
        DiscussionTopic::factory()->count(3)->create([
            'category_id' => $this->category->id,
            'author_id' => $this->student->id,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->getJson('/api/admin/topics');

        $response->assertOk()
            ->assertJsonStructure(['data' => [['id', 'title', 'content', 'locked']]]);
    }

    public function test_admin_can_filter_topics(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->student->id,
            'title' => 'Specific search target title',
        ]);

        DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->student->id,
            'title' => 'Unrelated topic',
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->getJson('/api/admin/topics?search=Specific');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $topic->id);
    }

    public function test_admin_can_view_topic(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->student->id,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->getJson("/api/admin/topics/{$topic->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $topic->id);
    }

    public function test_admin_cannot_edit_topic_content_but_can_moderate_status(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->student->id,
            'title' => 'Original title',
            'status' => 'published',
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->patchJson("/api/admin/topics/{$topic->id}", [
                'title' => 'Admin overwritten title',
                'status' => 'locked',
            ]);

        $response->assertOk();

        // O admin modera o estado, mas não edita o conteúdo (título/corpo) da
        // discussão de outro utilizador.
        $this->assertDatabaseHas('discussion_topics', [
            'id' => $topic->id,
            'title' => 'Original title',
            'status' => 'locked',
        ]);
    }

    public function test_admin_can_delete_topic(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->student->id,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->deleteJson("/api/admin/topics/{$topic->id}");

        $response->assertOk()
            ->assertJsonPath('message', 'Topic deleted successfully.');

        $this->assertDatabaseMissing('discussion_topics', ['id' => $topic->id]);
    }

    public function test_admin_can_pin_topic(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->student->id,
            'pinned' => false,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->patchJson("/api/admin/topics/{$topic->id}/pin");

        $response->assertOk()
            ->assertJsonPath('data.pinned', true);

        $this->assertTrue($topic->fresh()->pinned);
    }

    public function test_admin_can_lock_topic(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->student->id,
            'locked' => false,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->patchJson("/api/admin/topics/{$topic->id}/lock");

        $response->assertOk()
            ->assertJsonPath('data.locked', true);

        $this->assertNotNull($response->json('data.closed_at'));
        $this->assertTrue($topic->fresh()->locked);
    }

    public function test_admin_can_unlock_topic(): void
    {
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->student->id,
            'locked' => true,
        ]);

        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->patchJson("/api/admin/topics/{$topic->id}/unlock");

        $response->assertOk()
            ->assertJsonPath('data.locked', false);

        $this->assertFalse($topic->fresh()->locked);
    }

    public function test_admin_can_list_categories(): void
    {
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->getJson('/api/admin/community/categories');

        $response->assertOk()
            ->assertJsonStructure(['data' => [['id', 'name', 'slug']]]);
    }

    public function test_admin_can_create_category(): void
    {
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->postJson('/api/admin/community/categories', [
                'slug' => 'nova-categoria-admin',
                'name' => 'Nova Categoria Admin',
                'description' => 'Descrição da nova categoria admin',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.slug', 'nova-categoria-admin');

        $this->assertDatabaseHas('community_categories', [
            'slug' => 'nova-categoria-admin',
        ]);
    }

    public function test_admin_can_update_category(): void
    {
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->patchJson("/api/admin/community/categories/{$this->category->id}", [
                'name' => 'Nome da Categoria Alterado',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Nome da Categoria Alterado');

        $this->assertDatabaseHas('community_categories', [
            'id' => $this->category->id,
            'name' => 'Nome da Categoria Alterado',
        ]);
    }

    public function test_admin_can_delete_category(): void
    {
        $response = $this->withHeaders(['Authorization' => "Bearer {$this->adminToken}"])
            ->deleteJson("/api/admin/community/categories/{$this->category->id}");

        $response->assertOk()
            ->assertJsonPath('message', 'Category deleted successfully.');

        $this->assertDatabaseMissing('community_categories', ['id' => $this->category->id]);
    }

    public function test_non_admin_cannot_access_admin_endpoints(): void
    {
        // Category List (Admin)
        $response1 = $this->withHeaders(['Authorization' => "Bearer {$this->studentToken}"])
            ->getJson('/api/admin/community/categories');
        $response1->assertForbidden();

        // Topic List (Admin)
        $response2 = $this->withHeaders(['Authorization' => "Bearer {$this->studentToken}"])
            ->getJson('/api/admin/topics');
        $response2->assertForbidden();

        // Topic Lock (Admin)
        $topic = DiscussionTopic::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->student->id,
        ]);
        $response3 = $this->withHeaders(['Authorization' => "Bearer {$this->studentToken}"])
            ->patchJson("/api/admin/topics/{$topic->id}/lock");
        $response3->assertForbidden();
    }
}
