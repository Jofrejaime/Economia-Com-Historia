<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(['data' => DB::table('notifications')->where('user_id', $request->user()->id)->orderByDesc('created_at')->limit(50)->get()]);
    }

    public function markRead(string $id): JsonResponse { return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501); }
    public function markAllRead(): JsonResponse { return response()->json(['message' => 'Endpoint ready.'], 501); }
    public function destroy(string $id): JsonResponse { return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501); }
}