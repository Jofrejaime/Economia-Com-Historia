<?php

namespace App\Services;

use App\Enums\QuizStatus;
use App\Exceptions\QuizNotFoundException;
use App\Exceptions\InvalidQuizTransitionException;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QuizService
{
    private const ALLOWED_TRANSITIONS = [
        'publish' => [
            QuizStatus::DRAFT,
            QuizStatus::REVIEW,
        ],
        'review' => [
            QuizStatus::DRAFT,
        ],
        'archive' => [
            QuizStatus::PUBLISHED,
        ],
    ];

    public function listAdminQuizzes(array $filters, int $perPage = 20)
    {
        $query = Quiz::with(['category', 'creator.profile'])
            ->withCount(['questions', 'documents', 'attempts'])
            ->withCount(['attempts as completed_attempts' => function ($q) {
                $q->where('status', 'completed');
            }]);

        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', $search)
                  ->orWhere('description', 'like', $search)
                  ->orWhere('module', 'like', $search);
            });
        }

        if (!empty($filters['status'])) {
            $statusVal = $filters['status'] instanceof QuizStatus ? $filters['status']->value : $filters['status'];
            $query->where('status', $statusVal);
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['created_by'])) {
            $query->where('created_by', $filters['created_by']);
        }

        if (!empty($filters['difficulty'])) {
            $query->where('difficulty', $filters['difficulty']);
        }

        if (isset($filters['featured'])) {
            $featured = filter_var($filters['featured'], FILTER_VALIDATE_BOOLEAN);
            $query->where('is_featured', $featured);
        }

        if (isset($filters['standalone'])) {
            $standalone = filter_var($filters['standalone'], FILTER_VALIDATE_BOOLEAN);
            if ($standalone) {
                $query->standalone();
            } else {
                $query->whereHas('documents');
            }
        }

        if (isset($filters['published_only'])) {
            $publishedOnly = filter_var($filters['published_only'], FILTER_VALIDATE_BOOLEAN);
            if ($publishedOnly) {
                $query->published();
            }
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        $sortColumn = $this->resolveSortColumn($filters['sort_by'] ?? 'created_at');
        $sortDir = strtolower($filters['sort_direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        
        $query->orderBy($sortColumn, $sortDir);

        return $query->paginate($perPage);
    }

    public function store(array $validated, User $creator): Quiz
    {
        $quizId = (string) Str::uuid();

        DB::transaction(function () use ($quizId, $validated, $creator) {
            $quizData = collect($validated)->except(['questions', 'documents'])->all();
            $quizData['id'] = $quizId;
            $quizData['created_by'] = $creator->id;
            $quizData['created_at'] = now();
            $quizData['updated_at'] = now();

            DB::table('quizzes')->insert($quizData);

            if (!empty($validated['questions'])) {
                foreach ($validated['questions'] as $qData) {
                    $qId = $qData['id'] ?? (string) Str::uuid();

                    DB::table('quiz_questions')->insert([
                        'id' => $qId,
                        'quiz_id' => $quizId,
                        'question_order' => $qData['question_order'],
                        'title' => $qData['title'],
                        'subtitle' => $qData['subtitle'] ?? null,
                        'module_label' => $qData['module_label'] ?? null,
                        'question_type' => $qData['question_type'] ?? 'multiple_choice',
                        'points' => $qData['points'] ?? 10,
                        'hint_title' => $qData['hint_title'] ?? null,
                        'hint_quote' => $qData['hint_quote'] ?? null,
                        'expert_name' => $qData['expert_name'] ?? null,
                        'expert_role' => $qData['expert_role'] ?? null,
                        'reading_title' => $qData['reading_title'] ?? null,
                        'reading_text' => $qData['reading_text'] ?? null,
                        'created_at' => now(),
                    ]);

                    foreach ($qData['options'] as $oData) {
                        $oId = $oData['id'] ?? (string) Str::uuid();

                        DB::table('quiz_options')->insert([
                            'id' => $oId,
                            'question_id' => $qId,
                            'option_key' => $oData['option_key'],
                            'text' => $oData['text'],
                            'is_correct' => (bool) $oData['is_correct'],
                            'explanation' => $oData['explanation'] ?? null,
                        ]);
                    }
                }
            }

            if (!empty($validated['documents'])) {
                app(QuizDocumentService::class)->attachDocuments($quizId, $validated['documents']);
            }
        });

        return Quiz::findOrFail($quizId);
    }

    public function update(Quiz $quiz, array $validated): Quiz
    {
        DB::transaction(function () use ($quiz, $validated) {
            $quizData = collect($validated)->except(['questions', 'documents'])->all();
            $quizData['updated_at'] = now();

            DB::table('quizzes')->where('id', $quiz->id)->update($quizData);

            if (array_key_exists('questions', $validated)) {
                $payloadQuestionIds = collect($validated['questions'])->pluck('id')->filter()->all();

                DB::table('quiz_questions')
                    ->where('quiz_id', $quiz->id)
                    ->whereNotIn('id', $payloadQuestionIds)
                    ->delete();

                foreach ($validated['questions'] as $qData) {
                    $qId = $qData['id'] ?? (string) Str::uuid();

                    $questionFields = [
                        'quiz_id' => $quiz->id,
                        'question_order' => $qData['question_order'],
                        'title' => $qData['title'],
                        'subtitle' => $qData['subtitle'] ?? null,
                        'module_label' => $qData['module_label'] ?? null,
                        'question_type' => $qData['question_type'] ?? 'multiple_choice',
                        'points' => $qData['points'] ?? 10,
                        'hint_title' => $qData['hint_title'] ?? null,
                        'hint_quote' => $qData['hint_quote'] ?? null,
                        'expert_name' => $qData['expert_name'] ?? null,
                        'expert_role' => $qData['expert_role'] ?? null,
                        'reading_title' => $qData['reading_title'] ?? null,
                        'reading_text' => $qData['reading_text'] ?? null,
                    ];

                    DB::table('quiz_questions')->updateOrInsert(['id' => $qId], $questionFields);

                    $payloadOptionIds = collect($qData['options'])->pluck('id')->filter()->all();

                    DB::table('quiz_options')
                        ->where('question_id', $qId)
                        ->whereNotIn('id', $payloadOptionIds)
                        ->delete();

                    foreach ($qData['options'] as $oData) {
                        $oId = $oData['id'] ?? (string) Str::uuid();

                        $optionFields = [
                            'question_id' => $qId,
                            'option_key' => $oData['option_key'],
                            'text' => $oData['text'],
                            'is_correct' => (bool) $oData['is_correct'],
                            'explanation' => $oData['explanation'] ?? null,
                        ];

                        DB::table('quiz_options')->updateOrInsert(['id' => $oId], $optionFields);
                    }
                }
            }

            if (array_key_exists('documents', $validated)) {
                app(QuizDocumentService::class)->syncDocuments($quiz->id, $validated['documents'] ?? []);
            }
        });

        return $quiz->refresh();
    }

    public function destroy(Quiz $quiz): void
    {
        $quiz->delete();
    }

    public function publish(Quiz $quiz, User $admin): void
    {
        $this->assertTransition($quiz->status, QuizStatus::PUBLISHED, 'publish');

        $quiz->update([
            'status' => QuizStatus::PUBLISHED,
            'published_at' => now(),
            'published_by' => $admin->id,
        ]);
    }

    public function review(Quiz $quiz, User $admin): void
    {
        $this->assertTransition($quiz->status, QuizStatus::REVIEW, 'review');

        $quiz->update([
            'status' => QuizStatus::REVIEW,
            'reviewed_by' => $admin->id,
        ]);
    }

    public function archive(Quiz $quiz, User $admin): void
    {
        $this->assertTransition($quiz->status, QuizStatus::ARCHIVED, 'archive');

        $quiz->update([
            'status' => QuizStatus::ARCHIVED,
            'archived_by' => $admin->id,
        ]);
    }

    public function getDashboardData(): array
    {
        $quizStats = DB::table('quizzes')
            ->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN status = "published" THEN 1 ELSE 0 END) as published,
                SUM(CASE WHEN status = "draft" THEN 1 ELSE 0 END) as draft,
                SUM(CASE WHEN status = "review" THEN 1 ELSE 0 END) as review,
                SUM(CASE WHEN status = "archived" THEN 1 ELSE 0 END) as archived,
                SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) as featured
            ')
            ->first();

        $standaloneCount = Quiz::standalone()->count();
        $withDocumentsCount = Quiz::whereHas('documents')->count();

        $attemptStats = DB::table('quiz_attempts')
            ->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed,
                AVG(CASE WHEN status = "completed" THEN score ELSE NULL END) as average_score
            ')
            ->first();

        $totalAttempts = (int) ($attemptStats->total ?? 0);
        $completedAttempts = (int) ($attemptStats->completed ?? 0);
        $completionRate = $totalAttempts > 0 ? round(($completedAttempts / $totalAttempts) * 100, 2) : 0.0;
        $averageScore = $attemptStats->average_score !== null ? round((float) $attemptStats->average_score, 2) : 0.0;

        $mostAttempted = Quiz::orderByDesc('attempts_count')
            ->limit(5)
            ->get();

        $highestScore = Quiz::where('attempts_count', '>', 0)
            ->orderByDesc('avg_score')
            ->limit(5)
            ->get();

        $lowestScore = Quiz::where('attempts_count', '>', 0)
            ->orderBy('avg_score')
            ->limit(5)
            ->get();

        return [
            'quizzes' => [
                'total'             => (int) ($quizStats->total ?? 0),
                'published'         => (int) ($quizStats->published ?? 0),
                'draft'             => (int) ($quizStats->draft ?? 0),
                'review'            => (int) ($quizStats->review ?? 0),
                'archived'          => (int) ($quizStats->archived ?? 0),
                'featured'          => (int) ($quizStats->featured ?? 0),
                'standalone'        => $standaloneCount,
                'with_documents'    => $withDocumentsCount,
                'without_documents' => $standaloneCount,
            ],
            'attempts' => [
                'total'           => $totalAttempts,
                'completed'       => $completedAttempts,
                'completion_rate' => $completionRate,
                'average_score'   => $averageScore,
            ],
            'most_attempted' => $mostAttempted,
            'highest_score'  => $highestScore,
            'lowest_score'   => $lowestScore,
        ];
    }

    private function resolveSortColumn(?string $sortBy): string
    {
        $allowed = [
            'title'          => 'title',
            'created_at'     => 'created_at',
            'published_at'   => 'published_at',
            'attempts_count' => 'attempts_count',
            'avg_score'      => 'avg_score',
            'difficulty'     => 'difficulty',
        ];

        return $allowed[$sortBy] ?? 'created_at';
    }

    private function assertTransition(QuizStatus $current, QuizStatus $target, string $action): void
    {
        $allowed = self::ALLOWED_TRANSITIONS[$action] ?? [];

        if (!in_value($current, $allowed)) {
            throw new InvalidQuizTransitionException($current, $target);
        }
    }
}

if (!function_exists('App\Services\in_value')) {
    function in_value(QuizStatus $status, array $allowed): bool {
        foreach ($allowed as $item) {
            if ($item === $status || $item->value === $status->value) {
                return true;
            }
        }
        return false;
    }
}
