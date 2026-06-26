<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leaderboard_snapshots', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('snapshot_date');
            $table->string('scope', 20)->default('nacional');
            $table->string('province', 50)->nullable();
            $table->integer('rank_position');
            $table->integer('total_points');
            $table->integer('quizzes_completed');
            $table->decimal('accuracy_pct', 5, 2)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['user_id', 'snapshot_date', 'scope', 'province'], 'uq_leaderboard_snapshots');
            $table->index(['snapshot_date', 'scope'], 'idx_snapshots_date');
        });

        Schema::create('leaderboard_nacional_cache', function (Blueprint $table) {
            $table->integer('rank_position');
            $table->uuid('user_id');
            $table->string('display_name', 100);
            $table->string('province', 50)->nullable();
            $table->string('avatar_url', 500)->nullable();
            $table->integer('total_points')->default(0);
            $table->integer('quizzes_completed')->default(0);
            $table->integer('weekly_points')->default(0);
            $table->integer('current_level')->default(1);
            $table->integer('prev_rank')->default(0);
            $table->timestamp('refreshed_at')->useCurrent();

            $table->primary('user_id');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->index('rank_position', 'idx_leaderboard_cache_rank');
        });

        if (DB::getDriverName() === 'mysql') {
            DB::unprepared('DROP VIEW IF EXISTS province_stats');
            DB::unprepared(<<<'SQL'
CREATE VIEW province_stats AS
SELECT
  up.province,
  COUNT(u.id) AS total_users,
  SUM(ul.total_points) AS total_points,
  CAST(AVG(ul.total_points) AS UNSIGNED) AS avg_points,
  MAX(ul.total_points) AS max_points,
  SUM(ul.quizzes_completed) AS total_quizzes,
  CAST(AVG(ul.current_level) AS DECIMAL(3,2)) AS avg_level
FROM users u
JOIN user_profiles up ON up.user_id = u.id
JOIN user_levels ul ON ul.user_id = u.id
WHERE u.is_active = 1
  AND up.province IS NOT NULL
GROUP BY up.province
SQL);

            DB::unprepared('DROP PROCEDURE IF EXISTS sp_refresh_leaderboard_nacional');
            DB::unprepared(<<<'SQL'
CREATE PROCEDURE sp_refresh_leaderboard_nacional()
BEGIN
  TRUNCATE TABLE leaderboard_nacional_cache;

  INSERT INTO leaderboard_nacional_cache (
    rank_position, user_id, display_name, province,
    avatar_url, total_points, quizzes_completed,
    weekly_points, current_level, prev_rank, refreshed_at
  )
  SELECT
    @rank := @rank + 1,
    u.id,
    up.display_name,
    up.province,
    up.avatar_url,
    ul.total_points,
    ul.quizzes_completed,
    ul.weekly_points,
    ul.current_level,
    COALESCE((
      SELECT ls.rank_position
      FROM leaderboard_snapshots ls
      WHERE ls.user_id = u.id
        AND ls.scope = 'nacional'
        AND ls.snapshot_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
      LIMIT 1
    ), 0),
    NOW()
  FROM users u
  JOIN user_profiles up ON up.user_id = u.id
  JOIN user_levels ul ON ul.user_id = u.id,
  (SELECT @rank := 0) AS r
  WHERE u.is_active = 1
  ORDER BY ul.total_points DESC, ul.quizzes_completed DESC;
END
SQL);

            // EVENT comentado — usar Laravel Scheduler em vez do MySQL Event Scheduler
            // DB::unprepared('DROP EVENT IF EXISTS evt_refresh_leaderboard');
            // DB::unprepared(<<<'SQL'
            // CREATE EVENT evt_refresh_leaderboard
            //   ON SCHEDULE EVERY 1 HOUR
            //   DO CALL sp_refresh_leaderboard_nacional()
            // SQL);
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::unprepared('DROP EVENT IF EXISTS evt_refresh_leaderboard');
            DB::unprepared('DROP PROCEDURE IF EXISTS sp_refresh_leaderboard_nacional');
            DB::unprepared('DROP VIEW IF EXISTS province_stats');
        }

        Schema::dropIfExists('leaderboard_nacional_cache');
        Schema::dropIfExists('leaderboard_snapshots');
    }
};