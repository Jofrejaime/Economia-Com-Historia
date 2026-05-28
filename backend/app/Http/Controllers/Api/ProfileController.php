<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'profile' => DB::table('user_profiles')->where('user_id', $request->user()->id)->first(),
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
            'website_url' => ['sometimes', 'nullable', 'string', 'max:500'],
            'research_areas' => ['sometimes', 'nullable', 'array'],
        ]);

        DB::table('user_profiles')->updateOrInsert(
            ['user_id' => $request->user()->id],
            array_merge($validated, ['updated_at' => now()])
        );

        return response()->json(['message' => 'Profile updated.']);
    }

    public function updateAvatar(): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.'], 501);
    }

    public function updatePassword(): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.'], 501);
    }
}