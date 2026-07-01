<?php

namespace App\Services;

use App\Enums\QuizAttemptStatus;
use App\Models\Quiz;
use App\Models\QuizAttempt;
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
        $quiz = Quiz::find($quizId);
        if ($quiz === null) {
            abort(404, 'Quiz not found.');
        }

        if (!$this->accessGate->canAccess($user, $quiz->access_level_id) && $quiz->created_by !== $user->id) {
            abort(403, 'Access denied.');
        }

        if (!$quiz->isPublished() && $user->role !== 'admin' && $quiz->created_by !== $user->id) {
            abort(403, 'Quiz is not published.');
        }

        $activeAttempt = QuizAttempt::where('quiz_id', $quizId)
            ->where('user_id', $user->id)
            ->where('status', QuizAttemptStatus::IN_PROGRESS)
            ->first();

        if ($activeAttempt !== null) {
            return $activeAttempt->id;
        }

        $attemptId = (string) Str::uuid();

        DB::transaction(function () use ($attemptId, $quiz, $user) {
            $attempt = new QuizAttempt();
            $attempt->id = $attemptId;
            $attempt->quiz_id = $quiz->id;
            $attempt->user_id = $user->id;
            $attempt->status = QuizAttemptStatus::IN_PROGRESS;
            $attempt->started_at = now();
            $attempt->save();

            $quiz->increment('attempts_count');
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
        $attempt = QuizAttempt::find($attemptId);

        if ($attempt === null || $attempt->user_id !== $user->id) {
            abort(404, 'Attempt not found.');
        }

        if (!$attempt->isInProgress()) {
            abort(409, 'Attempt is not in progress.');
        }

        $quiz = Quiz::find($attempt->quiz_id);
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
            'is_correct'         => $isCorrect,
            'time_spent_secs'    => $timeSpentSecs,
            'answered_at'        => now(),
        ];

        if ($existing !== null) {
            DB::table('quiz_attempt_answers')->where('id', $existing->id)->update($payload);
        } else {
            DB::table('quiz_attempt_answers')->insert(array_merge($payload, [
                'id'          => (string) Str::uuid(),
                'attempt_id'  => $attemptId,
                'question_id' => $question->id,
            ]));
        }

        return [
            'is_correct'  => $isCorrect,
            'explanation' => $option->explanation ?? null,
        ];
    }

    public function completeAttempt(string $attemptId, ?int $timeSpentSecs, User $user): array
    {
        return DB::transaction(function () use ($attemptId, $timeSpentSecs, $user) {
            $attempt = QuizAttempt::find($attemptId);

            $this->validateAttempt($attempt, $user);

            $quiz = Quiz::find($attempt->quiz_id);
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

            $score = $this->calculateScore($correctAnswers, $totalQuestions);

            $attempt->update([
                'status'             => QuizAttemptStatus::COMPLETED,
                'score'              => $score,
                'correct_answers'    => $correctAnswers,
                'total_questions'    => $totalQuestions,
                'time_spent_secs'    => $timeSpent,
                'completed_at'       => now(),
                'performance_rating' => $this->performanceRating($score),
            ]);

            $this->updateStatistics($quiz, $attempt);

            $gamificationResult = $this->gamification->recordQuizCompletion($user, $attempt);

            $attempt->refresh();

            return [
                'attempt'      => $attempt,
                'gamification' => $gamificationResult,
            ];
        });
    }

    private function validateAttempt(?QuizAttempt $attempt, User $user): void
    {
        if ($attempt === null || $attempt->user_id !== $user->id) {
            abort(404, 'Attempt not found.');
        }

        if (!$attempt->isInProgress()) {
            abort(409, 'Attempt is not in progress.');
        }
    }

    private function calculateScore(int $correctAnswers, int $totalQuestions): int
    {
        return $totalQuestions > 0
            ? (int) round(($correctAnswers / $totalQuestions) * 100)
            : 0;
    }

    private function updateStatistics(Quiz $quiz, QuizAttempt $attempt): void
    {
        // Increment completions_count
        $quiz->increment('completions_count');

        // Calculate and update avg_score
        $avgScore = QuizAttempt::where('quiz_id', $attempt->quiz_id)
            ->completed()
            ->avg('score');

        $quiz->update([
            'avg_score' => $avgScore ?? 0.00
        ]);
    }

    private function performanceRating(int $scorePercent): string
    {
        return match (true) {
            $scorePercent >= 90 => 'excellent',
            $scorePercent >= 70 => 'good',
            $scorePercent >= 50 => 'fair',
            default             => 'needs_improvement',
        };
    }
}
