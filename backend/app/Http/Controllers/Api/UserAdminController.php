<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\AdminProfileResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\UserSessionResource;
use App\Services\UserAdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Admin Users",
 *     description="Operações administrativas de utilizadores"
 * )
 */
class UserAdminController extends Controller
{
    public function __construct(
        private readonly UserAdminService $userAdminService
    ) {}

    /**
     * @OA\Get(
     *      path="/admin/users",
     *      operationId="adminListUsers",
     *      tags={"Admin Users"},
     *      summary="Listar utilizadores (Admin)",
     *      description="Lista utilizadores com paginação, filtros e busca.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="role", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="verified", in="query", required=false, @OA\Schema(type="boolean")),
     *      @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer")),
     *      @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer")),
     *      @OA\Response(
     *          response=200,
     *          description="Sucesso"
     *      )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $paginated = $this->userAdminService->paginate($request->all());
        return response()->json([
            'data' => UserResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
            'links' => [
                'first' => $paginated->url(1),
                'last' => $paginated->url($paginated->lastPage()),
                'prev' => $paginated->previousPageUrl(),
                'next' => $paginated->nextPageUrl(),
            ]
        ]);
    }

    /**
     * @OA\Get(
     *      path="/admin/users/{id}",
     *      operationId="adminShowUser",
     *      tags={"Admin Users"},
     *      summary="Obter detalhe de um utilizador (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Sucesso"),
     *      @OA\Response(response=404, description="Não encontrado")
     * )
     */
    public function show(string $id): JsonResponse
    {
        $user = $this->userAdminService->find($id);
        return response()->json([
            'data' => new UserResource($user)
        ]);
    }

    /**
     * @OA\Post(
     *      path="/admin/users",
     *      operationId="adminStoreUser",
     *      tags={"Admin Users"},
     *      summary="Criar novo utilizador (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"email","password","role","display_name"},
     *              @OA\Property(property="email", type="string", format="email", example="user@domain.ao"),
     *              @OA\Property(property="password", type="string", minLength=8, example="password123"),
     *              @OA\Property(property="role", type="string", enum={"admin","professor","investigador","estudante"}, example="estudante"),
     *              @OA\Property(property="display_name", type="string", example="Manuel Costa"),
     *              @OA\Property(property="full_name", type="string", nullable=true, example="Manuel António Costa"),
     *              @OA\Property(property="institution", type="string", nullable=true, example="ISPTEC"),
     *              @OA\Property(property="province", type="string", nullable=true, example="Luanda")
     *          )
     *      ),
     *      @OA\Response(response=201, description="Criado"),
     *      @OA\Response(response=422, description="Dados inválidos")
     * )
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userAdminService->create($request->validated());
        return response()->json([
            'message' => 'User created successfully.',
            'data' => new UserResource($user)
        ], 201);
    }

    /**
     * @OA\Patch(
     *      path="/admin/users/{id}",
     *      operationId="adminUpdateUser",
     *      tags={"Admin Users"},
     *      summary="Atualizar utilizador (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"email","role","display_name"},
     *              @OA\Property(property="email", type="string", format="email", example="user@domain.ao"),
     *              @OA\Property(property="role", type="string", enum={"admin","professor","investigador","estudante"}, example="professor"),
     *              @OA\Property(property="display_name", type="string", example="Manuel Costa"),
     *              @OA\Property(property="is_active", type="boolean", example=true),
     *              @OA\Property(property="email_verified", type="boolean", example=true)
     *          )
     *      ),
     *      @OA\Response(response=200, description="Atualizado"),
     *      @OA\Response(response=422, description="Dados inválidos ou erro de negócio")
     * )
     */
    public function update(UpdateUserRequest $request, string $id): JsonResponse
    {
        try {
            $user = $this->userAdminService->update($id, $request->validated(), $request->user()->id);
            return response()->json([
                'message' => 'User updated successfully.',
                'data' => new UserResource($user)
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * @OA\Delete(
     *      path="/admin/users/{id}",
     *      operationId="adminDeleteUser",
     *      tags={"Admin Users"},
     *      summary="Eliminar utilizador (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Eliminado"),
     *      @OA\Response(response=422, description="Erro de negócio (ex: auto-eliminação)")
     * )
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $this->userAdminService->delete($id, $request->user()->id);
            return response()->json([
                'message' => 'User deleted successfully.',
                'id' => $id
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * @OA\Get(
     *      path="/admin/users/{id}/profile",
     *      operationId="adminGetUserProfile",
     *      tags={"Admin Users"},
     *      summary="Obter agregado de perfil administrativo (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Sucesso")
     * )
     */
    public function profile(string $id): JsonResponse
    {
        $profileData = $this->userAdminService->buildAdminProfile($id);
        return response()->json([
            'data' => new AdminProfileResource($profileData)
        ]);
    }

    /**
     * @OA\Get(
     *      path="/admin/users/{id}/sessions",
     *      operationId="adminGetUserSessions",
     *      tags={"Admin Users"},
     *      summary="Listar sessões do utilizador (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Sucesso")
     * )
     */
    public function sessions(string $id): JsonResponse
    {
        $sessions = $this->userAdminService->listSessions($id);
        return response()->json([
            'data' => UserSessionResource::collection($sessions)
        ]);
    }
}
