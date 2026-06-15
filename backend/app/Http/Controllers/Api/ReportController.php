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

    public function index(Request $request): JsonResponse
    {
        // Own reports
        $reports = DB::table('content_reports')
            ->where('reporter_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $reports]);
    }

    public function pending(Request $request): JsonResponse
    {
        // Admin-only: list all pending reports
        $reports = DB::table('content_reports')
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $reports]);
    }

    public function show(string $id): JsonResponse
    {
        $report = DB::table('content_reports')->where('id', $id)->first();

        if (!$report) {
            abort(404, 'Report not found.');
        }

        return response()->json(['data' => $report]);
    }

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