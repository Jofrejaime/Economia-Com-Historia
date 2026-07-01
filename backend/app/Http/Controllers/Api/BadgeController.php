<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BadgeController extends Controller
{
    public function index(): JsonResponse
    {
        $badges = Badge::query()
            ->withCount('userBadges')
            ->orderBy('name')
            ->get()
            ->map(fn (Badge $badge) => $this->presentBadge($badge));

        $totalEarned = DB::table('user_badges')->count();

        return response()->json([
            'data' => $badges,
            'stats' => [
                'total' => $badges->count(),
                'active' => $badges->where('is_active', true)->count(),
                'earned' => $totalEarned,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatePayload($request);

        $badge = Badge::create([
            ...$validated,
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Badge criado com sucesso.',
            'data' => $this->presentBadge($badge->loadCount('userBadges')),
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $badge = Badge::query()->find($id);

        if ($badge === null) {
            return response()->json(['message' => 'Badge não encontrado.'], 404);
        }

        $validated = $this->validatePayload($request, $id);
        $badge->update($validated);

        return response()->json([
            'message' => 'Badge atualizado com sucesso.',
            'data' => $this->presentBadge($badge->loadCount('userBadges')),
        ]);
    }

    public function toggleStatus(string $id): JsonResponse
    {
        $badge = Badge::query()->find($id);

        if ($badge === null) {
            return response()->json(['message' => 'Badge não encontrado.'], 404);
        }

        $badge->update(['is_active' => ! $badge->is_active]);

        return response()->json([
            'message' => 'Estado do badge alterado.',
            'data' => $this->presentBadge($badge->loadCount('userBadges')),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $badge = Badge::query()->find($id);

        if ($badge === null) {
            return response()->json(['message' => 'Badge não encontrado.'], 404);
        }

        $badge->delete();

        return response()->json(['message' => 'Badge eliminado com sucesso.']);
    }

    private function validatePayload(Request $request, ?string $ignoreId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:badges,name' . ($ignoreId ? ",$ignoreId" : '')],
            'description' => ['required', 'string'],
            'icon_url' => ['nullable', 'string', 'max:500'],
            'color_hex' => ['nullable', 'string', 'max:7'],
            'category' => ['nullable', 'string', 'max:50'],
            'criteria_type' => ['required', 'in:points,quizzes,documents'],
            'criteria_value' => ['required', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ]);
    }

    private function presentBadge(Badge $badge): array
    {
        return [
            'id' => $badge->id,
            'name' => $badge->name,
            'description' => $badge->description,
            'icon_url' => $badge->icon_url,
            'color_hex' => $badge->color_hex,
            'category' => $badge->category,
            'criteria_type' => $badge->criteria_type,
            'criteria_value' => $badge->criteria_value,
            'is_active' => $badge->is_active,
            'earned_count' => $badge->user_badges_count ?? 0,
        ];
    }
}