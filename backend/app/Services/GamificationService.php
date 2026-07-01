<?php

namespace App\Services;

use App\Models\User;
use App\Services\Gamification\GamificationResult;
use App\Services\NotificationService;
use App\Services\LeaderboardService;
use App\Support\PointTransactionReason;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;


class GamificationService
{
    public function __construct(
        private readonly NotificationService $notificationService,
    ) {}

    /**
     * Award points (positive) and sync level / badges.
     */
    public function awardPoints(
        User $user,
        int $points,
        string $reason,
        ?string $referenceId = null,
        ?string $referenceType = null,
        ?string $description = null,
    ): GamificationResult {
        if ($points <= 0) {
            throw new InvalidArgumentException('awardPoints expects a positive amount. Use deductPoints for penalties.');
        }

        $this->assertValidReason($reason);

        return $this->applyPointsChange(
            $user,
            $points,
            $reason,
            $referenceId,
            $referenceType,
            $description,
        );
    }

    /**
     * Deduct points via a negative transaction (admin_adjustment).
     */
    public function deductPoints(
        User $user,
        int $points,
        ?string $description = null,
        ?string $referenceId = null,
        ?string $referenceType = null,
    ): GamificationResult {
        if ($points <= 0) {
            throw new InvalidArgumentException('deductPoints expects a positive amount to subtract.');
        }

        return $this->applyPointsChange(
            $user,
            -$points,
            PointTransactionReason::ADMIN_ADJUSTMENT,
            $referenceId,
            $referenceType,
            $description,
        );
    }

    public function calculateLevel(int $totalPoints): ?object
    {
        return DB::table('level_definitions')
            ->where('min_points', '<=', $totalPoints)
            ->orderByDesc('level')
            ->first();
    }

    public function updateLevel(User $user, ?int $totalPoints = null): GamificationResult
    {
        $userLevel = $this->getOrCreateUserLevel($user);
        $total = $totalPoints ?? (int) $userLevel->total_points;
        $definition = $this->calculateLevel($total);

        if ($definition === null) {
            throw new InvalidArgumentException('No level definition found for user points.');
        }

        $previousLevel = (int) $userLevel->current_level;
        $newLevel = (int) $definition->level;

        if ($previousLevel !== $newLevel) {
            DB::table('user_levels')
                ->where('user_id', $user->id)
                ->update([
                    'current_level' => $newLevel,
                    'updated_at' => now(),
                ]);

            // Send notification for level up
            $this->notificationService->send(
                $user,
                'level_up',
                'Level Up!',
                "Congratulations! You have reached Level {$newLevel}. Keep going!",
                (string) $newLevel,
                'level'
            );
        }

        $badgesEarned = $this->evaluateBadges($user);

        $updated = $this->getOrCreateUserLevel($user);

        return new GamificationResult(
            pointsDelta: 0,
            totalPoints: (int) $updated->total_points,
            currentLevel: (int) $updated->current_level,
            levelChanged: $previousLevel !== $newLevel,
            previousLevel: $previousLevel !== $newLevel ? $previousLevel : null,
            transactions: [],
            badgesEarned: $badgesEarned,
        );
    }

    /**
     * @return list<object> Newly earned badge rows (with badge details)
     */
    public function evaluateBadges(User $user): array
    {
        $userLevel = $this->getOrCreateUserLevel($user);
        $earned = [];

        $badges = DB::table('badges')->where('is_active', true)->get();

        foreach ($badges as $badge) {
            if ($this->userHasBadge($user->id, $badge->id)) {
                continue;
            }

            if (! $this->badgeCriteriaMet($userLevel, $badge)) {
                continue;
            }

            DB::table('user_badges')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'badge_id' => $badge->id,
                'earned_at' => now(),
                'reference_id' => null,
            ]);

            $earned[] = $badge;

