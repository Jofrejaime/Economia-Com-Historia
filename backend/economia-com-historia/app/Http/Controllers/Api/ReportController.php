<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    public function store(Request $request): JsonResponse { return response()->json(['message' => 'Endpoint ready.'], 501); }
    public function index(Request $request): JsonResponse { return response()->json(['data' => DB::table('content_reports')->where('reporter_id', $request->user()->id)->get()]); }
    public function show(string $id): JsonResponse { return response()->json(['data' => DB::table('content_reports')->where('id', $id)->first()]); }
    public function update(string $id): JsonResponse { return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501); }
    public function action(string $id): JsonResponse { return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501); }
}