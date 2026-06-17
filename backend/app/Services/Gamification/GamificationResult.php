<?php

namespace App\Services\Gamification;

final class GamificationResult
{
    /**
     * @param  list<array<string, mixed>>  $transactions
     * @param  list<object>  $badgesEarned
     */
    public function __construct(
        public readonly int $pointsDelta,
        public readonly int $totalPoints,
        public readonly int $currentLevel,
        public readonly bool $levelChanged,
        public readonly ?int $previousLevel,
        public readonly array $transactions = [],
        public readonly array $badgesEarned = [],
    ) {}

    public function toArray(): array
    {
        return [
            'points_delta' => $this->pointsDelta,
            'total_points' => $this->totalPoints,
            'current_level' => $this->currentLevel,
            'level_changed' => $this->levelChanged,
            'previous_level' => $this->previousLevel,
            'transactions' => $this->transactions,
            'badges_earned' => $this->badgesEarned,
        ];
    }
}
