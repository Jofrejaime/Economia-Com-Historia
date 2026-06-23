<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\AngolaProvinces;
use App\Support\ProfilePresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * @OA\Get(
     *      path="/profile",
     *      operationId="showProfile",
     *      tags={"Profile"},
     *      summary="Visualizar perfil",
     *      description="Retorna os detalhes do perfil do utilizador autenticado.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Perfil obtido com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="profile", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Perfil não encontrado"
     *      )
     * )
     */
    public function show(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $profile = DB::table('user_profiles')->where('user_id', $userId)->first();

        if (! $profile) {
            return response()->json(['message' => 'Profile not found.'], 404);
        }

        return response()->json([
            'profile' => ProfilePresenter::presentProfile($profile),
        ]);
    }

    /**
     * @OA\Put(
     *      path="/profile",
     *      operationId="updateProfile",
     *      tags={"Profile"},
     *      summary="Atualizar perfil",
     *      description="Atualiza as informações do perfil do utilizador autenticado.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              @OA\Property(property="display_name", type="string", maxLength=100, example="João Silva"),
     *              @OA\Property(property="full_name", type="string", maxLength=255, nullable=true, example="João Maria Silva"),
     *              @OA\Property(property="institution", type="string", maxLength=255, nullable=true, example="ISPTEC"),
     *              @OA\Property(property="province", type="string", nullable=true, example="Luanda"),
     *              @OA\Property(property="bio", type="string", maxLength=2000, nullable=true, example="Estudante de engenharia..."),
     *              @OA\Property(property="website_url", type="string", format="url", maxLength=500, nullable=true, example="https://exemplo.com"),
     *              @OA\Property(property="research_areas", type="array", @OA\Items(type="string"), nullable=true, example={"História Monetária", "Caminho de Ferro de Benguela"})
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Perfil atualizado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Profile updated successfully."),
     *              @OA\Property(property="profile", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Erro de validação de dados"
     *      )
     * )
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'display_name' => ['sometimes', 'string', 'max:100'],
            'full_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'institution' => ['sometimes', 'nullable', 'string', 'max:255'],
            'province' => ['sometimes', 'nullable', 'string', AngolaProvinces::validationRule()],
            'bio' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'website_url' => ['sometimes', 'nullable', 'string', 'max:500', 'url'],
            'research_areas' => ['sometimes', 'nullable', 'array', 'max:10'],
            'research_areas.*' => ['string', 'max:100'],
        ]);

        $userId = $request->user()->id;
        $payload = $validated;

        if (array_key_exists('research_areas', $payload)) {
            $payload['research_areas'] = $payload['research_areas'] !== null
                ? json_encode($payload['research_areas'])
                : null;
        }

        $existing = DB::table('user_profiles')->where('user_id', $userId)->first();

        if ($existing) {
            DB::table('user_profiles')
                ->where('user_id', $userId)
                ->update(array_merge($payload, ['updated_at' => now()]));
        } else {
            DB::table('user_profiles')->insert(array_merge($payload, [
                'id' => (string) Str::uuid(),
                'user_id' => $userId,
                'display_name' => $payload['display_name'] ?? 'User',
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $updated = DB::table('user_profiles')->where('user_id', $userId)->first();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'profile' => ProfilePresenter::presentProfile($updated),
        ]);
    }

    /**
     * @OA\Post(
     *      path="/profile/avatar",
     *      operationId="updateAvatar",
     *      tags={"Profile"},
     *      summary="Atualizar foto de perfil (avatar)",
     *      description="Permite carregar uma nova imagem de perfil.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\MediaType(
     *              mediaType="multipart/form-data",
     *              @OA\Schema(
     *                  required={"avatar"},
     *                  @OA\Property(
     *                      property="avatar",
     *                      description="Ficheiro de imagem (jpeg, png, gif, webp, máx 5MB)",
     *                      type="string",
     *                      format="binary"
     *                  )
     *              )
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Avatar atualizado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Avatar uploaded successfully."),
     *              @OA\Property(property="avatar_url", type="string", format="url", example="http://localhost:8000/storage/avatars/...webp")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Erro de validação (tamanho, formato ou dimensões inválidas)"
     *      )
     * )
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'avatar' => [
                'required',
                'image',
                'mimes:jpeg,png,gif,webp',
                'max:5120',
                'dimensions:min_width=100,min_height=100,max_width=2000,max_height=2000',
            ],
        ]);

        $userId = $request->user()->id;
        $file = $validated['avatar'];

        $oldProfile = DB::table('user_profiles')->where('user_id', $userId)->first();
        if ($oldProfile && $oldProfile->avatar_url) {
            Storage::disk('public')->delete($oldProfile->avatar_url);
        }

        $path = $file->store("avatars/{$userId}", 'public');

        DB::table('user_profiles')->updateOrInsert(
            ['user_id' => $userId],
            [
                'avatar_url' => $path,
                'updated_at' => now(),
            ]
        );

        $url = ProfilePresenter::avatarPublicUrl($path);

        return response()->json([
            'message' => 'Avatar uploaded successfully.',
            'avatar_url' => $url,
        ]);
    }

    /**
     * @OA\Put(
     *      path="/profile/password",
     *      operationId="updatePassword",
     *      tags={"Profile"},
     *      summary="Alterar senha do perfil",
     *      description="Permite ao utilizador alterar a sua senha de acesso, revogando todas as outras sessões ativas.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"current_password", "password", "password_confirmation"},
     *              @OA\Property(property="current_password", type="string", format="password", example="OldPassword123!"),
     *              @OA\Property(property="password", type="string", format="password", example="NewPassword123!"),
     *              @OA\Property(property="password_confirmation", type="string", format="password", example="NewPassword123!")
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Senha alterada com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Password changed successfully. Other sessions have been revoked.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Validação incorreta de senhas"
     *      )
     * )
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
            ],
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password_hash)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
                'errors' => ['current_password' => ['The current password is incorrect.']],
            ], 422);
        }

        DB::transaction(function () use ($user, $validated, $request): void {
            $user->forceFill([
                'password_hash' => Hash::make($validated['password']),
            ])->save();

            $currentToken = $this->getCurrentSessionToken($request);

            if ($currentToken) {
                DB::table('user_sessions')
                    ->where('user_id', $user->id)
                    ->where('refresh_token', '!=', $currentToken)
                    ->delete();
            } else {
                DB::table('user_sessions')
                    ->where('user_id', $user->id)
                    ->where('expires_at', '<', now())
                    ->delete();
            }
        });

        return response()->json([
            'message' => 'Password changed successfully. Other sessions have been revoked.',
        ]);
    }

    private function getCurrentSessionToken(Request $request): ?string
    {
        $token = $request->bearerToken() ?? $request->header('X-Session-Token');

        if ($token) {
            $session = DB::table('user_sessions')
                ->where('refresh_token', $token)
                ->first();

            return $session?->refresh_token;
        }

        return null;
    }
}
