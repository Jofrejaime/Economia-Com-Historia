<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class AccessGateService
{
    public function canAccess(?User $user, string $accessLevelId): bool
    {
        if ($user !== null && $this->bypassesAccessChecks($user)) {
            return true;
        }

        if ($accessLevelId === 'public') {
            return true;
        }

        if ($user === null) {
            return false;
        }

        return in_array($accessLevelId, $this->activeGrantLevelIds($user), true);
    }

    public function canAccessDocument(?User $user, object $document): bool
    {
        if ($user !== null && $this->bypassesAccessChecks($user)) {
            return true;
        }

        if ($user !== null && isset($document->created_by) && $document->created_by === $user->id) {
            return true;
        }

        $accessLevelId = $document->access_level_id ?? 'public';

        return $this->canAccess($user, $accessLevelId);
    }

    /**
     * Restrict document/quiz listings to content the user is allowed to see.
     * Visitantes (user === null) só veem access_level_id = 'public'.
     */
    public function applyDocumentVisibilityFilter(Builder $query, ?User $user, string $tableAlias = 'd'): void
    {
        if ($user !== null && $this->bypassesAccessChecks($user)) {
            return;
        }

        $grantLevels = $user !== null ? $this->activeGrantLevelIds($user) : [];

        $query->where(function (Builder $builder) use ($user, $grantLevels, $tableAlias): void {
            $builder->where("{$tableAlias}.access_level_id", 'public');

            if ($user !== null) {
                $builder->orWhere("{$tableAlias}.created_by", $user->id);
            }

            if ($grantLevels !== []) {
                $builder->orWhereIn("{$tableAlias}.access_level_id", $grantLevels);
            }
        });
    }

    /**
     * @return list<string>
     */
    public function activeGrantLevelIds(User $user): array
    {
        return DB::table('user_access_grants')
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->whereNull('revoked_at')
            ->where(function (Builder $query): void {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->pluck('access_level_id')
            ->all();
    }

    public function hasActiveGrant(?User $user, string $accessLevelId): bool
    {
        if ($accessLevelId === 'public') {
            return true;
        }

        if ($user === null) {
            return false;
        }

        return in_array($accessLevelId, $this->activeGrantLevelIds($user), true);
    }

    private function bypassesAccessChecks(User $user): bool
    {
        return $user->role === 'admin';
    }
}