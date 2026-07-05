<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use OpenApi\Annotations as OA;

use App\Mail\EmailVerificationMail;
use App\Mail\PasswordResetMail;
use App\Models\User;
use App\Support\AngolaProvinces;
use App\Support\FrontendUrl;
use App\Support\ProfilePresenter;
use App\Support\VerificationTokenType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    private const REGISTERABLE_ROLES = ['estudante', 'investigador', 'professor'];

    /**
     * @OA\Post(
     *      path="/auth/register",
     *      operationId="register",
     *      tags={"Authentication"},
     *      summary="Registar um novo utilizador",
     *      description="Regista um novo utilizador no sistema com perfil e níveis iniciais, e envia email de verificação.",
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"email", "password", "password_confirmation", "display_name"},
     *              @OA\Property(property="email", type="string", format="email", example="user@example.com"),
     *              @OA\Property(property="password", type="string", format="password", example="Password123!"),
     *              @OA\Property(property="password_confirmation", type="string", format="password", example="Password123!"),
     *              @OA\Property(property="display_name", type="string", maxLength=100, example="João Silva"),
     *              @OA\Property(property="full_name", type="string", maxLength=255, nullable=true, example="João Maria Silva"),
     *              @OA\Property(property="institution", type="string", maxLength=255, nullable=true, example="ISPTEC"),
     *              @OA\Property(property="province", type="string", nullable=true, example="Luanda"),
     *              @OA\Property(property="role", type="string", enum={"estudante", "investigador", "professor"}, nullable=true, example="estudante")
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Registo efetuado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Registered successfully. Please verify your email."),
     *              @OA\Property(property="token", type="string", example="session_token_example"),
     *              @OA\Property(property="user", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Dados de validação inválidos"
     *      )
     * )
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
            ],
            'display_name' => ['required', 'string', 'max:100'],
            'full_name' => ['nullable', 'string', 'max:255'],
            'institution' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', AngolaProvinces::validationRule()],
            'role' => ['nullable', 'in:'.implode(',', self::REGISTERABLE_ROLES)],
        ]);

        $role = in_array($validated['role'] ?? 'estudante', self::REGISTERABLE_ROLES, true)
            ? ($validated['role'] ?? 'estudante')
            : 'estudante';

        $payload = DB::transaction(function () use ($validated, $role): array {
            $user = User::query()->create([
                'email' => $validated['email'],
                'password_hash' => $validated['password'],
                'email_verified' => false,
                'is_active' => true,
                'role' => $role,
            ]);

            DB::table('user_profiles')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'display_name' => $validated['display_name'],
                'full_name' => $validated['full_name'] ?? null,
                'institution' => $validated['institution'] ?? null,
                'province' => $validated['province'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('user_levels')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'current_level' => 1,
                'total_points' => 0,
                'weekly_points' => 0,
                'monthly_points' => 0,
                'quizzes_completed' => 0,
                'documents_read' => 0,
                'topics_created' => 0,
                'replies_posted' => 0,
                'updated_at' => now(),
            ]);

            $verificationToken = $this->createVerificationToken(
                $user->id,
                VerificationTokenType::EMAIL_VERIFICATION,
                now()->addDays(3),
            );

            return [
                'user' => $user,
                'verification_token' => $verificationToken,
            ];
        });

        $emailSent = $this->sendVerificationEmail($payload['user'], $payload['verification_token']);

        $token = $this->issueSessionToken($payload['user']->id);

        $response = [
            'message' => $emailSent
                ? 'Registered successfully. Please verify your email.'
                : 'Registered successfully. We could not send the verification email; use resend verification.',
            'token' => $token,
            'user' => $payload['user'],
        ];

        if ($this->shouldExposeVerificationToken()) {
            $response['verification_token'] = $payload['verification_token'];
        }

        return response()->json($response, 201);
    }

    /**
     * @OA\Post(
     *      path="/auth/login",
     *      operationId="login",
     *      tags={"Authentication"},
     *      summary="Efetuar login",
     *      description="Autentica um utilizador com as suas credenciais e retorna um token de sessão.",
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"email", "password"},
     *              @OA\Property(property="email", type="string", format="email", example="user@example.com"),
     *              @OA\Property(property="password", type="string", format="password", example="Password123!")
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Login efetuado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Login successful."),
     *              @OA\Property(property="token", type="string", example="session_token_example"),
     *              @OA\Property(property="user", type="object"),
     *              @OA\Property(property="profile", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Conta desativada ou email não verificado"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Credenciais inválidas"
     *      )
     * )
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if ($user === null || ! Hash::check($validated['password'], $user->password_hash)) {
            return response()->json(['message' => 'Invalid credentials.'], 422);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'This account has been deactivated.'], 403);
        }

        if (config('auth.api.require_email_verification') && ! $user->email_verified) {
            return response()->json([
                'message' => 'Please verify your email before logging in.',
            ], 403);
        }

        $user->forceFill(['last_login_at' => now()])->save();

        $token = $this->issueSessionToken($user->id);
        $profile = DB::table('user_profiles')->where('user_id', $user->id)->first();

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'user' => $user,
            'profile' => ProfilePresenter::presentProfile($profile),
        ]);
    }

    /**
     * @OA\Post(
     *      path="/auth/refresh",
     *      operationId="refresh",
     *      tags={"Authentication"},
     *      summary="Renovar token de sessão",
     *      description="Gera um novo token de sessão substituindo o atual.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Token renovado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Token refreshed."),
     *              @OA\Property(property="token", type="string", example="new_session_token_example")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Sessão expirada"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Token inválido ou ausente"
     *      )
     * )
     */
    public function refresh(Request $request): JsonResponse
    {
        $token = $this->extractBearerOrSessionToken($request);

        if ($token === null) {
            return response()->json(['message' => 'Token missing.'], 422);
        }

        $session = DB::table('user_sessions')->where('refresh_token', $token)->first();

        if ($session === null) {
            return response()->json(['message' => 'Invalid token.'], 422);
        }

        if ($session->expires_at <= now()) {
            DB::table('user_sessions')->where('id', $session->id)->delete();

            return response()->json(['message' => 'Session expired.'], 401);
        }

        $newToken = $this->issueSessionToken($session->user_id);
        DB::table('user_sessions')->where('id', $session->id)->delete();

        return response()->json([
            'message' => 'Token refreshed.',
            'token' => $newToken,
        ]);
    }

    /**
     * @OA\Post(
     *      path="/auth/logout",
     *      operationId="logout",
     *      tags={"Authentication"},
     *      summary="Terminar sessão",
     *      description="Invalida o token de sessão ativo.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Terminou sessão com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Logged out.")
     *          )
     *      )
     * )
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $this->extractBearerOrSessionToken($request);

        if ($token !== null) {
            DB::table('user_sessions')->where('refresh_token', $token)->delete();
        }

        return response()->json(['message' => 'Logged out.']);
    }

    /**
     * @OA\Get(
     *      path="/me",
     *      operationId="me",
     *      tags={"Authentication"},
     *      summary="Obter dados do utilizador autenticado",
     *      description="Retorna o perfil do utilizador autenticado, as permissões de acesso, o nível atual e as medalhas (badges).",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Detalhes do perfil obtidos com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="user", type="object"),
     *              @OA\Property(property="profile", type="object"),
     *              @OA\Property(property="access_grants", type="array", @OA\Items(type="object")),
     *              @OA\Property(property="user_level", type="object"),
     *              @OA\Property(property="level_definition", type="object"),
     *              @OA\Property(property="badges", type="array", @OA\Items(type="object"))
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      )
     * )
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $user->id;

        $profile = DB::table('user_profiles')->where('user_id', $userId)->first();

        $accessGrants = DB::table('user_access_grants as uag')
            ->join('access_levels as al', 'uag.access_level_id', '=', 'al.id')
            ->where('uag.user_id', $userId)
            ->whereNull('uag.revoked_at')
            ->select(
                'uag.id',
                'uag.user_id',
                'uag.access_level_id',
                'uag.granted_at',
                'al.name as access_level_name',
                'al.description as access_level_description'
            )
            ->get();

        $userLevel = DB::table('user_levels')->where('user_id', $userId)->first();

        $levelDefinition = null;
        if ($userLevel) {
            $levelDefinition = DB::table('level_definitions')
                ->where('level', $userLevel->current_level)
                ->first();
        }

        $badges = DB::table('user_badges as ub')
            ->join('badges as b', 'ub.badge_id', '=', 'b.id')
            ->where('ub.user_id', $userId)
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
            'user' => $user,
            'profile' => ProfilePresenter::presentProfile($profile),
            'access_grants' => $accessGrants,
            'user_level' => $userLevel,
            'level_definition' => $levelDefinition,
            'badges' => $badges,
        ]);
    }

    /**
     * @OA\Get(
     *      path="/auth/sessions",
     *      operationId="sessions",
     *      tags={"Authentication"},
     *      summary="Listar sessões ativas",
     *      description="Obtém uma lista de todas as sessões ativas do utilizador autenticado.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Lista de sessões obtida com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(
     *                  @OA\Property(property="id", type="string", format="uuid", example="uuid-string"),
     *                  @OA\Property(property="ip_address", type="string", format="ipv4", example="127.0.0.1"),
     *                  @OA\Property(property="user_agent", type="string", example="Mozilla/5.0..."),
     *                  @OA\Property(property="expires_at", type="string", format="date-time", example="2026-07-23T14:32:06Z"),
     *                  @OA\Property(property="created_at", type="string", format="date-time", example="2026-06-23T14:32:06Z"),
     *                  @OA\Property(property="is_current", type="boolean", example=true)
     *              ))
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      )
     * )
     */
    public function sessions(Request $request): JsonResponse
    {
        $currentToken = $this->extractBearerOrSessionToken($request);

        $sessions = DB::table('user_sessions')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function (object $session) use ($currentToken): array {
                return [
                    'id' => $session->id,
                    'ip_address' => $session->ip_address,
                    'user_agent' => $session->user_agent,
                    'expires_at' => $session->expires_at,
                    'created_at' => $session->created_at,
                    'is_current' => $currentToken !== null && $session->refresh_token === $currentToken,
                ];
            });

        return response()->json(['data' => $sessions]);
    }

    /**
     * @OA\Delete(
     *      path="/auth/sessions/{id}",
     *      operationId="destroySession",
     *      tags={"Authentication"},
     *      summary="Revogar uma sessão ativa",
     *      description="Encerra uma sessão específica do utilizador.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID da sessão a revogar",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Sessão revogada com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Session revoked."),
     *              @OA\Property(property="id", type="string", example="session-id")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Sessão não encontrada"
     *      )
     * )
     */
    public function destroySession(Request $request, string $id): JsonResponse
    {
        $session = DB::table('user_sessions')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($session === null) {
            return response()->json(['message' => 'Session not found.'], 404);
        }

        DB::table('user_sessions')->where('id', $id)->delete();

        return response()->json(['message' => 'Session revoked.', 'id' => $id]);
    }

    /**
     * @OA\Delete(
     *      path="/auth/sessions/others",
     *      operationId="destroyOtherSessions",
     *      tags={"Authentication"},
     *      summary="Revogar outras sessões ativas",
     *      description="Encerra todas as outras sessões ativas do utilizador, mantendo apenas a atual.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Outras sessões revogadas com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Other sessions revoked."),
     *              @OA\Property(property="revoked_count", type="integer", example=2)
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      )
     * )
     */
    public function destroyOtherSessions(Request $request): JsonResponse
    {
        $currentToken = $this->extractBearerOrSessionToken($request);

        $query = DB::table('user_sessions')->where('user_id', $request->user()->id);

        if ($currentToken !== null) {
            $query->where('refresh_token', '!=', $currentToken);
        }

        $deleted = $query->delete();

        return response()->json([
            'message' => 'Other sessions revoked.',
            'revoked_count' => $deleted,
        ]);
    }

    /**
     * @OA\Post(
     *      path="/auth/forgot-password",
     *      operationId="forgotPassword",
     *      tags={"Authentication"},
     *      summary="Solicitar recuperação de senha",
     *      description="Envia um link de recuperação para o email indicado se este existir.",
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"email"},
     *              @OA\Property(property="email", type="string", format="email", example="user@example.com")
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Solicitação efetuada (mensagem de sucesso padrão por segurança)",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="If this email exists, a reset link has been sent.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Erro de validação"
     *      ),
     *      @OA\Response(
     *          response=500,
     *          description="Erro de envio de email"
     *      )
     * )
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if ($user === null || ! $user->is_active) {
            return response()->json(['message' => 'If this email exists, a reset link has been sent.']);
        }

        $expireMinutes = (int) config('auth.passwords.users.expire', 30);

        $resetToken = $this->createVerificationToken(
            $user->id,
            VerificationTokenType::PASSWORD_RESET,
            now()->addMinutes($expireMinutes),
        );
        $profile = DB::table('user_profiles')->where('user_id', $user->id)->first();
        $recipientName = $profile->display_name ?? $user->email;

        $resetUrl = FrontendUrl::build('/auth/reset-password',  ['token' => $resetToken]);

        try {
            Mail::to($user->email)->send(new PasswordResetMail(
                $recipientName,
                $resetUrl,
                $expireMinutes,
            ));
        } catch (\Throwable $exception) {
            DB::table('verification_tokens')
                ->where('user_id', $user->id)
                ->where('type', VerificationTokenType::PASSWORD_RESET)
                ->whereNull('used_at')
                ->delete();

            Log::error('Failed to send password reset email.', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Nao foi possivel enviar o email de recuperacao. Tente novamente daqui a instantes.',
            ], 500);
        }

        return response()->json([
            'message' => 'If this email exists, a reset link has been sent.',
        ]);
    }

    /**
     * @OA\Post(
     *      path="/auth/reset-password",
     *      operationId="resetPassword",
     *      tags={"Authentication"},
     *      summary="Redefinir senha",
     *      description="Altera a senha do utilizador utilizando o token recebido por email.",
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"token", "password", "password_confirmation"},
     *              @OA\Property(property="token", type="string", example="reset_token_here"),
     *              @OA\Property(property="password", type="string", format="password", example="NewPassword123!"),
     *              @OA\Property(property="password_confirmation", type="string", format="password", example="NewPassword123!")
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Senha redefinida com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Password reset successfully.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Token inválido, expirado ou erro de validação"
     *      )
     * )
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
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

        $verification = $this->findActiveVerificationToken(
            $validated['token'],
            VerificationTokenType::PASSWORD_RESET,
        );

        if ($verification === null)
        {
            return response()->json(['message' => 'Invalid or expired token.'], 422);
        }

        DB::transaction(function () use ($verification, $validated): void {
            $user = User::query()->findOrFail($verification->user_id);
            $user->forceFill(['password_hash' => $validated['password']])->save();

            // Invalida todos os tokens de recuperação pendentes do utilizador
            DB::table('verification_tokens')
                ->where('user_id', $user->id)
                ->where('type', VerificationTokenType::PASSWORD_RESET)
                ->whereNull('used_at')
                ->update(['used_at' => now()]);

            // Invalida todas as sessões ativas (tokens de sessão) do utilizador
            DB::table('user_sessions')
                ->where('user_id', $user->id)
                ->delete();
        });

        return response()->json(['message' => 'Password reset successfully.']);
    }

    /**
     * @OA\Post(
     *      path="/auth/verify-email",
     *      operationId="verifyEmail",
     *      tags={"Authentication"},
     *      summary="Confirmar endereço de email",
     *      description="Valida a conta de utilizador através do token recebido.",
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"token"},
     *              @OA\Property(property="token", type="string", example="verification_token_here")
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Email verificado com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Email verified successfully.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Token inválido ou expirado"
     *      )
     * )
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $verification = $this->findActiveVerificationToken(
            $validated['token'],
            VerificationTokenType::EMAIL_VERIFICATION,
        );

        if ($verification === null) {
            return response()->json(['message' => 'Invalid or expired token.'], 422);
        }

        DB::transaction(function () use ($verification): void {
            $user = User::query()->findOrFail($verification->user_id);
            $user->forceFill(['email_verified' => true])->save();

            DB::table('verification_tokens')
                ->where('user_id', $user->id)
                ->where('type', VerificationTokenType::EMAIL_VERIFICATION)
                ->whereNull('used_at')
                ->update(['used_at' => now()]);
        });

        return response()->json(['message' => 'Email verified successfully.']);
    }

    /**
     * @OA\Post(
     *      path="/auth/resend-verification",
     *      operationId="resendVerification",
     *      tags={"Authentication"},
     *      summary="Reenviar email de verificação",
     *      description="Solicita novo email de validação de conta.",
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"email"},
     *              @OA\Property(property="email", type="string", format="email", example="user@example.com")
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Email enviado",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="If the account exists, a verification email was sent.")
     *          )
     *      )
     * )
     */
    public function resendVerification(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if ($user === null) {
            return response()->json(['message' => 'If the account exists, a verification email was sent.']);
        }

        if ($user->email_verified) {
            return response()->json(['message' => 'Email is already verified.']);
        }

        $verificationToken = $this->createVerificationToken(
            $user->id,
            VerificationTokenType::EMAIL_VERIFICATION,
            now()->addDays(3),
        );

        $this->sendVerificationEmail($user, $verificationToken);

        $response = [
            'message' => 'If the account exists, a verification email was sent.',
        ];

        if ($this->shouldExposeVerificationToken()) {
            $response['verification_token'] = $verificationToken;
        }

        return response()->json($response);
    }

    private function sendVerificationEmail(User $user, string $verificationToken): bool
    {
        $profile = DB::table('user_profiles')->where('user_id', $user->id)->first();
        $recipientName = $profile->display_name ?? $user->email;

        $verificationUrl = FrontendUrl::build('/auth/verify-email', ['token' => $verificationToken]);

        try {
            Mail::to($user->email)->send(new EmailVerificationMail(
                $recipientName,
                $verificationUrl,
                3,
            ));

            return true;
        } catch (\Throwable $exception) {
            Log::error('Failed to send verification email.', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $exception->getMessage(),
            ]);

            return false;
        }
    }

    private function shouldExposeVerificationToken(): bool
    {
        $configured = config('auth.api.expose_verification_token');

        if ($configured !== null) {
            return filter_var($configured, FILTER_VALIDATE_BOOLEAN);
        }

        return app()->environment('local', 'testing');
    }

    private function createVerificationToken(string $userId, string $type, \DateTimeInterface $expiresAt): string
    {
        DB::table('verification_tokens')
            ->where('user_id', $userId)
            ->where('type', $type)
            ->whereNull('used_at')
            ->delete();

        $token = Str::random(80);
        $hashedToken = hash('sha256', $token);

        DB::table('verification_tokens')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'token' => $hashedToken,
            'type' => $type,
            'expires_at' => $expiresAt,
            'used_at' => null,
            'created_at' => now(),
        ]);

        return $token;
    }

    private function findActiveVerificationToken(string $token, string $type): ?object
    {
        $hashedToken = hash('sha256', $token);

        return DB::table('verification_tokens')
            ->where('token', $hashedToken)
            ->where('type', $type)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->first();
    }

    private function issueSessionToken(string $userId): string
    {
        $token = Str::random(80);

        DB::table('user_sessions')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'refresh_token' => $token,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'expires_at' => now()->addDays(30),
            'created_at' => now(),
        ]);

        return $token;
    }

    private function extractBearerOrSessionToken(Request $request): ?string
    {
        $bearerToken = $request->bearerToken();

        if (is_string($bearerToken) && $bearerToken !== '') {
            return $bearerToken;
        }

        $headerToken = $request->header('X-Session-Token');

        if (is_string($headerToken) && $headerToken !== '') {
            return $headerToken;
        }

        return null;
    }
}
