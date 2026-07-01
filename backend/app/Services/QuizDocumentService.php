<?php

namespace App\Services;

use App\Enums\DocumentStatus;
use App\Models\Document;
use App\Models\Quiz;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class QuizDocumentService
{
    private const DOCUMENT_SORT_MAP = [
        'sort_order'   => 'quiz_documents.sort_order',
        'title'        => 'documents.title',
        'published_at' => 'documents.published_at',
    ];

    private const QUIZ_SORT_MAP = [
        'sort_order'   => 'quiz_documents.sort_order',
        'title'        => 'quizzes.title',
        'difficulty'   => 'quizzes.difficulty',
        'published_at' => 'quizzes.published_at',
    ];

    // ─── Manipulação ──────────────────────────────────────────────────────────

    public function attachDocuments(string $quizId, array $documentIds): void
    {
        $quiz = Quiz::findOrFail($quizId);
        $pivotData = [];
        foreach ($documentIds as $sort => $docId) {
            $pivotData[$docId] = ['sort_order' => $sort];
        }
        $quiz->documents()->attach($pivotData);
    }

    public function syncDocuments(string $quizId, array $documentIds): void
    {
        $quiz = Quiz::findOrFail($quizId);
        $pivotData = [];
        foreach ($documentIds as $sort => $docId) {
            $pivotData[$docId] = ['sort_order' => $sort];
        }
        DB::transaction(fn () => $quiz->documents()->sync($pivotData));
    }

    public function detachDocument(string $quizId, string $documentId): bool
    {
        $quiz = Quiz::findOrFail($quizId);
        return $quiz->documents()->detach($documentId) > 0;
    }

    // ─── Leitura ──────────────────────────────────────────────────────────────

    public function documentsOfQuiz(string $quizId, array $options = []): array
    {
        $quiz = Quiz::find($quizId);
        if ($quiz === null) {
            return ['data' => collect(), 'meta' => $this->emptyMeta($options)];
        }

        ['page' => $page, 'perPage' => $perPage, 'dir' => $dir] = $this->paginationOptions($options);
        $column = self::DOCUMENT_SORT_MAP[$options['sort_by'] ?? ''] ?? 'quiz_documents.sort_order';

        $paginator = $quiz->documents()
            ->with('category')
            ->where('documents.status', DocumentStatus::PUBLISHED->value)
            ->orderBy($column, $dir)
            ->paginate($perPage, ['documents.*'], 'page', $page);

        return ['data' => $paginator->getCollection(), 'meta' => $this->meta($paginator)];
    }

    public function quizzesOfDocument(string $documentId, array $options = []): array
    {
        $document = Document::find($documentId);
        if ($document === null) {
            return ['data' => collect(), 'meta' => $this->emptyMeta($options)];
        }

        ['page' => $page, 'perPage' => $perPage, 'dir' => $dir] = $this->paginationOptions($options);
        $column = self::QUIZ_SORT_MAP[$options['sort_by'] ?? ''] ?? 'quiz_documents.sort_order';

        $paginator = $document->quizzes()
            ->published()
            ->orderBy($column, $dir)
            ->paginate($perPage, ['quizzes.*'], 'page', $page);

        return ['data' => $paginator->getCollection(), 'meta' => $this->meta($paginator)];
    }

    public function availableQuizzesForDocument(string $documentId, array $options = []): array
    {
        return $this->quizzesOfDocument($documentId, $options);
    }

    public function hasDocuments(string $quizId): bool
    {
        $quiz = Quiz::find($quizId);
        return $quiz !== null && $quiz->documents()->exists();
    }

    public function countDocuments(string $quizId): int
    {
        $quiz = Quiz::find($quizId);
        return $quiz ? $quiz->documents()->count() : 0;
    }

    // ─── Helpers privados ─────────────────────────────────────────────────────

    private function paginationOptions(array $options): array
    {
        return [
            'page'    => max(1, (int) ($options['page'] ?? 1)),
            'perPage' => min(max(1, (int) ($options['per_page'] ?? 15)), 100),
            'dir'     => strtolower($options['sort_direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc',
        ];
    }

    private function meta(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page'    => $paginator->lastPage(),
            'per_page'     => $paginator->perPage(),
            'total'        => $paginator->total(),
        ];
    }

    private function emptyMeta(array $options): array
    {
        return [
            'current_page' => 1,
            'last_page'    => 1,
            'per_page'     => min(max(1, (int) ($options['per_page'] ?? 15)), 100),
            'total'        => 0,
        ];
    }
}
