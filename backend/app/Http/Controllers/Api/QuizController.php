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

    public function index(Request $request): JsonResponse
    {
        $query = DB::table('quizzes');
        $this->accessGate->applyDocumentVisibilityFilter($query, $request->user(), 'quizzes');
        
        $quizzes = $query->orderByDesc('created_at')->limit(20)->get();
        return response()->json(['data' => $quizzes]);
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

    public function startAttempt(string $id, Request $request): JsonResponse
    {
        $attemptId = $this->attemptService->startAttempt($id, $request->user());
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
