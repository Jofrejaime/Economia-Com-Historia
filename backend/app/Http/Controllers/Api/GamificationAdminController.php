<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GamificationDashboardResource;
use App\Http\Resources\LeaderboardResource;
use App\Http\Resources\PointTransactionResource;
use App\Http\Resources\QuizAttemptResource;
use App\Services\LeaderboardService;
use App\Services\PointTransactionService;
use App\Services\QuizAttemptService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @OA\Tag(
 *     name="Gamification Admin",
 *     description="Operações de Administração do Módulo de Gamificação (Somente Leitura para Logs/Logs Históricos)"
 * )
 */
class GamificationAdminController extends Controller
{
    public function __construct(
        private readonly LeaderboardService $leaderboardService,
        private readonly PointTransactionService $pointTransactionService,
        private readonly QuizAttemptService $quizAttemptService,
    ) {}

    /**
     * @OA\Get(
     *     path="/api/admin/gamification/dashboard",
     *     summary="Dashboard geral de gamificação (Admin)",
     *     tags={"Gamification Admin"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Dashboard compilado",
     *         @OA\JsonContent(ref="#/components/schemas/GamificationDashboard")
     *     )
     * )
     */
    public function dashboard(Request $request): JsonResponse
    {
        $totalUsers = DB::table('users')->where('is_active', 1)->count();
        $totalBadges = DB::table('badges')->count();
        $totalPoints = (int) DB::table('user_levels')->sum('total_points');

        $recentEarnedBadges = DB::table('user_badges as ub')
            ->join('badges as b', 'b.id', '=', 'ub.badge_id')
            ->join('user_profiles as up', 'up.user_id', '=', 'ub.user_id')
            ->select([
                'ub.id',
                'up.display_name as user_name',
                'b.name as badge_name',
                'b.icon_url',
                'ub.earned_at',
            ])
            ->orderByDesc('ub.earned_at')
            ->limit(5)
            ->get();

        $topUsers = $this->leaderboardService->topUsers(5);
        $quizzesCount = DB::table('quizzes')->count();

        $attemptsStats = $this->quizAttemptService->statistics();
        $snapshots = $this->leaderboardService->snapshots(10);

        $dashboardData = [
            'total_users'          => $totalUsers,
            'total_badges'         => $totalBadges,
            'total_points'         => $totalPoints,
            'recent_earned_badges' => $recentEarnedBadges,
            'top_users'            => $topUsers,
            'leaderboard'          => $topUsers,
            'quizzes_count'        => $quizzesCount,
            'total_attempts'       => $attemptsStats['total'],
            'snapshots'            => $snapshots,
        ];

        return response()->json([
            'data' => new GamificationDashboardResource($dashboardData),
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/leaderboard",
     *     summary="Listar Leaderboard com filtros e paginação (Admin)",
     *     tags={"Gamification Admin"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Ranking de utilizadores"
     *     )
     * )
     */
    public function leaderboard(Request $request): JsonResponse
    {
        $filters = $request->only(['scope', 'province', 'institution', 'page', 'per_page']);
        $result = $this->leaderboardService->ranking($filters);

        return response()->json(new LeaderboardResource(array_merge($filters, $result)));
    }

    /**
     * @OA\Post(
     *     path="/api/admin/leaderboard/refresh",
     *     summary="Forçar recalculamento do cache do Leaderboard (Admin)",
     *     tags={"Gamification Admin"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Cache atualizado"
     *     )
     * )
     */
    public function refreshLeaderboard(Request $request): JsonResponse
    {
        $this->leaderboardService->refresh($request->user());

        return response()->json([
            'message' => 'Leaderboard recalculado com sucesso.',
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/leaderboard/snapshots",
     *     summary="Listar snapshots históricos (Admin)",
     *     tags={"Gamification Admin"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de snapshots"
     *     )
     * )
     */
    public function snapshots(Request $request): JsonResponse
    {
        $limit = min((int) ($request->input('limit', 30)), 100);
        $snapshots = $this->leaderboardService->snapshots($limit);

        return response()->json([
            'data' => $snapshots,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/point-transactions",
     *     summary="Listar transações de pontos com filtros e paginação (Admin)",
     *     tags={"Gamification Admin"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de transações"
     *     )
     * )
     */
    public function pointTransactions(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'user_id', 'reason', 'type', 'date_from', 'date_to', 'per_page', 'page']);
        $result = $this->pointTransactionService->list($filters);

        return response()->json([
            'data'  => PointTransactionResource::collection($result['data']),
            'stats' => $this->pointTransactionService->statistics(),
            'meta'  => $result['meta'],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/point-transactions/{id}",
     *     summary="Ver detalhes de uma transação de pontos (Admin)",
     *     tags={"Gamification Admin"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="Detalhes da transação"
     *     )
     * )
     */
    public function showPointTransaction(string $id): JsonResponse
    {
        $tx = $this->pointTransactionService->find($id);

        if ($tx === null) {
            return response()->json(['message' => 'Transação não encontrada.'], 404);
        }

        return response()->json([
            'data' => new PointTransactionResource($tx),
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/point-transactions/export",
     *     summary="Exportar transações de pontos para CSV (Admin)",
     *     tags={"Gamification Admin"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Ficheiro CSV"
     *     )
     * )
     */
    public function exportPointTransactions(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'user_id', 'reason', 'type', 'date_from', 'date_to']);
        $csv = $this->pointTransactionService->export($filters);

        return response()->json([
            'csv' => $csv,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/quiz-attempts",
     *     summary="Listar tentativas de quiz com filtros e paginação (Admin)",
     *     tags={"Gamification Admin"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de tentativas"
     *     )
     * )
     */
    public function quizAttempts(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'user_id', 'quiz_id', 'status', 'min_score', 'max_score', 'per_page', 'page']);
        $result = $this->quizAttemptService->list($filters);

        return response()->json([
            'data'  => QuizAttemptResource::collection($result['data']),
            'stats' => $this->quizAttemptService->statistics(),
            'meta'  => $result['meta'],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/quiz-attempts/{id}",
     *     summary="Ver detalhes de uma tentativa de quiz (Admin)",
     *     tags={"Gamification Admin"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="Detalhes da tentativa"
     *     )
     * )
     */
    public function showQuizAttempt(string $id): JsonResponse
    {
        $attempt = $this->quizAttemptService->find($id);

        if ($attempt === null) {
            return response()->json(['message' => 'Tentativa não encontrada.'], 404);
        }

        return response()->json([
            'data' => new QuizAttemptResource($attempt),
        ]);
    }
}
