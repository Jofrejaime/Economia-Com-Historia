<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class ModerationAdminTest extends TestCase
{
    use RefreshDatabase;

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function createAdmin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    private function createStudent(): User
    {
        return User::factory()->create(['role' => 'student', 'is_active' => true]);
    }

    private function actingAsAdmin(): array
    {
        $admin = $this->createAdmin();
        $token = $this->loginUser($admin);
        return [$admin, $token];
    }

    private function loginUser(User $user): string
    {
        $token = Str::random(80);
        DB::table('user_sessions')->insert([
            'id'            => Str::uuid(),
            'user_id'       => $user->id,
            'refresh_token' => $token,
            'expires_at'    => now()->addDays(1),
            'created_at'    => now(),
        ]);
        return $token;
    }

    private function createReport(string $reporterId, string $contentType = 'topic'): object
    {
        // Create content first
        if ($contentType === 'topic') {
            $category = DB::table('community_categories')->first();
            if (!$category) {
                $catId = Str::uuid();
                DB::table('community_categories')->insert([
                    'id'         => $catId,
                    'slug'       => 'test-cat-' . Str::random(4),
                    'name'       => 'Test Category',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $category = DB::table('community_categories')->where('id', $catId)->first();
            }
            $contentId = Str::uuid();
            DB::table('discussion_topics')->insert([
                'id'           => $contentId,
                'category_id'  => $category->id,
                'author_id'    => $reporterId,
                'title'        => 'Test Topic',
                'content'      => 'Test content',
                'visibility'   => 'PUBLIC',
                'status'       => 'published',
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
        } else {
            $contentId = Str::uuid();
        }

        $reportId = Str::uuid();
        DB::table('content_reports')->insert([
            'id'           => $reportId,
            'reporter_id'  => $reporterId,
            'content_type' => $contentType,
            'content_id'   => $contentId,
            'reason'       => 'spam',
            'description'  => 'This is spam.',
            'status'       => 'pending',
            'created_at'   => now(),
        ]);
        return DB::table('content_reports')->where('id', $reportId)->first();
    }

    // ─── Report Tests ─────────────────────────────────────────────────────────

    public function test_admin_can_list_reports(): void
    {
        [$admin, $token] = $this->actingAsAdmin();
        $student = $this->createStudent();
        $this->createReport($student->id);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson('/api/admin/reports');

        $response->assertOk()
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_admin_can_review_report(): void
    {
        [$admin, $token] = $this->actingAsAdmin();
        $student = $this->createStudent();
        $report = $this->createReport($student->id);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->patchJson("/api/admin/reports/{$report->id}", [
                'status'      => 'reviewed',
                'action_taken' => 'Content was reviewed and found acceptable.',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'reviewed');
    }

    public function test_admin_can_warn_user(): void
    {
        [$admin, $token] = $this->actingAsAdmin();
        $student = $this->createStudent();
        $report = $this->createReport($student->id);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->postJson("/api/admin/reports/{$report->id}/action", [
                'action' => 'warn',
                'reason' => 'First warning for spam.',
            ]);

        $response->assertOk()
            ->assertJsonPath('action', 'warn');
    }

    public function test_admin_can_delete_reported_content(): void
    {
        [$admin, $token] = $this->actingAsAdmin();
        $student = $this->createStudent();
        $report = $this->createReport($student->id);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->postJson("/api/admin/reports/{$report->id}/action", [
                'action' => 'delete',
                'reason' => 'Persistent spam.',
            ]);

        $response->assertOk()
            ->assertJsonPath('action', 'delete');
    }

    public function test_admin_can_dismiss_report(): void
    {
        [$admin, $token] = $this->actingAsAdmin();
        $student = $this->createStudent();
        $report = $this->createReport($student->id);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->postJson("/api/admin/reports/{$report->id}/action", [
                'action' => 'dismiss',
                'reason' => 'Report not valid.',
            ]);

        $response->assertOk()
            ->assertJsonPath('action', 'dismiss');
    }

    public function test_non_admin_cannot_access_moderation(): void
    {
        $student = $this->createStudent();
        $token = $this->loginUser($student);

        $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson('/api/admin/reports')
            ->assertStatus(403);
    }
}
