<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\InvalidSubscriptionTransitionException;
use App\Exceptions\SubscriptionNotFoundException;
use App\Http\Controllers\Controller;
use App\Services\DocumentSubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDocumentSubscriptionController extends Controller
{
    public function __construct(private readonly DocumentSubscriptionService $subscriptionService) {}

    /**
     * @OA\Get(
     *      path="/admin/document-subscriptions",
     *      operationId="adminListDocumentSubscriptions",
     *      tags={"Admin - Subscriptions"},
     *      summary="Listar pedidos de subscrição (Admin)",
     *      description="Lista todos os pedidos de subscrição com paginação. Filtros: status, document_id, user_id.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string", enum={"PENDING", "ACTIVE", "REJECTED", "CANCELLED"})),
     *      @OA\Parameter(name="document_id", in="query", required=false, @OA\Schema(type="string", format="uuid")),
     *      @OA\Parameter(name="user_id", in="query", required=false, @OA\Schema(type="string", format="uuid")),
     *      @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", maximum=100, default=20)),
     *      @OA\Response(response=200, description="Lista de pedidos",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(
     *                  @OA\Property(property="id", type="string", format="uuid"),
     *                  @OA\Property(property="user_id", type="string", format="uuid"),
     *                  @OA\Property(property="document_id", type="string", format="uuid"),
     *                  @OA\Property(property="status", type="string", enum={"PENDING", "ACTIVE", "REJECTED", "CANCELLED"}),
     *                  @OA\Property(property="started_at", type="string", format="date-time"),
     *                  @OA\Property(property="approved_by", type="string", format="uuid", nullable=true),
     *                  @OA\Property(property="rejected_by", type="string", format="uuid", nullable=true),
     *                  @OA\Property(property="cancelled_by", type="string", format="uuid", nullable=true),
     *                  @OA\Property(property="document_title", type="string"),
     *                  @OA\Property(property="user_email", type="string"),
     *                  @OA\Property(property="user_display_name", type="string", nullable=true)
     *              )),
     *              @OA\Property(property="meta", type="object",
     *                  @OA\Property(property="current_page", type="integer"),
     *                  @OA\Property(property="last_page", type="integer"),
     *                  @OA\Property(property="per_page", type="integer"),
     *                  @OA\Property(property="total", type="integer")
     *              )
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Apenas administradores")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = array_filter([
            'status'      => $request->input('status'),
            'document_id' => $request->input('document_id'),
            'user_id'     => $request->input('user_id'),
        ]);

        $perPage   = min((int) $request->input('per_page', 20), 100);
        $paginator = $this->subscriptionService->listSubscriptions($filters, $perPage);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }

    /**
     * @OA\Patch(
     *      path="/admin/document-subscriptions/{id}/approve",
     *      operationId="adminApproveSubscription",
     *      tags={"Admin - Subscriptions"},
     *      summary="Aprovar pedido de subscrição (Admin)",
     *      description="Transição: PENDING → ACTIVE. Regista o admin responsável em approved_by.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string", format="uuid")),
     *      @OA\Response(response=200, description="Subscrição aprovada",
     *          @OA\JsonContent(@OA\Property(property="message", type="string"))
     *      ),
     *      @OA\Response(response=404, description="Pedido não encontrado"),
     *      @OA\Response(response=409, description="Transição de estado inválida",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string"),
     *              @OA\Property(property="current_status", type="string")
     *          )
     *      )
     * )
     */
    public function approve(string $id, Request $request): JsonResponse
    {
        try {
            $this->subscriptionService->approveSubscription($id, $request->user()->id);

            return response()->json(['message' => 'Subscription approved.']);
        } catch (SubscriptionNotFoundException) {
            return response()->json(['message' => 'Subscription not found.'], 404);
        } catch (InvalidSubscriptionTransitionException $e) {
            return response()->json([
                'message'        => 'Only PENDING subscriptions can be approved.',
                'current_status' => $e->currentStatus->value,
            ], 409);
        }
    }

    /**
     * @OA\Patch(
     *      path="/admin/document-subscriptions/{id}/reject",
     *      operationId="adminRejectSubscription",
     *      tags={"Admin - Subscriptions"},
     *      summary="Rejeitar pedido de subscrição (Admin)",
     *      description="Transição: PENDING → REJECTED. Regista o admin responsável em rejected_by.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string", format="uuid")),
     *      @OA\Response(response=200, description="Subscrição rejeitada",
     *          @OA\JsonContent(@OA\Property(property="message", type="string"))
     *      ),
     *      @OA\Response(response=404, description="Pedido não encontrado"),
     *      @OA\Response(response=409, description="Transição de estado inválida",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string"),
     *              @OA\Property(property="current_status", type="string")
     *          )
     *      )
     * )
     */
    public function reject(string $id, Request $request): JsonResponse
    {
        try {
            $this->subscriptionService->rejectSubscription($id, $request->user()->id);

            return response()->json(['message' => 'Subscription rejected.']);
        } catch (SubscriptionNotFoundException) {
            return response()->json(['message' => 'Subscription not found.'], 404);
        } catch (InvalidSubscriptionTransitionException $e) {
            return response()->json([
                'message'        => 'Only PENDING subscriptions can be rejected.',
                'current_status' => $e->currentStatus->value,
            ], 409);
        }
    }

    /**
     * @OA\Patch(
     *      path="/admin/document-subscriptions/{id}/cancel",
     *      operationId="adminCancelSubscription",
     *      tags={"Admin - Subscriptions"},
     *      summary="Cancelar subscrição (Admin)",
     *      description="Transição: ACTIVE ou PENDING → CANCELLED. Regista o admin responsável em cancelled_by.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string", format="uuid")),
     *      @OA\Response(response=200, description="Subscrição cancelada",
     *          @OA\JsonContent(@OA\Property(property="message", type="string"))
     *      ),
     *      @OA\Response(response=404, description="Pedido não encontrado"),
     *      @OA\Response(response=409, description="Transição de estado inválida",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string"),
     *              @OA\Property(property="current_status", type="string")
     *          )
     *      )
     * )
     */
    public function cancel(string $id, Request $request): JsonResponse
    {
        try {
            $this->subscriptionService->adminCancelSubscription($id, $request->user()->id);

            return response()->json(['message' => 'Subscription cancelled.']);
        } catch (SubscriptionNotFoundException) {
            return response()->json(['message' => 'Subscription not found.'], 404);
        } catch (InvalidSubscriptionTransitionException $e) {
            return response()->json([
                'message'        => 'Only ACTIVE or PENDING subscriptions can be cancelled.',
                'current_status' => $e->currentStatus->value,
            ], 409);
        }
    }
}
