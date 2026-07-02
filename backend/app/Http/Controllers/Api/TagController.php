<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TagResource;
use App\Services\TagService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function __construct(
        private readonly TagService $tagService
    ) {}

    /**
     * @OA\Get(
     *      path="/admin/tags",
     *      operationId="listAdminTags",
     *      tags={"Tags"},
     *      summary="Listar e pesquisar tags (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="q", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="sort_by", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="sort_direction", in="query", required=false, @OA\Schema(type="string")),
     *      @OA\Response(
     *          response=200,
     *          description="Tags obtidas com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $tags = $this->tagService->list($request->all());

        return response()->json([
            'data' => TagResource::collection($tags->items()),
            'meta' => [
                'current_page' => $tags->currentPage(),
                'last_page'    => $tags->lastPage(),
                'per_page'     => $tags->perPage(),
                'total'        => $tags->total(),
            ],
        ]);
    }

    /**
     * @OA\Get(
     *      path="/admin/tags/{id}",
     *      operationId="showAdminTag",
     *      tags={"Tags"},
     *      summary="Visualizar detalhes de uma tag (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Response(response=200, description="Detalhes da tag"),
     *      @OA\Response(response=404, description="Tag não encontrada")
     * )
     */
    public function show(string $id): JsonResponse
    {
        $tag = $this->tagService->find($id);
        return response()->json([
            'data' => new TagResource($tag)
        ]);
    }

    /**
     * @OA\Post(
     *      path="/admin/tags",
     *      operationId="storeAdminTag",
     *      tags={"Tags"},
     *      summary="Criar nova tag (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"name"},
     *              @OA\Property(property="name", type="string")
     *          )
     *      ),
     *      @OA\Response(response=201, description="Tag criada com sucesso"),
     *      @OA\Response(response=422, description="Erros de validação")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tags,name',
            'slug' => 'nullable|string|max:255|unique:tags,slug',
        ]);

        $tag = $this->tagService->create($validated);

        return response()->json([
            'message' => 'Tag created.',
            'data' => new TagResource($tag)
        ], 201);
    }

    /**
     * @OA\Patch(
     *      path="/admin/tags/{id}",
     *      operationId="updateAdminTag",
     *      tags={"Tags"},
     *      summary="Atualizar tag (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              @OA\Property(property="name", type="string")
     *          )
     *      ),
     *      @OA\Response(response=200, description="Tag atualizada com sucesso"),
     *      @OA\Response(response=404, description="Tag não encontrada")
     * )
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tags,name,' . $id,
            'slug' => 'nullable|string|max:255|unique:tags,slug,' . $id,
        ]);

        $tag = $this->tagService->update($id, $validated);

        return response()->json([
            'message' => 'Tag updated.',
            'data' => new TagResource($tag)
        ]);
    }

    /**
     * @OA\Delete(
     *      path="/admin/tags/{id}",
     *      operationId="destroyAdminTag",
     *      tags={"Tags"},
     *      summary="Eliminar tag (Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *      @OA\Parameter(name="confirm", in="query", required=false, @OA\Schema(type="boolean")),
     *      @OA\Response(response=200, description="Tag eliminada com sucesso"),
     *      @OA\Response(response=409, description="Tag em uso; necessita confirmação"),
     *      @OA\Response(response=404, description="Tag não encontrada")
     * )
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $confirm = $request->boolean('confirm', false);

        try {
            $this->tagService->delete($id, $confirm);
            return response()->json(['message' => 'Tag deleted.']);
        } catch (\Exception $e) {
            if ($e->getMessage() === 'TAG_IN_USE') {
                return response()->json([
                    'message' => 'Esta tag está associada a documentos. Confirme a eliminação.',
                    'in_use' => true
                ], 409);
            }
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }
}
