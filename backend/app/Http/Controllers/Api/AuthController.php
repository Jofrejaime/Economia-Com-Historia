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

        $user = DB::transaction(function () use ($validated): User {
            $user = User::query()->create([
                'email' => $validated['email'],
                'password_hash' => Hash::make($validated['password']),
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

            return $user;
        });

        $token = $this->issueSessionToken($user->id);

        return response()->json([
            'message' => 'Registered successfully.',
            'token' => $token,
            'user' => $user,
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

    public function forgotPassword(): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.'], 501);
    }

    public function resetPassword(): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.'], 501);
    }

    public function verifyEmail(): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.'], 501);
    }

    public function resendVerification(): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.'], 501);
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