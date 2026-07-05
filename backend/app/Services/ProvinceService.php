<?php

namespace App\Services;

use App\Models\Province;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProvinceService
{
    private const CACHE_KEY_LIST = 'provinces:list';
    private const CACHE_KEY_PREFIX = 'provinces:id:';

    public function list(array $filters): LengthAwarePaginator|Collection
    {
        $query = Province::query()->orderBy('name');

        if (isset($filters['search']) && !empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('code', 'like', $search);
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (isset($filters['per_page'])) {
            $perPage = (int)$filters['per_page'];
            return $query->paginate($perPage);
        }

        // Cachear apenas arrays simples (nunca objetos Eloquent) e re-hidratar,
        // para o driver database não rebentar ao desserializar após refactors.
        $rows = Cache::remember(self::CACHE_KEY_LIST, now()->addHour(), function () use ($query) {
            return $query->get()->toArray();
        });

        return Province::hydrate($rows);
    }

    public function find(string $id): Province
    {
        return Province::findOrFail($id);
    }

    public function create(array $data): Province
    {
        if (isset($data['code'])) {
            $data['code'] = strtoupper($data['code']);
            if (!$this->validateISO($data['code'])) {
                throw new \InvalidArgumentException("O código da província deve seguir o padrão ISO-3166-2 (ex: AO-LUA).");
            }
        }

        $province = Province::create([
            'id' => (string) Str::uuid(),
            'name' => $data['name'],
            'code' => $data['code'],
            'is_active' => $data['is_active'] ?? true,
        ]);

        $this->clearCache($province->id);
        Log::info("Província criada: [{$province->id}] {$province->name}");

        return $province;
    }

    public function update(string $id, array $data): Province
    {
        $province = Province::findOrFail($id);

        if (isset($data['code'])) {
            $data['code'] = strtoupper($data['code']);
            if (!$this->validateISO($data['code'])) {
                throw new \InvalidArgumentException("O código da província deve seguir o padrão ISO-3166-2 (ex: AO-LUA).");
            }
        }

        $province->update($data);

        $this->clearCache($id);
        Log::info("Província actualizada: [{$id}]");

        return $province->fresh();
    }

    public function delete(string $id): void
    {
        $province = Province::findOrFail($id);
        $province->delete();

        $this->clearCache($id);
        Log::info("Província eliminada: [{$id}]");
    }

    public function validateISO(string $code): bool
    {
        return (bool) preg_match('/^AO-[A-Z]{3}$/', $code);
    }

    public function statistics(): Collection
    {
        return Cache::remember('provinces:stats', now()->addMinutes(10), function () {
            return DB::table('provinces as p')
                ->leftJoin('user_profiles as up', 'up.province_id', '=', 'p.id')
                ->select('p.id', 'p.name', 'p.code', DB::raw('COUNT(up.id) as total_users'))
                ->groupBy('p.id', 'p.name', 'p.code')
                ->orderByDesc('total_users')
                ->get();
        });
    }

    private function clearCache(string $id): void
    {
        Cache::forget(self::CACHE_KEY_LIST);
        Cache::forget(self::CACHE_KEY_PREFIX . $id);
        Cache::forget('provinces:stats');
    }
}
