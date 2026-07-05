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
use App\Services\GamificationService;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function __construct(
        private readonly GamificationService $gamification,
        private readonly \App\Services\MediaService $mediaService,
    ) {}
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
        $user = $request->user();
        $this->gamification->reconcileUserPoints($user);

        $profile = DB::table('user_profiles')->where('user_id', $user->id)->first();

        if (! $profile) {
            return response()->json(['message' => 'Profile not found.'], 404);
        }

        $userLevel = DB::table('user_levels')->where('user_id', $user->id)->first();
        $levelDefinition = null;
        if ($userLevel) {
            $levelDefinition = DB::table('level_definitions')
                ->where('level', $userLevel->current_level)
                ->first();
        }

        $badges = DB::table('user_badges as ub')
            ->join('badges as b', 'ub.badge_id', '=', 'b.id')
            ->where('ub.user_id', $user->id)
            ->select(
                'b.id',
                'b.name',
                'b.description',
                'b.icon_url',
                'b.color_hex',
                'b.category',
                'ub.earned_at'
            )
            ->orderByDesc('ub.earned_at')
            ->get();

        $interestAreas = $this->userInterestAreas($user->id);

        return response()->json([
            'profile' => ProfilePresenter::presentProfile($profile),
            'user_level' => $userLevel,
            'level_definition' => $levelDefinition,
            'badges' => $badges,
            'interest_areas' => $interestAreas,
        ]);
    }

    /**
     * Áreas de interesse seleccionadas pelo utilizador (tabela pivot
     * user_interest_areas), ordenadas por nome.
     */
    private function userInterestAreas(string $userId): \Illuminate\Support\Collection
    {
        return DB::table('user_interest_areas as uia')
            ->join('interest_areas as ia', 'uia.interest_area_id', '=', 'ia.id')
            ->where('uia.user_id', $userId)
            ->select('ia.id', 'ia.name', 'ia.slug')
            ->orderBy('ia.name')
            ->get();
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
            'interest_area_ids' => ['sometimes', 'nullable', 'array', 'max:10'],
            'interest_area_ids.*' => ['uuid', 'exists:interest_areas,id'],
        ]);

        $userId = $request->user()->id;
        $payload = $validated;

        if (array_key_exists('research_areas', $payload)) {
            $payload['research_areas'] = $payload['research_areas'] !== null
                ? json_encode($payload['research_areas'])
                : null;
        }

        $interestAreaIds = $payload['interest_area_ids'] ?? null;
        unset($payload['interest_area_ids']);

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

        if ($interestAreaIds !== null) {
            DB::transaction(function () use ($userId, $interestAreaIds): void {
                DB::table('user_interest_areas')->where('user_id', $userId)->delete();

                if ($interestAreaIds !== []) {
                    DB::table('user_interest_areas')->insert(array_map(
                        fn (string $areaId) => ['user_id' => $userId, 'interest_area_id' => $areaId],
                        $interestAreaIds
                    ));
                }
            });
        }

        $user = $request->user();
        $this->gamification->reconcileUserPoints($user);

        $userLevel = DB::table('user_levels')->where('user_id', $user->id)->first();
        $levelDefinition = null;
        if ($userLevel) {
            $levelDefinition = DB::table('level_definitions')
                ->where('level', $userLevel->current_level)
                ->first();
        }

        $badges = DB::table('user_badges as ub')
            ->join('badges as b', 'ub.badge_id', '=', 'b.id')
            ->where('ub.user_id', $user->id)
            ->select(
                'b.id',
                'b.name',
                'b.description',
                'b.icon_url',
                'b.color_hex',
                'b.category',
                'ub.earned_at'
            )
            ->orderByDesc('ub.earned_at')
            ->get();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'profile' => ProfilePresenter::presentProfile($updated),
            'user_level' => $userLevel,
            'level_definition' => $levelDefinition,
            'badges' => $badges,
            'interest_areas' => $this->userInterestAreas($userId),
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
                // dimensions rule requires GD/Imagick — omitted to avoid false 422s on environments without those extensions
            ],
        ]);

        $userId = $request->user()->id;
        $file = $validated['avatar'];

        // Sprint 18.4 — todo o upload passa pelo MediaService (pipeline único):
        // valida MIME real, gera thumbnail e remove o avatar antigo apenas
        // depois de o novo estar armazenado.
        $current = \App\Models\Media::where('model_type', 'user_profile')
            ->where('model_id', $userId)
            ->where('collection', 'avatar')
            ->first();

        $media = $this->mediaService->replace($current, $file, "avatars/{$userId}", [
            'kind'       => \App\Services\MediaService::KIND_IMAGE,
            'max_kb'     => 5120,
            'model_type' => 'user_profile',
            'model_id'   => $userId,
            'collection' => 'avatar',
            'created_by' => $userId,
        ]);

        // Limpeza do ficheiro legado (armazenado antes da tabela media existir).
        $oldProfile = DB::table('user_profiles')->where('user_id', $userId)->first();
        if ($oldProfile && $oldProfile->avatar_url && $oldProfile->avatar_url !== $media->path
            && ! str_starts_with($oldProfile->avatar_url, 'http')) {
            Storage::disk('public')->delete($oldProfile->avatar_url);
        }

        if ($oldProfile !== null) {
            DB::table('user_profiles')->where('user_id', $userId)->update([
                'avatar_url' => $media->path,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('user_profiles')->insert([
                'id'           => (string) Str::uuid(),
                'user_id'      => $userId,
                'display_name' => Str::before($request->user()->email, '@'),
                'avatar_url'   => $media->path,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
        }

        return response()->json([
            'message'    => 'Avatar uploaded successfully.',
            'avatar_url' => ProfilePresenter::avatarPublicUrl($media->path), // legacy
            'avatar'     => $this->mediaService->payload($media),
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
            // 'sometimes' allows recovery flow to omit current_password
            'current_password' => ['sometimes', 'string'],
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

        // Only verify current password when it was provided (normal flow).
        // Recovery flow omits it — identity was already verified via reset link.
        if (array_key_exists('current_password', $validated)) {
            if (! Hash::check($validated['current_password'], $user->password_hash)) {
                return response()->json([
                    'message' => 'Current password is incorrect.',
                    'errors' => ['current_password' => ['The current password is incorrect.']],
                ], 422);
            }
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
