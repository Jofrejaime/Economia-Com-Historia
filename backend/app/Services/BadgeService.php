<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\User;
use App\Services\MediaService;
use App\Services\GamificationService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BadgeService
{
    public function __construct(
        private readonly MediaService $mediaService,
        private readonly GamificationService $gamification,
    ) {}

    public function list(array $filters = []): array
    {
        $query = Badge::query()->withCount('userBadges');

        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);
        $paginated = $query->paginate($perPage);

        $badges = collect($paginated->items());
        $totalEarned = DB::table('user_badges')->count();

        return [
            'data' => $badges,
            'stats' => [
                'total'  => Badge::count(),
                'active' => Badge::where('is_active', true)->count(),
                'earned' => $totalEarned,
            ],
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ]
        ];
    }

    public function find(string $id): ?Badge
    {
        return Badge::query()->withCount('userBadges')->find($id);
    }

    public function create(array $data, ?User $actor = null): Badge
    {
        $this->normalizeCriteria($data);

        $iconFile = $data['icon'] ?? null;
        $coverFile = $data['cover'] ?? null;
        $bannerFile = $data['banner'] ?? null;

        unset($data['icon'], $data['cover'], $data['banner']);

        return DB::transaction(function () use ($data, $iconFile, $coverFile, $bannerFile, $actor) {
            $badge = Badge::create([
                ...$data,
                'created_at' => now(),
            ]);

            if ($iconFile instanceof UploadedFile) {
                $media = $this->mediaService->upload($iconFile, 'badges/icons', [
                    'model_type' => 'badge',
                    'model_id'   => $badge->id,
                    'collection' => 'icon',
                    'created_by' => $actor?->id,
                ]);
                $badge->icon_url = $this->mediaService->buildPublicUrl($media->path);
                $badge->save();
            }

            if ($coverFile instanceof UploadedFile) {
                $this->mediaService->upload($coverFile, 'badges/covers', [
                    'model_type' => 'badge',
                    'model_id'   => $badge->id,
                    'collection' => 'cover',
                    'created_by' => $actor?->id,
                ]);
            }

            if ($bannerFile instanceof UploadedFile) {
                $this->mediaService->upload($bannerFile, 'badges/banners', [
                    'model_type' => 'badge',
                    'model_id'   => $badge->id,
                    'collection' => 'banner',
                    'created_by' => $actor?->id,
                ]);
            }

            Log::info('Badge created', [
                'admin_id'   => $actor?->id,
                'badge_id'   => $badge->id,
                'new_values' => $badge->toArray(),
            ]);

            return $badge;
        });
    }

    public function update(string $id, array $data, ?User $actor = null): Badge
    {
        $badge = Badge::findOrFail($id);
        $oldValues = $badge->toArray();

        $this->normalizeCriteria($data);

        $iconFile = $data['icon'] ?? null;
        $coverFile = $data['cover'] ?? null;
        $bannerFile = $data['banner'] ?? null;

        unset($data['icon'], $data['cover'], $data['banner']);

        return DB::transaction(function () use ($badge, $data, $iconFile, $coverFile, $bannerFile, $oldValues, $actor) {
            $badge->update($data);

            if ($iconFile instanceof UploadedFile) {
                $current = \App\Models\Media::where('model_type', 'badge')
                    ->where('model_id', $badge->id)
                    ->where('collection', 'icon')
                    ->first();
                $media = $this->mediaService->replace($current, $iconFile, 'badges/icons', [
                    'model_type' => 'badge',
                    'model_id'   => $badge->id,
                    'collection' => 'icon',
                    'created_by' => $actor?->id,
                ]);
                $badge->icon_url = $this->mediaService->buildPublicUrl($media->path);
                $badge->save();
            }

            if ($coverFile instanceof UploadedFile) {
                $current = \App\Models\Media::where('model_type', 'badge')
                    ->where('model_id', $badge->id)
                    ->where('collection', 'cover')
                    ->first();
                $this->mediaService->replace($current, $coverFile, 'badges/covers', [
                    'model_type' => 'badge',
                    'model_id'   => $badge->id,
                    'collection' => 'cover',
                    'created_by' => $actor?->id,
                ]);
            }

            if ($bannerFile instanceof UploadedFile) {
                $current = \App\Models\Media::where('model_type', 'badge')
                    ->where('model_id', $badge->id)
                    ->where('collection', 'banner')
                    ->first();
                $this->mediaService->replace($current, $bannerFile, 'badges/banners', [
                    'model_type' => 'badge',
                    'model_id'   => $badge->id,
                    'collection' => 'banner',
                    'created_by' => $actor?->id,
                ]);
            }

            Log::info('Badge updated', [
                'admin_id'   => $actor?->id,
                'badge_id'   => $badge->id,
                'old_values' => $oldValues,
                'new_values' => $badge->fresh()->toArray(),
            ]);

            return $badge->fresh();
        });
    }

    public function delete(string $id, ?User $actor = null): void
    {
        $badge = Badge::findOrFail($id);
        $oldValues = $badge->toArray();

        DB::transaction(function () use ($badge, $oldValues, $actor) {
            $this->mediaService->deleteFor('badge', $badge->id);
            DB::table('user_badges')->where('badge_id', $badge->id)->delete();
            $badge->delete();

            Log::info('Badge deleted', [
                'admin_id'   => $actor?->id,
                'badge_id'   => $badge->id,
                'old_values' => $oldValues,
            ]);
        });
    }

    public function toggleStatus(string $id, ?User $actor = null): Badge
    {
        $badge = Badge::findOrFail($id);
        $oldStatus = $badge->is_active;

        DB::transaction(function () use ($badge, $oldStatus, $actor) {
            $badge->update(['is_active' => !$badge->is_active]);

            Log::info('Badge status toggled', [
                'admin_id'   => $actor?->id,
                'badge_id'   => $badge->id,
                'old_values' => ['is_active' => $oldStatus],
                'new_values' => ['is_active' => $badge->is_active],
            ]);
        });

        return $badge;
    }

    public function assign(string $badgeId, string $userId, ?User $actor = null): void
    {
        $badge = Badge::findOrFail($badgeId);
        $user = User::findOrFail($userId);

        $exists = DB::table('user_badges')
            ->where('user_id', $user->id)
            ->where('badge_id', $badge->id)
            ->exists();

        if (!$exists) {
            DB::table('user_badges')->insert([
                'id'        => (string) Str::uuid(),
                'user_id'   => $user->id,
                'badge_id'  => $badge->id,
                'earned_at' => now(),
            ]);

            Log::info('Badge manually assigned', [
                'admin_id' => $actor?->id,
                'badge_id' => $badge->id,
                'user_id'  => $user->id,
            ]);
        }
    }

    public function remove(string $badgeId, string $userId, ?User $actor = null): void
    {
        $badge = Badge::findOrFail($badgeId);
        $user = User::findOrFail($userId);

        DB::table('user_badges')
            ->where('user_id', $user->id)
            ->where('badge_id', $badge->id)
            ->delete();

        Log::info('Badge manually removed', [
            'admin_id' => $actor?->id,
            'badge_id' => $badge->id,
            'user_id'  => $user->id,
        ]);
    }

    public function listUserBadges(string $userId): array
    {
        return DB::table('user_badges as ub')
            ->join('badges as b', 'b.id', '=', 'ub.badge_id')
            ->where('ub.user_id', $userId)
            ->select('b.*', 'ub.earned_at')
            ->get()
            ->all();
    }

    public function recalculateEligibleUsers(string $badgeId, ?User $actor = null): void
    {
        $badge = Badge::findOrFail($badgeId);
        if (!$badge->is_active) {
            return;
        }

        $users = User::where('is_active', true)->get();

        DB::transaction(function () use ($users, $badge, $actor) {
            $count = 0;
            foreach ($users as $user) {
                $hasBadge = DB::table('user_badges')
                    ->where('user_id', $user->id)
                    ->where('badge_id', $badge->id)
                    ->exists();

                if ($hasBadge) {
                    continue;
                }

                $userLevel = DB::table('user_levels')->where('user_id', $user->id)->first();
                if ($userLevel === null) {
                    continue;
                }

                $criteria = json_decode($badge->criteria_value, true);
                if (!is_array($criteria)) {
                    continue;
                }

                $eligible = match ($badge->criteria_type) {
                    'quiz_completed'   => (int) $userLevel->quizzes_completed >= (int) ($criteria['count'] ?? 0),
                    'topic_created'    => (int) ($userLevel->topics_created ?? 0) >= (int) ($criteria['count'] ?? 0),
                    'documents_read'   => (int) ($userLevel->documents_read ?? 0) >= (int) ($criteria['count'] ?? 0),
                    'level_reached'    => (int) $userLevel->current_level >= (int) ($criteria['level'] ?? 0),
                    default            => false,
                };

                if ($eligible) {
                    DB::table('user_badges')->insert([
                        'id'        => (string) Str::uuid(),
                        'user_id'   => $user->id,
                        'badge_id'  => $badge->id,
                        'earned_at' => now(),
                    ]);
                    $count++;
                }
            }

            Log::info('Badge eligible users recalculated', [
                'admin_id'    => $actor?->id,
                'badge_id'    => $badge->id,
                'users_added' => $count,
            ]);
        });
    }

    private function normalizeCriteria(array &$data): void
    {
        $type = $data['criteria_type'] ?? '';
        $value = $data['criteria_value'] ?? 1;

        if ($type === 'quizzes' || $type === 'quiz_completed') {
            $data['criteria_type'] = 'quiz_completed';
            $data['criteria_value'] = json_encode(['count' => (int) $value]);
        } elseif ($type === 'documents' || $type === 'documents_read') {
            $data['criteria_type'] = 'documents_read';
            $data['criteria_value'] = json_encode(['count' => (int) $value]);
        } elseif ($type === 'points' || $type === 'level_reached' || $type === 'level') {
            $data['criteria_type'] = 'level_reached';
            $data['criteria_value'] = json_encode(['level' => (int) $value]);
        } elseif ($type === 'topic_created' || $type === 'reply_accepted' || $type === 'document_uploaded' || $type === 'interactions') {
            $data['criteria_value'] = json_encode(['count' => (int) $value]);
        }
    }
}
