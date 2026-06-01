<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'display_name' => ['required', 'string', 'max:100'],
            'full_name' => ['nullable', 'string', 'max:255'],
            'institution' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:50'],
            'role' => ['nullable', 'in:estudante,investigador,professor'],
        ]);

        $payload = DB::transaction(function () use ($validated): array {
            $user = User::query()->create([
                'email' => $validated['email'],
                'password_hash' => $validated['password'],
                'email_verified' => false,
                'is_active' => true,
                'role' => $validated['role'] ?? 'estudante',
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

            $verificationToken = $this->createVerificationToken($user->id, 'email_verification', now()->addDays(3));

            return [
                'user' => $user,
                'verification_token' => $verificationToken,
            ];
        });

        $token = $this->issueSessionToken($payload['user']->id);

        return response()->json([
            'message' => 'Registered successfully.',
            'token' => $token,
            'verification_token' => $payload['verification_token'],
            'user' => $payload['user'],
        ], 201);
    }

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

        $user->forceFill(['last_login_at' => now()])->save();

        $token = $this->issueSessionToken($user->id);

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $token = $request->bearerToken() ?? $request->header('X-Session-Token');

        if (! is_string($token) || $token === '') {
            return response()->json(['message' => 'Token missing.'], 422);
        }

        $session = DB::table('user_sessions')->where('refresh_token', $token)->first();

        if ($session === null) {
            return response()->json(['message' => 'Invalid token.'], 422);
        }

        $newToken = $this->issueSessionToken($session->user_id);
        DB::table('user_sessions')->where('id', $session->id)->delete();

        return response()->json([
            'message' => 'Token refreshed.',
            'token' => $newToken,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->bearerToken() ?? $request->header('X-Session-Token');

        if (is_string($token) && $token !== '') {
            DB::table('user_sessions')->where('refresh_token', $token)->delete();
        }

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => $user,
            'profile' => DB::table('user_profiles')->where('user_id', $user->id)->first(),
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if ($user === null || ! $user->is_active) {
            return response()->json(['message' => 'If this email exists, a reset token has been generated.']);
        }

        $resetToken = $this->createVerificationToken($user->id, 'password_reset', now()->addHour());

        return response()->json([
            'message' => 'Password reset token generated.',
            'reset_token' => $resetToken,
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $verification = $this->findActiveVerificationToken($validated['token'], 'password_reset');

        if ($verification === null) {
            return response()->json(['message' => 'Invalid or expired token.'], 422);
        }

        DB::transaction(function () use ($verification, $validated): void {
            $user = User::query()->findOrFail($verification->user_id);
            $user->forceFill(['password_hash' => $validated['password']])->save();

            DB::table('verification_tokens')
                ->where('user_id', $user->id)
                ->where('type', 'password_reset')
                ->whereNull('used_at')
                ->update(['used_at' => now()]);
        });

        return response()->json(['message' => 'Password reset successfully.']);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $verification = $this->findActiveVerificationToken($validated['token'], 'email_verification');

        if ($verification === null) {
            return response()->json(['message' => 'Invalid or expired token.'], 422);
        }

        DB::transaction(function () use ($verification): void {
            $user = User::query()->findOrFail($verification->user_id);
            $user->forceFill(['email_verified' => true])->save();

            DB::table('verification_tokens')
                ->where('user_id', $user->id)
                ->where('type', 'email_verification')
                ->whereNull('used_at')
                ->update(['used_at' => now()]);
        });

        return response()->json(['message' => 'Email verified successfully.']);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if ($user === null) {
            return response()->json(['message' => 'If the account exists, a verification token was sent.']);
        }

        if ($user->email_verified) {
            return response()->json(['message' => 'Email is already verified.']);
        }

        $verificationToken = $this->createVerificationToken($user->id, 'email_verification', now()->addDays(3));

        return response()->json([
            'message' => 'Verification token generated.',
            'verification_token' => $verificationToken,
        ]);
    }

    private function createVerificationToken(string $userId, string $type, \DateTimeInterface $expiresAt): string
    {
        DB::table('verification_tokens')
            ->where('user_id', $userId)
            ->where('type', $type)
            ->whereNull('used_at')
            ->delete();

        $token = Str::random(80);

        DB::table('verification_tokens')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'token' => $token,
            'type' => $type,
            'expires_at' => $expiresAt,
            'used_at' => null,
            'created_at' => now(),
        ]);

        return $token;
    }

    private function findActiveVerificationToken(string $token, string $type): ?object
    {
        return DB::table('verification_tokens')
            ->where('token', $token)
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
} 