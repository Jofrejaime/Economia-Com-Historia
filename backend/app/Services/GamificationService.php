<?php

namespace App\Services;

use App\Models\User;

/**
 * Full implementation planned for Sprint 3 (points, levels, badges).
 */
class GamificationService
{
    /**
     * @param  array<string, mixed>  $metadata
     */
    public function awardPoints(
        User $user,
        int $points,
        string $reason,
        ?string $referenceId = null,
        ?string $referenceType = null,
        ?string $description = null,
        array $metadata = [],
    ): void {
        // Sprint 3
    }

    /**
     * @param  array<string, int>  $counters  Keys: quizzes_completed, documents_read, etc.
     */
    public function updateCounters(User $user, array $counters): void
    {
        // Sprint 3
    }

    public function resolveLevel(User $user): ?object
    {
        return null;
    }

    public function evaluateBadges(User $user): array
    {
        return [];
    }
}
