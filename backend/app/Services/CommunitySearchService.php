<?php

namespace App\Services;

use App\Models\DiscussionTopic;
use App\Models\User;
use App\Services\CommunityAuthorizationService;
use Illuminate\Support\Facades\Cache;

class CommunitySearchService
{
    public function __construct(
        private readonly CommunityAuthorizationService $communityAuthorization
    ) {}

    public function search(array $params, ?User $user)
    {
        $cacheKey = 'community-search:' . md5(serialize($params) . '_' . ($user?->id ?? 'guest') . '_' . ($user?->role ?? 'guest'));

        return Cache::remember($cacheKey, 30, function () use ($params, $user) {
            $query = DiscussionTopic::query()->with(['author.profile', 'category']);

            // Apply visible topics filter
            $this->communityAuthorization->applyVisibleTopicsFilter($query, $user);

            // Filters
            if (!empty($params['q'])) {
                $term = '%' . trim($params['q']) . '%';
                $query->where(function ($builder) use ($term) {
                    $builder->where('title', 'like', $term)
                        ->orWhere('content', 'like', $term)
                        ->orWhereExists(function ($q) use ($term) {
                            $q->selectRaw('1')
                                ->from('user_profiles as up')
                                ->whereColumn('up.user_id', 'discussion_topics.author_id')
                                ->where('up.display_name', 'like', $term);
                        });
                });
            }

            if (!empty($params['category_id'])) {
                $query->where('category_id', $params['category_id']);
            }

            if (!empty($params['author_id'])) {
                $query->where('author_id', $params['author_id']);
            }

            if (isset($params['pinned'])) {
                $query->where('pinned', (bool)$params['pinned']);
            }

            if (isset($params['locked'])) {
                $query->where('locked', (bool)$params['locked']);
            }

            if (isset($params['solved'])) {
                $query->where('solved', (bool)$params['solved']);
            }

            if (!empty($params['status'])) {
                $query->where('status', $params['status']);
            }

            if (!empty($params['visibility'])) {
                $query->where('visibility', $params['visibility']);
            }

            // Sorting
            $sort = $params['sort'] ?? 'newest';
            $query->orderByDesc('pinned'); // Pinned topics first

            switch ($sort) {
                case 'oldest':
                    $query->orderBy('created_at');
                    break;
                case 'popular':
                    $query->orderByDesc('likes_count')
                        ->orderByDesc('views_count');
                    break;
                case 'comments':
                    $query->orderByDesc('replies_count');
                    break;
                case 'newest':
                default:
                    $query->orderByDesc('created_at');
                    break;
            }

            $perPage = min((int) ($params['per_page'] ?? 20), 100);
            return $query->paginate($perPage);
        });
    }
}
