<?php

namespace App\Services;

use App\Enums\QuizAttemptStatus;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Collection;

class QuizAttemptService
{
    public function __construct(
        private readonly GamificationService $gamification,
    ) {}

    // ──────────────────────────────────────────────
    // Operações do Utilizador (Existentes)
    // ──────────────────────────────────────────────

    public function startAttempt(string $quizId, User $user): string
    {
        $quiz = Quiz::find($quizId);
        if ($quiz === null) {
            abort(404, 'Quiz not found.');
        }

        if (!$quiz->isPublished() && $user->role !== 'admin' && $quiz->created_by !== $user->id) {
            abort(403, 'Quiz is not published.');
        }

        $activeAttempt = QuizAttempt::where('quiz_id', $quizId)
            ->where('user_id', $user->id)
            ->inProgress()
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
        $quiz->increment('completions_count');

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

    // ──────────────────────────────────────────────
    // Métodos Administrativos / Leitura (Novos)
    // ──────────────────────────────────────────────

    public function list(array $filters = []): array
    {
        $query = QuizAttempt::query()->with(['user.profile', 'quiz']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('user.profile', function ($uq) use ($search) {
                    $uq->where('display_name', 'like', '%' . $search . '%')
                       ->orWhere('full_name', 'like', '%' . $search . '%');
                })->orWhereHas('quiz', function ($qq) use ($search) {
                    $qq->where('title', 'like', '%' . $search . '%');
                });
            });
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['quiz_id'])) {
            $query->where('quiz_id', $filters['quiz_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['min_score'])) {
            $query->where('score', '>=', (int) $filters['min_score']);
        }

        if (isset($filters['max_score'])) {
            $query->where('score', '<=', (int) $filters['max_score']);
        }

        $query->orderByDesc('started_at');

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);
        $paginated = $query->paginate($perPage);

        return [
            'data' => collect($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ]
        ];
    }

    public function find(string $id): ?QuizAttempt
    {
        $attempt = QuizAttempt::with(['user.profile', 'quiz'])->find($id);
        if ($attempt !== null) {
            // Load responses
            $answers = DB::table('quiz_attempt_answers as qaa')
                ->join('quiz_questions as qq', 'qq.id', '=', 'qaa.question_id')
                ->leftJoin('quiz_options as qo', 'qo.id', '=', 'qaa.selected_option_id')
                ->where('qaa.attempt_id', $id)
                ->select([
                    'qaa.id',
                    'qaa.question_id',
                    'qq.title as question_title',
                    'qaa.selected_option_id',
                    'qo.text as option_text',
                    'qo.option_key',
                    'qaa.is_correct',
                    'qo.explanation',
                    'qaa.time_spent_secs',
                ])
                ->get();
            $attempt->answers = $answers;
        }
        return $attempt;
    }

    public function userAttempts(string $userId): Collection
    {
        return QuizAttempt::where('user_id', $userId)
            ->with('quiz')
            ->orderByDesc('started_at')
            ->get();
    }

    public function quizAttempts(string $quizId): Collection
    {
        return QuizAttempt::where('quiz_id', $quizId)
            ->with('user.profile')
            ->orderByDesc('started_at')
            ->get();
    }

    public function statistics(): array
    {
        $total = QuizAttempt::count();
        $completed = QuizAttempt::completed()->count();
        $inProgress = QuizAttempt::inProgress()->count();

        $avgScore = QuizAttempt::completed()->avg('score') ?? 0;
        $successRate = $completed > 0
            ? (QuizAttempt::completed()->where('score', '>=', 50)->count() / $completed) * 100
            : 0;

        return [
            'total'           => $total,
            'completed'       => $completed,
            'in_progress'     => $inProgress,
            'avg_score'       => round($avgScore, 2),
            'success_rate'    => round($successRate, 2),
        ];
    }
}
