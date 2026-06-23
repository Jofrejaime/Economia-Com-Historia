<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class LeaderboardTest extends TestCase
{
    use RefreshDatabase;

    // ──────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────

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

    private function createUserWithLevel(?string $province = null, int $points = 100, int $quizzes = 5): User
    {
        $user = User::factory()->create();

        // UserFactory cria apenas o registo em `users`.
        // user_profiles e user_levels têm de ser inseridos explicitamente.
        DB::table('user_profiles')->insertOrIgnore([
            'id'           => (string) Str::uuid(),
            'user_id'      => $user->id,
            'display_name' => fake()->name(),
            'province'     => $province,
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        DB::table('user_levels')->insertOrIgnore([
            'id'                => (string) Str::uuid(),
            'user_id'           => $user->id,
            'current_level'     => 1,
            'total_points'      => $points,
            'weekly_points'     => (int) ($points * 0.1),
            'monthly_points'    => (int) ($points * 0.3),
            'quizzes_completed' => $quizzes,
            'documents_read'    => 0,
            'topics_created'    => 0,
            'replies_posted'    => 0,
            'updated_at'        => now(),
        ]);

        return $user;
    }

    private function seedNationalCache(array $users): void
    {
        foreach ($users as $i => $entry) {
            ['user' => $user, 'points' => $points, 'quizzes' => $quizzes, 'province' => $province] = $entry;

            $profile = DB::table('user_profiles')->where('user_id', $user->id)->first();

            DB::table('leaderboard_nacional_cache')->insertOrIgnore([
                'rank_position'     => $i + 1,
                'user_id'           => $user->id,
                'display_name'      => $profile->display_name ?? 'User ' . ($i + 1),
                'province'          => $province,
                'avatar_url'        => null,
                'total_points'      => $points,
                'quizzes_completed' => $quizzes,
                'weekly_points'     => 10,
                'current_level'     => 1,
                'prev_rank'         => $i + 1,
                'refreshed_at'      => now(),
            ]);
        }
    }

    private function seedSnapshot(User $user, int $rank = 1, string $scope = 'nacional', ?string $province = null): void
    {
        DB::table('leaderboard_snapshots')->insert([
            'id'                => (string) Str::uuid(),
            'user_id'           => $user->id,
            'snapshot_date'     => now()->toDateString(),
            'scope'             => $scope,
            'province'          => $province,
            'rank_position'     => $rank,
            'total_points'      => 200,
            'quizzes_completed' => 10,
            'accuracy_pct'      => 85.50,
            'created_at'        => now(),
        ]);
    }

    // ──────────────────────────────────────────────
    // Testes: Leaderboard Nacional
    // ──────────────────────────────────────────────

    public function test_can_view_national_leaderboard(): void
    {
        $user  = $this->createUserWithLevel('Luanda', 500, 20);
        $token = $this->issueToken($user);

        $this->seedNationalCache([
            ['user' => $user, 'points' => 500, 'quizzes' => 20, 'province' => 'Luanda'],
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/leaderboard/national')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_national_leaderboard_requires_authentication(): void
    {
        $this->getJson('/api/leaderboard/national')
            ->assertUnauthorized();
    }

    public function test_national_leaderboard_is_ordered_by_rank(): void
    {
        $userA = $this->createUserWithLevel('Luanda',  500, 20);
        $userB = $this->createUserWithLevel('Benguela', 300, 10);
        $token = $this->issueToken($userA);

        $this->seedNationalCache([
            ['user' => $userA, 'points' => 500, 'quizzes' => 20, 'province' => 'Luanda'],
            ['user' => $userB, 'points' => 300, 'quizzes' => 10, 'province' => 'Benguela'],
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/leaderboard/national')
            ->assertOk();

        $data = $response->json('data');
        $this->assertCount(2, $data);
        $this->assertSame(1, $data[0]['rank_position']);
        $this->assertSame(2, $data[1]['rank_position']);
    }

    // ──────────────────────────────────────────────
    // Testes: Leaderboard Provincial
    // ──────────────────────────────────────────────

    public function test_can_view_provincial_leaderboard(): void
    {
        $user  = $this->createUserWithLevel('Luanda', 400, 15);
        $token = $this->issueToken($user);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/leaderboard/provincial?province=Luanda')
            ->assertOk()
            ->assertJsonStructure([
                'data',
                'province',
                'pagination' => ['total', 'per_page', 'current_page', 'last_page'],
            ]);
    }

    public function test_provincial_leaderboard_requires_authentication(): void
    {
        $this->getJson('/api/leaderboard/provincial?province=Luanda')
            ->assertUnauthorized();
    }

    public function test_provincial_leaderboard_requires_province_param(): void
    {
        $user  = $this->createUserWithLevel('Luanda', 100, 5);
        $token = $this->issueToken($user);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/leaderboard/provincial')
            ->assertStatus(422)
            ->assertJsonFragment(['message' => 'O parâmetro province é obrigatório.']);
    }

    public function test_provincial_leaderboard_filters_by_province(): void
    {
        $userLuanda   = $this->createUserWithLevel('Luanda',   500, 20);
        $userBenguela = $this->createUserWithLevel('Benguela', 300, 10);
        $token        = $this->issueToken($userLuanda);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/leaderboard/provincial?province=Luanda')
            ->assertOk();

        $data     = $response->json('data');
        $province = $response->json('province');

        $this->assertSame('Luanda', $province);

        foreach ($data as $entry) {
            $this->assertSame('Luanda', $entry['province']);
        }

        $benguelaIds = collect($data)->pluck('user_id');
        $this->assertNotContains($userBenguela->id, $benguelaIds);
    }

    public function test_provincial_leaderboard_is_ordered_by_score_desc(): void
    {
        $userA = $this->createUserWithLevel('Luanda', 800, 30);
        $userB = $this->createUserWithLevel('Luanda', 400, 15);
        $userC = $this->createUserWithLevel('Luanda', 200,  5);
        $token = $this->issueToken($userA);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/leaderboard/provincial?province=Luanda')
            ->assertOk();

        $data = $response->json('data');
        $this->assertGreaterThanOrEqual(3, count($data));

        $points = collect($data)->pluck('total_points')->values()->all();
        for ($i = 0; $i < count($points) - 1; $i++) {
            $this->assertGreaterThanOrEqual($points[$i + 1], $points[$i]);
        }
    }

    public function test_provincial_leaderboard_returns_empty_for_unknown_province(): void
    {
        $user  = $this->createUserWithLevel('Luanda', 100, 5);
        $token = $this->issueToken($user);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/leaderboard/provincial?province=Atlantida')
            ->assertOk();

        $this->assertSame(0, $response->json('pagination.total'));
        $this->assertEmpty($response->json('data'));
    }

    public function test_provincial_leaderboard_pagination(): void
    {
        $anchor = $this->createUserWithLevel('Huambo', 900, 40);

        for ($i = 0; $i < 4; $i++) {
            $this->createUserWithLevel('Huambo', 100 + $i * 10, $i + 1);
        }

        $token = $this->issueToken($anchor);

        $responsePage1 = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/leaderboard/provincial?province=Huambo&per_page=3&page=1')
            ->assertOk();

        $this->assertSame(3, count($responsePage1->json('data')));
        $this->assertSame(1, $responsePage1->json('pagination.current_page'));
        $this->assertSame(5, $responsePage1->json('pagination.total'));
        $this->assertSame(2, $responsePage1->json('pagination.last_page'));

        $responsePage2 = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/leaderboard/provincial?province=Huambo&per_page=3&page=2')
            ->assertOk();

        $this->assertSame(2, count($responsePage2->json('data')));
        $this->assertSame(2, $responsePage2->json('pagination.current_page'));
    }

    // ──────────────────────────────────────────────
    // Testes: Snapshots
    // ──────────────────────────────────────────────

    public function test_can_view_snapshots(): void
    {
        $user  = $this->createUserWithLevel('Luanda', 200, 8);
        $token = $this->issueToken($user);

        $this->seedSnapshot($user, rank: 1, scope: 'nacional');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/leaderboard/snapshots')
            ->assertOk()
            ->assertJsonStructure(['data'])
            ->assertJsonCount(1, 'data');
    }

    public function test_snapshots_require_authentication(): void
    {
        $this->getJson('/api/leaderboard/snapshots')
            ->assertUnauthorized();
    }

    public function test_snapshots_ordered_by_date_desc(): void
    {
        $user  = $this->createUserWithLevel('Luanda', 300, 10);
        $token = $this->issueToken($user);

        // Insere dois snapshots com datas diferentes
        DB::table('leaderboard_snapshots')->insert([
            'id'                => (string) Str::uuid(),
            'user_id'           => $user->id,
            'snapshot_date'     => now()->subDays(2)->toDateString(),
            'scope'             => 'nacional',
            'province'          => null,
            'rank_position'     => 5,
            'total_points'      => 100,
            'quizzes_completed' => 3,
            'accuracy_pct'      => null,
            'created_at'        => now()->subDays(2),
        ]);

        DB::table('leaderboard_snapshots')->insert([
            'id'                => (string) Str::uuid(),
            'user_id'           => $user->id,
            'snapshot_date'     => now()->toDateString(),
            'scope'             => 'nacional',
            'province'          => null,
            'rank_position'     => 3,
            'total_points'      => 300,
            'quizzes_completed' => 10,
            'accuracy_pct'      => 85.50,
            'created_at'        => now(),
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/leaderboard/snapshots')
            ->assertOk();

        $dates = collect($response->json('data'))->pluck('snapshot_date')->values()->all();
        $this->assertGreaterThanOrEqual($dates[1], $dates[0]);
    }

    // ──────────────────────────────────────────────
    // Testes: Province Stats
    // ──────────────────────────────────────────────

    public function test_can_view_province_stats(): void
    {
        $user  = $this->createUserWithLevel('Luanda', 300, 12);
        $token = $this->issueToken($user);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/stats/provinces')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_province_stats_require_authentication(): void
    {
        $this->getJson('/api/stats/provinces')
            ->assertUnauthorized();
    }
}
