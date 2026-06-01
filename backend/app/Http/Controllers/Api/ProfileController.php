<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $profile = DB::table('user_profiles')->where('user_id', $userId)->first();

        if (!$profile) {
            return response()->json(['message' => 'Profile not found.'], 404);
        }

        return response()->json([
            'profile' => $profile,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'display_name' => ['sometimes', 'string', 'max:100'],
            'full_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'institution' => ['sometimes', 'nullable', 'string', 'max:255'],
            'province' => ['sometimes', 'nullable', 'string', 'max:50'],
            'bio' => ['sometimes', 'nullable', 'string'],
            'website_url' => ['sometimes', 'nullable', 'string', 'max:500', 'url'],
            'research_areas' => ['sometimes', 'nullable', 'array'],
            'research_areas.*' => ['string', 'max:100'],
        ]);

        DB::table('user_profiles')->updateOrInsert(
            ['user_id' => $request->user()->id],
            array_merge($validated, ['updated_at' => now()])
        );

        $updated = DB::table('user_profiles')->where('user_id', $request->user()->id)->first();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'profile' => $updated,
        ]);
    }

    public function updateAvatar(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,gif,webp', 'max:5120'],
        ]);

        $userId = $request->user()->id;
        $file = $validated['avatar'];

        // Delete old avatar if exists
        $oldProfile = DB::table('user_profiles')->where('user_id', $userId)->first();
        if ($oldProfile && $oldProfile->avatar_url) {
            Storage::disk('public')->delete($oldProfile->avatar_url);
        }

        // Store new avatar
        $path = $file->store("avatars/{$userId}", 'public');
        $url = Storage::disk('public')->url($path);

        DB::table('user_profiles')->updateOrInsert(
            ['user_id' => $userId],
            [
                'avatar_url' => $url,
                'updated_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Avatar uploaded successfully.',
            'avatar_url' => $url,
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password_hash)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
                'errors' => ['current_password' => ['The current password is incorrect.']],
            ], 422);
        }

        // Update password
        DB::transaction(function () use ($user, $validated): void {
            $user->forceFill([
                'password_hash' => Hash::make($validated['password']),
            ])->save();

            // Revoke all existing sessions except current
            $currentToken = $this->getCurrentSessionToken();
            DB::table('user_sessions')
                ->where('user_id', $user->id)
                ->where('refresh_token', '!=', $currentToken)
                ->delete();
        });

        return response()->json([
            'message' => 'Password changed successfully. Other sessions have been revoked.',
        ]);
    }

    private function getCurrentSessionToken(): ?string
    {
        $token = request()->bearerToken() ?? request()->header('X-Session-Token');
        
        if ($token) {
            $session = DB::table('user_sessions')
                ->where('refresh_token', $token)
                ->first();
            
            return $session?->refresh_token;
        }
        
        return null;
    }
}