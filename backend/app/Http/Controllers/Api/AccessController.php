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
        return response()->json(['data' => DB::table('access_levels')->get()]);
    }

    public function requests(Request $request): JsonResponse
    {
        return response()->json(['data' => DB::table('user_access_requests')->where('user_id', $request->user()->id)->get()]);
    }

    public function storeRequest(): JsonResponse { return response()->json(['message' => 'Endpoint ready.'], 501); }
    public function showRequest(string $id): JsonResponse { return response()->json(['data' => DB::table('user_access_requests')->where('id', $id)->first()]); }
    public function reviewRequest(string $id): JsonResponse { return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501); }
    public function grants(Request $request): JsonResponse { return response()->json(['data' => DB::table('user_access_grants')->where('user_id', $request->user()->id)->get()]); }
    public function revokeGrant(string $id): JsonResponse { return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501); }
}