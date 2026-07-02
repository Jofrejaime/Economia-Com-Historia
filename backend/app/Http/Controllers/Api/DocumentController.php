<?php

namespace App\Http\Controllers\Api;

use App\Enums\DocumentStatus;
use App\Enums\SubscriptionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Http\Resources\QuizSummaryResource;
use App\Models\Document;
use App\Services\DocumentAccessService;
use App\Services\DocumentSubscriptionService;
use App\Services\GamificationService;
use App\Services\QuizDocumentService;
use App\Support\PointTransactionReason;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    public function __construct(
        private readonly DocumentAccessService       $documentAccess,
        private readonly DocumentSubscriptionService $subscriptionService,
        private readonly GamificationService         $gamification,
        private readonly QuizDocumentService         $quizDocuments,
    ) {}

    /**
     * @OA\Get(
     *      path="/document-categories",
     *      operationId="documentCategories",
     *      tags={"Documents"},
     *      summary="Listar categorias de documentos",
     *      description="Retorna todas as categorias de documentos disponíveis.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Categorias obtidas com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado")
     * )
     */
    public function categories(): JsonResponse
    {
        $categories = DB::table('document_categories')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $categories]);
    }

    /**
     * @OA\Get(
     *      path="/me/favorites",
     *      operationId="myFavorites",
     *      tags={"Documents"},
     *      summary="Listar documentos favoritos",
     *      description="Lista os documentos marcados como favoritos pelo utilizador autenticado.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Lista obtida com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado")
     * )
     */
    public function myFavorites(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = DB::table('user_favorites as uf')
            ->join('documents as d', 'uf.document_id', '=', 'd.id')
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
            ->where('uf.user_id', $user->id);

        if ($user->role !== 'admin') {
            $query->where('d.status', DocumentStatus::PUBLISHED->value);
        }

        $this->documentAccess->applyListingFilter($query, $user, 'd');

        $favorites = $query->orderByDesc('uf.created_at')->limit(50)->get();

        return response()->json([
            'data' => collect($favorites)
                ->map(fn ($doc) => (new DocumentResource($doc))->toArray($request))
                ->all(),
        ]);
    }

    /**
     * @OA\Get(
     *      path="/documents",
     *      operationId="indexDocuments",
     *      tags={"Documents"},
     *      summary="Listar documentos com filtros",
     *      description="Obtém a lista de documentos ativos aos quais o utilizador tem permissões de acesso.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="category_id", in="query", required=false, @OA\Schema(type="string", format="uuid")),
     *      @OA\Parameter(name="document_type", in="query", required=false, @OA\Schema(type="string", enum={"manuscript", "article", "report", "thesis", "archive"})),
     *      @OA\Parameter(name="media_type", in="query", required=false, description="Filtrar por tipo de media", @OA\Schema(type="string", enum={"TEXT", "IMAGE", "VIDEO", "AUDIO", "PDF"})),
     *      @OA\Parameter(name="pinned", in="query", required=false, description="Filtrar apenas fixados", @OA\Schema(type="boolean")),
     *      @OA\Parameter(name="academic_level", in="query", required=false, @OA\Schema(type="string", enum={"intro", "advanced", "doctorate"})),
     *      @OA\Parameter(name="access_level_id", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Response(
     *          response=200,
     *          description="Documentos obtidos com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *              @OA\Property(property="meta", type="object")
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado")
     * )
     */
    public function index(Request $request): JsonResponse
{
    $user = $request->user();

    $query = DB::table('documents as d')
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

    if ($request->filled('q')) {
        $term = $request->string('q')->toString();
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

    if ($request->filled('academic_level')) {
        $query->where('d.academic_level', $request->input('academic_level'));
    }

    if ($request->filled('access_level_id')) {
        $query->where('d.access_level_id', $request->input('access_level_id'));
    }

    if ($request->filled('media_type')) {
        $query->where('d.media_type', $request->input('media_type'));
    }

    if ($request->boolean('pinned')) {
        $query->where('d.is_pinned', true);
    }

    if ($request->filled('status')) {
        $query->where('d.status', $request->input('status'));
    } elseif ($user === null || $user->role !== 'admin') {
        $query->where('d.status', DocumentStatus::PUBLISHED->value);
    }

    $this->documentAccess->applyListingFilter($query, $user);

    $query->orderByDesc('d.is_pinned');

    if ($request->input('sort') === 'popular') {
        $query->orderByDesc('d.likes_count')->orderByDesc('d.views_count');
    } else {
        $query->orderByDesc('d.created_at');
    }

    $perPage = min((int) $request->input('per_page', 15), 50);
    $paginator = $query->paginate($perPage);

    return response()->json([
        'data' => collect($paginator->items())
            ->map(fn ($doc) => (new DocumentResource($doc))->toArray($request))
            ->all(),
        'meta' => [
            'current_page' => $paginator->currentPage(),
            'last_page'    => $paginator->lastPage(),
            'per_page'     => $paginator->perPage(),
            'total'        => $paginator->total(),
        ],
    ]);
}

    /**
     * @OA\Get(
     *      path="/documents/search",
     *      operationId="searchDocuments",
     *      tags={"Documents"},
     *      summary="Pesquisar documentos por texto",
     *      description="Pesquisa em título, sumário e autor dos documentos.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="q", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="category_id", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="document_type", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Response(
     *          response=200,
     *          description="Resultados da pesquisa",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado")
     * )
     */
    public function search(Request $request): JsonResponse
{
    $user = $request->user();
    $term = $request->string('q')->toString();

    $query = DB::table('documents as d')
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
            'al.name as access_level_name',
            'up.display_name as author_display_name'
        )
        ->addSelect([
            'topics_count' => DB::table('discussion_topics')
                ->whereColumn('document_id', 'd.id')
                ->selectRaw('count(*)')
        ]);

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

    if ($user === null || $user->role !== 'admin') {
        $query->where('d.status', DocumentStatus::PUBLISHED->value);
    }

    $this->documentAccess->applyListingFilter($query, $user);

    $results = $query->orderByDesc('d.created_at')->limit(50)->get();

    return response()->json([
        'data' => collect($results)
            ->map(fn ($doc) => (new DocumentResource($doc))->toArray($request))
            ->all(),
    ]);
}

    /**
     * @OA\Get(
     *      path="/documents/{id}",
     *      operationId="showDocument",
     *      tags={"Documents"},
     *      summary="Visualizar detalhes de um documento",
     *      description="Retorna detalhes completos de um documento e regista uma visualização.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(
     *          response=200,
     *          description="Documento recuperado com sucesso.",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="object",
     *                  @OA\Property(property="topics_count", type="integer"),
     *                  @OA\Property(property="quizzes_count", type="integer"),
     *                  @OA\Property(property="topics_preview", type="array", @OA\Items(type="object")),
     *                  @OA\Property(property="quizzes", type="array", @OA\Items(type="object")),
     *                  @OA\Property(property="learning", type="object",
     *                      @OA\Property(property="documents_in_category", type="integer"),
     *                      @OA\Property(property="related_quizzes", type="integer"),
     *                      @OA\Property(property="related_topics", type="integer")
     *                  )
     *              ),
     *              @OA\Property(property="tags", type="array", @OA\Items(type="object")),
     *              @OA\Property(property="is_liked", type="boolean"),
     *              @OA\Property(property="is_favorited", type="boolean")
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Acesso negado por nível de privilégios insuficiente"),
     *      @OA\Response(response=404, description="Documento não encontrado ou não publicado")
     * )
     */
    public function show(string $id, Request $request): JsonResponse
{
    $user = $request->user();
    $document = Document::with([
        'category' => function ($q) {
            $q->withCount('documents');
        },
        'accessLevel',
        'createdBy.profile',
        'quizzes' => function ($q) {
            $q->select(
                'quizzes.id', 'quizzes.title', 'quizzes.description',
                'quizzes.difficulty', 'quizzes.base_points', 'quizzes.time_limit_secs',
                'quizzes.attempts_count', 'quizzes.avg_score', 'quizzes.status'
            )->withCount('questions');
        },
        'topics' => function ($q) {
            $q->select('id', 'document_id', 'author_id', 'title', 'replies_count', 'created_at')
              ->with('author.profile')
              ->orderByDesc('created_at')
              ->limit(3);
        }
    ])
    ->withCount(['topics', 'quizzes'])
    ->find($id);

    if ($document === null) {
        return response()->json(['message' => 'Document not found.'], 404);
    }

    if (!$this->documentAccess->canReadDocument($user, $document)) {
        return $this->denyDocumentAccess($document);
    }

    if (($user === null || $user->role !== 'admin') && $document->status !== DocumentStatus::PUBLISHED->value) {
        if ($user === null || $document->created_by !== $user->id) {
            return response()->json(['message' => 'Document not found.'], 404);
        }
    }

    // Fallback de quizzes: sem ligações directas → publicados da mesma categoria
    if ($document->quizzes->isEmpty() && $document->category_id) {
        $fallbackQuizzes = \App\Models\Quiz::published()
            ->where('category_id', $document->category_id)
            ->withCount('questions')
            ->orderByDesc('is_featured')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'title', 'description', 'difficulty', 'base_points', 'time_limit_secs', 'attempts_count', 'avg_score', 'status']);
        $document->setRelation('quizzes', $fallbackQuizzes);
    }

    $tags = DB::table('document_tags as dt')
        ->join('tags as t', 'dt.tag_id', '=', 't.id')
        ->where('dt.document_id', $id)
        ->select('t.id', 't.name', 't.slug')
        ->get();

    $userId = $user?->id;

    DB::table('document_views')->insert([
        'id'          => (string) Str::uuid(),
        'document_id' => $id,
        'user_id'     => $userId,
        'ip_address'  => $request->ip(),
        'created_at'  => now(),
    ]);

    $document->increment('views_count');

    $isLiked = $userId !== null && DB::table('document_likes')
        ->where('document_id', $id)
        ->where('user_id', $userId)
        ->exists();

    $isFavorited = $userId !== null && DB::table('user_favorites')
        ->where('document_id', $id)
        ->where('user_id', $userId)
        ->exists();

    $topicsPreview = $this->buildTopicsPreview($document);

    return response()->json([
        'data'            => (new DocumentResource($document))->toArray($request),
        'tags'            => $tags,
        'is_liked'        => $isLiked,
        'is_favorited'    => $isFavorited,
        'topics_preview'  => $topicsPreview,
    ]);
}

    /**
     * @OA\Post(
     *      path="/documents",
     *      operationId="storeDocument",
     *      tags={"Documents"},
     *      summary="Criar novo documento (Admin/Professor)",
     *      description="Adiciona um novo documento na base de dados em estado de rascunho (draft).",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"title", "author", "summary", "document_type", "academic_level", "access_level_id"},
     *              @OA\Property(property="title", type="string", maxLength=500),
     *              @OA\Property(property="author", type="string", maxLength=255),
     *              @OA\Property(property="summary", type="string"),
     *              @OA\Property(property="content", type="string", nullable=true),
     *              @OA\Property(property="document_type", type="string", enum={"manuscript", "article", "report", "thesis", "archive"}),
     *              @OA\Property(property="academic_level", type="string", enum={"intro", "advanced", "doctorate"}),
     *              @OA\Property(property="access_level_id", type="string"),
     *              @OA\Property(property="category_id", type="string", format="uuid", nullable=true),
     *              @OA\Property(property="institution", type="string", nullable=true),
     *              @OA\Property(property="publication_date", type="string", format="date", nullable=true),
     *              @OA\Property(property="period_start", type="integer", nullable=true),
     *              @OA\Property(property="period_end", type="integer", nullable=true),
     *              @OA\Property(property="cover_image_url", type="string", nullable=true),
     *              @OA\Property(property="media_type", type="string", enum={"TEXT", "IMAGE", "VIDEO", "AUDIO", "PDF"}, nullable=true),
     *              @OA\Property(property="media_url", type="string", nullable=true),
     *              @OA\Property(property="pdf_url", type="string", nullable=true, description="DEPRECATED — use media_url"),
     *              @OA\Property(property="tags", type="array", @OA\Items(type="string"), nullable=true)
     *          )
     *      ),
     *      @OA\Response(response=201, description="Documento criado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string"),
     *              @OA\Property(property="id", type="string", format="uuid")
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=422, description="Erros de validação")
     * )
     */
    public function store(StoreDocumentRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $tags = $validated['tags'] ?? [];
        unset($validated['tags']);

        $id = (string) Str::uuid();

        DB::transaction(function () use ($validated, $id, $request, $tags): void {
            DB::table('documents')->insert(array_merge($validated, [
                'id'              => $id,
                'slug'            => Str::slug($validated['title']).'-'.Str::lower(Str::random(6)),
                'created_by'      => $request->user()->id,
                'created_at'      => now(),
                'updated_at'      => now(),
                'views_count'     => 0,
                'likes_count'     => 0,
                'downloads_count' => 0,
                'status'          => DocumentStatus::DRAFT->value,
            ]));

            foreach ($tags as $tagName) {
                $slug = Str::slug($tagName);
                $tag  = DB::table('tags')->where('slug', $slug)->first();

                if ($tag === null) {
                    $tagId = (string) Str::uuid();
                    DB::table('tags')->insert([
                        'id'         => $tagId,
                        'name'       => $tagName,
                        'slug'       => $slug,
                        'created_at' => now(),
                    ]);
                } else {
                    $tagId = $tag->id;
                }

                DB::table('document_tags')->insert([
                    'document_id' => $id,
                    'tag_id'      => $tagId,
                ]);
            }
        });

        return response()->json(['message' => 'Document created.', 'id' => $id], 201);
    }

    /**
     * @OA\Patch(
     *      path="/documents/{id}",
     *      operationId="updateDocument",
     *      tags={"Documents"},
     *      summary="Atualizar documento (Admin/Professor)",
     *      description="Atualiza um documento existente.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              @OA\Property(property="title", type="string", maxLength=500),
     *              @OA\Property(property="status", type="string", enum={"draft", "published", "archived"})
     *          )
     *      ),
     *      @OA\Response(response=200, description="Documento atualizado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string"),
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=404, description="Documento não encontrado"),
     *      @OA\Response(response=422, description="Erros de validação")
     * )
     */
    public function update(string $id, UpdateDocumentRequest $request): JsonResponse
    {
        $document = Document::find($id);

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        $validated = $request->validated();

        if (empty($validated)) {
            return response()->json(['message' => 'No fields to update.'], 422);
        }

        $validated['updated_at'] = now();

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']).'-'.Str::lower(Str::random(6));
        }

        if (isset($validated['status']) && $validated['status'] === DocumentStatus::PUBLISHED->value && $document->published_at === null) {
            $validated['published_at'] = now();
            $validated['reviewed_by']  = $request->user()->id;
        }

        $document->fill($validated)->save();

        $document->load(['category', 'accessLevel', 'createdBy.profile']);

        return response()->json([
            'message' => 'Document updated.',
            'data'    => (new DocumentResource($document))->toArray($request),
        ]);
    }

    /**
     * @OA\Delete(
     *      path="/documents/{id}",
     *      operationId="destroyDocument",
     *      tags={"Documents"},
     *      summary="Eliminar documento (Admin/Professor)",
     *      description="Elimina permanentemente um documento.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Documento eliminado com sucesso",
     *          @OA\JsonContent(@OA\Property(property="message", type="string"))
     *      ),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=404, description="Documento não encontrado")
     * )
     */
    public function destroy(string $id): JsonResponse
    {
        $document = Document::find($id);

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        $document->delete();

        return response()->json(['message' => 'Document deleted.']);
    }

    /**
     * @OA\Post(
     *      path="/documents/{id}/like",
     *      operationId="likeDocument",
     *      tags={"Documents"},
     *      summary="Gostar de um documento",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Like registado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string"),
     *              @OA\Property(property="gamification", type="object")
     *          )
     *      ),
     *      @OA\Response(response=404, description="Documento não encontrado"),
     *      @OA\Response(response=403, description="Sem acesso"),
     *      @OA\Response(response=409, description="Já gostou anteriormente")
     * )
     */
    public function like(string $id, Request $request): JsonResponse
    {
        $document = Document::find($id);

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        if (!$this->documentAccess->canReadDocument($request->user(), $document)) {
            return $this->denyDocumentAccess($document);
        }

        $userId = $request->user()->id;

        $existing = DB::table('document_likes')
            ->where('document_id', $id)
            ->where('user_id', $userId)
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'Already liked.'], 409);
        }

        $likeId = (string) Str::uuid();

        DB::transaction(function () use ($id, $userId, $likeId, $document): void {
            DB::table('document_likes')->insert([
                'id'          => $likeId,
                'document_id' => $id,
                'user_id'     => $userId,
                'created_at'  => now(),
            ]);

            $document->increment('likes_count');
        });

        $gamification = $this->gamification->awardPoints(
            $request->user(),
            5,
            PointTransactionReason::DOCUMENT_LIKED,
            $id,
            'document',
            "Liked document: {$document->title}"
        );

        return response()->json([
            'message'      => 'Document liked.',
            'gamification' => $gamification->toArray(),
        ]);
    }

    /**
     * @OA\Delete(
     *      path="/documents/{id}/like",
     *      operationId="unlikeDocument",
     *      tags={"Documents"},
     *      summary="Remover gosto de um documento",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Like removido"),
     *      @OA\Response(response=404, description="Gosto ou documento não encontrado")
     * )
     */
    public function unlike(string $id, Request $request): JsonResponse
    {
        $document = Document::find($id);

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        if (!$this->documentAccess->canReadDocument($request->user(), $document)) {
            return $this->denyDocumentAccess($document);
        }

        $userId = $request->user()->id;

        $deleted = DB::table('document_likes')
            ->where('document_id', $id)
            ->where('user_id', $userId)
            ->delete();

        if ($deleted === 0) {
            return response()->json(['message' => 'Like not found.'], 404);
        }

        $document->decrement('likes_count');

        return response()->json(['message' => 'Like removed.']);
    }

    /**
     * @OA\Post(
     *      path="/documents/{id}/download",
     *      operationId="downloadDocument",
     *      tags={"Documents"},
     *      summary="Registar download de documento",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Download registado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string"),
     *              @OA\Property(property="pdf_url", type="string")
     *          )
     *      ),
     *      @OA\Response(response=404, description="Documento não encontrado"),
     *      @OA\Response(response=403, description="Acesso proibido")
     * )
     */
    public function download(string $id, Request $request): JsonResponse
    {
        $document = Document::find($id);

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        if (!$this->documentAccess->canReadDocument($request->user(), $document)) {
            return $this->denyDocumentAccess($document);
        }

        DB::table('document_downloads')->insert([
            'id'          => (string) Str::uuid(),
            'document_id' => $id,
            'user_id'     => $request->user()->id,
            'ip_address'  => $request->ip(),
            'created_at'  => now(),
        ]);

        $document->increment('downloads_count');

        return response()->json([
            'message' => 'Download recorded.',
            'pdf_url' => $document->pdf_url,
        ]);
    }

    /**
     * @OA\Post(
     *      path="/documents/{id}/favorite",
     *      operationId="favoriteDocument",
     *      tags={"Documents"},
     *      summary="Marcar documento como favorito",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Favoritado com sucesso"),
     *      @OA\Response(response=404, description="Documento não encontrado"),
     *      @OA\Response(response=409, description="Já favoritado anteriormente")
     * )
     */
    public function favorite(string $id, Request $request): JsonResponse
    {
        $document = Document::find($id);

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        if (!$this->documentAccess->canReadDocument($request->user(), $document)) {
            return $this->denyDocumentAccess($document);
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
            'id'          => (string) Str::uuid(),
            'user_id'     => $userId,
            'document_id' => $id,
            'created_at'  => now(),
        ]);

        return response()->json(['message' => 'Document added to favorites.']);
    }

    /**
     * @OA\Delete(
     *      path="/documents/{id}/favorite",
     *      operationId="unfavoriteDocument",
     *      tags={"Documents"},
     *      summary="Remover favorito de documento",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Removido dos favoritos com sucesso"),
     *      @OA\Response(response=404, description="Documento ou favorito não encontrado")
     * )
     */
    public function unfavorite(string $id, Request $request): JsonResponse
    {
        $document = Document::find($id);

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        if (!$this->documentAccess->canReadDocument($request->user(), $document)) {
            return $this->denyDocumentAccess($document);
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

    /**
     * @OA\Post(
     *      path="/documents/{id}/citations",
     *      operationId="createCitation",
     *      tags={"Documents"},
     *      summary="Gerar e registar citação académica",
     *      description="Gera uma citação académica no formato pedido (APA, MLA, Chicago, ABNT).",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\RequestBody(
     *          required=false,
     *          @OA\JsonContent(
     *              @OA\Property(property="citation_format", type="string", enum={"apa", "mla", "chicago", "abnt"}, default="apa")
     *          )
     *      ),
     *      @OA\Response(response=200, description="Citação gerada com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string"),
     *              @OA\Property(property="citation", type="string"),
     *              @OA\Property(property="format", type="string")
     *          )
     *      ),
     *      @OA\Response(response=404, description="Documento não encontrado"),
     *      @OA\Response(response=403, description="Sem acesso"),
     *      @OA\Response(response=422, description="Formato inválido")
     * )
     */
    public function createCitation(string $id, Request $request): JsonResponse
    {
        $document = Document::find($id);

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        if (!$this->documentAccess->canReadDocument($request->user(), $document)) {
            return $this->denyDocumentAccess($document);
        }

        $validated = $request->validate([
            'citation_format' => ['sometimes', 'in:apa,mla,chicago,abnt'],
        ]);

        $format = $validated['citation_format'] ?? 'apa';

        DB::table('document_citations')->insert([
            'id'              => (string) Str::uuid(),
            'document_id'     => $id,
            'user_id'         => $request->user()->id,
            'citation_format' => $format,
            'created_at'      => now(),
        ]);

        $citation = $this->generateCitation($document, $format);

        return response()->json([
            'message'  => 'Citation created.',
            'citation' => $citation,
            'format'   => $format,
        ]);
    }

    /**
     * @OA\Post(
     *      path="/documents/{id}/pin",
     *      operationId="pinDocument",
     *      tags={"Documents"},
     *      summary="Fixar documento (Admin)",
     *      description="Marca um documento como fixado. Apenas administradores.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Documento fixado",
     *          @OA\JsonContent(@OA\Property(property="message", type="string"))
     *      ),
     *      @OA\Response(response=404, description="Documento não encontrado"),
     *      @OA\Response(response=403, description="Apenas administradores")
     * )
     */
    public function pin(string $id): JsonResponse
    {
        $document = Document::find($id);

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        $document->update(['is_pinned' => true]);

        return response()->json(['message' => 'Document pinned.']);
    }

    /**
     * @OA\Delete(
     *      path="/documents/{id}/pin",
     *      operationId="unpinDocument",
     *      tags={"Documents"},
     *      summary="Remover fixação de documento (Admin)",
     *      description="Remove a fixação de um documento. Apenas administradores.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Fixação removida",
     *          @OA\JsonContent(@OA\Property(property="message", type="string"))
     *      ),
     *      @OA\Response(response=404, description="Documento não encontrado"),
     *      @OA\Response(response=403, description="Apenas administradores")
     * )
     */
    public function unpin(string $id): JsonResponse
    {
        $document = Document::find($id);

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        $document->update(['is_pinned' => false]);

        return response()->json(['message' => 'Document unpinned.']);
    }

    /**
     * @OA\Get(
     *      path="/documents/{id}/subscription",
     *      operationId="documentSubscriptionStatus",
     *      tags={"Documents"},
     *      summary="Estado da subscrição do utilizador para um documento",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Estado da subscrição",
     *          @OA\JsonContent(
     *              @OA\Property(property="required", type="boolean"),
     *              @OA\Property(property="status", type="string", nullable=true, enum={"PENDING", "ACTIVE", "REJECTED", "CANCELLED"}),
     *              @OA\Property(property="reason", type="string", nullable=true, enum={"WAITING_ADMIN_APPROVAL", "ACCESS_GRANTED", "REQUEST_REJECTED", "SUBSCRIPTION_CANCELLED"}),
     *              @OA\Property(property="started_at", type="string", format="date-time", nullable=true)
     *          )
     *      ),
     *      @OA\Response(response=404, description="Documento não encontrado")
     * )
     */
    public function subscriptionStatus(string $id, Request $request): JsonResponse
    {
        $document = Document::with(['category'])->find($id);

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        $required = $this->documentAccess->isSubscriptionRequired($document);

        if (!$required) {
            return response()->json([
                'required'        => false,
                'status'          => null,
                'reason'          => null,
                'has_subscription' => false,
                'started_at'      => null,
            ]);
        }

        $statusInfo = $this->subscriptionService->subscriptionStatus($request->user()->id, $id);

        return response()->json([
            'required'        => true,
            'status'          => $statusInfo['status'],
            'reason'          => $statusInfo['reason'],
            'has_subscription' => $statusInfo['has_subscription'],
            'started_at'      => $statusInfo['started_at'],
        ]);
    }

    /**
     * @OA\Post(
     *      path="/documents/{id}/subscribe",
     *      operationId="subscribeDocument",
     *      tags={"Documents"},
     *      summary="Solicitar subscrição para um documento",
     *      description="Cria um pedido PENDING. Admin pode especificar user_id para solicitar em nome de outro utilizador.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\RequestBody(
     *          required=false,
     *          @OA\JsonContent(
     *              @OA\Property(property="user_id", type="string", format="uuid", nullable=true, description="Admin only")
     *          )
     *      ),
     *      @OA\Response(response=201, description="Pedido criado",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string"),
     *              @OA\Property(property="id", type="string", format="uuid")
     *          )
     *      ),
     *      @OA\Response(response=200, description="Pedido já existente (ACTIVE ou PENDING)"),
     *      @OA\Response(response=404, description="Documento não encontrado")
     * )
     */
    public function subscribe(string $id, Request $request): JsonResponse
    {
        $document = Document::find($id);

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        $validated = $request->validate([
            'user_id' => ['sometimes', 'nullable', 'exists:users,id'],
        ]);

        $targetUserId = ($request->user()->role === 'admin' && !empty($validated['user_id']))
            ? $validated['user_id']
            : $request->user()->id;

        $result = $this->subscriptionService->requestSubscription($targetUserId, $id);

        if (!$result['created']) {
            $message = $result['status'] === SubscriptionStatus::ACTIVE->value
                ? 'Already subscribed.'
                : 'Subscription request already pending.';

            return response()->json([
                'id'            => $result['id'],
                'status'        => $result['status'],
                'already_exists' => true,
                'message'       => $message,
            ], 200);
        }

        return response()->json([
            'id'            => $result['id'],
            'status'        => $result['status'],
            'already_exists' => false,
            'message'       => 'Subscription request created.',
        ], 201);
    }

    /**
     * @OA\Delete(
     *      path="/documents/{id}/subscription",
     *      operationId="cancelDocumentSubscription",
     *      tags={"Documents"},
     *      summary="Cancelar subscrição de um documento",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Subscrição cancelada"),
     *      @OA\Response(response=404, description="Documento ou subscrição activa não encontrada")
     * )
     */
    public function cancelSubscription(string $id, Request $request): JsonResponse
    {
        $document = Document::find($id);

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        $cancelled = $this->subscriptionService->cancelSubscription($request->user()->id, $id);

        if (!$cancelled) {
            return response()->json(['message' => 'No active or pending subscription found.'], 404);
        }

        return response()->json(['message' => 'Subscription cancelled.']);
    }

    private function denyDocumentAccess(object $document): JsonResponse
    {
        $isSubscriptionRequired = $this->documentAccess->isSubscriptionRequired($document);

        return response()->json([
            'message'                  => 'You do not have access to this content.',
            'subscription_required'    => $isSubscriptionRequired,
            'required_access_level_id' => $isSubscriptionRequired ? null : ($document->access_level_id ?? null),
        ], 403);
    }

    /**
     * @OA\Get(
     *      path="/documents/{id}/quizzes",
     *      operationId="documentRelatedQuizzes",
     *      tags={"Documents"},
     *      summary="Listar quizzes associados a um documento",
     *      description="Retorna os quizzes publicados associados ao documento, ordenados por sort_order.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, description="ID do documento", @OA\Schema(type="string")),
     *      @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer", default=1)),
     *      @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15, maximum=100)),
     *      @OA\Parameter(name="sort_by", in="query", required=false, @OA\Schema(type="string", enum={"sort_order","title","difficulty","published_at"})),
     *      @OA\Parameter(name="sort_direction", in="query", required=false, @OA\Schema(type="string", enum={"asc","desc"})),
     *      @OA\Response(
     *          response=200,
     *          description="Quizzes obtidos com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *              @OA\Property(property="meta", type="object")
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=404, description="Documento não encontrado")
     * )
     */
    public function relatedQuizzes(string $id, Request $request): JsonResponse
    {
        $document = DB::table('documents')->where('id', $id)->first();
        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        $options = [
            'page'           => $request->input('page', 1),
            'per_page'       => $request->input('per_page', 10),
            'sort_by'        => $request->input('sort_by'),
            'sort_direction' => $request->input('sort_direction'),
        ];

        $result = $this->quizDocuments->availableQuizzesForDocument($id, $options);

        // Fallback: sem ligações directas → quizzes publicados da mesma categoria
        if ($result['meta']['total'] === 0 && $document->category_id) {
            $quizzes = \App\Models\Quiz::published()
                ->where('category_id', $document->category_id)
                ->orderByDesc('is_featured')
                ->orderByDesc('created_at')
                ->limit(10)
                ->get();

            return response()->json([
                'data' => QuizSummaryResource::collection($quizzes),
                'meta' => [
                    'current_page' => 1,
                    'last_page'    => 1,
                    'per_page'     => $quizzes->count(),
                    'total'        => $quizzes->count(),
                ],
            ]);
        }

        return response()->json([
            'data' => QuizSummaryResource::collection($result['data']),
            'meta' => $result['meta'],
        ]);
    }

    private function buildTopicsPreview(Document $document): array
    {
        // Tópicos directamente ligados ao documento (via document_id)
        if ($document->topics->isNotEmpty()) {
            return $document->topics->map(fn ($t) => [
                'id'                => $t->id,
                'title'             => $t->title,
                'replies_count'     => (int) $t->replies_count,
                'created_at'        => $t->created_at,
                'category_color_bg' => null,
                'author'            => [
                    'display_name' => $t->author?->profile?->display_name,
                    'avatar_url'   => $t->author?->profile?->avatar_url,
                ],
            ])->all();
        }

        // Fallback: tópicos da categoria comunitária com o mesmo nome
        if (!$document->category) {
            return [];
        }

        $communityCategory = DB::table('community_categories')
            ->whereRaw('LOWER(name) = LOWER(?)', [$document->category->name])
            ->first(['id', 'color_bg']);

        if (!$communityCategory) {
            return [];
        }

        return DB::table('discussion_topics as dt')
            ->leftJoin('user_profiles as up', 'dt.author_id', '=', 'up.user_id')
            ->where('dt.category_id', $communityCategory->id)
            ->where('dt.status', 'open')
            ->whereIn('dt.visibility', ['PUBLIC', 'CATEGORY'])
            ->orderByDesc('dt.created_at')
            ->limit(3)
            ->select(
                'dt.id', 'dt.title', 'dt.replies_count', 'dt.created_at',
                'up.display_name as author_display_name', 'up.avatar_url as author_avatar_url'
            )
            ->get()
            ->map(fn ($t) => [
                'id'                => $t->id,
                'title'             => $t->title,
                'replies_count'     => (int) $t->replies_count,
                'created_at'        => $t->created_at,
                'category_color_bg' => $communityCategory->color_bg,
                'author'            => [
                    'display_name' => $t->author_display_name,
                    'avatar_url'   => $t->author_avatar_url,
                ],
            ])
            ->all();
    }

    private function generateCitation(object $document, string $format): string
    {
        $year = $document->publication_date
            ? date('Y', strtotime((string) $document->publication_date))
            : date('Y', strtotime((string) $document->created_at));

        return match ($format) {
            'apa'     => "{$document->author} ({$year}). {$document->title}.",
            'mla'     => "{$document->author}. \"{$document->title}.\" {$year}.",
            'chicago' => "{$document->author}. \"{$document->title}.\" {$year}.",
            'abnt'    => "{$document->author}. {$document->title}. {$year}.",
            default   => "{$document->author} ({$year}). {$document->title}.",
        };
    }
}
