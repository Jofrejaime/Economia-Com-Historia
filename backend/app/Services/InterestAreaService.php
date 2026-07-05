<?php

namespace App\Services;

use App\Models\InterestArea;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class InterestAreaService
{
    private const CACHE_KEY_LIST = 'interest_areas:list';
    private const CACHE_KEY_PREFIX = 'interest_areas:id:';

    public function list(array $filters): LengthAwarePaginator|Collection
    {
        $query = InterestArea::query()->orderBy('name');

        if (isset($filters['search']) && !empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('slug', 'like', $search);
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

        return InterestArea::hydrate($rows);
    }

    public function find(string $id): InterestArea
    {
        return InterestArea::findOrFail($id);
    }

    public function create(array $data): InterestArea
    {
        $slug = $data['slug'] ?? Str::slug($data['name']);
        
        $area = InterestArea::create([
            'id' => (string) Str::uuid(),
            'name' => $data['name'],
            'slug' => $slug,
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        $this->clearCache($area->id);
        Log::info("Área de Interesse criada: [{$area->id}] {$area->name}");

        return $area;
    }

    public function update(string $id, array $data): InterestArea
    {
        $area = InterestArea::findOrFail($id);

        if (isset($data['name']) && !isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $area->update($data);

        $this->clearCache($id);
        Log::info("Área de Interesse actualizada: [{$id}]");

        return $area->fresh();
    }

    public function delete(string $id): void
    {
        $area = InterestArea::findOrFail($id);
        $area->delete();

        $this->clearCache($id);
        Log::info("Área de Interesse eliminada: [{$id}]");
    }

    public function categories(): Collection
    {
        return DB::table('community_categories')
            ->select('id', 'name', 'slug')
            ->orderBy('name')
            ->get();
    }

    public function metadata(string $id): array
    {
        $area = InterestArea::findOrFail($id);
        return [
            'users_count' => $area->users()->count(),
            'documents_count' => $area->documents()->count(),
            'topics_count' => $area->topics()->count(),
        ];
    }

    private function clearCache(string $id): void
    {
        Cache::forget(self::CACHE_KEY_LIST);
        Cache::forget(self::CACHE_KEY_PREFIX . $id);
    }
}
