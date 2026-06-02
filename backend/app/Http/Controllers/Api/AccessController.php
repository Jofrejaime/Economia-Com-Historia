<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AccessController extends Controller
{
    public function index(): JsonResponse
    {
        $levels = DB::table('access_levels')->get();

        return response()->json(['data' => $levels]);
    }

    public function requests(Request $request): JsonResponse
    {
        $requests = DB::table('user_access_requests')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $requests]);
    }

    public function storeRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'access_level_id' => ['required', 'string', 'exists:access_levels,id'],
            'justification' => ['nullable', 'string', 'max:1000'],
        ]);

        $existingRequest = DB::table('user_access_requests')
            ->where('user_id', $request->user()->id)
            ->where('access_level_id', $validated['access_level_id'])
            ->where('status', '!=', 'rejected')
            ->first();

        if ($existingRequest !== null) {
            return response()->json(['message' => 'You already have a pending or approved request for this access level.'], 409);
        }

        $accessLevel = DB::table('access_levels')->where('id', $validated['access_level_id'])->first();

        if ($accessLevel === null) {
            return response()->json(['message' => 'Access level not found.'], 404);
        }

        $requestId = (string) Str::uuid();
        $status = $accessLevel->auto_grant ? 'approved' : 'pending';

        DB::table('user_access_requests')->insert([
            'id' => $requestId,
            'user_id' => $request->user()->id,
            'access_level_id' => $validated['access_level_id'],
            'status' => $status,
            'justification' => $validated['justification'] ?? null,
            'reviewed_by' => null,
            'reviewed_at' => $status === 'approved' ? now() : null,
            'created_at' => now(),
        ]);

        if ($accessLevel->auto_grant) {
            DB::table('user_access_grants')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $request->user()->id,
                'access_level_id' => $validated['access_level_id'],
                'granted_by' => null,
                'request_id' => $requestId,
                'granted_at' => now(),
                'expires_at' => null,
                'revoked_at' => null,
                'is_active' => true,
            ]);
        }

        $newRequest = DB::table('user_access_requests')->where('id', $requestId)->first();

        return response()->json([
            'message' => 'Access request created.',
            'data' => $newRequest,
        ], 201);
    }

    public function showRequest(string $id): JsonResponse
    {
        $request = DB::table('user_access_requests')->where('id', $id)->first();

        if ($request === null) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        return response()->json(['data' => $request]);
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
                    ->first();

                if ($existing === null) {
                    DB::table('user_access_grants')->insert([
                        'id' => (string) Str::uuid(),
                        'user_id' => $accessRequest->user_id,
                        'access_level_id' => $accessRequest->access_level_id,
                        'granted_by' => $request->user()->id,
                        'request_id' => $id,
                        'granted_at' => now(),
                        'expires_at' => null,
                        'revoked_at' => null,
                        'is_active' => true,
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
        $grants = DB::table('user_access_grants')
            ->where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->where(function ($query): void {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->get();

        return response()->json(['data' => $grants]);
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
}