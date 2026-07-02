<?php

namespace App\Services;

use App\Models\CommunityCategory;
use App\Models\DiscussionTopic;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Exception;

class CommunityCategoryService
{
    public function list()
    {
        return Cache::remember('community-categories', 30, function () {
            return CommunityCategory::orderBy('sort_order')
                ->orderBy('name')
                ->get();
        });
    }

    public function find(string $id): CommunityCategory
    {
        return CommunityCategory::findOrFail($id);
    }

    public function create(array $data): CommunityCategory
    {
        if (empty($data['slug']) && !empty($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        if (empty($data['id'])) {
            $data['id'] = (string) Str::uuid();
        }
        $data['is_active'] = $data['is_active'] ?? true;
        $data['sort_order'] = $data['sort_order'] ?? 0;
        $data['members_count'] = $data['members_count'] ?? 0;
        $data['topics_count'] = $data['topics_count'] ?? 0;

        $category = CommunityCategory::create($data);
        $this->clearCache();

        return $category;
    }

    public function update(string $id, array $data): CommunityCategory
    {
        $category = CommunityCategory::findOrFail($id);

        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);
        $this->clearCache();

        return $category;
    }

    public function delete(string $id): void
    {
        $category = CommunityCategory::findOrFail($id);

        // Check if there are topics associated with this category
        if (DiscussionTopic::where('category_id', $id)->exists()) {
            throw new Exception('Não é possível eliminar uma categoria com tópicos associados.');
        }

        $category->delete();
        $this->clearCache();
    }

    public function clearCache(): void
    {
        Cache::forget('community-categories');
    }
}
