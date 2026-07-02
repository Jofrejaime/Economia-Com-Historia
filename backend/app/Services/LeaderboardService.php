<?php

namespace App\Services;

use App\Models\LeaderboardCache;
use App\Models\LeaderboardSnapshot;
use App\Models\ProvinceStat;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * LeaderboardService
 *
 * Centraliza a lógica de leitura dos rankings nacional e provincial,
 * histórico de snapshots e estatísticas por província.
 *
 * Todos os métodos são read-only. A escrita no cache é feita pelo
 * event scheduler MySQL (evt_refresh_leaderboard + sp_refresh_leaderboard_nacional).
 */
class LeaderboardService
{
    /** TTL padrão do cache provincial (segundos). */
    private const PROVINCIAL_CACHE_TTL = 300;

    // ──────────────────────────────────────────────
    // Ranking Nacional
    // ──────────────────────────────────────────────

    /**
     * Retorna todos os utilizadores do ranking nacional ordenados por posição.
     */
    public function national(): Collection
    {
        return LeaderboardCache::orderBy('rank_position')->get();
    }

    // ──────────────────────────────────────────────
    // Ranking Provincial
    // ──────────────────────────────────────────────

    /**
     * Retorna o ranking provincial filtrado por província, com paginação.
     *
     * @param  string $province  Nome da província (ex: 'Luanda')
     * @param  int    $page      Página actual (≥ 1)
     * @param  int    $perPage   Itens por página (1–100)
     * @return array{data: Collection, province: string, pagination: array}
     */
    public function provincial(string $province, int $page = 1, int $perPage = 20): array
    {
        $page    = max(1, $page);
        $perPage = max(1, min(100, $perPage));
        $offset  = ($page - 1) * $perPage;

        $cacheKey = 'leaderboard.provincial.' . md5($province) . '.p' . $page . '.pp' . $perPage;

        return Cache::remember($cacheKey, self::PROVINCIAL_CACHE_TTL, function () use ($province, $perPage, $offset, $page) {
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

            // rank_position calculado em PHP (portável entre MySQL e SQLite)
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
    // Snapshots
    // ──────────────────────────────────────────────

    /**
     * Retorna os últimos N snapshots do ranking, ordenados por data descendente.
     */
    public function snapshots(int $limit = 30): Collection
    {
        return LeaderboardSnapshot::orderByDesc('snapshot_date')
            ->limit($limit)
            ->get();
    }

    // ──────────────────────────────────────────────
    // Province Stats
    // ──────────────────────────────────────────────

    /**
     * Retorna as estatísticas agregadas de todas as províncias.
     */
    public function provinceStats(): Collection
    {
        return ProvinceStat::all();
    }

    /**
     * Recalcula e atualiza síncronamente a tabela leaderboard_nacional_cache.
     * Funciona em SQLite (para testes/dev local) e em MySQL.
     */
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

        // Limpa o cache de rankings provinciais
        Cache::flush();
    }
}

