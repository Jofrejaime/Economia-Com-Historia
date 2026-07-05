<?php

namespace App\Services;

use App\Models\Tag;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Exception;

class TagService
{
    public function list(array $params = [])
    {
        // Nunca cachear o LengthAwarePaginator: serializá-lo na tabela cache
        // (driver database) rebenta ao desserializar (__PHP_Incomplete_Class).
        $query = Tag::query();

        if (!empty($params['q'])) {
            $query->where('name', 'like', "%{$params['q']}%");
        }

        if (!empty($params['sort_by'])) {
            $direction = $params['sort_direction'] ?? 'asc';
            $query->orderBy($params['sort_by'], $direction);
        } else {
            $query->orderBy('name');
        }

        $perPage = min((int) ($params['per_page'] ?? 15), 100);
        return $query->paginate($perPage);
    }

    public function find(string $id): Tag
    {
        return Tag::findOrFail($id);
    }

    public function create(array $data): Tag
    {
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $tag = Tag::create($data);
        $this->clearCache();

        return $tag;
    }

    public function update(string $id, array $data): Tag
    {
        $tag = Tag::findOrFail($id);

        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $tag->update($data);
        $this->clearCache();

        return $tag;
    }

    public function delete(string $id, bool $confirm = false): void
    {
        $tag = Tag::findOrFail($id);

        $inUse = DB::table('document_tags')->where('tag_id', $id)->exists();

        if ($inUse && !$confirm) {
            throw new Exception('TAG_IN_USE');
        }

        DB::transaction(function () use ($tag, $id) {
            DB::table('document_tags')->where('tag_id', $id)->delete();
            $tag->delete();
        });

        $this->clearCache();
    }

    public function clearCache(): void
    {
        Cache::flush(); // Flush all caches
    }
}
