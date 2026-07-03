<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UserAdminService
{
    private const CACHE_KEY_PREFIX = 'admin-profile:';

    public function paginate(array $params): LengthAwarePaginator
    {
        $query = User::with('profile');

        if (!empty($params['search'])) {
            $search = '%' . trim($params['search']) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', $search)
                  ->orWhereHas('profile', function ($pq) use ($search) {
                      $pq->where('display_name', 'like', $search)
                        ->orWhere('full_name', 'like', $search)
                        ->orWhere('institution', 'like', $search);
                  });
            });
        }

        if (!empty($params['role'])) {
            $query->where('role', $params['role']);
        }

        if (!empty($params['status']) && $params['status'] !== 'all' && $params['status'] !== 'todos') {
            match ($params['status']) {
                'active' => $query->where('is_active', true)->where('email_verified', true),
                'inactive' => $query->where('is_active', false),
                'pending' => $query->where('is_active', false)->where('email_verified', false),
                'blocked' => $query->where('is_active', false)->where('email_verified', true),
                default => null,
            };
        }

        if (isset($params['verified'])) {
            $verified = filter_var($params['verified'], FILTER_VALIDATE_BOOLEAN);
            $query->where('email_verified', $verified);
        }

        $sortBy = $params['sort_by'] ?? 'created_at';
        $direction = $params['sort_direction'] ?? 'desc';

        if (in_array($sortBy, ['email', 'role', 'created_at', 'updated_at'])) {
            $query->orderBy($sortBy, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = (int) ($params['per_page'] ?? 10);
        return $query->paginate($perPage);
    }

    public function find(string $id): User
    {
        return User::with('profile')->findOrFail($id);
    }

    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'email' => $data['email'],
                'password_hash' => Hash::make($data['password']),
                'role' => $data['role'],
                'is_active' => $data['is_active'] ?? true,
                'email_verified' => $data['email_verified'] ?? true,
            ]);

            UserProfile::create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'display_name' => $data['display_name'],
                'full_name' => $data['full_name'] ?? null,
                'institution' => $data['institution'] ?? null,
                'province' => $data['province'] ?? null,
                'avatar_url' => $data['avatar_url'] ?? null,
                'bio' => $data['bio'] ?? null,
                'website_url' => $data['website_url'] ?? null,
                'research_areas' => $data['research_areas'] ?? null,
            ]);

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
            ]);

            Log::info("Admin created user: '{$user->email}' with ID [{$user->id}]");

            return $user->load('profile');
        });
    }

    public function update(string $id, array $data, ?string $adminId = null): User
    {
        $user = $this->find($id);

        if ($user->role === 'admin' && isset($data['role']) && $data['role'] !== 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                throw new \InvalidArgumentException("Cannot demote the last administrator of the system.");
            }
        }

        DB::transaction(function () use ($user, $data, $adminId) {
            $oldValues = $user->toArray();

            $user->update([
                'email' => $data['email'],
                'role' => $data['role'],
                'is_active' => $data['is_active'] ?? $user->is_active,
                'email_verified' => $data['email_verified'] ?? $user->email_verified,
            ]);

            $profileData = [
                'display_name' => $data['display_name'],
                'full_name' => $data['full_name'] ?? null,
                'institution' => $data['institution'] ?? null,
                'province' => $data['province'] ?? null,
                'avatar_url' => $data['avatar_url'] ?? null,
                'bio' => $data['bio'] ?? null,
                'website_url' => $data['website_url'] ?? null,
                'research_areas' => $data['research_areas'] ?? null,
            ];

            if ($user->profile) {
                $user->profile->update($profileData);
            } else {
                UserProfile::create(array_merge($profileData, [
                    'id' => (string) Str::uuid(),
                    'user_id' => $user->id,
                ]));
            }

            Cache::forget(self::CACHE_KEY_PREFIX . $user->id);

            $adminText = $adminId ? "by Admin ID [{$adminId}]" : "system-wide";
            Log::info("Admin updated user: '{$user->email}' {$adminText}", [
                'old' => $oldValues,
                'new' => $user->fresh()->toArray()
            ]);
        });

        return $user->fresh('profile');
    }

    public function delete(string $id, string $adminId): void
    {
        if ($adminId === $id) {
            throw new \InvalidArgumentException("You cannot delete your own account.");
        }

        $user = $this->find($id);

        if ($user->role === 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                throw new \InvalidArgumentException("Cannot delete the last administrator of the system.");
            }
        }

        DB::transaction(function () use ($user, $adminId) {
            $user->delete();
            Cache::forget(self::CACHE_KEY_PREFIX . $user->id);
            Log::info("Admin ID [{$adminId}] deleted user: '{$user->email}' with ID [{$user->id}]");
        });
    }

    public function buildAdminProfile(string $id): array
    {
        return Cache::remember(self::CACHE_KEY_PREFIX . $id, 30, function () use ($id) {
            $user = $this->find($id);
            $profile = $user->profile ?: new UserProfile();

            $userLevel = DB::table('user_levels')->where('user_id', $id)->first();
            $levelDefinition = null;
            if ($userLevel) {
                $levelDefinition = DB::table('level_definitions')
                    ->where('level', $userLevel->current_level)
                    ->first();
            }

            $badges = DB::table('user_badges as ub')
                ->join('badges as b', 'ub.badge_id', '=', 'b.id')
                ->where('ub.user_id', $id)
                ->select('b.*', 'ub.earned_at')
                ->orderByDesc('ub.earned_at')
                ->get();

            $accessGrants = DB::table('user_access_grants as uag')
                ->join('access_levels as al', 'uag.access_level_id', '=', 'al.id')
                ->where('uag.user_id', $id)
                ->whereNull('uag.revoked_at')
                ->select('uag.*', 'al.name as access_level_name')
                ->get();

            $accessRequests = DB::table('user_access_requests as uar')
                ->join('access_levels as al', 'uar.access_level_id', '=', 'al.id')
                ->where('uar.user_id', $id)
                ->select('uar.*', 'al.name as access_level_name')
                ->orderByDesc('uar.created_at')
                ->get();

            $stats = [
                'quizzes_completed' => $userLevel->quizzes_completed ?? 0,
                'documents_read' => $userLevel->documents_read ?? 0,
                'topics_created' => $userLevel->topics_created ?? 0,
                'replies_posted' => $userLevel->replies_posted ?? 0,
            ];

            return [
                'user' => $user,
                'profile' => $profile,
                'user_level' => $userLevel,
                'level_definition' => $levelDefinition,
                'badges' => $badges,
                'access_grants' => $accessGrants,
                'access_requests' => $accessRequests,
                'statistics' => $stats,
            ];
        });
    }

    public function listSessions(string $id): \Illuminate\Support\Collection
    {
        return DB::table('user_sessions')
            ->where('user_id', $id)
            ->orderByDesc('created_at')
            ->get();
    }
}
