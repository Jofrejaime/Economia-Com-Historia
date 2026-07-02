<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInterestAreaRequest;
use App\Http\Requests\UpdateInterestAreaRequest;
use App\Http\Resources\InterestAreaResource;
use App\Services\InterestAreaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="InterestAreas", description="Operações do domínio de Áreas de Interesse")
 *
 * @OA\Schema(
 *     schema="InterestAreaResource",
 *     type="object",
 *     @OA\Property(property="id", type="string", format="uuid"),
 *     @OA\Property(property="name", type="string"),
 *     @OA\Property(property="slug", type="string"),
 *     @OA\Property(property="description", type="string"),
 *     @OA\Property(property="is_active", type="boolean"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class InterestAreaController extends Controller
{
    public function __construct(
        private readonly InterestAreaService $interestAreaService
    ) {}

    /**
     * @OA\Get(
     *      path="/interest-areas",
     *      operationId="publicInterestAreasList",
     *      tags={"InterestAreas"},
     *      summary="Listar áreas de interesse activas (Público)",
     *      description="Lista todas as áreas de interesse activas para selecção em perfis.",
     *      @OA\Response(
     *          response=200,
     *          description="Áreas obtidas com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/InterestAreaResource"))
     *          )
     *      )
     * )
     */
    public function publicList(): JsonResponse
    {
        $areas = $this->interestAreaService->list(['is_active' => true]);
        return response()->json(['data' => InterestAreaResource::collection($areas)]);
    }

    /**
     * @OA\Get(
     *      path="/admin/interest-areas",
     *      operationId="adminInterestAreasList",
     *      tags={"InterestAreas"},
     *      summary="Listar áreas de interesse (Admin)",
     *      description="Lista áreas de interesse com paginação e filtros para administração.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="is_active", in="query", required=false, @OA\Schema(type="boolean")),
     *      @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer")),
     *      @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer")),
     *      @OA\Response(response=200, description="Operação bem sucedida"),
     *      @OA\Response(response=403, description="Acesso negado")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $filters = $request->only(['search', 'is_active', 'per_page', 'page']);
        $result = $this->interestAreaService->list($filters);

        if ($result instanceof \Illuminate\Contracts\Pagination\LengthAwarePaginator) {
            return response()->json([
                'data' => InterestAreaResource::collection($result->items()),
                'meta' => [
                    'current_page' => $result->currentPage(),
                    'per_page' => $result->perPage(),
                    'total' => $result->total(),
                    'last_page' => $result->lastPage(),
                ],
            ]);
        }

        return response()->json(['data' => InterestAreaResource::collection($result)]);
    }

    /**
     * @OA\Get(
     *      path="/admin/interest-areas/{id}",
     *      operationId="adminInterestAreaShow",
     *      tags={"InterestAreas"},
     *      summary="Visualizar área de interesse",
     *      description="Obtém detalhes de uma área de interesse específica.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Operação bem sucedida"),
     *      @OA\Response(response=404, description="Não encontrada")
     * )
     */
    public function show(string $id, Request $request): JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $area = $this->interestAreaService->find($id);
        return response()->json(['data' => new InterestAreaResource($area)]);
    }

    /**
     * @OA\Post(
     *      path="/admin/interest-areas",
     *      operationId="adminInterestAreaStore",
     *      tags={"InterestAreas"},
     *      summary="Criar área de interesse",
     *      description="Cria uma nova área de interesse na base de dados.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"name"},
     *              @OA\Property(property="name", type="string", example="Macroeconomia Aplicada"),
     *              @OA\Property(property="slug", type="string", example="macroeconomia-aplicada"),
     *              @OA\Property(property="description", type="string", nullable=true),
     *              @OA\Property(property="is_active", type="boolean", default=true)
     *          )
     *      ),
     *      @OA\Response(response=201, description="Criada com sucesso"),
     *      @OA\Response(response=422, description="Erros de validação")
     * )
     */
    public function store(StoreInterestAreaRequest $request): JsonResponse
    {
        $area = $this->interestAreaService->create($request->validated());
        return response()->json(['data' => new InterestAreaResource($area)], 201);
    }

    /**
     * @OA\Patch(
     *      path="/admin/interest-areas/{id}",
     *      operationId="adminInterestAreaUpdate",
     *      tags={"InterestAreas"},
     *      summary="Actualizar área de interesse",
     *      description="Actualiza detalhes de uma área de interesse existente.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\RequestBody(required=true, @OA\JsonContent(type="object")),
     *      @OA\Response(response=200, description="Actualizada com sucesso"),
     *      @OA\Response(response=422, description="Erros de validação")
     * )
     */
    public function update(string $id, UpdateInterestAreaRequest $request): JsonResponse
    {
        $area = $this->interestAreaService->update($id, $request->validated());
        return response()->json(['data' => new InterestAreaResource($area)]);
    }

    /**
     * @OA\Delete(
     *      path="/admin/interest-areas/{id}",
     *      operationId="adminInterestAreaDestroy",
     *      tags={"InterestAreas"},
     *      summary="Eliminar área de interesse",
     *      description="Elimina uma área de interesse da base de dados.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Eliminada com sucesso")
     * )
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $this->interestAreaService->delete($id);
        return response()->json(['message' => 'Interest area deleted successfully.']);
    }

    /**
     * @OA\Get(
     *      path="/admin/interest-areas/categories",
     *      operationId="adminInterestAreasCategories",
     *      tags={"InterestAreas"},
     *      summary="Categorias da comunidade associadas",
     *      description="Obtém todas as categorias do fórum associáveis.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(response=200, description="Operação bem sucedida")
     * )
     */
    public function categories(Request $request): JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $categories = $this->interestAreaService->categories();
        return response()->json(['data' => $categories]);
    }

    /**
     * @OA\Get(
     *      path="/admin/interest-areas/{id}/metadata",
     *      operationId="adminInterestAreaMetadata",
     *      tags={"InterestAreas"},
     *      summary="Metadados da área de interesse",
     *      description="Obtém estatísticas de adesão de utilizadores, documentos e tópicos associados a esta área de interesse.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Operação bem sucedida"),
     *      @OA\Response(response=404, description="Não encontrada")
     * )
     */
    public function metadata(string $id, Request $request): JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $metadata = $this->interestAreaService->metadata($id);
        return response()->json(['data' => $metadata]);
    }
}
