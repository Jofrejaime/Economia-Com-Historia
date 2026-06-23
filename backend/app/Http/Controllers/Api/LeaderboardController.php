<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LeaderboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    public function __construct(private readonly LeaderboardService $leaderboard) {}

    /**
     * @OA\Get(
     *      path="/leaderboard/national",
     *      operationId="nationalLeaderboard",
     *      tags={"Leaderboard"},
     *      summary="Classificação nacional",
     *      description="Lista os melhores utilizadores ao nível nacional.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Classificação nacional obtida",
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
    public function national(): JsonResponse
    {
        return response()->json(['data' => $this->leaderboard->national()]);
    }

    /**
     * @OA\Get(
     *      path="/leaderboard/provincial",
     *      operationId="provincialLeaderboard",
     *      tags={"Leaderboard"},
     *      summary="Classificação provincial",
     *      description="Lista os melhores utilizadores de uma província específica com paginação.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="province",
     *          in="query",
     *          required=true,
     *          description="Nome da província angolana",
     *          @OA\Schema(type="string", example="Luanda")
     *      ),
     *      @OA\Parameter(
     *          name="page",
     *          in="query",
     *          required=false,
     *          description="Número da página",
     *          @OA\Schema(type="integer", default=1)
     *      ),
     *      @OA\Parameter(
     *          name="per_page",
     *          in="query",
     *          required=false,
     *          description="Número de registos por página (1 a 100)",
     *          @OA\Schema(type="integer", default=20)
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Classificação provincial obtida",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *              @OA\Property(property="current_page", type="integer"),
     *              @OA\Property(property="last_page", type="integer"),
     *              @OA\Property(property="total", type="integer")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Parâmetro province em falta ou incorreto"
     *      )
     * )
     */
    public function provincial(Request $request): JsonResponse
    {
        $province = $request->query('province');

        if (! $province) {
            return response()->json(['message' => 'O parâmetro province é obrigatório.'], 422);
        }

        $result = $this->leaderboard->provincial(
            province: $province,
            page:     max(1, (int) $request->query('page', 1)),
            perPage:  max(1, min(100, (int) $request->query('per_page', 20))),
        );

        return response()->json($result);
    }

    /**
     * @OA\Get(
     *      path="/leaderboard/snapshots",
     *      operationId="leaderboardSnapshots",
     *      tags={"Leaderboard"},
     *      summary="Histórico de fotos do Leaderboard",
     *      description="Lista os instantâneos de classificação históricos gravados.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Histórico obtido",
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
    public function snapshots(): JsonResponse
    {
        return response()->json(['data' => $this->leaderboard->snapshots()]);
    }

    /**
     * @OA\Get(
     *      path="/stats/provinces",
     *      operationId="provinceStats",
     *      tags={"Leaderboard"},
     *      summary="Estatísticas globais por província",
     *      description="Obtém estatísticas agregadas por província angolana (ex: total de utilizadores, total de pontos).",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Estatísticas obtidas",
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
    public function provinceStats(): JsonResponse
    {
        return response()->json(['data' => $this->leaderboard->provinceStats()]);
    }
}