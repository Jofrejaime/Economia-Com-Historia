<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService) {}

    public function summary(): JsonResponse
    {
        return response()->json([
            'data' => $this->dashboardService->summary(),
        ]);
    }
}
