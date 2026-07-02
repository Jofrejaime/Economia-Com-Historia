<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ModerateReportRequest;
use App\Http\Resources\ReportResource;
use App\Http\Resources\ModerationActionResource;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportAdminController extends Controller
{
    public function __construct(
        private readonly ReportService $reportService
    ) {}

    /**
     * @OA\Get(
     *      path="/admin/reports",
     *      operationId="adminReportsList",
     *      tags={"Report Admin"},
     *      summary="Listar todas as denúncias (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="content_type", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer")),
     *      @OA\Response(response=200, description="Lista obtida", @OA\JsonContent(@OA\Property(property="data", type="array", @OA\Items(type="object"))))
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'content_type', 'search', 'per_page']);
        $paginator = $this->reportService->list($filters, $request->user());

        return response()->json(
            ReportResource::collection($paginator)->response()->getData(true)
        );
    }

    /**
     * @OA\Get(
     *      path="/admin/reports/{id}",
     *      operationId="adminReportShow",
     *      tags={"Report Admin"},
     *      summary="Detalhe de denúncia (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Detalhes", @OA\JsonContent(@OA\Property(property="data", type="object"))),
     *      @OA\Response(response=404, description="Não encontrado")
     * )
     */
    public function show(string $id, Request $request): JsonResponse
    {
        $report = $this->reportService->find($id, $request->user());
        if (!$report) {
            return response()->json(['message' => 'Report not found.'], 404);
        }

        return response()->json(['data' => new ReportResource($report)]);
    }

    /**
     * @OA\Patch(
     *      path="/admin/reports/{id}",
     *      operationId="adminReportUpdate",
     *      tags={"Report Admin"},
     *      summary="Atualizar / Rever denúncia (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"status"},
     *              @OA\Property(property="status", type="string"),
     *              @OA\Property(property="action_taken", type="string")
     *          )
     *      ),
     *      @OA\Response(response=200, description="Atualizado", @OA\JsonContent(@OA\Property(property="data", type="object")))
     * )
     */
    public function update(string $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status'       => ['required', 'string', 'in:pending,reviewed,dismissed,actioned,resolved'],
            'action_taken' => ['nullable', 'string', 'max:1000'],
        ]);

        $report = $this->reportService->review($id, $validated, $request->user());

        return response()->json([
            'message' => 'Report updated successfully.',
            'data' => new ReportResource($report)
        ]);
    }

    /**
     * @OA\Post(
     *      path="/admin/reports/{id}/action",
     *      operationId="adminReportExecuteAction",
     *      tags={"Report Admin"},
     *      summary="Executar ação de moderação em denúncia",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"action"},
     *              @OA\Property(property="action", type="string", enum={"warn", "delete", "hide", "restore", "dismiss", "flag"}),
     *              @OA\Property(property="reason", type="string")
     *          )
     *      ),
     *      @OA\Response(response=200, description="Ação executada com sucesso", @OA\JsonContent(@OA\Property(property="action", type="string")))
     * )
     */
    public function action(string $id, ModerateReportRequest $request): JsonResponse
    {
        $action = $request->input('action');
        $reason = $request->input('reason');
        $moderator = $request->user();

        $report = match ($action) {
            'warn'             => $this->reportService->warnUser($id, $reason, $moderator),
            'delete'           => $this->reportService->deleteContent($id, $reason, $moderator),
            'hide', 'flag'     => $this->reportService->hideContent($id, $reason, $moderator),
            'restore'          => $this->reportService->restoreContent($id, $reason, $moderator),
            'dismiss'          => $this->reportService->dismiss($id, $reason, $moderator),
            default            => throw new \InvalidArgumentException('Invalid action.')
        };

        return response()->json([
            'message' => 'Action executed successfully.',
            'action'  => $action,
            'data'    => new ModerationActionResource($report)
        ]);
    }
}
