<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AccessGateService;
use App\Services\GamificationService;
use App\Services\QuizAttemptService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QuizController extends Controller
{
    public function __construct(
        private readonly GamificationService $gamification,
        private readonly AccessGateService $accessGate,
        private readonly QuizAttemptService $attemptService,
    ) {}

    /**
     * @OA\Get(
     *      path="/quizzes",
     *      operationId="indexQuizzes",
     *      tags={"Quiz"},
     *      summary="Listar quizzes disponíveis",
     *      description="Lista todos os quizzes que o utilizador tem permissões para aceder.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Quizzes obtidos com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) ($request->input('per_page', 20)), 50);
        $page = max((int) ($request->input('page', 1)), 1);

        $query = DB::table('quizzes')->where('status', 'published');
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

    /**
     * @OA\Post(
     *      path="/quizzes",
     *      operationId="storeQuiz",
     *      tags={"Quiz"},
     *      summary="Criar novo quiz com perguntas (Admin/Professor)",
     *      description="Adiciona um novo quiz completo na base de dados.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"title"},
     *              @OA\Property(property="title", type="string", maxLength=255, example="Caminho de Ferro de Benguela"),
     *              @OA\Property(property="module", type="string", maxLength=255, nullable=true, example="Módulo I"),
     *              @OA\Property(property="description", type="string", nullable=true, example="Teste seus conhecimentos sobre o CFB."),
     *              @OA\Property(property="cover_image_url", type="string", format="url", maxLength=500, nullable=true),
     *              @OA\Property(property="difficulty", type="string", enum={"Básico", "Intermédio", "Avançado"}, default="Básico"),
     *              @OA\Property(property="base_points", type="integer", minimum=0, default=50),
     *              @OA\Property(property="time_limit_secs", type="integer", minimum=0, nullable=true, example=300),
     *              @OA\Property(property="access_level_id", type="string", example="public"),
     *              @OA\Property(property="is_featured", type="boolean", default=false),
     *              @OA\Property(property="status", type="string", enum={"published", "draft"}, default="draft"),
     *              @OA\Property(property="category_id", type="string", format="uuid", nullable=true),
     *              @OA\Property(property="questions", type="array", nullable=true, @OA\Items(
     *                  @OA\Property(property="question_order", type="integer", example=1),
     *                  @OA\Property(property="title", type="string", example="Qual o ano de início de construção do CFB?"),
     *                  @OA\Property(property="subtitle", type="string", nullable=true),
     *                  @OA\Property(property="module_label", type="string", nullable=true),
     *                  @OA\Property(property="question_type", type="string", enum={"multiple_choice"}, default="multiple_choice"),
     *                  @OA\Property(property="points", type="integer", default=10),
     *                  @OA\Property(property="hint_title", type="string", nullable=true),
     *                  @OA\Property(property="hint_quote", type="string", nullable=true),
     *                  @OA\Property(property="options", type="array", @OA\Items(
     *                      @OA\Property(property="option_key", type="string", maxLength=1, example="A"),
     *                      @OA\Property(property="text", type="string", example="1903"),
     *                      @OA\Property(property="is_correct", type="boolean", example=true),
     *                      @OA\Property(property="explanation", type="string", nullable=true, example="O CFB começou a ser construído em 1903.")
     *                  ))
     *              ))
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Quiz criado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Quiz created successfully."),
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Acesso proibido (Requer admin ou professor)"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Erro de validação"
     *      )
     * )
     */
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
            'status' => ['nullable', 'string', 'in:published,draft'],
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
        ]);

        $quizId = (string) Str::uuid();

        DB::transaction(function () use ($quizId, $validated, $request) {
            $quizData = collect($validated)->except(['questions'])->all();
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
        });

        $createdQuiz = DB::table('quizzes')->where('id', $quizId)->first();
        return response()->json([
            'message' => 'Quiz created successfully.',
            'data' => $createdQuiz,
        ], 201);
    }

    /**
     * @OA\Get(
     *      path="/quizzes/{id}",
     *      operationId="showQuiz",
     *      tags={"Quiz"},
     *      summary="Visualizar detalhes de um quiz",
     *      description="Retorna as informações básicas de um quiz.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do quiz",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Detalhes do quiz obtidos com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Sem acesso ao nível do quiz"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Quiz não encontrado"
     *      )
     * )
     */
    public function show(string $id, Request $request): JsonResponse
    {
        $quiz = DB::table('quizzes')->where('id', $id)->first();
        if ($quiz === null) {
            abort(404, 'Quiz not found.');
        }
        $this->checkQuizAccess($quiz, $request->user());
        return response()->json(['data' => $quiz]);
    }

    /**
     * @OA\Patch(
     *      path="/quizzes/{id}",
     *      operationId="updateQuiz",
     *      tags={"Quiz"},
     *      summary="Atualizar quiz (Admin/Professor)",
     *      description="Permite atualizar o quiz bem como as suas perguntas e opções.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do quiz",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"title"},
     *              @OA\Property(property="title", type="string"),
     *              @OA\Property(property="description", type="string"),
     *              @OA\Property(property="difficulty", type="string", enum={"Básico", "Intermédio", "Avançado"}),
     *              @OA\Property(property="status", type="string", enum={"published", "draft"})
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Quiz atualizado",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Quiz updated successfully."),
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Acesso proibido"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Quiz não encontrado"
     *      )
     * )
     */
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
            'status' => ['nullable', 'string', 'in:published,draft'],
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
        ]);

        DB::transaction(function () use ($id, $validated) {
            $quizData = collect($validated)->except(['questions'])->all();
            $quizData['updated_at'] = now();

            DB::table('quizzes')->where('id', $id)->update($quizData);

            if (array_key_exists('questions', $validated)) {
                $payloadQuestionIds = collect($validated['questions'])->pluck('id')->filter()->all();
                
                // Delete questions not in payload
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

                    // Delete options not in payload
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
        });

        $updatedQuiz = DB::table('quizzes')->where('id', $id)->first();
        return response()->json([
            'message' => 'Quiz updated successfully.',
            'data' => $updatedQuiz,
        ]);
    }

    /**
     * @OA\Delete(
     *      path="/quizzes/{id}",
     *      operationId="destroyQuiz",
     *      tags={"Quiz"},
     *      summary="Eliminar quiz (Admin/Professor)",
     *      description="Elimina permanentemente um quiz e todas as tentativas e perguntas associadas.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do quiz",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Quiz eliminado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Quiz deleted successfully.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Acesso proibido"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Quiz não encontrado"
     *      )
     * )
     */
    public function destroy(string $id): JsonResponse
    {
        $quiz = DB::table('quizzes')->where('id', $id)->first();
        if ($quiz === null) {
            abort(404, 'Quiz not found.');
        }

        DB::transaction(function () use ($id) {
            // Delete attempt answers
            $attemptIds = DB::table('quiz_attempts')->where('quiz_id', $id)->pluck('id');
            DB::table('quiz_attempt_answers')->whereIn('attempt_id', $attemptIds)->delete();
            
            // Delete attempts
            DB::table('quiz_attempts')->where('quiz_id', $id)->delete();
            
            // Delete quiz questions (which cascades to options)
            DB::table('quiz_questions')->where('quiz_id', $id)->delete();
            
            // Delete quiz itself
            DB::table('quizzes')->where('id', $id)->delete();
        });

        return response()->json(['message' => 'Quiz deleted successfully.']);
    }

    /**
     * @OA\Get(
     *      path="/quizzes/{id}/questions",
     *      operationId="quizQuestions",
     *      tags={"Quiz"},
     *      summary="Listar perguntas de um quiz",
     *      description="Retorna as perguntas de um quiz com opções (mas ocultando respostas corretas por segurança, dependendo da lógica do frontend).",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do quiz",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Perguntas obtidas",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Quiz não encontrado"
     *      )
     * )
     */
    public function questions(string $id, Request $request): JsonResponse
    {
        $quiz = DB::table('quizzes')->where('id', $id)->first();
        if ($quiz === null) {
            abort(404, 'Quiz not found.');
        }
        $this->checkQuizAccess($quiz, $request->user());

        $questions = DB::table('quiz_questions')
            ->where('quiz_id', $id)
            ->orderBy('question_order')
            ->get();

        $options = DB::table('quiz_options')
            ->whereIn('question_id', $questions->pluck('id'))
            ->get();

        $data = $questions->map(function ($q) use ($options) {
            $qOptions = $options->where('question_id', $q->id)->map(function ($o) {
                return [
                    'id' => $o->id,
                    'option_text' => $o->text,
                    'option_key' => $o->option_key,
                ];
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

    /**
     * @OA\Post(
     *      path="/quizzes/{id}/attempts",
     *      operationId="startQuizAttempt",
     *      tags={"Quiz"},
     *      summary="Iniciar tentativa de quiz",
     *      description="Cria uma nova tentativa de quiz para o utilizador autenticado.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID do quiz",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Tentativa iniciada",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Attempt started."),
     *              @OA\Property(property="id", type="string", format="uuid")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Quiz não encontrado"
     *      )
     * )
     */
    public function startAttempt(string $id, Request $request): JsonResponse
    {
        $attemptId = $this->attemptService->startAttempt($id, $request->user());
        return response()->json(['message' => 'Attempt started.', 'id' => $attemptId], 201);
    }

    /**
     * @OA\Get(
     *      path="/quiz-attempts/{id}",
     *      operationId="showQuizAttempt",
     *      tags={"Quiz"},
     *      summary="Visualizar detalhes de uma tentativa",
     *      description="Obtém informações sobre o estado de uma tentativa de quiz.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID da tentativa",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Detalhes obtidos",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Tentativa não encontrada"
     *      )
     * )
     */
    public function showAttempt(string $id, Request $request): JsonResponse
    {
        $attempt = DB::table('quiz_attempts')->where('id', $id)->first();

        if ($attempt === null || $attempt->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Attempt not found.'], 404);
        }

        return response()->json(['data' => $attempt]);
    }

    /**
     * @OA\Post(
     *      path="/quiz-attempts/{id}/answers",
     *      operationId="answerQuizAttempt",
     *      tags={"Quiz"},
     *      summary="Responder a uma pergunta do quiz",
     *      description="Regista uma resposta a uma das perguntas da tentativa ativa.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID da tentativa",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"question_id", "selected_option_id"},
     *              @OA\Property(property="question_id", type="string", format="uuid"),
     *              @OA\Property(property="selected_option_id", type="string", format="uuid"),
     *              @OA\Property(property="time_spent_secs", type="integer", nullable=true, example=15)
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Resposta gravada",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Answer recorded."),
     *              @OA\Property(property="is_correct", type="boolean", example=true)
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Erro de validação"
     *      )
     * )
     */
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

    /**
     * @OA\Post(
     *      path="/quiz-attempts/{id}/complete",
     *      operationId="completeQuizAttempt",
     *      tags={"Quiz"},
     *      summary="Finalizar tentativa de quiz",
     *      description="Conclui a tentativa, calcula pontuação e atribui experiência/pontos ao utilizador.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID da tentativa",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\RequestBody(
     *          required=false,
     *          @OA\JsonContent(
     *              @OA\Property(property="time_spent_secs", type="integer", nullable=true, example=120)
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Tentativa concluída",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Attempt completed."),
     *              @OA\Property(property="data", type="object"),
     *              @OA\Property(property="gamification", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Erro de validação"
     *      )
     * )
     */
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

        $documents = DB::table('quiz_documents as qd')
            ->join('documents as d', 'd.id', '=', 'qd.document_id')
            ->leftJoin('document_categories as dc', 'dc.id', '=', 'd.category_id')
            ->where('qd.quiz_id', $id)
            ->where('d.status', 'published')
            ->orderBy('qd.sort_order')
            ->select(
                'd.id', 'd.title', 'd.author', 'd.summary', 'd.document_type',
                'd.academic_level', 'd.access_level_id', 'd.cover_image_url',
                'd.views_count', 'd.likes_count', 'd.published_at', 'd.created_at',
                'dc.name as category_name'
            )
            ->get()
            ->map(fn ($doc) => array_merge((array) $doc, [
                'category' => $doc->category_name ? ['name' => $doc->category_name] : null,
            ]));

        return response()->json(['data' => $documents]);
    }

    /**
     * @OA\Get(
     *      path="/me/quiz-attempts",
     *      operationId="myQuizAttempts",
     *      tags={"Quiz"},
     *      summary="Listar as minhas tentativas de quiz",
     *      description="Histórico de quizzes resolvidos pelo utilizador autenticado.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Histórico obtido com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      )
     * )
     */
    public function myAttempts(Request $request): JsonResponse
    {
        return response()->json([
            'data' => DB::table('quiz_attempts')
                ->where('user_id', $request->user()->id)
                ->orderByDesc('started_at')
                ->limit(20)
                ->get()
        ]);
    }

    private function checkQuizAccess(object $quiz, User $user): void
    {
        if ($user->role === 'admin') {
            return;
        }

        if ($quiz->created_by === $user->id) {
            return;
        }

        if (!$this->accessGate->canAccess($user, $quiz->access_level_id)) {
            abort(403, 'Access denied.');
        }
    }
}
