<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LevelDefinitionResource;
use App\Services\LevelDefinitionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LevelDefinitionController extends Controller
{
    public function __construct(
        private readonly LevelDefinitionService $levelDefinitionService
    ) {}

    /**
     * @OA\Get(
     *      path="/admin/level-definitions",
     *      operationId="indexLevelDefinitions",
     *      tags={"LevelDefinitions"},
     *      summary="Listar todas as definições de níveis (Apenas Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Definições obtidas com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/LevelDefinition"))
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Acesso proibido")
     * )
     */
    public function index(): JsonResponse
    {
        $levels = $this->levelDefinitionService->getAll();
        return response()->json([
            'data' => LevelDefinitionResource::collection($levels)
        ]);
    }

    /**
     * @OA\Get(
     *      path="/admin/level-definitions/{level}",
     *      operationId="showLevelDefinition",
     *      tags={"LevelDefinitions"},
     *      summary="Visualizar uma definição de nível específica (Apenas Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="level",
     *          in="path",
     *          required=true,
     *          description="Nível (número inteiro)",
     *          @OA\Schema(type="integer")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Definição obtida com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", ref="#/components/schemas/LevelDefinition")
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=404, description="Definição não encontrada")
     * )
     */
    public function show(int $level): JsonResponse
    {
        $levelDef = $this->levelDefinitionService->getByLevel($level);
        return response()->json([
            'data' => new LevelDefinitionResource($levelDef)
        ]);
    }

    /**
     * @OA\Post(
     *      path="/admin/level-definitions",
     *      operationId="storeLevelDefinition",
     *      tags={"LevelDefinitions"},
     *      summary="Criar uma nova definição de nível (Apenas Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"level", "name", "min_points"},
     *              @OA\Property(property="level", type="integer", example=7),
     *              @OA\Property(property="name", type="string", example="Doutor"),
     *              @OA\Property(property="min_points", type="integer", example=2000),
     *              @OA\Property(property="max_points", type="integer", nullable=true, example=3000),
     *              @OA\Property(property="color_hex", type="string", example="#4ade80"),
     *              @OA\Property(property="icon_url", type="string", example="http://example.com/icons/level7.png"),
     *              @OA\Property(property="perks", type="array", @OA\Items(type="string"), example={"Acesso ilimitado"})
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Definição criada com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Level definition created successfully."),
     *              @OA\Property(property="data", ref="#/components/schemas/LevelDefinition")
     *          )
     *      ),
     *      @OA\Response(response=400, description="Dados inválidos"),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=422, description="Erro de validação")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'level' => ['required', 'integer', 'unique:level_definitions,level'],
            'name' => ['required', 'string', 'max:100'],
            'min_points' => ['required', 'integer', 'min:0'],
            'max_points' => ['nullable', 'integer', 'gt:min_points'],
            'color_hex' => ['nullable', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'icon_url' => ['nullable', 'string', 'max:500'],
            'perks' => ['nullable', 'array'],
            'perks.*' => ['string'],
        ]);

        try {
            $levelDef = $this->levelDefinitionService->create($validated);
            return response()->json([
                'message' => 'Level definition created successfully.',
                'data' => new LevelDefinitionResource($levelDef),
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * @OA\Patch(
     *      path="/admin/level-definitions/{level}",
     *      operationId="updateLevelDefinition",
     *      tags={"LevelDefinitions"},
     *      summary="Atualizar uma definição de nível existente (Apenas Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="level",
     *          in="path",
     *          required=true,
     *          description="Nível (número inteiro)",
     *          @OA\Schema(type="integer")
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              @OA\Property(property="name", type="string", example="Iniciante Renovado"),
     *              @OA\Property(property="min_points", type="integer", example=0),
     *              @OA\Property(property="max_points", type="integer", nullable=true, example=150),
     *              @OA\Property(property="color_hex", type="string", example="#cbd5e1"),
     *              @OA\Property(property="icon_url", type="string", example="http://example.com/icons/level1-v2.png"),
     *              @OA\Property(property="perks", type="array", @OA\Items(type="string"), example={"Pode visualizar ranking"})
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Definição atualizada com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Level definition updated successfully."),
     *              @OA\Property(property="data", ref="#/components/schemas/LevelDefinition")
     *          )
     *      ),
     *      @OA\Response(response=400, description="Dados inválidos"),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=404, description="Definição não encontrada"),
     *      @OA\Response(response=422, description="Erro de validação")
     * )
     */
    public function update(Request $request, int $level): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'min_points' => ['sometimes', 'required', 'integer', 'min:0'],
            'max_points' => ['nullable', 'integer'],
            'color_hex' => ['nullable', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'icon_url' => ['nullable', 'string', 'max:500'],
            'perks' => ['nullable', 'array'],
            'perks.*' => ['string'],
        ]);

        try {
            $levelDef = $this->levelDefinitionService->update($level, $validated);
            return response()->json([
                'message' => 'Level definition updated successfully.',
                'data' => new LevelDefinitionResource($levelDef),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * @OA\Delete(
     *      path="/admin/level-definitions/{level}",
     *      operationId="deleteLevelDefinition",
     *      tags={"LevelDefinitions"},
     *      summary="Eliminar uma definição de nível (Apenas Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="level",
     *          in="path",
     *          required=true,
     *          description="Nível (número inteiro)",
     *          @OA\Schema(type="integer")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Definição eliminada com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Level definition deleted successfully.")
     *          )
     *      ),
     *      @OA\Response(response=400, description="Erro ao eliminar"),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=404, description="Definição não encontrada")
     * )
     */
    public function destroy(int $level): JsonResponse
    {
        try {
            $this->levelDefinitionService->delete($level);
            return response()->json([
                'message' => 'Level definition deleted successfully.'
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
