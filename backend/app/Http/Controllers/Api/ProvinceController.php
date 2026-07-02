<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProvinceRequest;
use App\Http\Requests\UpdateProvinceRequest;
use App\Http\Resources\ProvinceResource;
use App\Services\ProvinceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="Provinces", description="Operações do domínio de Províncias")
 *
 * @OA\Schema(
 *     schema="ProvinceResource",
 *     type="object",
 *     @OA\Property(property="id", type="string", format="uuid"),
 *     @OA\Property(property="name", type="string"),
 *     @OA\Property(property="code", type="string"),
 *     @OA\Property(property="is_active", type="boolean"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class ProvinceController extends Controller
{
    public function __construct(
        private readonly ProvinceService $provinceService
    ) {}

    /**
     * @OA\Get(
      *      path="/provinces",
      *      operationId="publicProvincesList",
      *      tags={"Provinces"},
      *      summary="Listar províncias activas (Público)",
      *      description="Lista todas as províncias activas para selecção em formulários.",
      *      @OA\Response(
      *          response=200,
      *          description="Províncias obtidas com sucesso",
      *          @OA\JsonContent(
      *              @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/ProvinceResource"))
      *          )
      *      )
      * )
      */
    public function publicList(): JsonResponse
    {
        $provinces = $this->provinceService->list(['is_active' => true]);
        return response()->json(['data' => ProvinceResource::collection($provinces)]);
    }

    /**
     * @OA\Get(
     *      path="/admin/provinces",
     *      operationId="adminProvincesList",
     *      tags={"Provinces"},
     *      summary="Listar províncias (Admin)",
     *      description="Lista províncias com paginação e filtros para administração.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="is_active", in="query", required=false, @OA\Schema(type="boolean")),
     *      @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer")),
     *      @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer")),
     *      @OA\Response(
     *          response=200,
     *          description="Operação bem sucedida",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/ProvinceResource")),
     *              @OA\Property(property="meta", type="object")
     *          )
     *      ),
     *      @OA\Response(response=403, description="Acesso negado")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $filters = $request->only(['search', 'is_active', 'per_page', 'page']);
        $result = $this->provinceService->list($filters);

        if ($result instanceof \Illuminate\Contracts\Pagination\LengthAwarePaginator) {
            return response()->json([
                'data' => ProvinceResource::collection($result->items()),
                'meta' => [
                    'current_page' => $result->currentPage(),
                    'per_page' => $result->perPage(),
                    'total' => $result->total(),
                    'last_page' => $result->lastPage(),
                ],
            ]);
        }

        return response()->json(['data' => ProvinceResource::collection($result)]);
    }

    /**
     * @OA\Get(
     *      path="/admin/provinces/{id}",
     *      operationId="adminProvinceShow",
     *      tags={"Provinces"},
     *      summary="Visualizar província",
     *      description="Obtém detalhes de uma província específica.",
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

        $province = $this->provinceService->find($id);
        return response()->json(['data' => new ProvinceResource($province)]);
    }

    /**
     * @OA\Post(
     *      path="/admin/provinces",
     *      operationId="adminProvinceStore",
     *      tags={"Provinces"},
     *      summary="Criar província",
     *      description="Cria uma nova província na base de dados.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"name", "code"},
     *              @OA\Property(property="name", type="string", example="Bengo"),
     *              @OA\Property(property="code", type="string", example="AO-BGO"),
     *              @OA\Property(property="is_active", type="boolean", default=true)
     *          )
     *      ),
     *      @OA\Response(response=201, description="Criada com sucesso"),
     *      @OA\Response(response=422, description="Erros de validação")
     * )
     */
    public function store(StoreProvinceRequest $request): JsonResponse
    {
        $province = $this->provinceService->create($request->validated());
        return response()->json(['data' => new ProvinceResource($province)], 201);
    }

    /**
     * @OA\Patch(
     *      path="/admin/provinces/{id}",
     *      operationId="adminProvinceUpdate",
     *      tags={"Provinces"},
     *      summary="Actualizar província",
     *      description="Actualiza detalhes de uma província existente.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\RequestBody(required=true, @OA\JsonContent(type="object")),
     *      @OA\Response(response=200, description="Actualizada com sucesso"),
     *      @OA\Response(response=422, description="Erros de validação")
     * )
     */
    public function update(string $id, UpdateProvinceRequest $request): JsonResponse
    {
        $province = $this->provinceService->update($id, $request->validated());
        return response()->json(['data' => new ProvinceResource($province)]);
    }

    /**
     * @OA\Delete(
     *      path="/admin/provinces/{id}",
     *      operationId="adminProvinceDestroy",
     *      tags={"Provinces"},
     *      summary="Eliminar província",
     *      description="Elimina uma província da base de dados.",
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

        $this->provinceService->delete($id);
        return response()->json(['message' => 'Province deleted successfully.']);
    }

    /**
     * @OA\Get(
     *      path="/admin/provinces/statistics",
     *      operationId="adminProvincesStats",
     *      tags={"Provinces"},
     *      summary="Estatísticas de províncias",
     *      description="Obtém estatísticas de adesão de utilizadores por província.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(response=200, description="Operação bem sucedida")
     * )
     */
    public function stats(Request $request): JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $stats = $this->provinceService->statistics();
        return response()->json(['data' => $stats]);
    }
}
