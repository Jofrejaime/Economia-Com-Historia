<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Services\QuizAttemptService;
use App\Services\QuizDocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Endpoints de leitura + participação em Quizzes (qualquer utilizador
 * autenticado). A gestão administrativa (CRUD, transições de estado,
 * sincronização de documentos) vive exclusivamente em QuizAdminController,
 * sob as rotas /admin/quizzes — ver routes/api.php.
 */
class QuizController extends Controller
{
    public function __construct(
        private readonly QuizAttemptService   $attemptService,
        private readonly QuizDocumentService  $quizDocuments,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) ($request->input('per_page', 20)), 50);
        $page = max((int) ($request->input('page', 1)), 1);

        $query = Quiz::published()->getQuery();

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

    public function show(string $id, Request $request): JsonResponse
    {
        $quiz = DB::table('quizzes')->where('id', $id)->first();
        if ($quiz === null) {
            abort(404, 'Quiz not found.');
        }
        return response()->json(['data' => $quiz]);
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

}