<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('CREATE INDEX idx_user_levels_points ON user_levels(total_points DESC)');
        DB::statement('CREATE INDEX idx_user_levels_weekly ON user_levels(weekly_points DESC)');
        DB::statement('CREATE INDEX idx_replies_topic ON topic_replies(topic_id, created_at ASC)');
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('DROP INDEX idx_user_levels_points ON user_levels');
        DB::statement('DROP INDEX idx_user_levels_weekly ON user_levels');
        DB::statement('DROP INDEX idx_replies_topic ON topic_replies');
    }
};