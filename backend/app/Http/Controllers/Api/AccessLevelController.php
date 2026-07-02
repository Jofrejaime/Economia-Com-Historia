<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AccessLevelResource;
use App\Services\AccessLevelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccessLevelController extends Controller
{
    public function __construct(
        private readonly AccessLevelService $accessLevelService
    ) {}

    /**
     * @OA\Get(
     *      path="/admin/access-levels",
     *      operationId="adminIndexAccessLevels",
     *      tags={"AccessLevels"},
     *      summary="Listar todos os níveis de acesso (Apenas Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Níveis de acesso obtidos com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/AccessLevel"))
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Acesso proibido")
     * )
     */
    public function index(): JsonResponse
    {
        $levels = $this->accessLevelService->getAll();
        return response()->json([
            'data' => AccessLevelResource::collection($levels)
        ]);
    }

    /**
     * @OA\Get(
     *      path="/admin/access-levels/{id}",
     *      operationId="adminShowAccessLevel",
     *      tags={"AccessLevels"},
     *      summary="Visualizar um nível de acesso específico (Apenas Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do nível de acesso",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Nível de acesso obtido com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", ref="#/components/schemas/AccessLevel")
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=404, description="Nível de acesso não encontrado")
     * )
     */
    public function show(string $id): JsonResponse
    {
        $level = $this->accessLevelService->getById($id);
        return response()->json([
            'data' => new AccessLevelResource($level)
        ]);
    }

    /**
     * @OA\Post(
     *      path="/admin/access-levels",
     *      operationId="adminStoreAccessLevel",
     *      tags={"AccessLevels"},
     *      summary="Criar um novo nível de acesso (Apenas Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"id", "name"},
     *              @OA\Property(property="id", type="string", example="gold"),
     *              @OA\Property(property="name", type="string", example="Ouro"),
     *              @OA\Property(property="description", type="string", example="Acesso super premium"),
     *              @OA\Property(property="icon", type="string", example="🏆"),
     *              @OA\Property(property="color_bg", type="string", example="#fef08a"),
     *              @OA\Property(property="color_text", type="string", example="#854d0e"),
     *              @OA\Property(property="requires_approval", type="boolean", example=false),
     *              @OA\Property(property="auto_grant", type="boolean", example=true)
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Nível de acesso criado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Access level created successfully."),
     *              @OA\Property(property="data", ref="#/components/schemas/AccessLevel")
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
            'id' => ['required', 'string', 'max:20', 'unique:access_levels,id'],
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'icon' => ['nullable', 'string', 'max:10'],
            'color_bg' => ['nullable', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'color_text' => ['nullable', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'requires_approval' => ['sometimes', 'boolean'],
            'auto_grant' => ['sometimes', 'boolean'],
        ]);

        $level = $this->accessLevelService->create($validated);

        return response()->json([
            'message' => 'Access level created successfully.',
            'data' => new AccessLevelResource($level),
        ], 201);
    }

    /**
     * @OA\Patch(
     *      path="/admin/access-levels/{id}",
     *      operationId="adminUpdateAccessLevel",
     *      tags={"AccessLevels"},
     *      summary="Atualizar um nível de acesso existente (Apenas Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do nível de acesso",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              @OA\Property(property="name", type="string", example="Ouro Premium"),
     *              @OA\Property(property="description", type="string", example="Acesso a todos os conteúdos do site"),
     *              @OA\Property(property="icon", type="string", example="🌟"),
     *              @OA\Property(property="color_bg", type="string", example="#fef08a"),
     *              @OA\Property(property="color_text", type="string", example="#854d0e"),
     *              @OA\Property(property="requires_approval", type="boolean", example=false),
     *              @OA\Property(property="auto_grant", type="boolean", example=true)
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Nível de acesso atualizado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Access level updated successfully."),
     *              @OA\Property(property="data", ref="#/components/schemas/AccessLevel")
     *          )
     *      ),
     *      @OA\Response(response=400, description="Dados inválidos"),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=404, description="Nível de acesso não encontrado"),
     *      @OA\Response(response=422, description="Erro de validação")
     * )
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'icon' => ['nullable', 'string', 'max:10'],
            'color_bg' => ['nullable', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'color_text' => ['nullable', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'requires_approval' => ['sometimes', 'boolean'],
            'auto_grant' => ['sometimes', 'boolean'],
        ]);

        $level = $this->accessLevelService->update($id, $validated);

        return response()->json([
            'message' => 'Access level updated successfully.',
            'data' => new AccessLevelResource($level),
        ]);
    }

    /**
     * @OA\Delete(
     *      path="/admin/access-levels/{id}",
     *      operationId="adminDeleteAccessLevel",
     *      tags={"AccessLevels"},
     *      summary="Eliminar um nível de acesso (Apenas Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do nível de acesso",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Nível de acesso eliminado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Access level deleted successfully.")
     *          )
     *      ),
     *      @OA\Response(response=400, description="Erro ao eliminar"),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=404, description="Nível de acesso não encontrado")
     * )
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->accessLevelService->delete($id);
            return response()->json([
                'message' => 'Access level deleted successfully.'
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
