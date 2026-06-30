<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    private const USER_ROLES = ['admin', 'professor', 'investigador', 'estudante'];

    public function __construct(private readonly DashboardService $dashboardService) {}

    public function summary(): JsonResponse
    {
        return response()->json([
            'data' => $this->dashboardService->summary(),
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['sometimes', 'string', 'max:255'],
            'role' => ['sometimes', 'in:'.implode(',', self::USER_ROLES)],
            'status' => ['sometimes', 'in:all,active,inactive,pending,blocked'],
        ]);

        $query = DB::table('users as u')
            ->leftJoin('user_profiles as up', 'up.user_id', '=', 'u.id')
            ->select(
                'u.id',
                'u.email',
                'u.email_verified',
                'u.is_active',
                'u.role',
                'u.created_at',
                'u.updated_at',
                'u.last_login_at',
                'up.display_name',
                'up.full_name',
                'up.institution',
                'up.province',
                'up.avatar_url',
                'up.bio',
                'up.website_url',
                'up.research_areas'
            );

        if (! empty($validated['search'])) {
            $search = '%'.trim($validated['search']).'%';
            $query->where(function ($builder) use ($search): void {
                $builder->where('u.email', 'like', $search)
                    ->orWhere('up.display_name', 'like', $search)
                    ->orWhere('up.full_name', 'like', $search)
                    ->orWhere('up.institution', 'like', $search);
            });
        }

        if (! empty($validated['role'])) {
            $query->where('u.role', $validated['role']);
        }

        if (! empty($validated['status']) && $validated['status'] !== 'all') {
            match ($validated['status']) {
                'active' => $query->where('u.is_active', true)->where('u.email_verified', true),
                'inactive' => $query->where('u.is_active', false),
                'pending' => $query->where('u.is_active', false)->where('u.email_verified', false),
                'blocked' => $query->where('u.is_active', false)->where('u.email_verified', true),
                default => null,
            };
        }

        $users = $query->orderByDesc('u.created_at')->limit(200)->get()->map(function (object $user): array {
            return [
                'id' => $user->id,
                'email' => $user->email,
                'email_verified' => (bool) $user->email_verified,
                'is_active' => (bool) $user->is_active,
                'role' => $user->role,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'last_login_at' => $user->last_login_at,
                'display_name' => $user->display_name,
                'full_name' => $user->full_name,
                'institution' => $user->institution,
                'province' => $user->province,
                'avatar_url' => $user->avatar_url,
                'bio' => $user->bio,
                'website_url' => $user->website_url,
                'research_areas' => $this->decodeResearchAreas($user->research_areas),
            ];
        });

        return response()->json(['data' => $users]);
    }

    public function updateUser(Request $request, string $id): JsonResponse
    {
        $user = DB::table('users')->where('id', $id)->first();

        if ($user === null) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$id],
            'role' => ['required', 'in:'.implode(',', self::USER_ROLES)],
            'email_verified' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
            'display_name' => ['required', 'string', 'max:100'],
            'full_name' => ['nullable', 'string', 'max:255'],
            'institution' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:50'],
            'avatar_url' => ['nullable', 'string', 'max:500'],
            'bio' => ['nullable', 'string'],
            'website_url' => ['nullable', 'string', 'max:500'],
            'research_areas' => ['nullable', 'array'],
            'research_areas.*' => ['string', 'max:100'],
        ]);

        DB::transaction(function () use ($id, $validated): void {
            DB::table('users')->where('id', $id)->update([
                'email' => $validated['email'],
                'role' => $validated['role'],
                'email_verified' => $validated['email_verified'],
                'is_active' => $validated['is_active'],
                'updated_at' => now(),
            ]);

            DB::table('user_profiles')->updateOrInsert(
                ['user_id' => $id],
                [
                    'id' => DB::table('user_profiles')->where('user_id', $id)->value('id') ?? (string) Str::uuid(),
                    'display_name' => $validated['display_name'],
                    'full_name' => $validated['full_name'] ?? null,
                    'institution' => $validated['institution'] ?? null,
                    'province' => $validated['province'] ?? null,
                    'avatar_url' => $validated['avatar_url'] ?? null,
                    'bio' => $validated['bio'] ?? null,
                    'website_url' => $validated['website_url'] ?? null,
                    'research_areas' => isset($validated['research_areas']) ? json_encode($validated['research_areas']) : null,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        });

        return response()->json([
            'message' => 'User updated successfully.',
            'data' => $this->findUserPayload($id),
        ]);
    }

    public function deleteUser(Request $request, string $id): JsonResponse
    {
        if ($request->user()->id === $id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $user = DB::table('users')->where('id', $id)->first();

        if ($user === null) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        DB::table('users')->where('id', $id)->delete();

        return response()->json(['message' => 'User deleted successfully.', 'id' => $id]);
    }

    private function findUserPayload(string $id): array
    {
        $user = DB::table('users as u')
            ->leftJoin('user_profiles as up', 'up.user_id', '=', 'u.id')
            ->where('u.id', $id)
            ->select(
                'u.id',
                'u.email',
                'u.email_verified',
                'u.is_active',
                'u.role',
                'u.created_at',
                'u.updated_at',
                'u.last_login_at',
                'up.display_name',
                'up.full_name',
                'up.institution',
                'up.province',
                'up.avatar_url',
                'up.bio',
                'up.website_url',
                'up.research_areas'
            )
            ->first();

        if ($user === null) {
            return [];
        }

        return [
            'id' => $user->id,
            'email' => $user->email,
            'email_verified' => (bool) $user->email_verified,
            'is_active' => (bool) $user->is_active,
            'role' => $user->role,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'last_login_at' => $user->last_login_at,
            'display_name' => $user->display_name,
            'full_name' => $user->full_name,
            'institution' => $user->institution,
            'province' => $user->province,
            'avatar_url' => $user->avatar_url,
            'bio' => $user->bio,
            'website_url' => $user->website_url,
            'research_areas' => $this->decodeResearchAreas($user->research_areas),
        ];
    }

    private function decodeResearchAreas(mixed $value): ?array
    {
        if ($value === null) {
            return null;
        }

        if (is_array($value)) {
            return $value;
        }

        $decoded = json_decode((string) $value, true);

        return is_array($decoded) ? $decoded : null;
    }

}
