<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GamificationController extends Controller
{
    public function __construct(
        private readonly GamificationService $gamification,
    ) {}

    public function pointTransactions(Request $request): JsonResponse
    {
        $limit = min(100, max(1, (int) $request->query('limit', 50)));

        return response()->json([
            'data' => $this->gamification->pointTransactionHistory($request->user(), $limit),
        ]);
    }
}
