<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QuizAttemptService
{
    public function __construct(
        private readonly AccessGateService $accessGate,
        private readonly GamificationService $gamification,
    ) {}

    public function startAttempt(string $quizId, User $user): string
    {
        $quiz = DB::table('quizzes')->where('id', $quizId)->first();
        if ($quiz === null) {
            abort(404, 'Quiz not found.');
        }

        if (!$this->accessGate->canAccess($user, $quiz->access_level_id) && $quiz->created_by !== $user->id) {
            abort(403, 'Access denied.');
        }

        if ($quiz->status !== 'published' && $user->role !== 'admin' && $quiz->created_by !== $user->id) {
            abort(403, 'Quiz is not published.');
        }

        $activeAttempt = DB::table('quiz_attempts')
            ->where('quiz_id', $quizId)
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->first();

        if ($activeAttempt !== null) {
            return $activeAttempt->id;
        }

        $attemptId = (string) Str::uuid();

        DB::transaction(function () use ($attemptId, $quizId, $user) {
            DB::table('quiz_attempts')->insert([
                'id' => $attemptId,
                'quiz_id' => $quizId,
                'user_id' => $user->id,
                'status' => 'in_progress',
                'started_at' => now(),
            ]);

            DB::table('quizzes')->where('id', $quizId)->increment('attempts_count');
        });

        return $attemptId;
    }

    public function answerAttempt(
        string $attemptId,
        string $questionId,
        string $selectedOptionId,
        ?int $timeSpentSecs,
        User $user
    ): array {
        $attempt = DB::table('quiz_attempts')->where('id', $attemptId)->first();

        if ($attempt === null || $attempt->user_id !== $user->id) {
            abort(404, 'Attempt not found.');
        }

        if ($attempt->status !== 'in_progress') {
            abort(409, 'Attempt is not in progress.');
        }

        $quiz = DB::table('quizzes')->where('id', $attempt->quiz_id)->first();
        if ($quiz === null) {
            abort(404, 'Quiz not found.');
        }

        if (!$this->accessGate->canAccess($user, $quiz->access_level_id) && $quiz->created_by !== $user->id) {
            abort(403, 'Access denied.');
        }

        $question = DB::table('quiz_questions')
            ->where('id', $questionId)
            ->where('quiz_id', $attempt->quiz_id)
            ->first();

        if ($question === null) {
            abort(422, 'Question does not belong to this quiz.');
        }

        $option = DB::table('quiz_options')
            ->where('id', $selectedOptionId)
            ->where('question_id', $question->id)
            ->first();

        if ($option === null) {
            abort(422, 'Option does not belong to this question.');
        }

        $isCorrect = (bool) $option->is_correct;
        $existing = DB::table('quiz_attempt_answers')
            ->where('attempt_id', $attemptId)
            ->where('question_id', $question->id)
            ->first();

        $payload = [
            'selected_option_id' => $option->id,
            'is_correct' => $isCorrect,
            'time_spent_secs' => $timeSpentSecs,
            'answered_at' => now(),
        ];

        if ($existing !== null) {
            DB::table('quiz_attempt_answers')->where('id', $existing->id)->update($payload);
        } else {
            DB::table('quiz_attempt_answers')->insert(array_merge($payload, [
                'id' => (string) Str::uuid(),
                'attempt_id' => $attemptId,
                'question_id' => $question->id,
            ]));
        }

        return [
            'is_correct' => $isCorrect,
            'explanation' => $option->explanation ?? null,
        ];
    }

    public function completeAttempt(string $attemptId, ?int $timeSpentSecs, User $user): array
    {
        return DB::transaction(function () use ($attemptId, $timeSpentSecs, $user) {
            $attempt = DB::table('quiz_attempts')->where('id', $attemptId)->first();

            if ($attempt === null || $attempt->user_id !== $user->id) {
                abort(404, 'Attempt not found.');
            }

            if ($attempt->status !== 'in_progress') {
                abort(409, 'Attempt is not in progress.');
            }

            $quiz = DB::table('quizzes')->where('id', $attempt->quiz_id)->first();
            if ($quiz === null) {
                abort(404, 'Quiz not found.');
            }

            if (!$this->accessGate->canAccess($user, $quiz->access_level_id) && $quiz->created_by !== $user->id) {
                abort(403, 'Access denied.');
            }

            $totalQuestions = (int) DB::table('quiz_questions')
                ->where('quiz_id', $attempt->quiz_id)
                ->count();

            $answers = DB::table('quiz_attempt_answers')->where('attempt_id', $attemptId)->get();
            $correctAnswers = $answers->where('is_correct', true)->count();

            $timeSpent = $timeSpentSecs
                ?? (int) $answers->sum(fn ($answer) => (int) ($answer->time_spent_secs ?? 0));

            $score = $totalQuestions > 0
                ? (int) round(($correctAnswers / $totalQuestions) * 100)
                : 0;

            DB::table('quiz_attempts')->where('id', $attemptId)->update([
                'status' => 'completed',
                'score' => $score,
                'correct_answers' => $correctAnswers,
                'total_questions' => $totalQuestions,
                'time_spent_secs' => $timeSpent,
                'completed_at' => now(),
                'performance_rating' => $this->performanceRating($score),
            ]);

            // Increment completions_count
            DB::table('quizzes')->where('id', $attempt->quiz_id)->increment('completions_count');

            // Calculate and update avg_score
            $avgScore = DB::table('quiz_attempts')
                ->where('quiz_id', $attempt->quiz_id)
                ->where('status', 'completed')
                ->avg('score');

            DB::table('quizzes')->where('id', $attempt->quiz_id)->update([
                'avg_score' => $avgScore ?? 0.00
            ]);

            $gamificationResult = $this->gamification->recordQuizCompletion(
                $user,
                $attemptId,
                $attempt->quiz_id,
                $correctAnswers,
                $totalQuestions,
                $timeSpent
            );

            $updatedAttempt = DB::table('quiz_attempts')->where('id', $attemptId)->first();

            return [
                'attempt' => $updatedAttempt,
                'gamification' => $gamificationResult,
            ];
        });
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
