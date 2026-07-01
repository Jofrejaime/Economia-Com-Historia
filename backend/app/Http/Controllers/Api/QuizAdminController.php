<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\InvalidQuizTransitionException;
use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Document;
use App\Services\QuizService;
use App\Services\QuizDocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Enums\QuizStatus;

/**
 * @OA\Tag(name="Admin - Quizzes", description="Operações de administração de Quizzes")
 */
class QuizAdminController extends Controller
{
    public function __construct(
        private readonly QuizService $quizService,
        private readonly QuizDocumentService $quizDocuments
    ) {}

    /**
     * @OA\Get(
     *      path="/admin/quizzes",
     *      operationId="adminListQuizzes",
     *      tags={"Admin - Quizzes"},
     *      summary="Listar Quizzes (Admin)",
     *      description="Retorna listagem detalhada de quizzes com paginação, filtros e ordenação.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="search", in="query", required=false, description="Pesquisa por title, description e module", @OA\Schema(type="string")),
     *      @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string", enum={"draft", "review", "published", "archived"})),
     *      @OA\Parameter(name="category_id", in="query", required=false, @OA\Schema(type="string", format="uuid")),
     *      @OA\Parameter(name="created_by", in="query", required=false, @OA\Schema(type="string", format="uuid")),
     *      @OA\Parameter(name="difficulty", in="query", required=false, @OA\Schema(type="string", enum={"Básico", "Intermédio", "Avançado"})),
     *      @OA\Parameter(name="featured", in="query", required=false, @OA\Schema(type="boolean")),
     *      @OA\Parameter(name="standalone", in="query", required=false, @OA\Schema(type="boolean")),
     *      @OA\Parameter(name="published_only", in="query", required=false, @OA\Schema(type="boolean")),
     *      @OA\Parameter(name="date_from", in="query", required=false, description="Data início YYYY-MM-DD", @OA\Schema(type="string", format="date")),
     *      @OA\Parameter(name="date_to", in="query", required=false, description="Data fim YYYY-MM-DD", @OA\Schema(type="string", format="date")),
     *      @OA\Parameter(name="sort_by", in="query", required=false, @OA\Schema(type="string", enum={"title", "created_at", "published_at", "attempts_count", "avg_score", "difficulty"})),
     *      @OA\Parameter(name="sort_direction", in="query", required=false, @OA\Schema(type="string", enum={"asc", "desc"})),
     *      @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", maximum=100, default=20)),
     *      @OA\Response(response=200, description="Sucesso"),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Acesso negado")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search', 'status', 'category_id', 'created_by', 'difficulty',
            'featured', 'standalone', 'published_only', 'date_from', 'date_to',
            'sort_by', 'sort_direction'
        ]);

        $perPage = min((int) $request->input('per_page', 20), 100);
        $paginator = $this->quizService->listAdminQuizzes($filters, $perPage);

        $mappedItems = collect($paginator->items())->map(function ($quiz) {
            return [
                'id'                 => $quiz->id,
                'title'              => $quiz->title,
                'description'        => $quiz->description,
                'module'             => $quiz->module,
                'difficulty'         => $quiz->difficulty,
                'status'             => $quiz->status->value ?? $quiz->status,
                'category_id'        => $quiz->category_id,
                'category_name'      => $quiz->category?->name,
                'creator_id'         => $quiz->created_by,
                'creator_name'       => $quiz->creator?->display_name,
                'published_at'       => $quiz->published_at?->toIso8601String(),
                'created_at'         => $quiz->created_at->toIso8601String(),
                'updated_at'         => $quiz->updated_at->toIso8601String(),
                'attempts_count'     => (int) $quiz->attempts_count,
                'completed_attempts' => (int) $quiz->completed_attempts,
                'completion_rate'    => $quiz->attempts_count > 0 ? round(($quiz->completed_attempts / $quiz->attempts_count) * 100, 2) : 0.0,
                'avg_score'          => (float) $quiz->avg_score,
                'questions_count'    => (int) $quiz->questions_count,
                'documents_count'    => (int) $quiz->documents_count,
                'is_featured'        => (bool) $quiz->is_featured,
                'is_standalone'      => $quiz->documents_count === 0,
                'has_documents'      => $quiz->documents_count > 0,
            ];
        });

        return response()->json([
            'data' => $mappedItems,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ]
        ]);
    }

    /**
     * @OA\Get(
     *      path="/admin/quizzes/{id}",
     *      operationId="adminGetQuiz",
     *      tags={"Admin - Quizzes"},
     *      summary="Obter quiz para administração",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string", format="uuid")),
     *      @OA\Response(response=200, description="Sucesso"),
     *      @OA\Response(response=404, description="Quiz não encontrado")
     * )
     */
    public function show(string $id): JsonResponse
    {
        $quiz = Quiz::with(['category', 'creator.profile'])->find($id);
        if ($quiz === null) {
            return response()->json(['message' => 'Quiz not found.'], 404);
        }

        return response()->json(['data' => $quiz]);
    }

