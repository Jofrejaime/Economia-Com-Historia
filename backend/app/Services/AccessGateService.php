<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class AccessGateService
{
    public function canAccess(User $user, string $accessLevelId): bool
    {
        if ($this->bypassesAccessChecks($user)) {
            return true;
        }

        if ($accessLevelId === 'public') {
            return true;
        }

        return in_array($accessLevelId, $this->activeGrantLevelIds($user), true);
    }

    public function canAccessDocument(User $user, object $document): bool
    {
        if ($this->bypassesAccessChecks($user)) {
            return true;
        }

        if (isset($document->created_by) && $document->created_by === $user->id) {
            return true;
        }

        $accessLevelId = $document->access_level_id ?? 'public';

        return $this->canAccess($user, $accessLevelId);
    }

    /**
     * Restrict document listings to content the user is allowed to see.
     */
    public function applyDocumentVisibilityFilter(Builder $query, User $user, string $tableAlias = 'd'): void
    {
        if ($this->bypassesAccessChecks($user)) {
            return;
        }

        $grantLevels = $this->activeGrantLevelIds($user);

        $query->where(function (Builder $builder) use ($user, $grantLevels, $tableAlias): void {
            $builder->where("{$tableAlias}.access_level_id", 'public')
                ->orWhere("{$tableAlias}.created_by", $user->id);

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

    public function hasActiveGrant(User $user, string $accessLevelId): bool
    {
        if ($accessLevelId === 'public') {
            return true;
        }

        return in_array($accessLevelId, $this->activeGrantLevelIds($user), true);
    }

    private function bypassesAccessChecks(User $user): bool
    {
        return $user->role === 'admin';
    }
}
