<?php

namespace App\Services;

use App\Models\AccessGrant;
use App\Models\AccessLevel;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AccessGrantService
{
    public function __construct(
        private readonly NotificationService $notificationService,
    ) {}

    public function list(array $filters = [], ?User $currentUser = null)
    {
        $query = AccessGrant::query()
            ->with(['user.profile', 'accessLevel', 'grantedBy.profile'])
            ->orderByDesc('granted_at');

        if ($currentUser && $currentUser->role !== 'admin') {
            $query->where('user_id', $currentUser->id);
        } elseif (isset($filters['scope']) && $filters['scope'] === 'mine' && $currentUser) {
            $query->where('user_id', $currentUser->id);
        }

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['access_level_id'])) {
            $query->where('access_level_id', $filters['access_level_id']);
        }

        if (isset($filters['active'])) {
            $active = filter_var($filters['active'], FILTER_VALIDATE_BOOLEAN);
            if ($active) {
                $query->where('is_active', true)
                    ->whereNull('revoked_at')
                    ->where(function ($q) {
                        $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                    });
            } else {
                $query->where(function ($q) {
                    $q->where('is_active', false)
                        ->orWhereNotNull('revoked_at')
                        ->orWhere('expires_at', '<=', now());
                });
            }
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function activeGrants(string $userId)
    {
        return AccessGrant::where('user_id', $userId)
            ->where('is_active', true)
            ->whereNull('revoked_at')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->get();
    }

    public function grant(array $data, ?User $grantedBy): AccessGrant
    {
        $userId = $data['user_id'];
        $accessLevelId = $data['access_level_id'];
        $requestId = $data['request_id'] ?? null;
        $expiresAt = $data['expires_at'] ?? null;

        return DB::transaction(function () use ($userId, $accessLevelId, $grantedBy, $requestId, $expiresAt) {
            $existing = AccessGrant::where('user_id', $userId)
                ->where('access_level_id', $accessLevelId)
                ->first();

            if ($existing) {
                $existing->update([
                    'is_active'  => true,
                    'revoked_at' => null,
                    'granted_by' => $grantedBy ? $grantedBy->id : null,
                    'request_id' => $requestId,
                    'granted_at' => now(),
                    'expires_at' => $expiresAt,
                ]);

                $grant = $existing;
            } else {
                $grant = AccessGrant::create([
                    'id'              => (string) Str::uuid(),
                    'user_id'         => $userId,
                    'access_level_id' => $accessLevelId,
                    'granted_by'      => $grantedBy ? $grantedBy->id : null,
                    'request_id'      => $requestId,
                    'granted_at'      => now(),
                    'expires_at'      => $expiresAt,
                    'revoked_at'      => null,
                    'is_active'       => true,
                ]);
            }

            // Clear permission / access cache for this user
            $this->clearAccessCache($userId);

            // Audit
            Log::info('Concessão de acesso concedida', [
                'admin_id'          => $grantedBy ? $grantedBy->id : null,
                'target_user'       => $userId,
                'grant_id'          => $grant->id,
                'access_request_id' => $requestId,
                'new_values'        => [
                    'access_level_id' => $accessLevelId,
                    'is_active'       => true,
                ],
            ]);

            return $grant;
        });
    }

    public function revoke(string $id, ?User $revokedBy, ?string $reason = null): AccessGrant
    {
        $grant = AccessGrant::find($id);
        if (!$grant) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Grant not found.');
        }

        if (!$grant->is_active || $grant->revoked_at !== null) {
            throw new \DomainException('This grant is already revoked or inactive.', 409);
        }

        $user = User::find($grant->user_id);
        $accessLevel = AccessLevel::find($grant->access_level_id);

        DB::transaction(function () use ($grant, $revokedBy, $reason, $user, $accessLevel) {
            $grant->update([
                'is_active'  => false,
                'revoked_at' => now(),
            ]);

            // Clear cache
            $this->clearAccessCache($grant->user_id);

            // Audit Log
            Log::info('Revogação de acesso', [
                'admin_id'          => $revokedBy ? $revokedBy->id : null,
                'target_user'       => $grant->user_id,
                'grant_id'          => $grant->id,
                'old_values'        => ['is_active' => true, 'revoked_at' => null],
                'new_values'        => ['is_active' => false, 'revoked_at' => now()],
                'reason'            => $reason,
            ]);

            // Notify
            if ($user) {
                $this->notificationService->send(
                    $user,
                    'access_grant_revoked',
                    'Access Grant Revoked',
                    "Your access to {$accessLevel->name} has been revoked." . ($reason ? " Reason: {$reason}" : ""),
                    $grant->id,
                    'access_grant'
                );
            }
        });

        return $grant->fresh();
    }

    public function history(string $userId)
    {
        return AccessGrant::where('user_id', $userId)
            ->with(['accessLevel', 'grantedBy.profile'])
            ->orderByDesc('granted_at')
            ->get();
    }

    private function clearAccessCache(string $userId): void
    {
        Cache::forget("user_active_grant_ids_{$userId}");
        Cache::forget("user_permissions_{$userId}");
    }
}
