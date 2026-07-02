<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentCategoryResource;
use App\Services\DocumentCategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentCategoryController extends Controller
{
    public function __construct(
        private readonly DocumentCategoryService $categoryService
    ) {}

    /**
     * @OA\Get(
     *      path="/admin/document-categories",
     *      operationId="listAdminDocumentCategories",
     *      tags={"Document Categories"},
     *      summary="Listar categorias de documentos (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Categorias obtidas com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado")
     * )
     */
    public function index(): JsonResponse
    {
        $categories = $this->categoryService->list();
        return response()->json([
            'data' => DocumentCategoryResource::collection($categories)
        ]);
    }

    /**
     * @OA\Get(
     *      path="/admin/document-categories/{id}",
     *      operationId="showAdminDocumentCategory",
     *      tags={"Document Categories"},
     *      summary="Visualizar detalhes de uma categoria (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Detalhes da categoria"),
     *      @OA\Response(response=404, description="Categoria não encontrada")
     * )
     */
    public function show(string $id): JsonResponse
    {
        $category = $this->categoryService->find($id);
        return response()->json([
            'data' => new DocumentCategoryResource($category)
        ]);
    }

    /**
     * @OA\Post(
     *      path="/admin/document-categories",
     *      operationId="storeAdminDocumentCategory",
     *      tags={"Document Categories"},
     *      summary="Criar nova categoria (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"name"},
     *              @OA\Property(property="name", type="string"),
     *              @OA\Property(property="description", type="string", nullable=true),
     *              @OA\Property(property="color_bg", type="string", nullable=true),
     *              @OA\Property(property="color_text", type="string", nullable=true),
     *              @OA\Property(property="icon", type="string", nullable=true),
     *              @OA\Property(property="sort_order", type="integer", nullable=true),
     *              @OA\Property(property="requires_subscription", type="boolean", nullable=true)
     *          )
     *      ),
     *      @OA\Response(response=201, description="Categoria criada com sucesso"),
     *      @OA\Response(response=422, description="Erros de validação")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color_bg' => 'nullable|string|max:50',
            'color_text' => 'nullable|string|max:50',
            'icon' => 'nullable|string|max:255',
            'parent_id' => 'nullable|uuid|exists:document_categories,id',
            'sort_order' => 'nullable|integer',
            'requires_subscription' => 'nullable|boolean',
        ]);

        $category = $this->categoryService->create($validated);

        return response()->json([
            'message' => 'Category created.',
            'data' => new DocumentCategoryResource($category)
        ], 201);
    }

    /**
     * @OA\Patch(
     *      path="/admin/document-categories/{id}",
     *      operationId="updateAdminDocumentCategory",
     *      tags={"Document Categories"},
     *      summary="Atualizar categoria (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              @OA\Property(property="name", type="string")
     *          )
     *      ),
     *      @OA\Response(response=200, description="Categoria atualizada com sucesso"),
     *      @OA\Response(response=404, description="Categoria não encontrada")
     * )
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'color_bg' => 'nullable|string|max:50',
            'color_text' => 'nullable|string|max:50',
            'icon' => 'nullable|string|max:255',
            'parent_id' => 'nullable|uuid|exists:document_categories,id',
            'sort_order' => 'nullable|integer',
            'requires_subscription' => 'nullable|boolean',
        ]);

        $category = $this->categoryService->update($id, $validated);

        return response()->json([
            'message' => 'Category updated.',
            'data' => new DocumentCategoryResource($category)
        ]);
    }

    /**
     * @OA\Delete(
     *      path="/admin/document-categories/{id}",
     *      operationId="destroyAdminDocumentCategory",
     *      tags={"Document Categories"},
     *      summary="Eliminar categoria (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Categoria eliminada com sucesso"),
     *      @OA\Response(response=409, description="Categoria associada a documentos"),
     *      @OA\Response(response=404, description="Categoria não encontrada")
     * )
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->categoryService->delete($id);
            return response()->json(['message' => 'Category deleted.']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }
}
