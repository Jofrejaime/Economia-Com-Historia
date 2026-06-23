<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportModerationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    public function __construct(
        private ReportModerationService $moderationService
    ) {}

    /**
     * @OA\Post(
     *      path="/reports",
     *      operationId="storeReport",
     *      tags={"Reports"},
     *      summary="Criar uma denúncia",
     *      description="Denuncia um conteúdo (documento, tópico, resposta ou utilizador) por comportamento ou conteúdo inadequado.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"content_type", "content_id", "reason"},
     *              @OA\Property(property="content_type", type="string", enum={"document", "topic", "reply", "user"}, example="document"),
     *              @OA\Property(property="content_id", type="string", format="uuid", example="content-uuid"),
     *              @OA\Property(property="reason", type="string", enum={"spam", "inappropriate", "misinformation", "copyright", "off_topic", "other"}, example="spam"),
     *              @OA\Property(property="description", type="string", maxLength=1000, nullable=true, example="Este documento contém informações falsas...")
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Denúncia submetida com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Report submitted successfully."),
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Conteúdo especificado não encontrado"
     *      ),
     *      @OA\Response(
     *          response=409,
     *          description="Já tem uma denúncia pendente para este conteúdo"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Erros de validação"
     *      )
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content_type' => ['required', 'string', 'in:document,topic,reply,user'],
            'content_id' => ['required', 'string', 'uuid'],
            'reason' => ['required', 'string', 'in:spam,inappropriate,misinformation,copyright,off_topic,other'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        // Validate content exists
        if (!$this->moderationService->contentExists($validated['content_type'], $validated['content_id'])) {
            return response()->json([
                'message' => 'The specified content does not exist.',
            ], 404);
        }

        // Check for duplicate pending report
        if ($this->moderationService->hasPendingReport($request->user()->id, $validated['content_type'], $validated['content_id'])) {
            return response()->json([
                'message' => 'You already have a pending report for this content.',
            ], 409);
        }

        $report = DB::transaction(function () use ($validated, $request) {
            $report = [
                'id' => (string) Str::uuid(),
                'reporter_id' => $request->user()->id,
                'content_type' => $validated['content_type'],
                'content_id' => $validated['content_id'],
                'reason' => $validated['reason'],
                'description' => $validated['description'] ?? null,
                'status' => 'pending',
                'created_at' => now(),
            ];

            DB::table('content_reports')->insert($report);

            return $report;
        });

        return response()->json([
            'message' => 'Report submitted successfully.',
            'data' => $report,
        ], 201);
    }

    /**
     * @OA\Get(
     *      path="/reports",
     *      operationId="indexReports",
     *      tags={"Reports"},
     *      summary="Listar as minhas denúncias",
     *      description="Lista as denúncias efetuadas pelo utilizador autenticado.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Denúncias obtidas com sucesso",
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
    public function index(Request $request): JsonResponse
    {
        // Own reports
        $reports = DB::table('content_reports')
            ->where('reporter_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $reports]);
    }

    /**
     * @OA\Get(
     *      path="/reports/pending",
     *      operationId="pendingReports",
     *      tags={"Reports"},
     *      summary="Listar denúncias pendentes (Apenas Admin)",
     *      description="Lista todas as denúncias com estado pendente.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Denúncias pendentes obtidas",
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
     *          description="Acesso proibido (Requer admin)"
     *      )
     * )
     */
    public function pending(Request $request): JsonResponse
    {
        // Admin-only: list all pending reports
        $reports = DB::table('content_reports')
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $reports]);
    }

    /**
     * @OA\Get(
     *      path="/reports/{id}",
     *      operationId="showReport",
     *      tags={"Reports"},
     *      summary="Visualizar detalhes de uma denúncia",
     *      description="Retorna os detalhes de uma denúncia específica.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID da denúncia",
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
     *          response=404,
     *          description="Denúncia não encontrada"
     *      )
     * )
     */
    public function show(string $id): JsonResponse
    {
        $report = DB::table('content_reports')->where('id', $id)->first();

        if (!$report) {
            abort(404, 'Report not found.');
        }

        return response()->json(['data' => $report]);
    }

    /**
     * @OA\Patch(
     *      path="/reports/{id}",
     *      operationId="updateReport",
     *      tags={"Reports"},
     *      summary="Atualizar denúncia (Apenas Admin)",
     *      description="Atualiza informações de revisão e estado da denúncia.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID da denúncia",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"status"},
     *              @OA\Property(property="status", type="string", enum={"pending", "reviewed", "dismissed", "actioned"}),
     *              @OA\Property(property="reviewed_by", type="string", format="uuid", nullable=true),
     *              @OA\Property(property="reviewed_at", type="string", format="date-time", nullable=true),
     *              @OA\Property(property="action_taken", type="string", maxLength=1000, nullable=true)
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Denúncia atualizada com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Report updated successfully."),
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Acesso proibido (Requer admin)"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Denúncia não encontrada"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Erros de validação"
     *      )
     * )
     */
    public function update(string $id, Request $request): JsonResponse
    {
        $report = DB::table('content_reports')->where('id', $id)->first();

        if (!$report) {
            abort(404, 'Report not found.');
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,reviewed,dismissed,actioned'],
            'reviewed_by' => ['nullable', 'string', 'uuid'],
            'reviewed_at' => ['nullable', 'date'],
            'action_taken' => ['nullable', 'string', 'max:1000'],
        ]);

        $data = [
            'status' => $validated['status'],
        ];

        if (isset($validated['reviewed_by'])) {
            $data['reviewed_by'] = $validated['reviewed_by'];
        }
        if (isset($validated['reviewed_at'])) {
            $data['reviewed_at'] = $validated['reviewed_at'];
        }
        if (isset($validated['action_taken'])) {
            $data['action_taken'] = $validated['action_taken'];
        }

        DB::table('content_reports')
            ->where('id', $id)
            ->update($data);

        $updated = DB::table('content_reports')->where('id', $id)->first();

        return response()->json([
            'message' => 'Report updated successfully.',
            'data' => $updated,
        ]);
    }

    /**
     * @OA\Post(
     *      path="/reports/{id}/action",
     *      operationId="executeReportAction",
     *      tags={"Reports"},
     *      summary="Executar ação moderadora em denúncia (Apenas Admin)",
     *      description="Aplica sanções baseadas na denúncia (ex: sinalizar conteúdo, apagar conteúdo, alertar utilizador, arquivar).",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID da denúncia",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"action"},
     *              @OA\Property(property="action", type="string", enum={"flag", "delete", "warn", "dismiss"}, example="flag"),
     *              @OA\Property(property="reason", type="string", maxLength=500, nullable=true, example="Violação persistente de termos...")
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Ação executada com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Action executed successfully."),
     *              @OA\Property(property="action", type="string", example="flag")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Acesso proibido (Requer admin)"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Denúncia não encontrada"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Erro de validação"
     *      )
     * )
     */
    public function action(string $id, Request $request): JsonResponse
    {
        $report = DB::table('content_reports')->where('id', $id)->first();

        if (!$report) {
            abort(404, 'Report not found.');
        }

        $validated = $request->validate([
            'action' => ['required', 'string', 'in:flag,delete,warn,dismiss'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($report, $validated, $request) {
            // Update report status
            DB::table('content_reports')
                ->where('id', $report->id)
                ->update([
                    'status' => 'actioned',
                    'reviewed_by' => $request->user()->id,
                    'reviewed_at' => now(),
                    'action_taken' => "Action taken: {$validated['action']}. Reason: {$validated['reason']}",
                ]);

            // Execute action using service
            match ($validated['action']) {
                'flag' => $this->moderationService->flagContent($report),
                'delete' => $this->moderationService->deleteContent($report),
                'warn' => $this->moderationService->warnUser($report),
                'dismiss' => $this->moderationService->dismissReport($report),
                default => null,
            };
        });

        return response()->json([
            'message' => 'Action executed successfully.',
            'action' => $validated['action'],
        ]);
    }
}