    /**
     * @OA\Post(
     *      path="/admin/quizzes",
     *      operationId="adminCreateQuiz",
     *      tags={"Admin - Quizzes"},
     *      summary="Criar Quiz",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(required=true, @OA\JsonContent()),
     *      @OA\Response(response=201, description="Criado com sucesso")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateQuiz($request);
        $quiz = $this->quizService->store($validated, $request->user());

        return response()->json([
            'message' => 'Quiz created successfully.',
            'data'    => $quiz,
        ], 201);
    }

    /**
     * @OA\Patch(
     *      path="/admin/quizzes/{id}",
     *      operationId="adminUpdateQuiz",
     *      tags={"Admin - Quizzes"},
     *      summary="Atualizar Quiz",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string", format="uuid")),
     *      @OA\RequestBody(required=true, @OA\JsonContent()),
     *      @OA\Response(response=200, description="Atualizado com sucesso")
     * )
     */
    public function update(string $id, Request $request): JsonResponse
    {
        $quiz = Quiz::find($id);
        if ($quiz === null) {
            return response()->json(['message' => 'Quiz not found.'], 404);
        }

        $validated = $this->validateQuiz($request);
        $updated = $this->quizService->update($quiz, $validated);

        return response()->json([
            'message' => 'Quiz updated successfully.',
            'data'    => $updated,
        ]);
    }

    /**
     * @OA\Delete(
     *      path="/admin/quizzes/{id}",
     *      operationId="adminDestroyQuiz",
     *      tags={"Admin - Quizzes"},
     *      summary="Eliminar Quiz",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string", format="uuid")),
     *      @OA\Response(response=200, description="Sucesso")
     * )
     */
    public function destroy(string $id): JsonResponse
    {
        $quiz = Quiz::find($id);
        if ($quiz === null) {
            return response()->json(['message' => 'Quiz not found.'], 404);
        }

        $this->quizService->destroy($quiz);

        return response()->json(['message' => 'Quiz deleted successfully.']);
    }

