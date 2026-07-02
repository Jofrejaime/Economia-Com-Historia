<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SettingsResource;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function __construct(
        private readonly SettingsService $settingsService
    ) {}

    /**
     * @OA\Get(
     *      path="/admin/settings",
     *      operationId="indexSettings",
     *      tags={"Settings"},
     *      summary="Listar todas as configurações da plataforma (Apenas Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Configurações obtidas com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Setting"))
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Acesso proibido")
     * )
     */
    public function index(): JsonResponse
    {
        $settings = $this->settingsService->getAll();
        return response()->json([
            'data' => SettingsResource::collection($settings)
        ]);
    }

    /**
     * @OA\Get(
     *      path="/admin/settings/{key}",
     *      operationId="showSetting",
     *      tags={"Settings"},
     *      summary="Visualizar uma configuração específica (Apenas Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="key",
     *          in="path",
     *          required=true,
     *          description="Chave da configuração",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Configuração obtida com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", ref="#/components/schemas/Setting")
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=404, description="Configuração não encontrada")
     * )
     */
    public function show(string $key): JsonResponse
    {
        $setting = $this->settingsService->getByKey($key);
        return response()->json([
            'data' => new SettingsResource($setting)
        ]);
    }

    /**
     * @OA\Patch(
     *      path="/admin/settings/{key}",
     *      operationId="updateSetting",
     *      tags={"Settings"},
     *      summary="Atualizar o valor de uma configuração (Apenas Admin)",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="key",
     *          in="path",
     *          required=true,
     *          description="Chave da configuração",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"value"},
     *              @OA\Property(property="value", type="string", example="Novo Nome do Site")
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Configuração atualizada com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Setting updated successfully."),
     *              @OA\Property(property="data", ref="#/components/schemas/Setting")
     *          )
     *      ),
     *      @OA\Response(response=400, description="Dados inválidos"),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Acesso proibido"),
     *      @OA\Response(response=404, description="Configuração não encontrada"),
     *      @OA\Response(response=422, description="Erro de validação")
     * )
     */
    public function update(Request $request, string $key): JsonResponse
    {
        $request->validate([
            'value' => ['required'],
        ]);

        try {
            $setting = $this->settingsService->update($key, $request->input('value'), $request->user()?->id);
            return response()->json([
                'message' => 'Setting updated successfully.',
                'data' => new SettingsResource($setting),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
