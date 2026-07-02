<?php

namespace App\Services;

use App\Models\AccessLevel;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AccessLevelService
{
    private const CACHE_KEY_ALL = 'access_levels:all';

    public function getAll(): Collection
    {
        $rows = Cache::remember(self::CACHE_KEY_ALL, now()->addDay(), function () {
            return AccessLevel::orderBy('id')->get()->toArray();
        });

        return AccessLevel::hydrate($rows);
    }

    public function getById(string $id): AccessLevel
    {
        return AccessLevel::where('id', $id)->firstOrFail();
    }

    public function create(array $data): AccessLevel
    {
        return DB::transaction(function () use ($data) {
            $level = AccessLevel::create($data);
            Cache::forget(self::CACHE_KEY_ALL);
            return $level;
        });
    }

    public function update(string $id, array $data): AccessLevel
    {
        $accessLevel = $this->getById($id);

        return DB::transaction(function () use ($accessLevel, $data) {
            $accessLevel->update($data);
            Cache::forget(self::CACHE_KEY_ALL);
            return $accessLevel->fresh();
        });
    }

    public function delete(string $id): void
    {
        $level = $this->getById($id);

        if (AccessLevel::count() <= 1) {
            throw new \RuntimeException("Cannot delete the only remaining Access Level.");
        }

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

        DB::transaction(function () use ($level) {
            $level->delete();
            Cache::forget(self::CACHE_KEY_ALL);
        });
    }
}