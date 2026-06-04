<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QuizController extends Controller
{
    public function __construct(
        private readonly GamificationService $gamification,
    ) {}

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

    public function showAttempt(string $id, Request $request): JsonResponse
    {
        $attempt = DB::table('quiz_attempts')->where('id', $id)->first();

        if ($attempt === null || $attempt->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Attempt not found.'], 404);
        }

        return response()->json(['data' => $attempt]);
    }

    public function answerAttempt(string $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question_id' => ['required', 'uuid', 'exists:quiz_questions,id'],
            'selected_option_id' => ['required', 'uuid', 'exists:quiz_options,id'],
            'time_spent_secs' => ['nullable', 'integer', 'min:0'],
        ]);

        $attempt = DB::table('quiz_attempts')->where('id', $id)->first();

        if ($attempt === null || $attempt->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Attempt not found.'], 404);
        }

        if ($attempt->status !== 'in_progress') {
            return response()->json(['message' => 'Attempt is not in progress.'], 409);
        }

        $question = DB::table('quiz_questions')
            ->where('id', $validated['question_id'])
            ->where('quiz_id', $attempt->quiz_id)
            ->first();

        if ($question === null) {
            return response()->json(['message' => 'Question does not belong to this quiz.'], 422);
        }

        $option = DB::table('quiz_options')
            ->where('id', $validated['selected_option_id'])
            ->where('question_id', $question->id)
            ->first();

        if ($option === null) {
            return response()->json(['message' => 'Option does not belong to this question.'], 422);
        }

        $isCorrect = (bool) $option->is_correct;
        $existing = DB::table('quiz_attempt_answers')
            ->where('attempt_id', $id)
            ->where('question_id', $question->id)
            ->first();

        $payload = [
            'selected_option_id' => $option->id,
            'is_correct' => $isCorrect,
            'time_spent_secs' => $validated['time_spent_secs'] ?? null,
            'answered_at' => now(),
        ];

        if ($existing !== null) {
            DB::table('quiz_attempt_answers')->where('id', $existing->id)->update($payload);
        } else {
            DB::table('quiz_attempt_answers')->insert(array_merge($payload, [
                'id' => (string) Str::uuid(),
                'attempt_id' => $id,
                'question_id' => $question->id,
            ]));
        }

        return response()->json([
            'message' => 'Answer recorded.',
            'is_correct' => $isCorrect,
        ]);
    }

    public function completeAttempt(string $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'time_spent_secs' => ['nullable', 'integer', 'min:0'],
        ]);

        $attempt = DB::table('quiz_attempts')->where('id', $id)->first();

        if ($attempt === null || $attempt->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Attempt not found.'], 404);
        }

        if ($attempt->status !== 'in_progress') {
            return response()->json(['message' => 'Attempt is not in progress.'], 409);
        }

        $totalQuestions = (int) DB::table('quiz_questions')
            ->where('quiz_id', $attempt->quiz_id)
            ->count();

        $answers = DB::table('quiz_attempt_answers')->where('attempt_id', $id)->get();
        $correctAnswers = $answers->where('is_correct', true)->count();

        $timeSpent = $validated['time_spent_secs']
            ?? (int) $answers->sum(fn ($answer) => (int) ($answer->time_spent_secs ?? 0));

        $score = $totalQuestions > 0
            ? (int) round(($correctAnswers / $totalQuestions) * 100)
            : 0;

        DB::table('quiz_attempts')->where('id', $id)->update([
            'status' => 'completed',
            'score' => $score,
            'correct_answers' => $correctAnswers,
            'total_questions' => $totalQuestions,
            'time_spent_secs' => $timeSpent,
            'completed_at' => now(),
            'performance_rating' => $this->performanceRating($score),
        ]);

        $gamification = $this->gamification->recordQuizCompletion(
            $request->user(),
            $id,
            $attempt->quiz_id,
            $correctAnswers,
            $totalQuestions,
            $timeSpent,
        );

        $attempt = DB::table('quiz_attempts')->where('id', $id)->first();

        return response()->json([
            'message' => 'Attempt completed.',
            'data' => $attempt,
            'gamification' => $gamification->toArray(),
        ]);
    }

    public function myAttempts(Request $request): JsonResponse
    {
        return response()->json(['data' => DB::table('quiz_attempts')->where('user_id', $request->user()->id)->orderByDesc('started_at')->limit(20)->get()]);
    }

    private function performanceRating(int $scorePercent): string
    {
        return match (true) {
            $scorePercent >= 90 => 'excellent',
            $scorePercent >= 70 => 'good',
            $scorePercent >= 50 => 'fair',
            default => 'needs_improvement',
        };
    }
}
