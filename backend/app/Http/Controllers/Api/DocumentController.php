<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AccessGateService;
use App\Services\GamificationService;
use App\Support\PointTransactionReason;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    public function __construct(
        private readonly AccessGateService $accessGate,
        private readonly GamificationService $gamification,
    ) {}

    public function categories(): JsonResponse
    {
        $categories = DB::table('document_categories')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $categories]);
    }

    public function myFavorites(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = DB::table('user_favorites as uf')
            ->join('documents as d', 'uf.document_id', '=', 'd.id')
            ->leftJoin('document_categories as dc', 'd.category_id', '=', 'dc.id')
            ->leftJoin('access_levels as al', 'd.access_level_id', '=', 'al.id')
            ->leftJoin('user_profiles as up', 'd.created_by', '=', 'up.user_id')
            ->select(
                'd.*',
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
            ->where('uf.user_id', $user->id);

        if ($user->role !== 'admin') {
            $query->where('d.status', 'published');
        }

        $this->accessGate->applyDocumentVisibilityFilter($query, $user, 'd');

        $favorites = $query->orderByDesc('uf.created_at')->limit(50)->get();

        return response()->json(['data' => $favorites]);
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = DB::table('documents as d')
            ->leftJoin('document_categories as dc', 'd.category_id', '=', 'dc.id')
            ->leftJoin('access_levels as al', 'd.access_level_id', '=', 'al.id')
            ->leftJoin('user_profiles as up', 'd.created_by', '=', 'up.user_id')
            ->select(
                'd.*',
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
            );

        if ($request->filled('category_id')) {
            $query->where('d.category_id', $request->input('category_id'));
        }

        if ($request->filled('document_type')) {
            $query->where('d.document_type', $request->input('document_type'));
        }

        if ($request->filled('academic_level')) {
            $query->where('d.academic_level', $request->input('academic_level'));
        }

        if ($request->filled('access_level_id')) {
            $query->where('d.access_level_id', $request->input('access_level_id'));
        }

        if ($request->filled('status')) {
            $query->where('d.status', $request->input('status'));
        } elseif ($user->role !== 'admin') {
            $query->where('d.status', 'published');
        }

        $this->accessGate->applyDocumentVisibilityFilter($query, $user);

        $documents = $query->orderByDesc('d.created_at')->limit(50)->get();

        return response()->json(['data' => $documents]);
    }

    public function search(Request $request): JsonResponse
    {
        $user = $request->user();
        $term = $request->string('q')->toString();

        $query = DB::table('documents as d')
            ->leftJoin('document_categories as dc', 'd.category_id', '=', 'dc.id')
            ->leftJoin('access_levels as al', 'd.access_level_id', '=', 'al.id')
            ->leftJoin('user_profiles as up', 'd.created_by', '=', 'up.user_id')
            ->select(
                'd.*',
                'dc.name as category_name',
                'dc.slug as category_slug',
                'al.name as access_level_name',
                'up.display_name as author_display_name'
            );

        if ($term !== '') {
            $query->where(function ($builder) use ($term): void {
                $builder->where('d.title', 'like', "%{$term}%")
                    ->orWhere('d.summary', 'like', "%{$term}%")
                    ->orWhere('d.author', 'like', "%{$term}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('d.category_id', $request->input('category_id'));
        }

        if ($request->filled('document_type')) {
            $query->where('d.document_type', $request->input('document_type'));
        }

        if ($user->role !== 'admin') {
            $query->where('d.status', 'published');
        }

        $this->accessGate->applyDocumentVisibilityFilter($query, $user);

        return response()->json(['data' => $query->orderByDesc('d.created_at')->limit(50)->get()]);
    }

    public function show(string $id, Request $request): JsonResponse
    {
        $document = $this->findDocument($id);

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        if ($denied = $this->denyUnlessCanAccessDocument($request, $document)) {
            return $denied;
        }

        if ($request->user()->role !== 'admin' && $document->status !== 'published') {
            if ($document->created_by !== $request->user()->id) {
                return response()->json(['message' => 'Document not found.'], 404);
            }
        }

        $tags = DB::table('document_tags as dt')
            ->join('tags as t', 'dt.tag_id', '=', 't.id')
            ->where('dt.document_id', $id)
            ->select('t.id', 't.name', 't.slug')
            ->get();

        $userId = $request->user()->id;

        DB::table('document_views')->insert([
            'id' => (string) Str::uuid(),
            'document_id' => $id,
            'user_id' => $userId,
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        DB::table('documents')->where('id', $id)->increment('views_count');

        $isLiked = DB::table('document_likes')
            ->where('document_id', $id)
            ->where('user_id', $userId)
            ->exists();

        $isFavorited = DB::table('user_favorites')
            ->where('document_id', $id)
            ->where('user_id', $userId)
            ->exists();

        return response()->json([
            'data' => $document,
            'tags' => $tags,
            'is_liked' => $isLiked,
            'is_favorited' => $isFavorited,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:500'],
            'author' => ['required', 'string', 'max:255'],
            'summary' => ['required', 'string'],
            'content' => ['nullable', 'string'],
            'document_type' => ['required', 'in:manuscript,article,report,thesis,archive'],
            'academic_level' => ['required', 'in:intro,advanced,doctorate'],
            'access_level_id' => ['required', 'exists:access_levels,id'],
            'category_id' => ['nullable', 'exists:document_categories,id'],
            'institution' => ['nullable', 'string', 'max:255'],
            'publication_date' => ['nullable', 'date'],
            'period_start' => ['nullable', 'integer'],
            'period_end' => ['nullable', 'integer'],
            'cover_image_url' => ['nullable', 'string', 'max:500'],
            'pdf_url' => ['nullable', 'string', 'max:500'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:100'],
        ]);

        $tags = $validated['tags'] ?? [];
        unset($validated['tags']);

        $id = (string) Str::uuid();

        DB::transaction(function () use ($validated, $id, $request, $tags): void {
            DB::table('documents')->insert(array_merge($validated, [
                'id' => $id,
                'slug' => Str::slug($validated['title']).'-'.Str::lower(Str::random(6)),
                'created_by' => $request->user()->id,
                'created_at' => now(),
                'updated_at' => now(),
                'views_count' => 0,
                'likes_count' => 0,
                'downloads_count' => 0,
                'comments_count' => 0,
                'status' => 'draft',
            ]));

            foreach ($tags as $tagName) {
                $slug = Str::slug($tagName);
                $tag = DB::table('tags')->where('slug', $slug)->first();

                if ($tag === null) {
                    $tagId = (string) Str::uuid();
                    DB::table('tags')->insert([
                        'id' => $tagId,
                        'name' => $tagName,
                        'slug' => $slug,
                        'created_at' => now(),
                    ]);
                } else {
                    $tagId = $tag->id;
                }

                DB::table('document_tags')->insert([
                    'document_id' => $id,
                    'tag_id' => $tagId,
                ]);
            }
        });

        return response()->json(['message' => 'Document created.', 'id' => $id], 201);
    }

    public function update(string $id, Request $request): JsonResponse
    {
        $document = DB::table('documents')->where('id', $id)->first();

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:500'],
            'author' => ['sometimes', 'string', 'max:255'],
            'summary' => ['sometimes', 'string'],
            'content' => ['sometimes', 'nullable', 'string'],
            'document_type' => ['sometimes', 'in:manuscript,article,report,thesis,archive'],
            'academic_level' => ['sometimes', 'in:intro,advanced,doctorate'],
            'access_level_id' => ['sometimes', 'exists:access_levels,id'],
            'category_id' => ['sometimes', 'nullable', 'exists:document_categories,id'],
            'institution' => ['sometimes', 'nullable', 'string', 'max:255'],
            'publication_date' => ['sometimes', 'nullable', 'date'],
            'period_start' => ['sometimes', 'nullable', 'integer'],
            'period_end' => ['sometimes', 'nullable', 'integer'],
            'cover_image_url' => ['sometimes', 'nullable', 'string', 'max:500'],
            'pdf_url' => ['sometimes', 'nullable', 'string', 'max:500'],
            'status' => ['sometimes', 'in:draft,published,archived'],
        ]);

        if (empty($validated)) {
            return response()->json(['message' => 'No fields to update.'], 422);
        }

        $validated['updated_at'] = now();

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']).'-'.Str::lower(Str::random(6));
        }

        if (isset($validated['status']) && $validated['status'] === 'published' && $document->published_at === null) {
            $validated['published_at'] = now();
            $validated['reviewed_by'] = $request->user()->id;
        }

        DB::table('documents')->where('id', $id)->update($validated);

        $updated = DB::table('documents')->where('id', $id)->first();

        return response()->json([
            'message' => 'Document updated.',
            'data' => $updated,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $document = DB::table('documents')->where('id', $id)->first();

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        DB::table('documents')->where('id', $id)->delete();

        return response()->json(['message' => 'Document deleted.']);
    }

    public function like(string $id, Request $request): JsonResponse
    {
        $document = DB::table('documents')->where('id', $id)->first();

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        if ($denied = $this->denyUnlessCanAccessDocument($request, $document)) {
            return $denied;
        }

        $userId = $request->user()->id;

        $existing = DB::table('document_likes')
            ->where('document_id', $id)
            ->where('user_id', $userId)
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'Already liked.'], 409);
        }

        DB::table('document_likes')->insert([
            'id' => (string) Str::uuid(),
            'document_id' => $id,
            'user_id' => $userId,
            'created_at' => now(),
        ]);

        DB::table('documents')->where('id', $id)->increment('likes_count');

        return response()->json(['message' => 'Document liked.']);
    }

    public function unlike(string $id, Request $request): JsonResponse
    {
        $document = DB::table('documents')->where('id', $id)->first();

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        if ($denied = $this->denyUnlessCanAccessDocument($request, $document)) {
            return $denied;
        }

        $userId = $request->user()->id;

        $deleted = DB::table('document_likes')
            ->where('document_id', $id)
            ->where('user_id', $userId)
            ->delete();

        if ($deleted === 0) {
            return response()->json(['message' => 'Like not found.'], 404);
        }

        DB::table('documents')->where('id', $id)->decrement('likes_count');

        return response()->json(['message' => 'Like removed.']);
    }

    public function download(string $id, Request $request): JsonResponse
    {
        $document = DB::table('documents')->where('id', $id)->first();

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        if ($denied = $this->denyUnlessCanAccessDocument($request, $document)) {
            return $denied;
        }

        DB::table('document_downloads')->insert([
            'id' => (string) Str::uuid(),
            'document_id' => $id,
            'user_id' => $request->user()->id,
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        DB::table('documents')->where('id', $id)->increment('downloads_count');

        return response()->json([
            'message' => 'Download recorded.',
            'pdf_url' => $document->pdf_url,
        ]);
    }

    public function favorite(string $id, Request $request): JsonResponse
    {
        $document = DB::table('documents')->where('id', $id)->first();

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        if ($denied = $this->denyUnlessCanAccessDocument($request, $document)) {
            return $denied;
        }

        $userId = $request->user()->id;

        $existing = DB::table('user_favorites')
            ->where('document_id', $id)
            ->where('user_id', $userId)
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'Already favorited.'], 409);
        }

        DB::table('user_favorites')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'document_id' => $id,
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Document added to favorites.']);
    }

    public function unfavorite(string $id, Request $request): JsonResponse
    {
        $document = DB::table('documents')->where('id', $id)->first();

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        if ($denied = $this->denyUnlessCanAccessDocument($request, $document)) {
            return $denied;
        }

        $userId = $request->user()->id;

        $deleted = DB::table('user_favorites')
            ->where('document_id', $id)
            ->where('user_id', $userId)
            ->delete();

        if ($deleted === 0) {
            return response()->json(['message' => 'Favorite not found.'], 404);
        }

        return response()->json(['message' => 'Document removed from favorites.']);
    }

    public function createCitation(string $id, Request $request): JsonResponse
    {
        $document = DB::table('documents')->where('id', $id)->first();

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        if ($denied = $this->denyUnlessCanAccessDocument($request, $document)) {
            return $denied;
        }

        $validated = $request->validate([
            'citation_format' => ['sometimes', 'in:apa,mla,chicago,abnt'],
        ]);

        $format = $validated['citation_format'] ?? 'apa';

        DB::table('document_citations')->insert([
            'id' => (string) Str::uuid(),
            'document_id' => $id,
            'user_id' => $request->user()->id,
            'citation_format' => $format,
            'created_at' => now(),
        ]);

        $citation = $this->generateCitation($document, $format);

        return response()->json([
            'message' => 'Citation created.',
            'citation' => $citation,
            'format' => $format,
        ]);
    }

    private function findDocument(string $id): ?object
    {
        return DB::table('documents as d')
            ->leftJoin('document_categories as dc', 'd.category_id', '=', 'dc.id')
            ->leftJoin('access_levels as al', 'd.access_level_id', '=', 'al.id')
            ->leftJoin('user_profiles as up', 'd.created_by', '=', 'up.user_id')
            ->where('d.id', $id)
            ->select(
                'd.*',
                'dc.name as category_name',
                'dc.slug as category_slug',
                'dc.color_bg as category_color_bg',
                'dc.icon as category_icon',
                'al.name as access_level_name',
                'al.icon as access_level_icon',
                'up.display_name as author_display_name',
                'up.avatar_url as author_avatar_url',
                'up.institution as author_institution'
            )
            ->first();
    }

    private function denyUnlessCanAccessDocument(Request $request, object $document): ?JsonResponse
    {
        if (! $this->accessGate->canAccessDocument($request->user(), $document)) {
            return response()->json([
                'message' => 'You do not have access to this content.',
                'required_access_level_id' => $document->access_level_id ?? null,
            ], 403);
        }

        return null;
    }

    private function generateCitation(object $document, string $format): string
    {
        $year = $document->publication_date
            ? date('Y', strtotime($document->publication_date))
            : date('Y', strtotime($document->created_at));

        return match ($format) {
            'apa' => "{$document->author} ({$year}). {$document->title}.",
            'mla' => "{$document->author}. \"{$document->title}.\" {$year}.",
            'chicago' => "{$document->author}. \"{$document->title}.\" {$year}.",
            'abnt' => "{$document->author}. {$document->title}. {$year}.",
            default => "{$document->author} ({$year}). {$document->title}.",
        };
    }
}