            // Send notification for badge earned
            $this->notificationService->send(
                $user,
                'badge_earned',
                'New Badge Earned!',
                "You have earned the badge: {$badge->name}",
                $badge->id,
                'badge'
            );
        }

        return $earned;
    }

    /**
     * Quiz completion entry point — all gamification side-effects live here.
     */
    public function recordQuizCompletion(
        User $user,
        string $attemptId,
        string $quizId,
        int $correctAnswers,
        int $totalQuestions,
        int $timeSpentSecs,
    ): GamificationResult {
        return DB::transaction(function () use ($user, $attemptId, $quizId, $correctAnswers, $totalQuestions, $timeSpentSecs): GamificationResult {
            $quiz = DB::table('quizzes')->where('id', $quizId)->first();

            if ($quiz === null) {
                throw new InvalidArgumentException('Quiz not found.');
            }

            $alreadyCompleted = DB::table('quiz_attempts')
                ->where('quiz_id', $quizId)
                ->where('user_id', $user->id)
                ->where('status', 'completed')
                ->where('id', '!=', $attemptId)
                ->exists();

            if (!$alreadyCompleted) {
                $this->incrementCounters($user, ['quizzes_completed' => 1]);
            }

            $accuracy = $totalQuestions > 0
                ? (int) round(($correctAnswers / $totalQuestions) * 100)
                : 0;

            $transactions = [];
            $totalDelta = 0;
            $completionPoints = 0;
            $bonusAccuracy = 0;
            $bonusSpeed = 0;

            if (!$alreadyCompleted) {
                $basePoints = (int) $quiz->base_points;
                $completionPoints = (int) max(1, round($basePoints * ($accuracy / 100)));

                $completionTx = $this->applyPointsChange(
                    $user,
                    $completionPoints,
                    PointTransactionReason::QUIZ_COMPLETION,
                    $attemptId,
                    'quiz_attempt',
                    "Quiz completed: {$quiz->title} ({$accuracy}%)",
                    evaluateBadges: false,
                );
                $transactions[] = $completionTx->transactions[0] ?? [];
                $totalDelta += $completionPoints;

                if ($accuracy >= 80 && $totalQuestions > 0) {
                    $bonusAccuracy = (int) max(1, round($basePoints * 0.2));
                    $accuracyTx = $this->applyPointsChange(
                        $user,
                        $bonusAccuracy,
                        PointTransactionReason::QUIZ_BONUS_ACCURACY,
                        $attemptId,
                        'quiz_attempt',
                        'Accuracy bonus (80%+ correct)',
                        evaluateBadges: false,
                    );
                    $transactions[] = $accuracyTx->transactions[0] ?? [];
                    $totalDelta += $bonusAccuracy;
                }

                if ($quiz->time_limit_secs && $timeSpentSecs > 0 && $timeSpentSecs <= ((int) $quiz->time_limit_secs * 0.5)) {
                    $bonusSpeed = (int) max(1, round($basePoints * 0.1));
                    $speedTx = $this->applyPointsChange(
                        $user,
                        $bonusSpeed,
                        PointTransactionReason::QUIZ_BONUS_SPEED,
                        $attemptId,
                        'quiz_attempt',
                        'Speed bonus (under half the time limit)',
                        evaluateBadges: false,
                    );
                    $transactions[] = $speedTx->transactions[0] ?? [];
                    $totalDelta += $bonusSpeed;
                }
            }

            DB::table('quiz_attempts')->where('id', $attemptId)->update([
                'points_earned' => $completionPoints,
                'bonus_points' => $bonusAccuracy + $bonusSpeed,
            ]);

            $levelResult = $this->updateLevel($user);
            $badgesEarned = $levelResult->badgesEarned;

            $userLevel = $this->getOrCreateUserLevel($user);

            return new GamificationResult(
                pointsDelta: $totalDelta,
                totalPoints: (int) $userLevel->total_points,
                currentLevel: (int) $userLevel->current_level,
                levelChanged: $levelResult->levelChanged,
                previousLevel: $levelResult->previousLevel,
                transactions: $transactions,
                badgesEarned: $badgesEarned,
            );
        });
    }

    /**
     * @return Collection<int, object>
     */
    public function pointTransactionHistory(User $user, int $limit = 50): Collection
    {
        return DB::table('point_transactions')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public function reconcileUserPoints(User $user): int
    {
        $sum = (int) DB::table('point_transactions')
            ->where('user_id', $user->id)
            ->sum('points');

        $userLevel = $this->getOrCreateUserLevel($user);

        if ((int) $userLevel->total_points !== $sum) {
            DB::table('user_levels')
                ->where('user_id', $user->id)
                ->update([
                    'total_points' => max(0, $sum),
                    'updated_at' => now(),
                ]);

            $this->updateLevel($user, max(0, $sum));
            app(LeaderboardService::class)->refreshNationalCache();
        }

        return max(0, $sum);
    }

    /**
     * @param  array<string, int>  $counters
     */
    public function incrementCounters(User $user, array $counters): void
    {
        if ($counters === []) {
            return;
        }

        $this->getOrCreateUserLevel($user);

        $allowed = ['quizzes_completed', 'documents_read', 'topics_created', 'replies_posted'];
        $updates = ['updated_at' => now()];

        foreach ($counters as $field => $amount) {
            if (! in_array($field, $allowed, true) || $amount === 0) {
                continue;
            }

            $updates[$field] = DB::raw("{$field} + ".(int) $amount);
        }

        if (count($updates) > 1) {
            DB::table('user_levels')->where('user_id', $user->id)->update($updates);
        }
    }

    private function applyPointsChange(
        User $user,
        int $pointsDelta,
        string $reason,
        ?string $referenceId,
        ?string $referenceType,
        ?string $description,
        bool $evaluateBadges = true,
    ): GamificationResult {
        if ($pointsDelta === 0) {
            throw new InvalidArgumentException('Points delta cannot be zero.');
        }

        return DB::transaction(function () use ($user, $pointsDelta, $reason, $referenceId, $referenceType, $description, $evaluateBadges): GamificationResult {
            $userLevel = $this->getOrCreateUserLevel($user);
            $previousLevel = (int) $userLevel->current_level;

            $newTotal = (int) $userLevel->total_points + $pointsDelta;
            if ($newTotal < 0) {
                throw new InvalidArgumentException('Insufficient points balance.');
            }

            $transactionId = (string) Str::uuid();

            DB::table('point_transactions')->insert([
                'id' => $transactionId,
                'user_id' => $user->id,
                'points' => $pointsDelta,
                'reason' => $reason,
                'reference_id' => $referenceId,
                'reference_type' => $referenceType,
                'description' => $description,
                'created_at' => now(),
            ]);

            $weeklyDelta = $pointsDelta > 0 ? $pointsDelta : 0;
            $monthlyDelta = $pointsDelta > 0 ? $pointsDelta : 0;

            DB::table('user_levels')
                ->where('user_id', $user->id)
                ->update([
                    'total_points' => $newTotal,
                    'weekly_points' => DB::raw('weekly_points + '.$weeklyDelta),
                    'monthly_points' => DB::raw('monthly_points + '.$monthlyDelta),
                    'updated_at' => now(),
                ]);

            $definition = $this->calculateLevel($newTotal);
            $newLevel = $definition ? (int) $definition->level : $previousLevel;

            if ($newLevel !== $previousLevel) {
                DB::table('user_levels')
                    ->where('user_id', $user->id)
                    ->update(['current_level' => $newLevel]);
            }

            $badgesEarned = $evaluateBadges ? $this->evaluateBadges($user) : [];

            $updated = $this->getOrCreateUserLevel($user);

            $transaction = DB::table('point_transactions')->where('id', $transactionId)->first();

            // Refresh national leaderboard cache synchronously
            app(LeaderboardService::class)->refreshNationalCache();

            return new GamificationResult(
                pointsDelta: $pointsDelta,
                totalPoints: (int) $updated->total_points,
                currentLevel: (int) $updated->current_level,
                levelChanged: $previousLevel !== $newLevel,
                previousLevel: $previousLevel !== $newLevel ? $previousLevel : null,
                transactions: [$transaction],
                badgesEarned: $badgesEarned,
            );
        });
    }

    private function getOrCreateUserLevel(User $user): object
    {
        $row = DB::table('user_levels')->where('user_id', $user->id)->first();

        if ($row !== null) {
            return $row;
        }

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

        return DB::table('user_levels')->where('user_id', $user->id)->first();
    }

    private function assertValidReason(string $reason): void
    {
        if (! in_array($reason, PointTransactionReason::all(), true)) {
            throw new InvalidArgumentException("Invalid point transaction reason [{$reason}].");
        }
    }

    private function userHasBadge(string $userId, string $badgeId): bool
    {
        return DB::table('user_badges')
            ->where('user_id', $userId)
            ->where('badge_id', $badgeId)
            ->exists();
    }

    private function badgeCriteriaMet(object $userLevel, object $badge): bool
    {
        $criteria = json_decode($badge->criteria_value, true);

        if (! is_array($criteria)) {
            return false;
        }

        return match ($badge->criteria_type) {
            'quiz_completed' => (int) $userLevel->quizzes_completed >= (int) ($criteria['count'] ?? 0),
            'topic_created' => (int) $userLevel->topics_created >= (int) ($criteria['count'] ?? 0),
            'documents_read' => (int) $userLevel->documents_read >= (int) ($criteria['count'] ?? 0),
            'level_reached' => (int) $userLevel->current_level >= (int) ($criteria['level'] ?? 0),
            default => false,
        };
    }
}
