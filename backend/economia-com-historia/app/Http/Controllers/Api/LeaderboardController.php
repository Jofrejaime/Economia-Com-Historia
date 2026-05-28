<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends Controller
{
    public function national(): JsonResponse
    {
        return response()->json(['data' => DB::table('leaderboard_nacional_cache')->orderBy('rank_position')->get()]);
    }

    public function provincial(): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.'], 501);
    }

    public function snapshots(): JsonResponse
    {
        return response()->json(['data' => DB::table('leaderboard_snapshots')->orderByDesc('snapshot_date')->limit(30)->get()]);
    }

    public function provinceStats(): JsonResponse
    {
        return response()->json(['data' => DB::table('province_stats')->get()]);
    }
}