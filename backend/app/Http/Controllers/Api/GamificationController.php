<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GamificationController extends Controller
{
    public function __construct(
        private readonly GamificationService $gamification,
    ) {}

    /**
     * @OA\Get(
     *      path="/me/point-transactions",
     *      operationId="pointTransactions",
     *      tags={"Profile"},
     *      summary="Histórico de transações de pontos",
     *      description="Retorna o histórico de pontos obtidos pelo utilizador autenticado.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="limit",
     *          in="query",
     *          required=false,
     *          description="Número limite de transações a retornar (1 a 100, padrão 50)",
     *          @OA\Schema(type="integer", minimum=1, maximum=100, default=50)
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Histórico obtido com sucesso",
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
    public function pointTransactions(Request $request): JsonResponse
    {
        $limit = min(100, max(1, (int) $request->query('limit', 50)));

        return response()->json([
            'data' => $this->gamification->pointTransactionHistory($request->user(), $limit),
        ]);
    }
}
