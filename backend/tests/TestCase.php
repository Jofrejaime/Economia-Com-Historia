<?php

namespace Tests;

use Database\Seeders\LevelDefinitionsSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (
            Schema::hasTable('level_definitions')
            && DB::table('level_definitions')->count() === 0
        ) {
            $this->seed(LevelDefinitionsSeeder::class);
        }
    }
}
