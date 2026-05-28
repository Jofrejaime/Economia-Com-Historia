<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QuizController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => DB::table('quizzes')->orderByDesc('created_at')->limit(20)->get()]);
    }

    public function store(): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.'], 501);
    }

    public function show(string $id): JsonResponse
    {
        return response()->json(['data' => DB::table('quizzes')->where('id', $id)->first()]);
    }

    public function update(string $id): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501);
    }

    public function destroy(string $id): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501);
    }

    public function questions(string $id): JsonResponse
    {
        return response()->json(['data' => DB::table('quiz_questions')->where('quiz_id', $id)->orderBy('question_order')->get()]);
    }

    public function startAttempt(string $id, Request $request): JsonResponse
    {
        $attemptId = (string) Str::uuid();

        DB::table('quiz_attempts')->insert([
            'id' => $attemptId,
            'quiz_id' => $id,
            'user_id' => $request->user()->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return response()->json(['message' => 'Attempt started.', 'id' => $attemptId], 201);
    }

    public function showAttempt(string $id): JsonResponse
    {
        return response()->json(['data' => DB::table('quiz_attempts')->where('id', $id)->first()]);
    }

    public function answerAttempt(string $id): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.', 'attempt_id' => $id], 501);
    }

    public function completeAttempt(string $id): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.', 'attempt_id' => $id], 501);
    }

    public function myAttempts(Request $request): JsonResponse
    {
        return response()->json(['data' => DB::table('quiz_attempts')->where('user_id', $request->user()->id)->orderByDesc('started_at')->limit(20)->get()]);
    }
}