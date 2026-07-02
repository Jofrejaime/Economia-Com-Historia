<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAccessRequestRequest;
use App\Http\Requests\ReviewAccessRequestRequest;
use App\Http\Resources\AccessRequestResource;
use App\Services\AccessRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccessRequestAdminController extends Controller
{
    public function __construct(
        private readonly AccessRequestService $accessRequestService
    ) {}

    /**
     * @OA\Get(
     *      path="/admin/access-requests",
     *      operationId="adminAccessRequestsList",
     *      tags={"Access Request Admin"},
     *      summary="Listar todas as solicitações de acesso (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer")),
     *      @OA\Response(
     *          response=200,
     *          description="Lista obtida com sucesso",
     *          @OA\JsonContent(@OA\Property(property="data", type="array", @OA\Items(type="object")))
     *      ),
     *      @OA\Response(response=403, description="Acesso proibido")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'search', 'per_page']);
        $paginator = $this->accessRequestService->list($filters, $request->user());

        return response()->json(
            AccessRequestResource::collection($paginator)->response()->getData(true)
        );
    }

    /**
     * @OA\Get(
     *      path="/admin/access-requests/{id}",
     *      operationId="adminAccessRequestShow",
     *      tags={"Access Request Admin"},
     *      summary="Visualizar detalhes de uma solicitação (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Detalhes da solicitação", @OA\JsonContent(@OA\Property(property="data", type="object"))),
     *      @OA\Response(response=404, description="Solicitação não encontrada")
     * )
     */
    public function show(string $id, Request $request): JsonResponse
    {
        $accessRequest = $this->accessRequestService->find($id, $request->user());
        if (!$accessRequest) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        return response()->json(['data' => new AccessRequestResource($accessRequest)]);
    }

    /**
     * @OA\Post(
     *      path="/admin/access-requests",
     *      operationId="adminAccessRequestStore",
     *      tags={"Access Request Admin"},
     *      summary="Criar solicitação de acesso por um administrador",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"access_level_id", "user_id"},
     *              @OA\Property(property="user_id", type="string"),
     *              @OA\Property(property="access_level_id", type="string"),
     *              @OA\Property(property="justification", type="string")
     *          )
     *      ),
     *      @OA\Response(response=201, description="Solicitação criada", @OA\JsonContent(@OA\Property(property="data", type="object"))),
     *      @OA\Response(response=409, description="Conflito de solicitação")
     * )
     */
    public function store(StoreAccessRequestRequest $request): JsonResponse
    {
        $targetUser = \App\Models\User::find($request->input('user_id'));
        if (!$targetUser) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        try {
            $accessRequest = $this->accessRequestService->create($request->validated(), $targetUser);
            return response()->json([
                'message' => 'Access request created.',
                'data' => new AccessRequestResource($accessRequest)
            ], 201);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }

    /**
     * @OA\Patch(
     *      path="/admin/access-requests/{id}/approve",
     *      operationId="adminAccessRequestApprove",
     *      tags={"Access Request Admin"},
     *      summary="Aprovar solicitação de acesso",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\RequestBody(
     *          required=false,
     *          @OA\JsonContent(@OA\Property(property="review_notes", type="string"))
     *      ),
     *      @OA\Response(response=200, description="Aprovado", @OA\JsonContent(@OA\Property(property="data", type="object")))
     * )
     */
    public function approve(string $id, ReviewAccessRequestRequest $request): JsonResponse
    {
        try {
            $data = array_merge($request->validated(), ['status' => 'approved']);
            $accessRequest = $this->accessRequestService->approve($id, $data, $request->user());
            return response()->json([
                'message' => 'Request approved.',
                'data' => new AccessRequestResource($accessRequest)
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }

    /**
     * @OA\Patch(
     *      path="/admin/access-requests/{id}/reject",
     *      operationId="adminAccessRequestReject",
     *      tags={"Access Request Admin"},
     *      summary="Rejeitar solicitação de acesso",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\RequestBody(
     *          required=false,
     *          @OA\JsonContent(@OA\Property(property="review_notes", type="string"))
     *      ),
     *      @OA\Response(response=200, description="Rejeitado", @OA\JsonContent(@OA\Property(property="data", type="object")))
     * )
     */
    public function reject(string $id, ReviewAccessRequestRequest $request): JsonResponse
    {
        try {
            $data = array_merge($request->validated(), ['status' => 'rejected']);
            $accessRequest = $this->accessRequestService->reject($id, $data, $request->user());
            return response()->json([
                'message' => 'Request rejected.',
                'data' => new AccessRequestResource($accessRequest)
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }
}
