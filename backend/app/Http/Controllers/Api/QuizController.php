<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Services\AccessGateService;
use App\Services\GamificationService;
use App\Services\QuizAttemptService;
use App\Services\QuizDocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QuizController extends Controller
{
    public function __construct(
        private readonly GamificationService  $gamification,
        private readonly AccessGateService    $accessGate,
        private readonly QuizAttemptService   $attemptService,
        private readonly QuizDocumentService  $quizDocuments,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) ($request->input('per_page', 20)), 50);
        $page = max((int) ($request->input('page', 1)), 1);

        $query = Quiz::published()->getQuery();
        $this->accessGate->applyDocumentVisibilityFilter($query, $request->user(), 'quizzes');

        if ($request->filled('difficulty')) {
            $query->where('difficulty', $request->input('difficulty'));
        }

        $query->orderByDesc('created_at');

        $total = (clone $query)->count();
        $items = $query->forPage($page, $perPage)->get();

        $categoryIds = $items->pluck('category_id')->filter()->unique()->values();
        $categories = $categoryIds->isNotEmpty()
            ? DB::table('document_categories')->whereIn('id', $categoryIds)->get()->keyBy('id')
            : collect();

        $data = $items->map(function ($quiz) use ($categories) {
            $quiz->category = $quiz->category_id ? $categories->get($quiz->category_id) : null;
            return $quiz;
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $page,
                'last_page' => max(1, (int) ceil($total / $perPage)),
                'per_page' => $perPage,
                'total' => $total,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'module' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'cover_image_url' => ['nullable', 'string', 'url', 'max:500'],
            'difficulty' => ['nullable', 'string', 'in:Básico,Intermédio,Avançado'],
            'base_points' => ['nullable', 'integer', 'min:0'],
            'time_limit_secs' => ['nullable', 'integer', 'min:0'],
            'access_level_id' => ['nullable', 'string', 'exists:access_levels,id'],
            'is_featured' => ['nullable', 'boolean'],
            'status' => ['nullable', \Illuminate\Validation\Rule::enum(\App\Enums\QuizStatus::class)],
            'category_id' => ['nullable', 'uuid', 'exists:document_categories,id'],
            'questions' => ['nullable', 'array'],
            'questions.*.id' => ['nullable', 'uuid'],
            'questions.*.question_order' => ['required', 'integer'],
            'questions.*.title' => ['required', 'string'],
            'questions.*.subtitle' => ['nullable', 'string'],
            'questions.*.module_label' => ['nullable', 'string'],
            'questions.*.question_type' => ['nullable', 'string', 'in:multiple_choice'],
            'questions.*.points' => ['nullable', 'integer', 'min:0'],
            'questions.*.hint_title' => ['nullable', 'string'],
            'questions.*.hint_quote' => ['nullable', 'string'],
            'questions.*.expert_name' => ['nullable', 'string'],
            'questions.*.expert_role' => ['nullable', 'string'],
            'questions.*.reading_title' => ['nullable', 'string'],
            'questions.*.reading_text' => ['nullable', 'string'],
            'questions.*.options' => ['required_with:questions', 'array', 'min:2'],
            'questions.*.options.*.id' => ['nullable', 'uuid'],
            'questions.*.options.*.option_key' => ['required', 'string', 'size:1'],
            'questions.*.options.*.text' => ['required', 'string'],
            'questions.*.options.*.is_correct' => ['required', 'boolean'],
            'questions.*.options.*.explanation' => ['nullable', 'string'],
            'documents'   => ['nullable', 'array'],
            'documents.*' => ['nullable', 'uuid', 'exists:documents,id'],
        ]);

        $quizId = (string) Str::uuid();

        DB::transaction(function () use ($quizId, $validated, $request) {
            $quizData = collect($validated)->except(['questions', 'documents'])->all();
            $quizData['id'] = $quizId;
            $quizData['created_by'] = $request->user()->id;
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
                $this->quizDocuments->attachDocuments($quizId, $validated['documents']);
            }
        });

        $createdQuiz = DB::table('quizzes')->where('id', $quizId)->first();
        return response()->json([
            'message' => 'Quiz created successfully.',
            'data' => $createdQuiz,
        ], 201);
    }

    public function show(string $id, Request $request): JsonResponse
{
    $quiz = DB::table('quizzes')->where('id', $id)->first();
    if ($quiz === null) {
        abort(404, 'Quiz not found.');
    }
    $this->checkQuizAccess($quiz, $request->user());
    return response()->json(['data' => $quiz]);
}

    public function update(string $id, Request $request): JsonResponse
    {
        $quiz = DB::table('quizzes')->where('id', $id)->first();
        if ($quiz === null) {
            abort(404, 'Quiz not found.');
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'module' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'cover_image_url' => ['nullable', 'string', 'url', 'max:500'],
            'difficulty' => ['nullable', 'string', 'in:Básico,Intermédio,Avançado'],
            'base_points' => ['nullable', 'integer', 'min:0'],
            'time_limit_secs' => ['nullable', 'integer', 'min:0'],
            'access_level_id' => ['nullable', 'string', 'exists:access_levels,id'],
            'is_featured' => ['nullable', 'boolean'],
            'status' => ['nullable', \Illuminate\Validation\Rule::enum(\App\Enums\QuizStatus::class)],
            'category_id' => ['nullable', 'uuid', 'exists:document_categories,id'],
            'questions' => ['nullable', 'array'],
            'questions.*.id' => ['nullable', 'uuid'],
            'questions.*.question_order' => ['required', 'integer'],
            'questions.*.title' => ['required', 'string'],
            'questions.*.subtitle' => ['nullable', 'string'],
            'questions.*.module_label' => ['nullable', 'string'],
            'questions.*.question_type' => ['nullable', 'string', 'in:multiple_choice'],
            'questions.*.points' => ['nullable', 'integer', 'min:0'],
            'questions.*.hint_title' => ['nullable', 'string'],
            'questions.*.hint_quote' => ['nullable', 'string'],
            'questions.*.expert_name' => ['nullable', 'string'],
            'questions.*.expert_role' => ['nullable', 'string'],
            'questions.*.reading_title' => ['nullable', 'string'],
            'questions.*.reading_text' => ['nullable', 'string'],
            'questions.*.options' => ['required_with:questions', 'array', 'min:2'],
            'questions.*.options.*.id' => ['nullable', 'uuid'],
            'questions.*.options.*.option_key' => ['required', 'string', 'size:1'],
            'questions.*.options.*.text' => ['required', 'string'],
            'questions.*.options.*.is_correct' => ['required', 'boolean'],
            'questions.*.options.*.explanation' => ['nullable', 'string'],
            'documents'   => ['nullable', 'array'],
            'documents.*' => ['nullable', 'uuid', 'exists:documents,id'],
        ]);

        DB::transaction(function () use ($id, $validated) {
            $quizData = collect($validated)->except(['questions', 'documents'])->all();
            $quizData['updated_at'] = now();

            DB::table('quizzes')->where('id', $id)->update($quizData);

            if (array_key_exists('questions', $validated)) {
                $payloadQuestionIds = collect($validated['questions'])->pluck('id')->filter()->all();

                DB::table('quiz_questions')
                    ->where('quiz_id', $id)
                    ->whereNotIn('id', $payloadQuestionIds)
                    ->delete();

                foreach ($validated['questions'] as $qData) {
                    $qId = $qData['id'] ?? (string) Str::uuid();

                    $questionFields = [
                        'quiz_id' => $id,
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
                $this->quizDocuments->syncDocuments($id, $validated['documents'] ?? []);
            }
        });

        $updatedQuiz = DB::table('quizzes')->where('id', $id)->first();
        return response()->json([
            'message' => 'Quiz updated successfully.',
            'data' => $updatedQuiz,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $quiz = Quiz::find($id);
        if ($quiz === null) {
            abort(404, 'Quiz not found.');
        }

        $quiz->delete();

        return response()->json(['message' => 'Quiz deleted successfully.']);
    }

    /**
     * Retorna as perguntas de um quiz.
     * Para utilizadores normais, oculta is_correct/explanation (evita fuga de respostas).
     * Para admins, expõe tudo — necessário para o formulário de edição.
     */
    public function questions(string $id, Request $request): JsonResponse
{
    $quiz = DB::table('quizzes')->where('id', $id)->first();
    if ($quiz === null) {
        abort(404, 'Quiz not found.');
    }
    $this->checkQuizAccess($quiz, $request->user());

    $isAdmin = $request->user() !== null && $request->user()->role === 'admin';

    $questions = DB::table('quiz_questions')
        ->where('quiz_id', $id)
        ->orderBy('question_order')
        ->get();

    $options = DB::table('quiz_options')
        ->whereIn('question_id', $questions->pluck('id'))
        ->get();

    $data = $questions->map(function ($q) use ($options, $isAdmin) {
        $qOptions = $options->where('question_id', $q->id)->map(function ($o) use ($isAdmin) {
            $option = [
                'id' => $o->id,
                'option_text' => $o->text,
                'option_key' => $o->option_key,
            ];

            if ($isAdmin) {
                $option['is_correct'] = (bool) $o->is_correct;
                $option['explanation'] = $o->explanation;
            }

            return $option;
        })->values()->all();

        return [
            'id' => $q->id,
            'quiz_id' => $q->quiz_id,
            'question_order' => $q->question_order,
            'question' => $q->title,
            'title' => $q->title,
            'subtitle' => $q->subtitle,
            'module_label' => $q->module_label,
            'question_type' => $q->question_type,
            'points' => $q->points,
            'hint_title' => $q->hint_title,
            'hint_quote' => $q->hint_quote,
            'expert_name' => $q->expert_name,
            'expert_role' => $q->expert_role,
            'reading_title' => $q->reading_title,
            'reading_text' => $q->reading_text,
            'options' => $qOptions,
        ];
    });

    return response()->json(['data' => $data]);
}

    public function startAttempt(string $id, Request $request): JsonResponse
    {
        $attemptId = $this->attemptService->startAttempt($id, $request->user());
        return response()->json(['message' => 'Attempt started.', 'id' => $attemptId], 201);
    }

    public function showAttempt(string $id, Request $request): JsonResponse
    {
        $attempt = QuizAttempt::find($id);

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

        $result = $this->attemptService->answerAttempt(
            $id,
            $validated['question_id'],
            $validated['selected_option_id'],
            $validated['time_spent_secs'] ?? null,
            $request->user()
        );

        return response()->json([
            'message' => 'Answer recorded.',
            'is_correct' => $result['is_correct'],
            'explanation' => $result['explanation'] ?? null,
        ]);
    }

    public function completeAttempt(string $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'time_spent_secs' => ['nullable', 'integer', 'min:0'],
        ]);

        $result = $this->attemptService->completeAttempt(
            $id,
            $validated['time_spent_secs'] ?? null,
            $request->user()
        );

        return response()->json([
            'message' => 'Attempt completed.',
            'data' => $result['attempt'],
            'gamification' => $result['gamification']->toArray(),
        ]);
    }

    public function relatedDocuments(string $id, Request $request): JsonResponse
    {
        $quiz = DB::table('quizzes')->where('id', $id)->first();
        if ($quiz === null) {
            abort(404, 'Quiz not found.');
        }

        $result = $this->quizDocuments->documentsOfQuiz($id, [
            'page'           => $request->input('page', 1),
            'per_page'       => $request->input('per_page', 15),
            'sort_by'        => $request->input('sort_by'),
            'sort_direction' => $request->input('sort_direction'),
        ]);

        return response()->json([
            'data' => $result['data']->map(fn (Document $doc) => [
                'id'              => $doc->id,
                'title'           => $doc->title,
                'author'          => $doc->author,
                'summary'         => $doc->summary,
                'document_type'   => $doc->document_type,
                'academic_level'  => $doc->academic_level,
                'access_level_id' => $doc->access_level_id,
                'cover_image_url' => $doc->cover_image_url,
                'views_count'     => (int) ($doc->views_count ?? 0),
                'likes_count'     => (int) ($doc->likes_count ?? 0),
                'published_at'    => $doc->published_at,
                'created_at'      => $doc->created_at,
                'category_name'   => $doc->category?->name,
                'category'        => $doc->category ? ['name' => $doc->category->name] : null,
                'sort_order'      => $doc->pivot?->sort_order ?? 0,
            ]),
            'meta' => $result['meta'],
        ]);
    }

    public function myAttempts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status'   => ['sometimes', 'in:in_progress,completed'],
            'page'     => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 20);
        $page    = (int) ($validated['page'] ?? 1);

        $query = QuizAttempt::where('user_id', $request->user()->id);

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        $total = (clone $query)->count();
        $items = $query->orderByDesc('started_at')
            ->forPage($page, $perPage)
            ->get();

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $page,
                'per_page'     => $perPage,
                'total'        => $total,
                'last_page'    => $total > 0 ? (int) ceil($total / $perPage) : 1,
            ],
        ]);
    }

    public function syncDocuments(string $id, Request $request): JsonResponse
    {
        $quiz = DB::table('quizzes')->where('id', $id)->first();
        if ($quiz === null) {
            abort(404, 'Quiz not found.');
        }

        $validated = $request->validate([
            'documents'   => ['present', 'array'],
            'documents.*' => ['uuid', 'exists:documents,id'],
        ]);

        $this->quizDocuments->syncDocuments($id, $validated['documents']);

        return response()->json([
            'message' => 'Documents synced successfully.',
            'count'   => count($validated['documents']),
        ]);
    }

    public function detachDocument(string $id, string $documentId): JsonResponse
    {
        $quiz = DB::table('quizzes')->where('id', $id)->first();
        if ($quiz === null) {
            abort(404, 'Quiz not found.');
        }

        if (!$this->quizDocuments->detachDocument($id, $documentId)) {
            return response()->json(['message' => 'Document not associated with this quiz.'], 404);
        }

        return response()->json(['message' => 'Document removed from quiz.']);
    }

    private function checkQuizAccess(object $quiz, ?User $user): void
{
    if ($user !== null && $user->role === 'admin') {
        return;
    }

    if ($user !== null && $quiz->created_by === $user->id) {
        return;
    }

    if (!$this->accessGate->canAccess($user, $quiz->access_level_id)) {
        abort(403, 'Access denied.');
    }
}
}