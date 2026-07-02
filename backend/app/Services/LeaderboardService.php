<?php

namespace App\Services;

use App\Models\LeaderboardCache;
use App\Models\LeaderboardSnapshot;
use App\Models\ProvinceStat;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LeaderboardService
{
    private const CACHE_TTL = 30; // 30 seconds as requested

    // ──────────────────────────────────────────────
    // Ranking Nacional
    // ──────────────────────────────────────────────

    public function national(): Collection
    {
        return Cache::remember('leaderboard-national', self::CACHE_TTL, function () {
            return LeaderboardCache::orderBy('rank_position')->get();
        });
    }

    // ──────────────────────────────────────────────
    // Ranking Provincial
    // ──────────────────────────────────────────────

    public function provincial(string $province, int $page = 1, int $perPage = 20): array
    {
        $page    = max(1, $page);
        $perPage = max(1, min(100, $perPage));
        $offset  = ($page - 1) * $perPage;

        $cacheKey = 'leaderboard-provincial.' . md5($province) . '.p' . $page . '.pp' . $perPage;

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($province, $perPage, $offset, $page) {
            $base = DB::table('user_profiles as up')
                ->join('users as u', 'u.id', '=', 'up.user_id')
                ->join('user_levels as ul', 'ul.user_id', '=', 'u.id')
                ->where('u.is_active', 1)
                ->where('up.province', $province);

            $total = (clone $base)->count();

            $rows = (clone $base)
                ->select([
                    'u.id as user_id',
                    'up.display_name',
                    'up.province',
                    'up.avatar_url',
                    'ul.total_points',
                    'ul.quizzes_completed',
                    'ul.weekly_points',
                    'ul.current_level',
                ])
                ->orderByDesc('ul.total_points')
                ->orderByDesc('ul.quizzes_completed')
                ->limit($perPage)
                ->offset($offset)
                ->get();

            $data = $rows->map(fn ($row, int $i) => array_merge(
                (array) $row,
                ['rank_position' => $offset + $i + 1],
            ))->values();

            return [
                'data'       => $data,
                'province'   => $province,
                'pagination' => [
                    'total'        => $total,
                    'per_page'     => $perPage,
                    'current_page' => $page,
                    'last_page'    => max(1, (int) ceil($total / $perPage)),
                ],
            ];
        });
    }

    // ──────────────────────────────────────────────
    // Ranking por Instituição
    // ──────────────────────────────────────────────

    public function institution(string $institution, int $page = 1, int $perPage = 20): array
    {
        $page    = max(1, $page);
        $perPage = max(1, min(100, $perPage));
        $offset  = ($page - 1) * $perPage;

        $cacheKey = 'leaderboard-institution.' . md5($institution) . '.p' . $page . '.pp' . $perPage;

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($institution, $perPage, $offset, $page) {
            $base = DB::table('user_profiles as up')
                ->join('users as u', 'u.id', '=', 'up.user_id')
                ->join('user_levels as ul', 'ul.user_id', '=', 'u.id')
                ->where('u.is_active', 1)
                ->where('up.institution', $institution);

            $total = (clone $base)->count();

            $rows = (clone $base)
                ->select([
                    'u.id as user_id',
                    'up.display_name',
                    'up.institution',
                    'up.province',
                    'up.avatar_url',
                    'ul.total_points',
                    'ul.quizzes_completed',
                    'ul.weekly_points',
                    'ul.current_level',
                ])
                ->orderByDesc('ul.total_points')
                ->orderByDesc('ul.quizzes_completed')
                ->limit($perPage)
                ->offset($offset)
                ->get();

            $data = $rows->map(fn ($row, int $i) => array_merge(
                (array) $row,
                ['rank_position' => $offset + $i + 1],
            ))->values();

            return [
                'data'       => $data,
                'institution' => $institution,
                'pagination' => [
                    'total'        => $total,
                    'per_page'     => $perPage,
                    'current_page' => $page,
                    'last_page'    => max(1, (int) ceil($total / $perPage)),
                ],
            ];
        });
    }

    // ──────────────────────────────────────────────
    // Ranking Geral / Filtros
    // ──────────────────────────────────────────────

    public function ranking(array $filters = []): array
    {
        $scope = $filters['scope'] ?? 'national';
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(max(1, (int) ($filters['per_page'] ?? 20)), 100);

        if ($scope === 'provincial' && !empty($filters['province'])) {
            return $this->provincial($filters['province'], $page, $perPage);
        }

        if ($scope === 'institution' && !empty($filters['institution'])) {
            return $this->institution($filters['institution'], $page, $perPage);
        }

        // National Scope (default)
        $cacheKey = "leaderboard-national.p{$page}.pp{$perPage}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($page, $perPage) {
            $query = LeaderboardCache::orderBy('rank_position');
            $total = $query->count();
            $items = $query->forPage($page, $perPage)->get();

            return [
                'data' => $items,
                'pagination' => [
                    'total'        => $total,
                    'per_page'     => $perPage,
                    'current_page' => $page,
                    'last_page'    => max(1, (int) ceil($total / $perPage)),
                ]
            ];
        });
    }

    public function topUsers(int $limit = 10): Collection
    {
        return Cache::remember("leaderboard-top-{$limit}", self::CACHE_TTL, function () use ($limit) {
            return LeaderboardCache::orderBy('rank_position')->limit($limit)->get();
        });
    }

    // ──────────────────────────────────────────────
    // Snapshots
    // ──────────────────────────────────────────────

    public function snapshots(int $limit = 30): Collection
    {
        return Cache::remember('leaderboard-snapshots', self::CACHE_TTL, function () use ($limit) {
            return LeaderboardSnapshot::orderByDesc('snapshot_date')
                ->limit($limit)
                ->get();
        });
    }

    public function provinceStats(): Collection
    {
        return ProvinceStat::all();
    }

    public function userPosition(string $userId): array
    {
        $cached = LeaderboardCache::where('user_id', $userId)->first();
        if ($cached !== null) {
            return [
                'rank_position' => $cached->rank_position,
                'total_points'  => $cached->total_points,
                'current_level' => $cached->current_level,
            ];
        }

        $points = DB::table('user_levels')->where('user_id', $userId)->value('total_points') ?? 0;
        $level = DB::table('user_levels')->where('user_id', $userId)->value('current_level') ?? 1;

        $rank = DB::table('user_levels')
            ->where('total_points', '>', $points)
            ->count() + 1;

        return [
            'rank_position' => $rank,
            'total_points'  => $points,
            'current_level' => $level,
        ];
    }

    public function history(string $userId): Collection
    {
        return LeaderboardSnapshot::where('user_id', $userId)
            ->orderBy('snapshot_date')
            ->get();
    }

    // ──────────────────────────────────────────────
    // Cache e Sincronização
    // ──────────────────────────────────────────────

    public function refresh(?User $actor = null): void
    {
        $this->refreshNationalCache();

        Log::info('Leaderboard refreshed', [
            'admin_id' => $actor?->id,
            'time'     => now()->toDateTimeString(),
        ]);
    }

    public function refreshNationalCache(): void
    {
        $users = DB::table('users as u')
            ->join('user_profiles as up', 'up.user_id', '=', 'u.id')
            ->join('user_levels as ul', 'ul.user_id', '=', 'u.id')
            ->where('u.is_active', 1)
            ->orderByDesc('ul.total_points')
            ->orderByDesc('ul.quizzes_completed')
            ->select([
                'u.id as user_id',
                'up.display_name',
                'up.province',
                'up.avatar_url',
                'ul.total_points',
                'ul.quizzes_completed',
                'ul.weekly_points',
                'ul.current_level',
            ])
            ->get();

        $rows = [];
        $rank = 1;
        $now = now();

        foreach ($users as $u) {
            $prevRank = DB::table('leaderboard_snapshots')
                ->where('user_id', $u->user_id)
                ->where('scope', 'nacional')
                ->where('snapshot_date', now()->subDay()->toDateString())
                ->value('rank_position') ?? 0;

            $rows[] = [
                'rank_position' => $rank++,
                'user_id' => $u->user_id,
                'display_name' => $u->display_name,
                'province' => $u->province,
                'avatar_url' => $u->avatar_url,
                'total_points' => $u->total_points,
                'quizzes_completed' => $u->quizzes_completed,
                'weekly_points' => $u->weekly_points,
                'current_level' => $u->current_level,
                'prev_rank' => $prevRank,
                'refreshed_at' => $now,
            ];
        }

        DB::transaction(function () use ($rows) {
            DB::table('leaderboard_nacional_cache')->delete();
            if (!empty($rows)) {
                foreach (array_chunk($rows, 100) as $chunk) {
                    DB::table('leaderboard_nacional_cache')->insert($chunk);
                }
            }
        });

        // Limpa o cache
        Cache::flush();
    }

    public function takeDailySnapshot(?User $actor = null): void
    {
        $today = now()->toDateString();

        $nacionalCache = DB::table('leaderboard_nacional_cache')
            ->select([
                'user_id',
                'rank_position',
                'total_points',
                'quizzes_completed',
            ])
            ->get();

        $rows = [];
        foreach ($nacionalCache as $row) {
            $rows[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'user_id' => $row->user_id,
                'snapshot_date' => $today,
                'scope' => 'nacional',
                'province' => null,
                'rank_position' => $row->rank_position,
                'total_points' => $row->total_points,
                'quizzes_completed' => $row->quizzes_completed,
                'accuracy_pct' => null,
                'created_at' => now(),
            ];
        }

        DB::transaction(function () use ($rows, $today): void {
            DB::table('leaderboard_snapshots')
                ->where('snapshot_date', $today)
                ->where('scope', 'nacional')
                ->delete();

            if ($rows !== []) {
                foreach (array_chunk($rows, 100) as $chunk) {
                    DB::table('leaderboard_snapshots')->insert($chunk);
                }
            }
        });

        Log::info('Leaderboard snapshot taken', [
            'admin_id'      => $actor?->id,
            'snapshot_date' => $today,
        ]);

        Cache::flush();
    }
}
