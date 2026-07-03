<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunityCategory;
use App\Models\DiscussionTopic;
use App\Models\DiscussionTopicMember;
use App\Models\TopicReply;
use App\Models\TopicLike;
use App\Models\ReplyLike;
use App\Models\TopicFollower;
use App\Models\Document;
use App\Services\CommunityAuthorizationService;
use App\Services\GamificationService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CommunityController extends Controller
{
    public function __construct(
        private readonly CommunityAuthorizationService $communityAuthorization,
        private readonly GamificationService $gamification,
        private readonly NotificationService $notificationService,
    ) {}

    // ─── CATEGORIES ────────────────────────────────────────────────────────

    /**
     * @OA\Get(
     *      path="/community/categories",
     *      operationId="communityCategories",
     *      tags={"Community"},
     *      summary="Listar categorias da comunidade",
     *      description="Lista todas as categorias do fórum da comunidade.",
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
        $categories = CommunityCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json(['data' => $categories]);
    }

    /*
     * A criação/gestão de categorias vive exclusivamente em
     * /admin/community/categories (CommunityCategoryAdminController).
     * A rota duplicada POST /community/categories foi removida na Sprint 18.5.1.
     */

    // ─── TOPICS ────────────────────────────────────────────────────────────

    /**
     * @OA\Get(
     *      path="/topics",
     *      operationId="indexTopics",
     *      tags={"Community"},
     *      summary="Listar tópicos recentes",
     *      description="Lista os tópicos de discussão publicados recentemente.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Tópicos obtidos com sucesso",
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
    public function indexTopics(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search'      => ['sometimes', 'string', 'max:255'],
            'category_id' => ['sometimes', 'uuid', 'exists:community_categories,id'],
            'status'      => ['sometimes', 'string', 'in:open,locked,archived,published,draft'],
            'visibility'  => ['sometimes', 'string', 'in:PUBLIC,INVITE_ONLY'],
            'page'        => ['sometimes', 'integer', 'min:1'],
            'per_page'    => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $query = DiscussionTopic::query()->with(['author.profile', 'category'])
            ->whereIn('status', ['open', 'locked', 'published', 'closed'])
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at');

        $this->communityAuthorization->applyVisibleTopicsFilter($query, $request->user());

        if (! empty($validated['search'])) {
            $search = '%'.trim($validated['search']).'%';
            $query->where(function ($builder) use ($search): void {
                $builder->where('title', 'like', $search)
                    ->orWhere('content', 'like', $search);
            });
        }

        if (! empty($validated['category_id'])) {
            $query->where('category_id', $validated['category_id']);
        }

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (! empty($validated['visibility'])) {
            $query->where('visibility', $validated['visibility']);
        }

        $perPage = $validated['per_page'] ?? 20;
        $topics = $query->paginate($perPage);

        return response()->json([
            'data' => $topics->items(),
            'meta' => [
                'current_page' => $topics->currentPage(),
                'per_page' => $topics->perPage(),
                'total' => $topics->total(),
                'last_page' => $topics->lastPage(),
            ],
        ]);
    }

    /**
     * @OA\Post(
     *      path="/topics",
     *      operationId="storeTopic",
     *      tags={"Community"},
     *      summary="Criar novo tópico",
     *      description="Cria um novo tópico numa categoria da comunidade. A categoria apenas organiza — o acesso é definido pela visibilidade do tópico (PUBLIC por omissão; INVITE_ONLY restringe a autor, admin e membros convidados).",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"category_id", "title", "content"},
     *              @OA\Property(property="category_id", type="string", format="uuid", example="category-uuid"),
     *              @OA\Property(property="title", type="string", maxLength=255, example="Dúvida sobre o comércio colonial"),
     *              @OA\Property(property="content", type="string", maxLength=5000, example="Gostaria de saber quais eram os principais portos..."),
     *              @OA\Property(property="visibility", type="string", enum={"PUBLIC", "INVITE_ONLY"}, default="PUBLIC"),
     *              @OA\Property(property="member_ids", type="array", @OA\Items(type="string", format="uuid"), description="Convidados (apenas INVITE_ONLY)")
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Tópico criado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Topic created successfully."),
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Acesso proibido à categoria"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Erro de validação"
     *      )
     * )
     */
    /**
     * Regras de validação partilhadas por storeTopic() e storeTopicForDocument()
     * (Sprint 17.3) — a criação de tópicos existe apenas uma vez, em createTopic().
     */
    private function topicValidationRules(): array
    {
        return [
            'category_id'      => ['required', 'uuid', 'exists:community_categories,id'],
            'document_id'      => ['sometimes', 'nullable', 'uuid', 'exists:documents,id'],
            'title'            => ['required', 'string', 'max:255'],
            'content'          => ['required', 'string', 'max:5000'],
            'visibility'       => ['sometimes', 'string', 'in:PUBLIC,INVITE_ONLY'],
            'member_ids'       => ['sometimes', 'array'],
            'member_ids.*'     => ['uuid', 'exists:users,id'],
            'members'          => ['sometimes', 'array'],
            'members.*.user_id' => ['required', 'uuid', 'exists:users,id'],
        ];
    }

    public function storeTopic(Request $request): JsonResponse
    {
        $validated = $request->validate($this->topicValidationRules());

        $topic = $this->createTopic($validated, $request);

        return response()->json([
            'message' => 'Topic created successfully.',
            'data' => $topic,
        ], 201);
    }

    /**
     * @OA\Post(
     *      path="/documents/{id}/topics",
     *      operationId="storeTopicForDocument",
     *      tags={"Community"},
     *      summary="Criar tópico contextualizado a um documento",
     *      description="Cria um tópico de discussão associado a um documento específico (Sprint 17.3). Reutiliza exatamente a mesma lógica de POST /topics — o document_id é preenchido a partir do URL, nunca do corpo do pedido.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, description="ID do documento", @OA\Schema(type="string", format="uuid")),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"category_id", "title", "content"},
     *              @OA\Property(property="category_id", type="string", format="uuid"),
     *              @OA\Property(property="title", type="string", maxLength=255),
     *              @OA\Property(property="content", type="string", maxLength=5000)
     *          )
     *      ),
     *      @OA\Response(response=201, description="Tópico criado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Topic created successfully."),
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Acesso proibido à categoria"),
     *      @OA\Response(response=404, description="Documento não encontrado"),
     *      @OA\Response(response=422, description="Erro de validação")
     * )
     */
    public function storeTopicForDocument(string $documentId, Request $request): JsonResponse
    {
        $document = Document::find($documentId);
        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        $validated = $request->validate($this->topicValidationRules());
        $validated['document_id'] = $documentId;

        $topic = $this->createTopic($validated, $request);

        return response()->json([
            'message' => 'Topic created successfully.',
            'data' => $topic,
        ], 201);
    }

    /**
     * @OA\Get(
     *      path="/documents/{id}/topics",
     *      operationId="documentTopics",
     *      tags={"Community"},
     *      summary="Listar discussões associadas a um documento",
     *      description="Lista os tópicos de discussão contextualizados a este documento (Sprint 17.3), ordenados por fixados primeiro e depois mais recentes. Não inclui as respostas.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, description="ID do documento", @OA\Schema(type="string", format="uuid")),
     *      @OA\Response(
     *          response=200,
     *          description="Discussões obtidas com sucesso",
     *          @OA\JsonContent(@OA\Property(property="data", type="array", @OA\Items(type="object")))
     *      ),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=404, description="Documento não encontrado")
     * )
     */
    public function documentTopics(string $id, Request $request): JsonResponse
    {
        $document = Document::find($id);
        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        $query = DiscussionTopic::where('document_id', $id)
            ->with('author.profile')
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at');

        $this->communityAuthorization->applyVisibleTopicsFilter($query, $request->user());

        $topics = $query->get();

        $data = $topics->map(fn (DiscussionTopic $topic) => [
            'id'               => $topic->id,
            'title'            => $topic->title,
            'author'           => [
                'id'           => $topic->author?->id,
                'display_name' => $topic->author?->profile?->display_name,
                'avatar_url'   => $topic->author?->profile?->avatar_url,
            ],
            'replies_count'    => (int) $topic->replies_count,
            'views_count'      => (int) $topic->views_count,
            'likes_count'      => (int) $topic->likes_count,
            'created_at'       => $topic->created_at,
            'last_activity_at' => $topic->last_reply_at,
            'is_locked'        => $topic->status === 'locked',
            'is_pinned'        => (bool) $topic->is_pinned,
        ]);

        return response()->json(['data' => $data]);
    }

    /**
     * Criação de tópico partilhada por storeTopic() (geral) e
     * storeTopicForDocument() (contextual) — Sprint 17.3, Módulo 7:
     * "a criação deverá existir apenas uma vez".
     */
    private function createTopic(array $validated, Request $request): DiscussionTopic
    {
        $category = CommunityCategory::findOrFail($validated['category_id']);
        $visibility = $validated['visibility'] ?? 'PUBLIC';

        return DB::transaction(function () use ($validated, $request, $category, $visibility) {
            $topic = DiscussionTopic::create([
                'id' => (string) Str::uuid(),
                'category_id' => $validated['category_id'],
                'document_id' => $validated['document_id'] ?? null,
                'author_id' => $request->user()->id,
                'title' => $validated['title'],
                'content' => $validated['content'],
                'visibility' => $visibility,
                'status' => 'published',
                'is_pinned' => false,
                'is_featured' => false,
                'last_reply_at' => null,
                'replies_count' => 0,
                'views_count' => 0,
                'likes_count' => 0,
                'followers_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DiscussionTopicMember::create([
                'id' => (string) Str::uuid(),
                'topic_id' => $topic->id,
                'user_id' => $request->user()->id,
                'joined_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $invitedIds = (! empty($validated['members'])
                    ? collect($validated['members'])->pluck('user_id')
                    : collect($validated['member_ids'] ?? []))
                ->unique()
                ->reject(fn (string $id): bool => $id === $request->user()->id)
                ->values();

            if ($visibility === 'INVITE_ONLY') {
                foreach ($invitedIds as $memberId) {
                    DiscussionTopicMember::create([
                        'id' => (string) Str::uuid(),
                        'topic_id' => $topic->id,
                        'user_id' => $memberId,
                        'joined_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $member = \App\Models\User::find($memberId);

                    if ($member) {
                        $this->notificationService->sendTopicInvitation(
                            $member,
                            $topic->title,
                            $request->user()->display_name,
                            $topic->id
                        );
                    }
                }
            }

            // Increment category topics_count
            $category->increment('topics_count');

            // Award gamification points
            $this->gamification->awardPoints(
                $request->user(),
                20,
                'topic_created',
                $topic->id,
                'discussion_topic',
                "Created topic: {$topic->title}"
            );

            // Increment counter
            $this->gamification->incrementCounters($request->user(), ['topics_created' => 1]);

            return $topic->load(['author.profile', 'category', 'members.user.profile']);
        });
    }

    /**
     * @OA\Get(
     *      path="/topics/{id}",
     *      operationId="showTopic",
     *      tags={"Community"},
     *      summary="Visualizar detalhes de um tópico",
     *      description="Obtém detalhes do tópico e incrementa a contagem de visualizações.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do tópico",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Detalhes obtidos com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Tópico não encontrado"
     *      )
     * )
     */
    public function showTopic(string $id, Request $request): JsonResponse
    {
        $topic = $this->resolveTopicForUserOrFail($id, $request, ['author.profile', 'category', 'members.user.profile']);

        $topic->increment('views_count');

        $isLiked = TopicLike::where('topic_id', $id)
            ->where('user_id', $request->user()->id)
            ->exists();

        $data = $topic->toArray();
        $data['is_liked'] = $isLiked;

        return response()->json(['data' => $data]);
    }

    /**
     * @OA\Patch(
     *      path="/topics/{id}",
     *      operationId="updateTopic",
     *      tags={"Community"},
     *      summary="Atualizar um tópico",
     *      description="Permite ao autor ou ao administrador atualizar o título e o conteúdo de um tópico.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do tópico",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              @OA\Property(property="title", type="string", maxLength=255),
     *              @OA\Property(property="content", type="string", maxLength=5000),
     *              @OA\Property(property="status", type="string", enum={"open", "closed", "locked", "archived", "published", "draft"}),
     *              @OA\Property(property="visibility", type="string", enum={"PUBLIC", "INVITE_ONLY"})
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Tópico atualizado",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Topic updated successfully."),
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Acesso proibido (não é autor nem admin)"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Tópico não encontrado"
     *      )
     * )
     */
    public function updateTopic(string $id, Request $request): JsonResponse
    {
        $topic = $this->resolveTopicForUserOrFail($id, $request, ['category', 'members.user.profile']);
        if (! $this->communityAuthorization->canUpdateTopic($request->user(), $topic)) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'title'      => ['sometimes', 'string', 'max:255'],
            'content'    => ['sometimes', 'string', 'max:5000'],
            'status'     => ['sometimes', 'string', 'in:open,closed,locked,archived,published,draft'],
            'visibility' => ['sometimes', 'string', 'in:PUBLIC,INVITE_ONLY'],
        ]);

        // Fórum encerrado é irreversível — apenas admin pode reabrir
        if (
            $topic->status === 'closed'
            && isset($validated['status'])
            && $validated['status'] !== 'closed'
            && $request->user()->role !== 'admin'
        ) {
            abort(403, 'Um fórum encerrado não pode ser reaberto.');
        }

        $topic->update([
            'title'      => $validated['title']      ?? $topic->title,
            'content'    => $validated['content']    ?? $topic->content,
            'status'     => $validated['status']     ?? $topic->status,
            'visibility' => $validated['visibility'] ?? $topic->visibility,
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Topic updated successfully.',
            'data' => $topic->load(['author.profile', 'category', 'members.user.profile']),
        ]);
    }

    /**
     * @OA\Delete(
     *      path="/topics/{id}",
     *      operationId="destroyTopic",
     *      tags={"Community"},
     *      summary="Eliminar um tópico",
     *      description="Elimina o tópico e todos os likes/seguidores/respostas associados.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do tópico",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Tópico eliminado",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Topic deleted successfully.")
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
     *          description="Tópico não encontrado"
     *      )
     * )
     */
    public function destroyTopic(string $id, Request $request): JsonResponse
    {
        $topic = $this->resolveTopicForUserOrFail($id, $request, ['category', 'members.user.profile']);
        if (! $this->communityAuthorization->canDeleteTopic($request->user(), $topic)) {
            abort(403, 'Unauthorized.');
        }

        DB::transaction(function () use ($topic) {
            // Decrement category topics_count
            $topic->category?->decrement('topics_count');

            // Delete all related data
            TopicLike::where('topic_id', $topic->id)->delete();
            TopicFollower::where('topic_id', $topic->id)->delete();
            ReplyLike::whereIn('reply_id', $topic->replies()->pluck('id'))->delete();
            TopicReply::where('topic_id', $topic->id)->delete();

            // Delete topic
            $topic->delete();
        });

        return response()->json(['message' => 'Topic deleted successfully.']);
    }

    // ─── TOPIC MEMBERS ─────────────────────────────────────────────────────

    private function resolveTopicForUserOrFail(string $id, Request $request, array $relations = ['category']): DiscussionTopic
    {
        $topic = DiscussionTopic::with($relations)->findOrFail($id);

        if (! $this->communityAuthorization->canViewTopic($request->user(), $topic)) {
            abort(404, 'Topic not found.');
        }

        return $topic;
    }

    /**
     * @OA\Get(
     *      path="/topics/{id}/members",
     *      operationId="topicMembers",
     *      tags={"Community"},
     *      summary="Listar membros de um tópico",
     *      description="Devolve os membros visíveis do tópico autenticado.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do tópico",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(response=200, description="Membros obtidos"),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=404, description="Tópico não encontrado")
     * )
     */
    public function topicMembers(string $id, Request $request): JsonResponse
    {
        $topic = $this->resolveTopicForUserOrFail($id, $request, ['category', 'members.user.profile']);

        return response()->json([
            'data' => $topic->members->values(),
        ]);
    }

    /**
     * @OA\Post(
     *      path="/topics/{id}/members",
     *      operationId="storeTopicMember",
     *      tags={"Community"},
     *      summary="Convidar membro para tópico privado",
     *      description="Adiciona um utilizador como membro do tópico. Apenas o autor do tópico ou um administrador pode convidar. O convite torna o utilizador membro de imediato.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do tópico",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"user_id"},
     *              @OA\Property(property="user_id", type="string", format="uuid")
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Membro convidado",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Member invited successfully."),
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Sem permissões"),
     *      @OA\Response(response=404, description="Tópico não encontrado"),
     *      @OA\Response(response=409, description="Membro já existe"),
     *      @OA\Response(response=422, description="Erro de validação")
     * )
     */
    public function storeTopicMember(string $id, Request $request): JsonResponse
    {
        $topic = $this->resolveTopicForUserOrFail($id, $request, ['category', 'members']);
        if (! $this->communityAuthorization->canManageMembers($request->user(), $topic)) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'user_id' => ['required', 'uuid', 'exists:users,id'],
        ]);

        if (DiscussionTopicMember::where('topic_id', $topic->id)->where('user_id', $validated['user_id'])->exists()) {
            return response()->json(['message' => 'Member already exists.'], 409);
        }

        $member = DiscussionTopicMember::create([
            'id' => (string) Str::uuid(),
            'topic_id' => $topic->id,
            'user_id' => $validated['user_id'],
            'joined_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $member->load(['user.profile']);

        $targetUser = \App\Models\User::find($validated['user_id']);

        if ($targetUser) {
            $this->notificationService->sendTopicInvitation(
                $targetUser,
                $topic->title,
                $request->user()->display_name,
                $topic->id
            );
        }

        return response()->json([
            'message' => 'Member invited successfully.',
            'data' => $member,
        ], 201);
    }

    /**
     * @OA\Delete(
     *      path="/topics/{id}/members/{user}",
     *      operationId="destroyTopicMember",
     *      tags={"Community"},
     *      summary="Remover membro",
     *      description="Remove um membro do tópico.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Parameter(name="user", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Membro removido"),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Sem permissões"),
     *      @OA\Response(response=404, description="Tópico ou membro não encontrado"),
     *      @OA\Response(response=422, description="Erro de validação")
     * )
     */
    public function destroyTopicMember(string $id, string $userId, Request $request): JsonResponse
    {
        $topic = $this->resolveTopicForUserOrFail($id, $request, ['category', 'members']);
        if (! $this->communityAuthorization->canManageMembers($request->user(), $topic)) {
            abort(403, 'Unauthorized.');
        }

        $member = DiscussionTopicMember::where('topic_id', $topic->id)
            ->where('user_id', $userId)
            ->firstOrFail();

        if ($userId === $topic->author_id) {
            abort(422, 'Topic author cannot be removed.');
        }

        $memberUser = $member->user;
        $member->delete();

        if ($memberUser) {
            $this->notificationService->sendTopicRemoved($memberUser, $topic->title, $topic->id);
        }

        return response()->json(['message' => 'Member removed successfully.']);
    }

    /**
     * @OA\Post(
     *      path="/topics/{id}/join",
     *      operationId="joinTopic",
     *      tags={"Community"},
     *      summary="Confirmar participação num tópico privado",
     *      description="Confirma a participação de um utilizador convidado num tópico INVITE_ONLY. O convite já concede a participação — este endpoint é idempotente e existe para compatibilidade com os clientes.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Participação confirmada"),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Sem permissões (não convidado, tópico público ou próprio autor)"),
     *      @OA\Response(response=404, description="Tópico não encontrado")
     * )
     */
    public function joinTopic(string $id, Request $request): JsonResponse
    {
        $topic = $this->resolveTopicForUserOrFail($id, $request, ['category', 'members']);
        if (! $this->communityAuthorization->canJoinTopic($request->user(), $topic)) {
            abort(403, 'Unauthorized.');
        }

        $member = DiscussionTopicMember::where('topic_id', $topic->id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json([
            'message' => 'Topic joined successfully.',
            'data' => $member->load(['user.profile']),
        ]);
    }

    /**
     * @OA\Post(
     *      path="/topics/{id}/leave",
     *      operationId="leaveTopic",
     *      tags={"Community"},
     *      summary="Sair do tópico",
     *      description="Remove o utilizador autenticado do tópico privado.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Saída concluída"),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Sem permissões"),
     *      @OA\Response(response=404, description="Tópico ou membro não encontrado")
     * )
     */
    public function leaveTopic(string $id, Request $request): JsonResponse
    {
        $topic = $this->resolveTopicForUserOrFail($id, $request, ['category', 'members']);
        if (! $this->communityAuthorization->canLeaveTopic($request->user(), $topic)) {
            abort(403, 'Unauthorized.');
        }

        $member = DiscussionTopicMember::where('topic_id', $topic->id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $member->delete();

        return response()->json(['message' => 'Topic left successfully.']);
    }

    // ─── TOPIC LIKES ────────────────────────────────────────────────────────

    /**
     * @OA\Post(
     *      path="/topics/{id}/like",
     *      operationId="likeTopic",
     *      tags={"Community"},
     *      summary="Gostar de um tópico",
     *      description="Regista um 'like' no tópico.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do tópico",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Gosto registado",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Topic liked.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Tópico não encontrado"
     *      ),
     *      @OA\Response(
     *          response=409,
     *          description="Já gostou anteriormente"
     *      )
     * )
     */
    public function likeTopic(string $id, Request $request): JsonResponse
    {
        $topic = $this->resolveTopicForUserOrFail($id, $request, ['category', 'members']);

        $existing = TopicLike::where('topic_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already liked.'], 409);
        }

        DB::transaction(function () use ($topic, $request, $id) {
            TopicLike::create([
                'id' => (string) Str::uuid(),
                'topic_id' => $id,
                'user_id' => $request->user()->id,
                'created_at' => now(),
            ]);

            $topic->increment('likes_count');
        });

        return response()->json(['message' => 'Topic liked.'], 201);
    }

    /**
     * @OA\Delete(
     *      path="/topics/{id}/like",
     *      operationId="unlikeTopic",
     *      tags={"Community"},
     *      summary="Remover gosto de um tópico",
     *      description="Remove o 'like' previamente dado a um tópico.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do tópico",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Gosto removido",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Topic unliked.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Tópico ou gosto não encontrado"
     *      )
     * )
     */
    public function unlikeTopic(string $id, Request $request): JsonResponse
    {
        $topic = $this->resolveTopicForUserOrFail($id, $request, ['category', 'members']);

        $deleted = TopicLike::where('topic_id', $id)
            ->where('user_id', $request->user()->id)
            ->delete();

        if ($deleted > 0) {
            $topic->decrement('likes_count');
            return response()->json(['message' => 'Topic unliked.']);
        }

        return response()->json(['message' => 'Like not found.'], 404);
    }

    // ─── TOPIC FOLLOWERS ────────────────────────────────────────────────────

    /**
     * @OA\Post(
     *      path="/topics/{id}/follow",
     *      operationId="followTopic",
     *      tags={"Community"},
     *      summary="Seguir um tópico",
     *      description="Passa a seguir as atualizações do tópico.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do tópico",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="A seguir",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Topic followed.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Tópico não encontrado"
     *      ),
     *      @OA\Response(
     *          response=409,
     *          description="Já segue anteriormente"
     *      )
     * )
     */
    public function followTopic(string $id, Request $request): JsonResponse
    {
        $topic = $this->resolveTopicForUserOrFail($id, $request, ['category', 'members']);

        $existing = TopicFollower::where('topic_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already following.'], 409);
        }

        DB::transaction(function () use ($topic, $request, $id) {
            TopicFollower::create([
                'id' => (string) Str::uuid(),
                'topic_id' => $id,
                'user_id' => $request->user()->id,
                'created_at' => now(),
            ]);

            $topic->increment('followers_count');
        });

        return response()->json(['message' => 'Topic followed.'], 201);
    }

    /**
     * @OA\Delete(
     *      path="/topics/{id}/follow",
     *      operationId="unfollowTopic",
     *      tags={"Community"},
     *      summary="Deixar de seguir tópico",
     *      description="Remove o utilizador da lista de seguidores do tópico.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do tópico",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Deixou de seguir",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Topic unfollowed.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Tópico ou seguidor não encontrado"
     *      )
     * )
     */
    public function unfollowTopic(string $id, Request $request): JsonResponse
    {
        $topic = $this->resolveTopicForUserOrFail($id, $request, ['category', 'members']);

        $deleted = TopicFollower::where('topic_id', $id)
            ->where('user_id', $request->user()->id)
            ->delete();

        if ($deleted > 0) {
            $topic->decrement('followers_count');
            return response()->json(['message' => 'Topic unfollowed.']);
        }

        return response()->json(['message' => 'Follow not found.'], 404);
    }

    // ─── REPLIES ────────────────────────────────────────────────────────────

    /**
     * @OA\Get(
     *      path="/topics/{id}/replies",
     *      operationId="topicReplies",
     *      tags={"Community"},
     *      summary="Listar respostas de um tópico",
     *      description="Lista as respostas dadas no tópico em ordem cronológica.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do tópico",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Respostas obtidas",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Tópico não encontrado"
     *      )
     * )
     */
    public function topicReplies(string $id, Request $request): JsonResponse
    {
        $topic = $this->resolveTopicForUserOrFail($id, $request, ['category', 'members']);

        $replies = TopicReply::where('topic_id', $id)
            ->with(['author.profile'])
            ->orderBy('created_at')
            ->get();

        return response()->json(['data' => $replies]);
    }

    /**
     * @OA\Post(
     *      path="/topics/{id}/replies",
     *      operationId="storeReply",
     *      tags={"Community"},
     *      summary="Responder a um tópico",
     *      description="Adiciona uma nova resposta a um tópico, opcionalmente referenciando outra resposta.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do tópico",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"content"},
     *              @OA\Property(property="content", type="string", maxLength=3000, example="Excelente reflexão! Concordo plenamente."),
     *              @OA\Property(property="parent_reply_id", type="string", format="uuid", nullable=true)
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Resposta registada",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Reply created successfully."),
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Tópico não encontrado"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Erro de validação"
     *      )
     * )
     */
    public function storeReply(string $id, Request $request): JsonResponse
    {
        $topic = $this->resolveTopicForUserOrFail($id, $request, ['category', 'members']);
        if (! $this->communityAuthorization->canReply($request->user(), $topic)) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'content' => ['required', 'string', 'max:3000'],
            'parent_reply_id' => ['nullable', 'uuid', 'exists:topic_replies,id'],
        ]);

        $reply = DB::transaction(function () use ($topic, $validated, $request, $id) {
            $reply = TopicReply::create([
                'id' => (string) Str::uuid(),
                'topic_id' => $id,
                'author_id' => $request->user()->id,
                'parent_reply_id' => $validated['parent_reply_id'] ?? null,
                'content' => $validated['content'],
                'is_accepted' => false,
                'is_flagged' => false,
                'likes_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Increment topic replies_count
            $topic->increment('replies_count');
            $topic->update(['last_reply_at' => now()]);

            // Award gamification points
            $this->gamification->awardPoints(
                $request->user(),
                10,
                'reply_posted',
                $reply->id,
                'topic_reply',
                "Reply on topic: {$topic->title}"
            );

            // Increment counter
            $this->gamification->incrementCounters($request->user(), ['replies_posted' => 1]);

            // Send notification to topic author (if not the same user)
            if ($topic->author_id !== $request->user()->id) {
                $this->notificationService->send(
                    $topic->author,
                    'topic_reply',
                    'New reply on your topic',
                    "Someone replied to your topic: {$topic->title}",
                    $reply->id,
                    'topic_reply'
                );
            }

            return $reply->load(['author.profile']);
        });

        return response()->json([
            'message' => 'Reply created successfully.',
            'data' => $reply,
        ], 201);
    }

    /**
     * @OA\Patch(
     *      path="/replies/{id}",
     *      operationId="updateReply",
     *      tags={"Community"},
     *      summary="Editar resposta",
     *      description="Permite ao autor ou admin editar o conteúdo de uma resposta.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID da resposta",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"content"},
     *              @OA\Property(property="content", type="string", maxLength=3000)
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Resposta editada",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Reply updated successfully."),
     *              @OA\Property(property="data", type="object")
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
     *          description="Resposta não encontrada"
     *      )
     * )
     */
    public function updateReply(string $id, Request $request): JsonResponse
    {
        $reply = TopicReply::findOrFail($id);
        $topic = $this->resolveTopicForUserOrFail($reply->topic_id, $request, ['category', 'members']);

        if ($reply->author_id !== $request->user()->id && $request->user()->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'content' => ['required', 'string', 'max:3000'],
        ]);

        $reply->update([
            'content' => $validated['content'],
            'edited_at' => now(),
            'edited_by' => $request->user()->id,
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Reply updated successfully.',
            'data' => $reply->load(['author.profile']),
        ]);
    }

    /**
     * @OA\Delete(
     *      path="/replies/{id}",
     *      operationId="destroyReply",
     *      tags={"Community"},
     *      summary="Eliminar uma resposta",
     *      description="Elimina a resposta e quaisquer respostas filhas recursivamente.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID da resposta",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Resposta eliminada",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Reply deleted successfully.")
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
     *          description="Resposta não encontrada"
     *      )
     * )
     */
    public function destroyReply(string $id, Request $request): JsonResponse
    {
        $reply = TopicReply::findOrFail($id);
        $topic = $this->resolveTopicForUserOrFail($reply->topic_id, $request, ['category', 'members']);

        if ($reply->author_id !== $request->user()->id && $request->user()->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        DB::transaction(function () use ($reply, $id) {
            $topic = $reply->topic;

            $deletedCount = $this->deleteReplyAndChildren($id);

            if ($topic) {
                $topic->decrement('replies_count', $deletedCount);
            }
        });

        return response()->json(['message' => 'Reply deleted successfully.']);
    }

    /**
     * Apaga a resposta e toda a sua árvore (nível a nível, sem recursão por nó)
     * e devolve o número de respostas removidas.
     */
    private function deleteReplyAndChildren(string $replyId): int
    {
        $idsToDelete = [$replyId];
        $currentLevelIds = [$replyId];

        while ($currentLevelIds !== []) {
            $childIds = TopicReply::whereIn('parent_reply_id', $currentLevelIds)
                ->pluck('id')
                ->all();

            $idsToDelete = array_merge($idsToDelete, $childIds);
            $currentLevelIds = $childIds;
        }

        ReplyLike::whereIn('reply_id', $idsToDelete)->delete();

        // Apagar dos níveis mais profundos para a raiz respeita a FK auto-referente.
        foreach (array_reverse($idsToDelete) as $idToDelete) {
            TopicReply::where('id', $idToDelete)->delete();
        }

        return count($idsToDelete);
    }

    // ─── REPLY LIKES ────────────────────────────────────────────────────────

    /**
     * @OA\Post(
     *      path="/replies/{id}/like",
     *      operationId="likeReply",
     *      tags={"Community"},
     *      summary="Gostar de uma resposta",
     *      description="Regista gosto numa resposta.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID da resposta",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Gosto registado",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Reply liked.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Resposta não encontrada"
     *      ),
     *      @OA\Response(
     *          response=409,
     *          description="Já gostou anteriormente"
     *      )
     * )
     */
    public function likeReply(string $id, Request $request): JsonResponse
    {
        $reply = TopicReply::findOrFail($id);
        $topic = $this->resolveTopicForUserOrFail($reply->topic_id, $request, ['category', 'members']);

        $existing = ReplyLike::where('reply_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already liked.'], 409);
        }

        DB::transaction(function () use ($reply, $request, $id) {
            ReplyLike::create([
                'id' => (string) Str::uuid(),
                'reply_id' => $id,
                'user_id' => $request->user()->id,
                'created_at' => now(),
            ]);

            $reply->increment('likes_count');
        });

        return response()->json(['message' => 'Reply liked.'], 201);
    }

    /**
     * @OA\Delete(
     *      path="/replies/{id}/like",
     *      operationId="unlikeReply",
     *      tags={"Community"},
     *      summary="Remover gosto de resposta",
     *      description="Remove gosto anteriormente registado em resposta.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID da resposta",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Gosto removido",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Reply unliked.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Gosto ou resposta não encontrados"
     *      )
     * )
     */
    public function unlikeReply(string $id, Request $request): JsonResponse
    {
        $reply = TopicReply::findOrFail($id);
        $topic = $this->resolveTopicForUserOrFail($reply->topic_id, $request, ['category', 'members']);

        $deleted = ReplyLike::where('reply_id', $id)
            ->where('user_id', $request->user()->id)
            ->delete();

        if ($deleted > 0) {
            $reply->decrement('likes_count');
            return response()->json(['message' => 'Reply unliked.']);
        }

        return response()->json(['message' => 'Like not found.'], 404);
    }

    // ─── REPLY ACCEPTED ─────────────────────────────────────────────────────

    /**
     * @OA\Post(
     *      path="/replies/{id}/accept",
     *      operationId="acceptReply",
     *      tags={"Community"},
     *      summary="Aceitar resposta como solução",
     *      description="Marca uma resposta como a solução aceite para o tópico. Apenas o autor do tópico ou o admin o podem fazer.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID da resposta",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Marcado como aceite",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Reply marked as accepted."),
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Acesso proibido (não é o autor do tópico)"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Resposta não encontrada"
     *      ),
     *      @OA\Response(
     *          response=409,
     *          description="A resposta já está aceite"
     *      )
     * )
     */
    public function acceptReply(string $id, Request $request): JsonResponse
    {
        $reply = TopicReply::findOrFail($id);
        $topic = $this->resolveTopicForUserOrFail($reply->topic_id, $request, ['category', 'members']);
        if (! $this->communityAuthorization->canUpdateTopic($request->user(), $topic)) {
            abort(403, 'Unauthorized.');
        }

        if ($reply->is_accepted) {
            return response()->json(['message' => 'Reply already accepted.'], 409);
        }

        DB::transaction(function () use ($reply, $request, $topic) {
            // Unmark any previously accepted reply (is_accepted e best_answer andam juntos)
            TopicReply::where('topic_id', $reply->topic_id)
                ->where('is_accepted', true)
                ->update(['is_accepted' => false, 'best_answer' => false]);

            // Mark this reply as accepted
            $reply->update(['is_accepted' => true, 'best_answer' => true]);

            // Award bonus points to reply author
            $this->gamification->awardPoints(
                $reply->author,
                50,
                'reply_accepted',
                $reply->id,
                'topic_reply',
                'Reply marked as accepted solution'
            );

            // Send notification to reply author
            $this->notificationService->send(
                $reply->author,
                'reply_accepted',
                'Your reply was accepted',
                "Your reply was marked as accepted on topic: {$topic->title}",
                $reply->id,
                'topic_reply'
            );
        });

        return response()->json([
            'message' => 'Reply marked as accepted.',
            'data' => $reply->load(['author.profile']),
        ]);
    }

    
}
