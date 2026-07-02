<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBadgeRequest;
use App\Http\Requests\UpdateBadgeRequest;
use App\Http\Resources\BadgeResource;
use App\Services\BadgeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Badges",
 *     description="Gerenciamento de Badges de Gamificação"
 * )
 */
class BadgeController extends Controller
{
    public function __construct(
        private readonly BadgeService $badgeService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/badges",
     *     summary="Listar todos os badges",
     *     tags={"Badges"},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de badges e estatísticas",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Badge")),
     *             @OA\Property(property="stats", type="object")
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'is_active', 'category', 'per_page', 'page']);
        $result = $this->badgeService->list($filters);

        return response()->json([
            'data'  => BadgeResource::collection($result['data']),
            'stats' => $result['stats'],
            'meta'  => $result['meta'],
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/admin/badges",
     *     summary="Criar um novo badge (Admin)",
     *     tags={"Badges"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/BadgeInput")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Badge criado com sucesso",
     *         @OA\JsonContent(ref="#/components/schemas/Badge")
     *     )
     * )
     */
    public function store(StoreBadgeRequest $request): JsonResponse
    {
        $badge = $this->badgeService->create($request->validated(), $request->user());

        return response()->json([
            'message' => 'Badge criado com sucesso.',
            'data'    => new BadgeResource($badge),
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/badges/{id}",
     *     summary="Ver detalhes de um badge",
     *     tags={"Badges"},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="Detalhes do badge",
     *         @OA\JsonContent(ref="#/components/schemas/Badge")
     *     )
     * )
     */
    public function show(string $id): JsonResponse
    {
        $badge = $this->badgeService->find($id);

        if ($badge === null) {
            return response()->json(['message' => 'Badge não encontrado.'], 404);
        }

        return response()->json([
            'data' => new BadgeResource($badge),
        ]);
    }

    /**
     * @OA\Patch(
     *     path="/api/admin/badges/{id}",
     *     summary="Atualizar um badge (Admin)",
     *     tags={"Badges"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/BadgeInput")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Badge atualizado com sucesso"
     *     )
     * )
     */
    public function update(UpdateBadgeRequest $request, string $id): JsonResponse
    {
        $badge = $this->badgeService->update($id, $request->validated(), $request->user());

        return response()->json([
            'message' => 'Badge atualizado com sucesso.',
            'data'    => new BadgeResource($badge),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/admin/badges/{id}/toggle-status",
     *     summary="Alternar status ativo/inativo de um badge (Admin)",
     *     tags={"Badges"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="Status alternado"
     *     )
     * )
     */
    public function toggleStatus(Request $request, string $id): JsonResponse
    {
        $badge = $this->badgeService->toggleStatus($id, $request->user());

        return response()->json([
            'message' => 'Estado do badge alterado.',
            'data'    => new BadgeResource($badge),
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/admin/badges/{id}",
     *     summary="Excluir um badge (Admin)",
     *     tags={"Badges"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="Badge excluído com sucesso"
     *     )
     * )
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $this->badgeService->delete($id, $request->user());

        return response()->json([
            'message' => 'Badge eliminado com sucesso.',
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/admin/badges/{id}/assign",
     *     summary="Atribuir badge a um utilizador manualmente (Admin)",
     *     tags={"Badges"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="user_id", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Badge atribuído com sucesso"
     *     )
     * )
     */
    public function assign(Request $request, string $id): JsonResponse
    {
        $request->validate(['user_id' => 'required|uuid']);
        $this->badgeService->assign($id, $request->input('user_id'), $request->user());

        return response()->json([
            'message' => 'Badge atribuído com sucesso.',
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/admin/badges/{id}/remove",
     *     summary="Remover badge de um utilizador manualmente (Admin)",
     *     tags={"Badges"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="user_id", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Badge removido com sucesso"
     *     )
     * )
     */
    public function remove(Request $request, string $id): JsonResponse
    {
        $request->validate(['user_id' => 'required|uuid']);
        $this->badgeService->remove($id, $request->input('user_id'), $request->user());

        return response()->json([
            'message' => 'Badge removido com sucesso.',
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/admin/badges/{id}/recalculate",
     *     summary="Recalcular utilizadores elegíveis para o badge (Admin)",
     *     tags={"Badges"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="Elegibilidade recalculada com sucesso"
     *     )
     * )
     */
    public function recalculate(Request $request, string $id): JsonResponse
    {
        $this->badgeService->recalculateEligibleUsers($id, $request->user());

        return response()->json([
            'message' => 'Recálculo de elegibilidade concluído.',
        ]);
    }
}