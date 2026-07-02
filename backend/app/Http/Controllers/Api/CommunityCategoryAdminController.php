<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommunityCategoryResource;
use App\Services\CommunityCategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommunityCategoryAdminController extends Controller
{
    public function __construct(
        private readonly CommunityCategoryService $categoryService
    ) {}

    /**
     * @OA\Get(
     *      path="/admin/community/categories",
     *      operationId="adminCommunityCategoriesList",
     *      tags={"Community Admin"},
     *      summary="Listar categorias (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Lista obtida",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *          )
     *      )
     * )
     */
    public function index(): JsonResponse
    {
        $categories = $this->categoryService->list();
        return response()->json([
            'data' => CommunityCategoryResource::collection($categories)
        ]);
    }

    /**
     * @OA\Post(
     *      path="/admin/community/categories",
     *      operationId="adminCommunityCategoryCreate",
     *      tags={"Community Admin"},
     *      summary="Criar categoria (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"name"},
     *              @OA\Property(property="name", type="string"),
     *              @OA\Property(property="slug", type="string"),
     *              @OA\Property(property="description", type="string"),
     *              @OA\Property(property="color_bg", type="string"),
     *              @OA\Property(property="color_text", type="string"),
     *              @OA\Property(property="cover_image_url", type="string")
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Categoria criada",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string"),
     *              @OA\Property(property="data", type="object")
     *          )
     *      )
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', 'unique:community_categories,slug'],
            'description' => ['sometimes', 'nullable', 'string'],
            'color_bg' => ['sometimes', 'nullable', 'string', 'max:7'],
            'color_text' => ['sometimes', 'nullable', 'string', 'max:7'],
            'cover_image_url' => ['sometimes', 'nullable', 'string', 'max:500'],
            'sort_order' => ['sometimes', 'integer'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $category = $this->categoryService->create($validated);

        return response()->json([
            'message' => 'Category created successfully.',
            'data' => new CommunityCategoryResource($category)
        ], 201);
    }

    /**
     * @OA\Patch(
     *      path="/admin/community/categories/{id}",
     *      operationId="adminCommunityCategoryUpdate",
     *      tags={"Community Admin"},
     *      summary="Atualizar categoria (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              @OA\Property(property="name", type="string"),
     *              @OA\Property(property="slug", type="string"),
     *              @OA\Property(property="description", type="string"),
     *              @OA\Property(property="color_bg", type="string"),
     *              @OA\Property(property="color_text", type="string"),
     *              @OA\Property(property="cover_image_url", type="string")
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Categoria atualizada",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string"),
     *              @OA\Property(property="data", type="object")
     *          )
     *      )
     * )
     */
    public function update(string $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', 'unique:community_categories,slug,'.$id],
            'description' => ['sometimes', 'nullable', 'string'],
            'color_bg' => ['sometimes', 'nullable', 'string', 'max:7'],
            'color_text' => ['sometimes', 'nullable', 'string', 'max:7'],
            'cover_image_url' => ['sometimes', 'nullable', 'string', 'max:500'],
            'sort_order' => ['sometimes', 'integer'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $category = $this->categoryService->update($id, $validated);

        return response()->json([
            'message' => 'Category updated successfully.',
            'data' => new CommunityCategoryResource($category)
        ]);
    }

    /**
     * @OA\Delete(
     *      path="/admin/community/categories/{id}",
     *      operationId="adminCommunityCategoryDelete",
     *      tags={"Community Admin"},
     *      summary="Excluir categoria (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(
     *          response=200,
     *          description="Categoria excluída",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string")
     *          )
     *      ),
     *      @OA\Response(response=409, description="Conflito (categoria com dependências)")
     * )
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->categoryService->delete($id);
            return response()->json(['message' => 'Category deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }
}
