<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

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
            'province' => [
                'sometimes',
                'nullable',
                'string',
                'in:' . implode(',', [
                    'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
                    'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
                    'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico',
                    'Namibe', 'Uíge', 'Zaire'
                ]),
            ],
            'bio' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'website_url' => ['sometimes', 'nullable', 'string', 'max:500', 'url'],
            'research_areas' => ['sometimes', 'nullable', 'array', 'max:10'],
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

        // Delete old avatar if exists
        $oldProfile = DB::table('user_profiles')->where('user_id', $userId)->first();
        if ($oldProfile && $oldProfile->avatar_url) {
            // ✅ FIXED: avatar_url now contains path, not full URL
            Storage::disk('public')->delete($oldProfile->avatar_url);
        }

        // Store new avatar
        $path = $file->store("avatars/{$userId}", 'public');

        // ✅ FIXED: Save path instead of URL to database
        DB::table('user_profiles')->updateOrInsert(
            ['user_id' => $userId],
            [
                'avatar_url' => $path,  // Store relative path: "avatars/{user_id}/filename.jpg"
                'updated_at' => now(),
            ]
        );

        // Generate URL for response (frontend needs this)
        $url = Storage::disk('public')->url($path);

        return response()->json([
            'message' => 'Avatar uploaded successfully.',
            'avatar_url' => $url,  // Return full URL to frontend
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
                    ->mixedCase()      // Require uppercase and lowercase
                    ->numbers()        // Require numbers
                    ->symbols()        // Require symbols
                    ->uncompromised(), // Check against known breaches
            ],
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

            // ✅ FIXED: Safely revoke sessions with proper null check
            $currentToken = $this->getCurrentSessionToken();
            
            if ($currentToken) {
                // If we found current token, revoke all OTHER sessions
                DB::table('user_sessions')
                    ->where('user_id', $user->id)
                    ->where('refresh_token', '!=', $currentToken)
                    ->delete();
            } else {
                // If we couldn't identify current token, only revoke EXPIRED sessions
                // This prevents accidentally revoking the current session
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