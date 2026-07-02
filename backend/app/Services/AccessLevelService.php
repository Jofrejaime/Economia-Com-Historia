<?php

namespace App\Services;

use App\Models\AccessLevel;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AccessLevelService
{
    public function getAll(): Collection
    {
        return AccessLevel::orderBy('id')->get();
    }

    public function getById(string $id): AccessLevel
    {
        return AccessLevel::where('id', $id)->firstOrFail();
    }

    public function create(array $data): AccessLevel
    {
        return AccessLevel::create($data);
    }

    public function update(string $id, array $data): AccessLevel
    {
        $accessLevel = $this->getById($id);
        $accessLevel->update($data);
        return $accessLevel->fresh();
    }

    public function delete(string $id): void
    {
        $level = $this->getById($id);

        if (DB::table('user_access_grants')->where('access_level_id', $id)->exists()) {
            throw new \RuntimeException("Cannot delete Access Level [{$id}] because it is currently granted to users.");
        }

        if (DB::table('user_access_requests')->where('access_level_id', $id)->exists()) {
            throw new \RuntimeException("Cannot delete Access Level [{$id}] because there are access requests referencing it.");
        }

        if (DB::table('documents')->where('access_level_id', $id)->exists()) {
            throw new \RuntimeException("Cannot delete Access Level [{$id}] because it is assigned to documents.");
        }

        if (DB::table('quizzes')->where('access_level_id', $id)->exists()) {
            throw new \RuntimeException("Cannot delete Access Level [{$id}] because it is assigned to quizzes.");
        }

        if (DB::table('community_categories')->where('access_level_id', $id)->exists()) {
            throw new \RuntimeException("Cannot delete Access Level [{$id}] because it is assigned to community categories.");
        }

        $level->delete();
    }
}
