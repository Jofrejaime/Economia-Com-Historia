<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TopicResource;
use App\Http\Resources\TopicSummaryResource;
use App\Services\TopicService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TopicAdminController extends Controller
{
    public function __construct(
        private readonly TopicService $topicService
    ) {}

    /**
     * @OA\Get(
     *      path="/admin/topics",
     *      operationId="adminTopicsList",
     *      tags={"Community Admin"},
     *      summary="Listar todos os tópicos (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="category_id", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="locked", in="query", required=false, @OA\Schema(type="boolean")),
     *      @OA\Parameter(name="pinned", in="query", required=false, @OA\Schema(type="boolean")),
     *      @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer")),
     *      @OA\Response(
     *          response=200,
     *          description="Lista obtida",
     *          @OA\JsonContent(@OA\Property(property="data", type="array", @OA\Items(type="object")))
     *      ),
     *      @OA\Response(response=403, description="Acesso proibido")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = \App\Models\DiscussionTopic::query()
            ->with(['author.profile', 'category']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($request->has('locked')) {
            $query->where('locked', (bool) $request->input('locked'));
        }

        if ($request->has('pinned')) {
            $query->where('pinned', (bool) $request->input('pinned'));
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $perPage = min((int) $request->input('per_page', 20), 100);
        $topics = $query->orderByDesc('pinned')->orderByDesc('created_at')->paginate($perPage);

        return response()->json(TopicResource::collection($topics)->response()->getData(true));
    }

    /**
     * @OA\Get(
     *      path="/admin/topics/{id}",
     *      operationId="adminTopicShow",
     *      tags={"Community Admin"},
     *      summary="Obter detalhe de um tópico (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Detalhe obtido", @OA\JsonContent(@OA\Property(property="data", type="object"))),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=404, description="Não encontrado")
     * )
     */
    public function show(string $id): JsonResponse
    {
        $topic = $this->topicService->buildTopic($id);
        return response()->json(['data' => new TopicResource($topic)]);
    }

    /**
     * @OA\Patch(
     *      path="/admin/topics/{id}",
     *      operationId="adminTopicUpdate",
     *      tags={"Community Admin"},
     *      summary="Atualizar tópico (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              @OA\Property(property="title", type="string"),
     *              @OA\Property(property="content", type="string"),
     *              @OA\Property(property="status", type="string")
     *          )
     *      ),
     *      @OA\Response(response=200, description="Tópico atualizado", @OA\JsonContent(@OA\Property(property="data", type="object"))),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=404, description="Não encontrado")
     * )
     */
    public function update(string $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'string', 'max:5000'],
            'status' => ['sometimes', 'string', 'in:draft,published,closed,locked,archived'],
            'visibility' => ['sometimes', 'string', 'in:PUBLIC,CATEGORY,INVITE_ONLY'],
            'pinned' => ['sometimes', 'boolean'],
            'is_pinned' => ['sometimes', 'boolean'],
            'featured' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'locked' => ['sometimes', 'boolean'],
            'solved' => ['sometimes', 'boolean'],
        ]);

        $topic = $this->topicService->update($id, $validated, $request->user());

        return response()->json([
            'message' => 'Topic updated successfully.',
            'data' => new TopicResource($topic)
        ]);
    }

    /**
     * @OA\Delete(
     *      path="/admin/topics/{id}",
     *      operationId="adminTopicDelete",
     *      tags={"Community Admin"},
     *      summary="Excluir tópico (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Excluído com sucesso", @OA\JsonContent(@OA\Property(property="message", type="string"))),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=404, description="Não encontrado")
     * )
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        $this->topicService->delete($id, $request->user());
        return response()->json(['message' => 'Topic deleted successfully.']);
    }

    /**
     * @OA\Patch(
     *      path="/admin/topics/{id}/pin",
     *      operationId="adminTopicPin",
     *      tags={"Community Admin"},
     *      summary="Fixar tópico (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Tópico fixado", @OA\JsonContent(@OA\Property(property="data", type="object"))),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=404, description="Não encontrado")
     * )
     */
    public function pin(string $id, Request $request): JsonResponse
    {
        $topic = $this->topicService->pin($id, $request->user());
        return response()->json([
            'message' => 'Topic pinned successfully.',
            'data' => new TopicResource($topic)
        ]);
    }

    /**
     * @OA\Patch(
     *      path="/admin/topics/{id}/unpin",
     *      operationId="adminTopicUnpin",
     *      tags={"Community Admin"},
     *      summary="Desfixar tópico (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Tópico desfixado", @OA\JsonContent(@OA\Property(property="data", type="object"))),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=404, description="Não encontrado")
     * )
     */
    public function unpin(string $id, Request $request): JsonResponse
    {
        $topic = $this->topicService->unpin($id, $request->user());
        return response()->json([
            'message' => 'Topic unpinned successfully.',
            'data' => new TopicResource($topic)
        ]);
    }

    /**
     * @OA\Patch(
     *      path="/admin/topics/{id}/lock",
     *      operationId="adminTopicLock",
     *      tags={"Community Admin"},
     *      summary="Bloquear tópico (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Tópico bloqueado", @OA\JsonContent(@OA\Property(property="data", type="object"))),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=404, description="Não encontrado")
     * )
     */
    public function lock(string $id, Request $request): JsonResponse
    {
        $topic = $this->topicService->lock($id, $request->user());
        return response()->json([
            'message' => 'Topic locked successfully.',
            'data' => new TopicResource($topic)
        ]);
    }

    /**
     * @OA\Patch(
     *      path="/admin/topics/{id}/unlock",
     *      operationId="adminTopicUnlock",
     *      tags={"Community Admin"},
     *      summary="Desbloquear tópico (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Tópico desbloqueado", @OA\JsonContent(@OA\Property(property="data", type="object"))),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=404, description="Não encontrado")
     * )
     */
    public function unlock(string $id, Request $request): JsonResponse
    {
        $topic = $this->topicService->unlock($id, $request->user());
        return response()->json([
            'message' => 'Topic unlocked successfully.',
            'data' => new TopicResource($topic)
        ]);
    }
}
