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
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      )
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
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      )
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

    /**
     * @OA\Get(
     *      path="/documents",
     *      operationId="indexDocuments",
     *      tags={"Documents"},
     *      summary="Listar documentos com filtros",
     *      description="Obtém a lista de documentos ativos aos quais o utilizador tem permissões de acesso.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="category_id",
     *          in="query",
     *          required=false,
     *          description="ID da categoria",
     *          @OA\Schema(type="string", format="uuid")
     *      ),
     *      @OA\Parameter(
     *          name="document_type",
     *          in="query",
     *          required=false,
     *          description="Tipo de documento",
     *          @OA\Schema(type="string", enum={"manuscript", "article", "report", "thesis", "archive"})
     *      ),
     *      @OA\Parameter(
     *          name="academic_level",
     *          in="query",
     *          required=false,
     *          description="Nível académico",
     *          @OA\Schema(type="string", enum={"intro", "advanced", "doctorate"})
     *      ),
     *      @OA\Parameter(
     *          name="access_level_id",
     *          in="query",
     *          required=false,
     *          description="ID do nível de acesso",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Parameter(
     *          name="status",
     *          in="query",
     *          required=false,
     *          description="Estado (apenas admin pode filtrar por outros além de published)",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Documentos obtidos com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      )
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

        if ($request->filled('status')) {
            $query->where('d.status', $request->input('status'));
        } elseif ($user->role !== 'admin') {
            $query->where('d.status', 'published');
        }

        $this->accessGate->applyDocumentVisibilityFilter($query, $user);

        if ($request->input('sort') === 'popular') {
            $query->orderByDesc('d.likes_count')->orderByDesc('d.views_count');
        } else {
            $query->orderByDesc('d.created_at');
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
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
     *      @OA\Parameter(
     *          name="q",
     *          in="query",
     *          required=false,
     *          description="Termo a pesquisar",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Parameter(
     *          name="category_id",
     *          in="query",
     *          required=false,
     *          description="Filtrar por ID de categoria",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Parameter(
     *          name="document_type",
     *          in="query",
     *          required=false,
     *          description="Filtrar por tipo de documento",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Resultados da pesquisa",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      )
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

    /**
     * @OA\Get(
     *      path="/documents/{id}",
     *      operationId="showDocument",
     *      tags={"Documents"},
     *      summary="Visualizar detalhes de um documento",
     *      description="Retorna detalhes completos de um documento e regista uma visualização.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do documento",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Detalhes do documento",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="object"),
     *              @OA\Property(property="tags", type="array", @OA\Items(type="object")),
     *              @OA\Property(property="is_liked", type="boolean"),
     *              @OA\Property(property="is_favorited", type="boolean")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Acesso negado por nível de privilégios insuficiente"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Documento não encontrado ou não publicado"
     *      )
     * )
     */
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
     *              @OA\Property(property="title", type="string", maxLength=500, example="História Económica do Reino do Kongo"),
     *              @OA\Property(property="author", type="string", maxLength=255, example="Afonso Silva"),
     *              @OA\Property(property="summary", type="string", example="Sumário detalhado..."),
     *              @OA\Property(property="content", type="string", nullable=true, example="Conteúdo integral do documento..."),
     *              @OA\Property(property="document_type", type="string", enum={"manuscript", "article", "report", "thesis", "archive"}, example="article"),
     *              @OA\Property(property="academic_level", type="string", enum={"intro", "advanced", "doctorate"}, example="advanced"),
     *              @OA\Property(property="access_level_id", type="string", example="public"),
     *              @OA\Property(property="category_id", type="string", format="uuid", nullable=true, example="category-uuid"),
     *              @OA\Property(property="institution", type="string", maxLength=255, nullable=true, example="ISPTEC"),
     *              @OA\Property(property="publication_date", type="string", format="date", nullable=true, example="2026-06-23"),
     *              @OA\Property(property="period_start", type="integer", nullable=true, example=1400),
     *              @OA\Property(property="period_end", type="integer", nullable=true, example=1600),
     *              @OA\Property(property="cover_image_url", type="string", format="url", maxLength=500, nullable=true),
     *              @OA\Property(property="pdf_url", type="string", format="url", maxLength=500, nullable=true),
     *              @OA\Property(property="tags", type="array", @OA\Items(type="string"), nullable=true, example={"Kongo", "Economia Colonial"})
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Documento criado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Document created."),
     *              @OA\Property(property="id", type="string", format="uuid", example="uuid-string")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Acesso proibido (Requer role admin ou professor)"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Erros de validação"
     *      )
     * )
     */
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

    /**
     * @OA\Patch(
     *      path="/documents/{id}",
     *      operationId="updateDocument",
     *      tags={"Documents"},
     *      summary="Atualizar documento (Admin/Professor)",
     *      description="Atualiza um documento existente.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do documento",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              @OA\Property(property="title", type="string", maxLength=500),
     *              @OA\Property(property="author", type="string", maxLength=255),
     *              @OA\Property(property="summary", type="string"),
     *              @OA\Property(property="content", type="string", nullable=true),
     *              @OA\Property(property="document_type", type="string", enum={"manuscript", "article", "report", "thesis", "archive"}),
     *              @OA\Property(property="academic_level", type="string", enum={"intro", "advanced", "doctorate"}),
     *              @OA\Property(property="access_level_id", type="string"),
     *              @OA\Property(property="category_id", type="string", format="uuid", nullable=true),
     *              @OA\Property(property="status", type="string", enum={"draft", "published", "archived"})
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Documento atualizado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Document updated."),
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Acesso proibido (Requer role admin ou professor)"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Documento não encontrado"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Erros de validação ou campos vazios"
     *      )
     * )
     */
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

    /**
     * @OA\Delete(
     *      path="/documents/{id}",
     *      operationId="destroyDocument",
     *      tags={"Documents"},
     *      summary="Eliminar documento (Admin/Professor)",
     *      description="Elimina permanentemente um documento.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do documento",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Documento eliminado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Document deleted.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Acesso proibido"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Documento não encontrado"
     *      )
     * )
     */
    public function destroy(string $id): JsonResponse
    {
        $document = DB::table('documents')->where('id', $id)->first();

        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        DB::table('documents')->where('id', $id)->delete();

        return response()->json(['message' => 'Document deleted.']);
    }

    /**
     * @OA\Post(
     *      path="/documents/{id}/like",
     *      operationId="likeDocument",
     *      tags={"Documents"},
     *      summary="Gostar de um documento",
     *      description="Regista um 'like' no documento e atribui pontos ao utilizador.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do documento",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Like registado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Document liked."),
     *              @OA\Property(property="gamification", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Proibido se não puder ler o documento"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Documento não encontrado"
     *      ),
     *      @OA\Response(
     *          response=409,
     *          description="Já gostou anteriormente"
     *      )
     * )
     */
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

        $likeId = (string) Str::uuid();

        DB::transaction(function () use ($id, $userId, $likeId): void {
            DB::table('document_likes')->insert([
                'id' => $likeId,
                'document_id' => $id,
                'user_id' => $userId,
                'created_at' => now(),
            ]);

            DB::table('documents')->where('id', $id)->increment('likes_count');
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
            'message' => 'Document liked.',
            'gamification' => $gamification->toArray(),
        ]);
    }

    /**
     * @OA\Delete(
     *      path="/documents/{id}/like",
     *      operationId="unlikeDocument",
     *      tags={"Documents"},
     *      summary="Remover gosto de um documento",
     *      description="Remove o 'like' previamente registado no documento.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do documento",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Like removido",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Like removed.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Gosto ou documento não encontrado"
     *      )
     * )
     */
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

    /**
     * @OA\Post(
     *      path="/documents/{id}/download",
     *      operationId="downloadDocument",
     *      tags={"Documents"},
     *      summary="Registar download de documento",
     *      description="Regista o download de um PDF na base de dados.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do documento",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Download registado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Download recorded."),
     *              @OA\Property(property="pdf_url", type="string", format="url")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Acesso proibido ao documento"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Documento não encontrado"
     *      )
     * )
     */
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

    /**
     * @OA\Post(
     *      path="/documents/{id}/favorite",
     *      operationId="favoriteDocument",
     *      tags={"Documents"},
     *      summary="Marcar documento como favorito",
     *      description="Adiciona o documento aos favoritos do utilizador autenticado.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do documento",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Favoritado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Document added to favorites.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Sem acesso ao documento"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Documento não encontrado"
     *      ),
     *      @OA\Response(
     *          response=409,
     *          description="Já favoritado anteriormente"
     *      )
     * )
     */
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

    /**
     * @OA\Delete(
     *      path="/documents/{id}/favorite",
     *      operationId="unfavoriteDocument",
     *      tags={"Documents"},
     *      summary="Remover favorito de documento",
     *      description="Remove o documento dos favoritos do utilizador.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do documento",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Removido dos favoritos com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Document removed from favorites.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Documento ou favorito não encontrado"
     *      )
     * )
     */
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

    /**
     * @OA\Post(
     *      path="/documents/{id}/citations",
     *      operationId="createCitation",
     *      tags={"Documents"},
     *      summary="Gerar e registar citação académica",
     *      description="Gera uma citação académica no formato pedido (APA, MLA, Chicago, ABNT).",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do documento",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\RequestBody(
     *          required=false,
     *          @OA\JsonContent(
     *              @OA\Property(property="citation_format", type="string", enum={"apa", "mla", "chicago", "abnt"}, default="apa", example="apa")
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Citação gerada com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Citation created."),
     *              @OA\Property(property="citation", type="string", example="Silva, A. (2026). História Económica do Reino do Kongo."),
     *              @OA\Property(property="format", type="string", example="apa")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Sem acesso ao documento"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Documento não encontrado"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Formato de citação inválido"
     *      )
     * )
     */
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
