<?php

namespace App\Services;

use App\Models\LevelDefinition;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class LevelDefinitionService
{
    public function __construct(
        private readonly GamificationService $gamificationService
    ) {}

    public function getAll(): Collection
    {
        return LevelDefinition::orderBy('level')->get();
    }

    public function getByLevel(int $level): LevelDefinition
    {
        return LevelDefinition::where('level', $level)->firstOrFail();
    }

    public function create(array $data): LevelDefinition
    {
        $this->validateMinPointsZeroOnChanges(null, $data['min_points'] ?? null);

        $levelDefinition = DB::transaction(function () use ($data) {
            $level = LevelDefinition::create($data);
            $this->gamificationService->recalculateAllUserLevels();
            return $level;
        });

        return $levelDefinition;
    }

    public function update(int $level, array $data): LevelDefinition
    {
        $levelDefinition = $this->getByLevel($level);

        if (isset($data['min_points'])) {
            $this->validateMinPointsZeroOnChanges($level, $data['min_points']);
        }

        DB::transaction(function () use ($levelDefinition, $data) {
            $levelDefinition->update($data);
            $this->gamificationService->recalculateAllUserLevels();
        });

        return $levelDefinition->fresh();
    }

    public function delete(int $level): void
    {
        $levelDefinition = $this->getByLevel($level);

        // Prevent deletion of the last remaining level
        if (LevelDefinition::count() <= 1) {
            throw new \RuntimeException("Cannot delete the only remaining level definition.");
        }

        // Prevent deletion if it leaves the system without a level with min_points = 0
        if ((int) $levelDefinition->min_points === 0) {
            $hasAnotherZeroPointsLevel = LevelDefinition::where('level', '!=', $level)
                ->where('min_points', 0)
                ->exists();
            if (!$hasAnotherZeroPointsLevel) {
                throw new \RuntimeException("Cannot delete level definition because it would leave the system without a level starting at 0 points.");
            }
        }

        DB::transaction(function () use ($levelDefinition, $level) {
            $fallbackLevel = LevelDefinition::where('level', '!=', $level)->orderBy('level')->first()->level;
            DB::table('user_levels')->where('current_level', $level)->update(['current_level' => $fallbackLevel]);

            $levelDefinition->delete();
            $this->gamificationService->recalculateAllUserLevels();
        });
    }

    private function validateMinPointsZeroOnChanges(?int $editingLevel, ?int $newMinPoints): void
    {
        if ($newMinPoints === 0) {
            return;
        }

        $query = LevelDefinition::where('min_points', 0);
        if ($editingLevel !== null) {
            $query->where('level', '!=', $editingLevel);
        }

        if (!$query->exists()) {
            throw new \InvalidArgumentException("There must always be at least one level starting at 0 points.");
        }
    }
}
