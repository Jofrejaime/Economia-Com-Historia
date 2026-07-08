<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\PointTransactionReason;
use Database\Seeders\BadgesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class DocumentLikeGamificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(BadgesSeeder::class);
    }

    private function registerStudent(string $email = 'student@example.com'): array
    {
        Mail::fake();

        $response = $this->postJson('/api/auth/register', [
            'email' => $email,
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Student User',
        ]);

        return [
            'token' => $response->json('token'),
            'user' => User::query()->where('email', $email)->first(),
        ];
    }

    private function seedPublishedDocument(string $title): string
    {
        $id = (string) Str::uuid();

        DB::table('documents')->insert([
            'id' => $id,
            'title' => $title,
            'slug' => Str::slug($title).'-'.Str::lower(Str::random(4)),
            'author' => 'Test Author',
            'summary' => 'Summary',
            'document_type' => 'article',
            'academic_level' => 'intro',
            'status' => 'published',
            'created_by' => User::factory()->create()->id,
            'published_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    public function test_liking_document_awards_points(): void
    {
        $student = $this->registerStudent();
        $docId = $this->seedPublishedDocument('ANGOLA ECONOMY');

        $response = $this->withHeader('Authorization', "Bearer {$student['token']}")
            ->postJson("/api/documents/{$docId}/like")
            ->assertOk();

        $response->assertJsonPath('gamification.points_delta', 5);

        $this->assertDatabaseHas('point_transactions', [
            'user_id' => $student['user']->id,
            'reason' => PointTransactionReason::DOCUMENT_LIKED,
            'reference_id' => $docId,
            'reference_type' => 'document',
        ]);

        $this->assertDatabaseHas('user_levels', [
            'user_id' => $student['user']->id,
            'total_points' => 5,
        ]);
    }

    public function test_liking_same_document_twice_fails_and_does_not_duplicate_points(): void
    {
        $student = $this->registerStudent();
        $docId = $this->seedPublishedDocument('ANGOLA ECONOMY');

        $this->withHeader('Authorization', "Bearer {$student['token']}")
            ->postJson("/api/documents/{$docId}/like")
            ->assertOk();

        $this->withHeader('Authorization', "Bearer {$student['token']}")
            ->postJson("/api/documents/{$docId}/like")
            ->assertStatus(409);

        $this->assertSame(
            1,
            DB::table('point_transactions')
                ->where('user_id', $student['user']->id)
                ->where('reason', PointTransactionReason::DOCUMENT_LIKED)
                ->count()
        );

        $this->assertDatabaseHas('user_levels', [
            'user_id' => $student['user']->id,
            'total_points' => 5,
        ]);
    }
}
