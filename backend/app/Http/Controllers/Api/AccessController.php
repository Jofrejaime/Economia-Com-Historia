<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AccessGateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AccessController extends Controller
{
    public function __construct(
        private readonly AccessGateService $accessGate,
    ) {}

    public function index(): JsonResponse
    {
        $levels = DB::table('access_levels')->orderBy('id')->get();

        return response()->json(['data' => $levels]);
    }

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

        DB::transaction(function () use ($accessRequest, $validated, $request, $id): void {
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
            }
        });

        $updated = DB::table('user_access_requests')->where('id', $id)->first();

        return response()->json([
            'message' => 'Request reviewed.',
            'data' => $updated,
        ]);
    }

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