    /**
     * @OA\Post(
     *      path="/admin/quizzes/{id}/publish",
     *      operationId="adminPublishQuiz",
     *      tags={"Admin - Quizzes"},
     *      summary="Publicar Quiz",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string", format="uuid")),
     *      @OA\Response(response=200, description="Sucesso"),
     *      @OA\Response(response=409, description="Transição inválida")
     * )
     */
    public function publish(string $id, Request $request): JsonResponse
    {
        $quiz = Quiz::find($id);
        if ($quiz === null) {
            return response()->json(['message' => 'Quiz not found.'], 404);
        }

        try {
            $this->quizService->publish($quiz, $request->user());
            return response()->json(['message' => 'Quiz published successfully.']);
        } catch (InvalidQuizTransitionException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }

    /**
     * @OA\Post(
     *      path="/admin/quizzes/{id}/review",
     *      operationId="adminReviewQuiz",
     *      tags={"Admin - Quizzes"},
     *      summary="Enviar para revisão",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string", format="uuid")),
     *      @OA\Response(response=200, description="Sucesso"),
     *      @OA\Response(response=409, description="Transição inválida")
     * )
     */
    public function review(string $id, Request $request): JsonResponse
    {
        $quiz = Quiz::find($id);
        if ($quiz === null) {
            return response()->json(['message' => 'Quiz not found.'], 404);
        }

        try {
            $this->quizService->review($quiz, $request->user());
            return response()->json(['message' => 'Quiz status updated to review.']);
        } catch (InvalidQuizTransitionException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }

    /**
     * @OA\Post(
     *      path="/admin/quizzes/{id}/archive",
     *      operationId="adminArchiveQuiz",
     *      tags={"Admin - Quizzes"},
     *      summary="Arquivar Quiz",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string", format="uuid")),
     *      @OA\Response(response=200, description="Sucesso"),
     *      @OA\Response(response=409, description="Transição inválida")
     * )
     */
    public function archive(string $id, Request $request): JsonResponse
    {
        $quiz = Quiz::find($id);
        if ($quiz === null) {
            return response()->json(['message' => 'Quiz not found.'], 404);
        }

        try {
            $this->quizService->archive($quiz, $request->user());
            return response()->json(['message' => 'Quiz archived successfully.']);
        } catch (InvalidQuizTransitionException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }

    /**
     * @OA\Get(
     *      path="/admin/quizzes/dashboard",
     *      operationId="adminQuizDashboard",
     *      tags={"Admin - Quizzes"},
     *      summary="Dashboard estatístico de Quizzes",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(response=200, description="Sucesso")
     * )
     */
    public function dashboard(): JsonResponse
    {
        $data = $this->quizService->getDashboardData();

        $mapQuiz = fn($q) => [
            'id' => $q->id,
            'title' => $q->title,
            'attempts_count' => (int) $q->attempts_count,
            'avg_score' => (float) $q->avg_score,
        ];

        return response()->json([
            'quizzes'        => $data['quizzes'],
            'attempts'       => $data['attempts'],
            'most_attempted' => collect($data['most_attempted'])->map($mapQuiz),
            'highest_score'  => collect($data['highest_score'])->map($mapQuiz),
            'lowest_score'   => collect($data['lowest_score'])->map($mapQuiz),
        ]);
    }

    /**
     * @OA\Get(
     *      path="/admin/quizzes/{id}/documents",
     *      operationId="adminGetQuizDocuments",
     *      tags={"Admin - Quizzes"},
     *      summary="Listar documentos associados ao Quiz",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string", format="uuid")),
     *      @OA\Response(response=200, description="Sucesso")
     * )
     */
    public function documents(string $id): JsonResponse
    {
        $quiz = Quiz::find($id);
        if ($quiz === null) {
            return response()->json(['message' => 'Quiz not found.'], 404);
        }

        $documents = $quiz->documents()->with('category')->get();
        $mapped = $documents->map(function ($doc) {
            return [
                'document_id' => $doc->id,
                'title'       => $doc->title,
                'category'    => $doc->category?->name,
                'sort_order'  => $doc->pivot->sort_order,
                'status'      => $doc->status,
            ];
        });

        return response()->json(['data' => $mapped]);
    }

    public function syncDocuments(string $id, Request $request): JsonResponse
    {
        $quiz = Quiz::find($id);
        if ($quiz === null) {
            return response()->json(['message' => 'Quiz not found.'], 404);
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
        $quiz = Quiz::find($id);
        if ($quiz === null) {
            return response()->json(['message' => 'Quiz not found.'], 404);
        }

        $detached = $this->quizDocuments->detachDocument($id, $documentId);

        if (!$detached) {
            return response()->json(['message' => 'Document not associated with this quiz.'], 404);
        }

        return response()->json(['message' => 'Document removed from quiz.']);
    }

    /**
     * @OA\Get(
     *      path="/admin/documents/{id}/quizzes",
     *      operationId="adminGetDocumentQuizzes",
     *      tags={"Admin - Quizzes"},
     *      summary="Listar quizzes associados ao Documento (Admin)",
     *      description="Lista todos os quizzes associados ao documento (incluindo rascunhos, revisão e arquivados).",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string", format="uuid")),
     *      @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", maximum=100, default=20)),
     *      @OA\Response(response=200, description="Sucesso")
     * )
     */
    public function documentQuizzes(string $id, Request $request): JsonResponse
    {
        $document = Document::find($id);
        if ($document === null) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        $perPage = min((int) $request->input('per_page', 20), 100);
        $paginator = $document->quizzes()
            ->with(['category', 'creator.profile'])
            ->withCount(['questions', 'documents', 'attempts'])
            ->withCount(['attempts as completed_attempts' => function ($q) {
                $q->where('status', 'completed');
            }])
            ->paginate($perPage);

        $mappedItems = collect($paginator->items())->map(function ($quiz) {
            return [
                'id'                 => $quiz->id,
                'title'              => $quiz->title,
                'description'        => $quiz->description,
                'module'             => $quiz->module,
                'difficulty'         => $quiz->difficulty,
                'status'             => $quiz->status->value ?? $quiz->status,
                'category_id'        => $quiz->category_id,
                'category_name'      => $quiz->category?->name,
                'creator_id'         => $quiz->created_by,
                'creator_name'       => $quiz->creator?->display_name,
                'published_at'       => $quiz->published_at?->toIso8601String(),
                'created_at'         => $quiz->created_at->toIso8601String(),
                'updated_at'         => $quiz->updated_at->toIso8601String(),
                'attempts_count'     => (int) $quiz->attempts_count,
                'completed_attempts' => (int) $quiz->completed_attempts,
                'completion_rate'    => $quiz->attempts_count > 0 ? round(($quiz->completed_attempts / $quiz->attempts_count) * 100, 2) : 0.0,
                'avg_score'          => (float) $quiz->avg_score,
                'questions_count'    => (int) $quiz->questions_count,
                'documents_count'    => (int) $quiz->documents_count,
                'is_featured'        => (bool) $quiz->is_featured,
                'is_standalone'      => $quiz->documents_count === 0,
                'has_documents'      => $quiz->documents_count > 0,
            ];
        });

        return response()->json([
            'data' => $mappedItems,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ]
        ]);
    }

    private function validateQuiz(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'module' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'cover_image_url' => ['nullable', 'string', 'url', 'max:500'],
            'difficulty' => ['nullable', 'string', 'in:Básico,Intermédio,Avançado'],
            'base_points' => ['nullable', 'integer', 'min:0'],
            'time_limit_secs' => ['nullable', 'integer', 'min:0'],
            'access_level_id' => ['nullable', 'string', 'exists:access_levels,id'],
            'is_featured' => ['nullable', 'boolean'],
            'status' => ['nullable', Rule::enum(QuizStatus::class)],
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
    }
}
