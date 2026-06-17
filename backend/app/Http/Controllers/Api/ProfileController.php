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
