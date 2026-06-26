<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\UserDirectoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class UserController extends Controller
{
    public function __construct(private readonly UserDirectoryService $directoryService)
    {
    }

    /**
     * @OA\Get(
     *      path="/users/search",
     *      operationId="searchUsers",
     *      tags={"Users"},
     *      summary="Pesquisar utilizadores",
     *      description="Pesquisa utilizadores ativos e devolve apenas campos públicos para convites e colaboração.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="q",
     *          in="query",
     *          required=true,
     *          description="Termo de pesquisa",
     *          @OA\Schema(type="string", minLength=2, example="jo")
     *      ),
     *      @OA\Parameter(
     *          name="limit",
     *          in="query",
     *          required=false,
     *          description="Número máximo de resultados",
     *          @OA\Schema(type="integer", minimum=1, maximum=20, example=10)
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Utilizadores encontrados",
     *          @OA\JsonContent(type="array", @OA\Items(
     *              @OA\Property(property="id", type="string", format="uuid"),
     *              @OA\Property(property="display_name", type="string"),
     *              @OA\Property(property="full_name", type="string", nullable=true),
     *              @OA\Property(property="avatar_url", type="string", nullable=true),
     *              @OA\Property(property="institution", type="string", nullable=true)
     *          ))
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      )
     * )
     */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:255'],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:20'],
        ]);

        $users = $this->directoryService->search(
            $validated['q'],
            (int) ($validated['limit'] ?? 10)
        );

        return response()->json($users);
    }
}
