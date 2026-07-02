<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Drop the view before altering the table (essential for SQLite)
        if (DB::getDriverName() === 'mysql' || DB::getDriverName() === 'sqlite') {
            DB::unprepared('DROP VIEW IF EXISTS province_stats');
        }

        // 2. Perform table alterations
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->uuid('province_id')->nullable()->after('province');
            $table->foreign('province_id')->references('id')->on('provinces')->nullOnDelete();
        });

        // 3. Recreate the view after altering
        $this->createProvinceStatsView();

        // 4. Create pivot tables
        Schema::create('user_interest_areas', function (Blueprint $table) {
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('interest_area_id')->constrained('interest_areas')->cascadeOnDelete();
            $table->primary(['user_id', 'interest_area_id']);
        });

        Schema::create('document_interest_areas', function (Blueprint $table) {
            $table->foreignUuid('document_id')->constrained('documents')->cascadeOnDelete();
            $table->foreignUuid('interest_area_id')->constrained('interest_areas')->cascadeOnDelete();
            $table->primary(['document_id', 'interest_area_id']);
        });

        Schema::create('topic_interest_areas', function (Blueprint $table) {
            $table->foreignUuid('topic_id')->constrained('discussion_topics')->cascadeOnDelete();
            $table->foreignUuid('interest_area_id')->constrained('interest_areas')->cascadeOnDelete();
            $table->primary(['topic_id', 'interest_area_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('topic_interest_areas');
        Schema::dropIfExists('document_interest_areas');
        Schema::dropIfExists('user_interest_areas');

        // 1. Drop the view before altering the table (essential for SQLite)
        if (DB::getDriverName() === 'mysql' || DB::getDriverName() === 'sqlite') {
            DB::unprepared('DROP VIEW IF EXISTS province_stats');
        }

        // 2. Perform table alterations
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->dropForeign(['province_id']);
            $table->dropColumn('province_id');
        });

        // 3. Recreate the view
        $this->createProvinceStatsView();
    }

    private function createProvinceStatsView(): void
    {
        if (DB::getDriverName() === 'mysql') {
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
        } elseif (DB::getDriverName() === 'sqlite') {
            DB::unprepared(<<<'SQL'
CREATE VIEW province_stats AS
SELECT
  up.province,
  COUNT(u.id) AS total_users,
  SUM(ul.total_points) AS total_points,
  CAST(AVG(ul.total_points) AS INTEGER) AS avg_points,
  MAX(ul.total_points) AS max_points,
  SUM(ul.quizzes_completed) AS total_quizzes,
  CAST(AVG(ul.current_level) AS NUMERIC) AS avg_level
FROM users u
JOIN user_profiles up ON up.user_id = u.id
JOIN user_levels ul ON ul.user_id = u.id
WHERE u.is_active = 1
  AND up.province IS NOT NULL
GROUP BY up.province
SQL);
        }
    }
};
