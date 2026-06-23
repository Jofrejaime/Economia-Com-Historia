<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AccessGateService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AccessController extends Controller
{
    public function __construct(
        private readonly AccessGateService $accessGate,
        private readonly NotificationService $notificationService,
    ) {}

    /**
     * @OA\Get(
     *      path="/access-levels",
     *      operationId="indexAccessLevels",
     *      tags={"Access"},
     *      summary="Listar níveis de acesso",
     *      description="Lista todos os níveis de acesso configurados no sistema.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Níveis de acesso obtidos com sucesso",
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
    public function index(): JsonResponse
    {
        $levels = DB::table('access_levels')->orderBy('id')->get();

        return response()->json(['data' => $levels]);
    }

    /**
     * @OA\Get(
     *      path="/access-requests",
     *      operationId="requests",
     *      tags={"Access"},
     *      summary="Listar solicitações de acesso",
     *      description="Lista as solicitações de acesso. Utilizadores normais veem apenas as suas, admins podem usar scope=all para ver todas.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="scope",
     *          in="query",
     *          required=false,
     *          description="Escopo das solicitações (mine = próprias, all = todas, requer privilégios de admin)",
     *          @OA\Schema(type="string", enum={"mine", "all"}, default="mine")
     *      ),
     *      @OA\Parameter(
     *          name="status",
     *          in="query",
     *          required=false,
     *          description="Filtrar por estado da solicitação",
     *          @OA\Schema(type="string", enum={"pending", "approved", "rejected", "revoked"})
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Solicitações de acesso obtidas com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Proibido se tentar listar all sem ser admin"
     *      )
     * )
     */
    public function requests(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'scope' => ['sometimes', 'in:mine,all'],
            'status' => ['sometimes', 'in:pending,approved,rejected,revoked'],
        ]);

        $scope = $validated['scope'] ?? 'mine';

        if ($scope === 'all' && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Insufficient role privileges.'], 403);
        }

        $query = DB::table('user_access_requests as uar')
            ->join('access_levels as al', 'uar.access_level_id', '=', 'al.id')
            ->leftJoin('user_profiles as up', 'uar.user_id', '=', 'up.user_id')
            ->select(
                'uar.*',
                'al.name as access_level_name',
                'up.display_name as user_display_name',
            );

        if ($scope === 'mine') {
            $query->where('uar.user_id', $request->user()->id);
        }

        if (! empty($validated['status'])) {
            $query->where('uar.status', $validated['status']);
        }

        $requests = $query->orderByDesc('uar.created_at')->limit(100)->get();

        return response()->json(['data' => $requests]);
    }

    /**
     * @OA\Post(
     *      path="/access-requests",
     *      operationId="storeAccessRequest",
     *      tags={"Access"},
     *      summary="Criar solicitação de acesso",
     *      description="Submete um pedido de acesso a um determinado nível de privilégios. Se auto_grant estiver ativo no nível de acesso, é aprovado automaticamente.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"access_level_id"},
     *              @OA\Property(property="access_level_id", type="string", format="uuid", example="access-level-uuid"),
     *              @OA\Property(property="justification", type="string", maxLength=1000, nullable=true, example="Preciso de acesso para fins de investigação...")
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Solicitação criada com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Access request created."),
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Nível de acesso não encontrado"
     *      ),
     *      @OA\Response(
     *          response=409,
     *          description="Solicitação pendente existente ou acesso já concedido"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Erro de validação"
     *      )
     * )
     */
    public function storeRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'access_level_id' => ['required', 'string', 'exists:access_levels,id'],
            'justification' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = $request->user();
        $accessLevelId = $validated['access_level_id'];

        if (in_array($accessLevelId, $this->accessGate->activeGrantLevelIds($user), true)) {
            return response()->json(['message' => 'You already have access to this level.'], 409);
        }

        $existingRequest = DB::table('user_access_requests')
            ->where('user_id', $user->id)
            ->where('access_level_id', $accessLevelId)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existingRequest !== null) {
            return response()->json(['message' => 'You already have a pending or approved request for this access level.'], 409);
        }

        $accessLevel = DB::table('access_levels')->where('id', $accessLevelId)->first();

        if ($accessLevel === null) {
            return response()->json(['message' => 'Access level not found.'], 404);
        }

        $requestId = (string) Str::uuid();
        $status = $accessLevel->auto_grant ? 'approved' : 'pending';

        DB::transaction(function () use ($user, $validated, $accessLevelId, $requestId, $status, $accessLevel): void {
            DB::table('user_access_requests')->insert([
                'id' => $requestId,
                'user_id' => $user->id,
                'access_level_id' => $accessLevelId,
                'status' => $status,
                'justification' => $validated['justification'] ?? null,
                'reviewed_by' => $status === 'approved' ? null : null,
                'reviewed_at' => $status === 'approved' ? now() : null,
                'created_at' => now(),
            ]);

            if ($accessLevel->auto_grant) {
                $this->createGrant($user->id, $accessLevelId, null, $requestId);
            }
        });

        $newRequest = DB::table('user_access_requests')->where('id', $requestId)->first();

        return response()->json([
            'message' => 'Access request created.',
            'data' => $newRequest,
        ], 201);
    }

    /**
     * @OA\Get(
     *      path="/access-requests/{id}",
     *      operationId="showAccessRequest",
     *      tags={"Access"},
     *      summary="Visualizar detalhes de uma solicitação",
     *      description="Obtém os detalhes de um pedido de acesso. Utilizadores comuns veem apenas os seus, admins veem qualquer um.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do pedido de acesso",
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
     *          response=403,
     *          description="Proibido se não for dono do pedido nem admin"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Pedido não encontrado"
     *      )
     * )
     */
    public function showRequest(Request $request, string $id): JsonResponse
    {
        $accessRequest = DB::table('user_access_requests')->where('id', $id)->first();

        if ($accessRequest === null) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        if ($request->user()->role !== 'admin' && $accessRequest->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(['data' => $accessRequest]);
    }

    /**
     * @OA\Patch(
     *      path="/access-requests/{id}",
     *      operationId="reviewRequest",
     *      tags={"Access"},
     *      summary="Rever/Decidir pedido de acesso (Apenas Admin)",
     *      description="Permite a um administrador aprovar ou rejeitar uma solicitação de acesso pendente.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do pedido de acesso",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"status"},
     *              @OA\Property(property="status", type="string", enum={"approved", "rejected"}, example="approved"),
     *              @OA\Property(property="review_notes", type="string", maxLength=1000, nullable=true, example="Acesso concedido após verificação de matrícula.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Pedido revisto com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Request reviewed."),
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Acesso proibido (Requer role admin)"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Pedido não encontrado"
     *      ),
     *      @OA\Response(
     *          response=409,
     *          description="O pedido já foi revisto anteriormente"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Erro de validação"
     *      )
     * )
     */
    public function reviewRequest(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'review_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $accessRequest = DB::table('user_access_requests')->where('id', $id)->first();

        if ($accessRequest === null) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        if ($accessRequest->status !== 'pending') {
            return response()->json(['message' => 'This request has already been reviewed.'], 409);
        }

        // Get user and access level data before transaction
        $user = User::find($accessRequest->user_id);
        $accessLevel = DB::table('access_levels')->where('id', $accessRequest->access_level_id)->first();

        DB::transaction(function () use ($accessRequest, $validated, $request, $id, $user, $accessLevel) {
            DB::table('user_access_requests')
                ->where('id', $id)
                ->update([
                    'status' => $validated['status'],
                    'reviewed_by' => $request->user()->id,
                    'reviewed_at' => now(),
                    'review_notes' => $validated['review_notes'] ?? null,
                ]);

            if ($validated['status'] === 'approved') {
                $existing = DB::table('user_access_grants')
                    ->where('user_id', $accessRequest->user_id)
                    ->where('access_level_id', $accessRequest->access_level_id)
                    ->whereNull('revoked_at')
                    ->first();

                if ($existing === null) {
                    $this->createGrant(
                        $accessRequest->user_id,
                        $accessRequest->access_level_id,
                        $request->user()->id,
                        $id,
                    );
                } elseif (! $existing->is_active) {
                    DB::table('user_access_grants')
                        ->where('id', $existing->id)
                        ->update([
                            'is_active' => true,
                            'revoked_at' => null,
                            'granted_by' => $request->user()->id,
                            'granted_at' => now(),
                            'request_id' => $id,
                        ]);
                }

                // Send notification for approval
                $this->notificationService->send(
                    $user,
                    'access_request_approved',
                    'Access Request Approved',
                    "Your request for {$accessLevel->name} access has been approved.",
                    $id,
                    'access_request'
                );
            } else {
                // Send notification for rejection
                $this->notificationService->send(
                    $user,
                    'access_request_rejected',
                    'Access Request Rejected',
                    "Your request for {$accessLevel->name} access has been rejected.",
                    $id,
                    'access_request'
                );
            }
        });

        $updated = DB::table('user_access_requests')->where('id', $id)->first();

        return response()->json([
            'message' => 'Request reviewed.',
            'data' => $updated,
        ]);
    }

    /**
     * @OA\Get(
     *      path="/access-grants",
     *      operationId="grants",
     *      tags={"Access"},
     *      summary="Listar concessões de acesso",
     *      description="Lista as concessões de acesso ativas. Utilizadores veem as suas, admins podem usar scope=all.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="scope",
     *          in="query",
     *          required=false,
     *          description="Escopo (mine = próprias, all = todas, requer privilégios de admin)",
     *          @OA\Schema(type="string", enum={"mine", "all"}, default="mine")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Concessões de acesso obtidas com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Proibido se scope=all sem ser admin"
     *      )
     * )
     */
    public function grants(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'scope' => ['sometimes', 'in:mine,all'],
        ]);

        $scope = $validated['scope'] ?? 'mine';

        if ($scope === 'all' && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Insufficient role privileges.'], 403);
        }

        $query = DB::table('user_access_grants as uag')
            ->join('access_levels as al', 'uag.access_level_id', '=', 'al.id')
            ->select(
                'uag.*',
                'al.name as access_level_name',
            )
            ->where('uag.is_active', true)
            ->whereNull('uag.revoked_at')
            ->where(function ($builder): void {
                $builder->whereNull('uag.expires_at')->orWhere('uag.expires_at', '>', now());
            });

        if ($scope === 'mine') {
            $query->where('uag.user_id', $request->user()->id);
        }

        return response()->json(['data' => $query->orderByDesc('uag.granted_at')->get()]);
    }

    /**
     * @OA\Post(
     *      path="/access-grants/{id}/revoke",
     *      operationId="revokeGrant",
     *      tags={"Access"},
     *      summary="Revogar concessão de acesso (Apenas Admin)",
     *      description="Permite a um administrador revogar manualmente uma concessão de acesso ativa.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID da concessão de acesso",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Concessão revogada com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Grant revoked."),
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Acesso proibido (Requer role admin)"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Concessão não encontrada"
     *      )
     * )
     */
    public function revokeGrant(Request $request, string $id): JsonResponse
    {
        $grant = DB::table('user_access_grants')->where('id', $id)->first();

        if ($grant === null) {
            return response()->json(['message' => 'Grant not found.'], 404);
        }

        DB::table('user_access_grants')
            ->where('id', $id)
            ->update([
                'revoked_at' => now(),
                'is_active' => false,
            ]);

        $updated = DB::table('user_access_grants')->where('id', $id)->first();

        return response()->json([
            'message' => 'Grant revoked.',
            'data' => $updated,
        ]);
    }

    private function createGrant(
        string $userId,
        string $accessLevelId,
        ?string $grantedBy,
        ?string $requestId,
    ): void {
        DB::table('user_access_grants')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'access_level_id' => $accessLevelId,
            'granted_by' => $grantedBy,
            'request_id' => $requestId,
            'granted_at' => now(),
            'expires_at' => null,
            'revoked_at' => null,
            'is_active' => true,
        ]);
    }
}
