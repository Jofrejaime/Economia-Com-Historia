<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\GamificationService;
use App\Support\PointTransactionReason;
use Database\Seeders\BadgesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Tests\TestCase;

class GamificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(BadgesSeeder::class);
    }

    private function userWithLevel(): User
    {
        $user = User::factory()->create();

        DB::table('user_levels')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'current_level' => 1,
            'total_points' => 0,
            'weekly_points' => 0,
            'monthly_points' => 0,
            'quizzes_completed' => 0,
            'documents_read' => 0,
            'topics_created' => 0,
            'replies_posted' => 0,
            'updated_at' => now(),
        ]);

        return $user;
    }

    public function test_award_points_creates_transaction_and_updates_balance(): void
    {
        $user = $this->userWithLevel();
        $service = app(GamificationService::class);

        $result = $service->awardPoints(
            $user,
            50,
            PointTransactionReason::ADMIN_ADJUSTMENT,
            description: 'Test bonus',
        );

        $this->assertSame(50, $result->pointsDelta);
        $this->assertSame(50, $result->totalPoints);

        $this->assertDatabaseHas('point_transactions', [
            'user_id' => $user->id,
            'points' => 50,
            'reason' => PointTransactionReason::ADMIN_ADJUSTMENT,
        ]);

        $this->assertDatabaseHas('user_levels', [
            'user_id' => $user->id,
            'total_points' => 50,
        ]);
    }

    public function test_deduct_points_reduces_balance(): void
    {
        $user = $this->userWithLevel();
        $service = app(GamificationService::class);

        $service->awardPoints($user, 100, PointTransactionReason::ADMIN_ADJUSTMENT);
        $result = $service->deductPoints($user, 30, 'Correction');

        $this->assertSame(-30, $result->pointsDelta);
        $this->assertSame(70, $result->totalPoints);
    }

    public function test_deduct_points_fails_when_balance_insufficient(): void
    {
        $user = $this->userWithLevel();
        $service = app(GamificationService::class);

        $this->expectException(InvalidArgumentException::class);
        $service->deductPoints($user, 10);
    }

    public function test_calculate_level_returns_highest_matching_definition(): void
    {
        $service = app(GamificationService::class);

        $level = $service->calculateLevel(150);

        $this->assertNotNull($level);
        $this->assertSame(2, (int) $level->level);
    }

    public function test_update_level_promotes_user_and_evaluates_badges(): void
    {
        $user = $this->userWithLevel();
        $service = app(GamificationService::class);

        DB::table('user_levels')->where('user_id', $user->id)->update([
            'quizzes_completed' => 1,
            'total_points' => 0,
        ]);

        $result = $service->updateLevel($user);

        $this->assertNotEmpty($result->badgesEarned);
        $this->assertDatabaseHas('user_badges', ['user_id' => $user->id]);
    }

    public function test_evaluate_badges_does_not_duplicate(): void
    {
        $user = $this->userWithLevel();
        $service = app(GamificationService::class);

        DB::table('user_levels')->where('user_id', $user->id)->update(['quizzes_completed' => 1]);

        $first = $service->evaluateBadges($user);
        $second = $service->evaluateBadges($user);

        $this->assertCount(1, $first);
        $this->assertCount(0, $second);

        $this->assertSame(
            1,
            DB::table('user_badges')->where('user_id', $user->id)->count()
        );
    }

    public function test_reconcile_user_points_fixes_drift(): void
    {
        $user = $this->userWithLevel();
        $service = app(GamificationService::class);

        DB::table('point_transactions')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'points' => 25,
            'reason' => PointTransactionReason::ADMIN_ADJUSTMENT,
            'created_at' => now(),
        ]);

        DB::table('user_levels')->where('user_id', $user->id)->update(['total_points' => 0]);

        $total = $service->reconcileUserPoints($user);

        $this->assertSame(25, $total);
        $this->assertDatabaseHas('user_levels', [
            'user_id' => $user->id,
            'total_points' => 25,
        ]);
    }

    public function test_point_transactions_history_endpoint(): void
    {
        $user = $this->userWithLevel();
        $token = $this->issueToken($user);

        app(GamificationService::class)->awardPoints(
            $user,
            15,
            PointTransactionReason::ADMIN_ADJUSTMENT,
        );

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/me/point-transactions')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    private function issueToken(User $user): string
    {
        $token = Str::random(80);

        DB::table('user_sessions')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'refresh_token' => $token,
            'expires_at' => now()->addDays(30),
            'created_at' => now(),
        ]);

        return $token;
    }
}
