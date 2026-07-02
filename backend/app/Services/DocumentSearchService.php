<?php

namespace App\Services;

use App\Enums\DocumentStatus;
use App\Models\User;
use App\Services\DocumentAccessService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class DocumentSearchService
{
    public function __construct(
        private readonly DocumentAccessService $documentAccess
    ) {}

    /**
     * Perform search with filters, sorting, and pagination.
     */
    public function search(array $params, ?User $user)
    {
        $cacheKey = 'docs-search:' . md5(serialize($params) . '_' . ($user?->id ?? 'guest') . '_' . ($user?->role ?? 'guest'));

        return Cache::remember($cacheKey, 30, function () use ($params, $user) {
            $query = $this->baseQuery();

            $query = $this->buildFilters($query, $params, $user);
            $query = $this->buildSorting($query, $params);

            return $this->paginate($query, $params);
        });
    }

    /**
     * Advanced search wrapper.
     */
    public function advancedSearch(array $params, ?User $user)
    {
        return $this->search($params, $user);
    }

    /**
     * Build base query with standard columns and joins.
     */
    private function baseQuery()
    {
        return DB::table('documents as d')
            ->leftJoin('document_categories as dc', 'd.category_id', '=', 'dc.id')
            ->leftJoin('access_levels as al', 'd.access_level_id', '=', 'al.id')
            ->leftJoin('user_profiles as up', 'd.created_by', '=', 'up.user_id')
            ->select(
                'd.id', 'd.title', 'd.slug', 'd.author', 'd.institution',
                'd.category_id', 'd.document_type', 'd.academic_level', 'd.access_level_id',
                'd.publication_date', 'd.period_start', 'd.period_end',
                'd.summary', 'd.content', 'd.cover_image_url',
                'd.media_type', 'd.media_url', 'd.pdf_url',
                'd.status', 'd.is_pinned', 'd.created_by', 'd.published_at', 'd.created_at', 'd.updated_at',
                'd.views_count', 'd.likes_count', 'd.downloads_count',
                'dc.name as category_name',
                'dc.slug as category_slug',
                'dc.color_bg as category_color_bg',
                'dc.icon as category_icon',
                'al.name as access_level_name',
                'al.icon as access_level_icon',
                'al.color_bg as access_level_color_bg',
                'al.color_text as access_level_color_text',
                'up.display_name as author_display_name',
                'up.avatar_url as author_avatar_url'
            )
            ->addSelect([
                'topics_count' => DB::table('discussion_topics')
                    ->whereColumn('document_id', 'd.id')
                    ->selectRaw('count(*)')
            ]);
    }

    /**
     * Apply filter criteria to the query.
     */
    public function buildFilters($query, array $params, ?User $user)
    {
        // Text search
        if (!empty($params['q'])) {
            $term = $params['q'];
            $query->where(function ($builder) use ($term): void {
                $builder->where('d.title', 'like', "%{$term}%")
                    ->orWhere('d.summary', 'like', "%{$term}%")
                    ->orWhere('d.author', 'like', "%{$term}%");
            });
        }

        // Title filter
        if (!empty($params['title'])) {
            $query->where('d.title', 'like', "%{$params['title']}%");
        }

        // Description / Summary filter
        if (!empty($params['description'])) {
            $query->where('d.summary', 'like', "%{$params['description']}%");
        }

        // Author filter
        if (!empty($params['author'])) {
            $query->where('d.author', 'like', "%{$params['author']}%");
        }

        // Category filter
        if (!empty($params['category_id'])) {
            $query->where('d.category_id', $params['category_id']);
        }
        if (!empty($params['category'])) {
            $query->where('dc.slug', $params['category'])
                  ->orWhere('dc.name', 'like', "%{$params['category']}%");
        }

        // Tag filter
        if (!empty($params['tag'])) {
            $tagValue = $params['tag'];
            $query->whereExists(function ($q) use ($tagValue) {
                $q->from('document_tags as dt')
                  ->join('tags as t', 'dt.tag_id', '=', 't.id')
                  ->whereColumn('dt.document_id', 'd.id')
                  ->where(function ($b) use ($tagValue) {
                      $b->where('t.name', 'like', "%{$tagValue}%")
                        ->orWhere('t.slug', '=', Str::slug($tagValue));
                  });
            });
        }

        // Institution filter
        if (!empty($params['institution'])) {
            $query->where('d.institution', 'like', "%{$params['institution']}%");
        }

        // Language / Academic level / Document type filters
        if (!empty($params['document_type'])) {
            $query->where('d.document_type', $params['document_type']);
        }
        if (!empty($params['academic_level'])) {
            $query->where('d.academic_level', $params['academic_level']);
        }
        if (!empty($params['access_level_id'])) {
            $query->where('d.access_level_id', $params['access_level_id']);
        }
        if (!empty($params['media_type'])) {
            $query->where('d.media_type', $params['media_type']);
        }

        // Year filter
        if (!empty($params['year'])) {
            $query->whereYear('d.publication_date', $params['year']);
        }

        // Pinned
        if (isset($params['pinned'])) {
            $query->where('d.is_pinned', (bool)$params['pinned']);
        }

        // Status
        if (!empty($params['status'])) {
            $query->where('d.status', $params['status']);
        } elseif ($user === null || $user->role !== 'admin') {
            $query->where('d.status', DocumentStatus::PUBLISHED->value);
        }

        // Apply Access Gate filters
        $this->documentAccess->applyListingFilter($query, $user);

        return $query;
    }

    /**
     * Apply sorting logic.
     */
    public function buildSorting($query, array $params)
    {
        $sort = $params['sort'] ?? 'newest';

        $query->orderByDesc('d.is_pinned');

        switch ($sort) {
            case 'oldest':
                $query->orderBy('d.created_at');
                break;
            case 'popular':
                $query->orderByDesc('d.likes_count')->orderByDesc('d.views_count');
                break;
            case 'downloads':
                $query->orderByDesc('d.downloads_count');
                break;
            case 'favorites':
                $query->orderByDesc(function ($sub) {
                    $sub->from('user_favorites')
                        ->whereColumn('document_id', 'd.id')
                        ->selectRaw('count(*)');
                });
                break;
            case 'alphabetical':
                $query->orderBy('d.title');
                break;
            case 'newest':
            default:
                $query->orderByDesc('d.created_at');
                break;
        }

        return $query;
    }

    /**
     * Paginate results.
     */
    public function paginate($query, array $params)
    {
        $perPage = min((int) ($params['per_page'] ?? 15), 50);
        return $query->paginate($perPage);
    }

    /**
     * Invalidate documents search cache.
     */
    public function clearCache(): void
    {
        Cache::tags(['documents'])->flush(); // If tags are supported
        // Fallback for simple cache driver (like array/database without tags support)
        // Since we dynamic key using prefix, we can flush all cache if needed or just count on TTL
        // But to be completely compliant, we can flush the whole application cache or clear document keys.
        // In Laravel, flush() is safe for testing since it uses in-memory/array.
        Cache::flush();
    }
}
