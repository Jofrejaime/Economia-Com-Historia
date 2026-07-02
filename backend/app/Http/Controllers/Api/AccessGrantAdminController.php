<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RevokeGrantRequest;
use App\Http\Resources\AccessGrantResource;
use App\Services\AccessGrantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccessGrantAdminController extends Controller
{
    public function __construct(
        private readonly AccessGrantService $accessGrantService
    ) {}

    /**
     * @OA\Get(
     *      path="/admin/access-grants",
     *      operationId="adminAccessGrantsList",
     *      tags={"Access Grant Admin"},
     *      summary="Listar todas as concessões de acesso (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="user_id", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="access_level_id", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="active", in="query", required=false, @OA\Schema(type="boolean")),
     *      @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer")),
     *      @OA\Response(response=200, description="Lista obtida", @OA\JsonContent(@OA\Property(property="data", type="array", @OA\Items(type="object"))))
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['user_id', 'access_level_id', 'active', 'per_page']);
        $paginator = $this->accessGrantService->list($filters, $request->user());

        return response()->json(
            AccessGrantResource::collection($paginator)->response()->getData(true)
        );
    }

    /**
     * @OA\Post(
     *      path="/admin/access-grants/{id}/revoke",
     *      operationId="adminAccessGrantRevoke",
     *      tags={"Access Grant Admin"},
     *      summary="Revogar concessão de acesso",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\RequestBody(required=false, @OA\JsonContent(@OA\Property(property="reason", type="string"))),
     *      @OA\Response(response=200, description="Revogado com sucesso", @OA\JsonContent(@OA\Property(property="message", type="string")))
     * )
     */
    public function revoke(string $id, RevokeGrantRequest $request): JsonResponse
    {
        try {
            $grant = $this->accessGrantService->revoke($id, $request->user(), $request->input('reason'));
            return response()->json([
                'message' => 'Grant revoked.',
                'data' => new AccessGrantResource($grant)
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }
}
