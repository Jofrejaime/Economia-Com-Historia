<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('access_levels', function (Blueprint $table) {
            $table->string('id', 20)->primary();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->string('icon', 10)->nullable();
            $table->string('color_bg', 7)->nullable();
            $table->string('color_text', 7)->nullable();
            $table->boolean('requires_approval')->default(false);
            $table->boolean('auto_grant')->default(false);
        });

        DB::table('access_levels')->insert([
            ['id' => 'public', 'name' => 'Público', 'description' => 'Acesso automático ao solicitar', 'icon' => null, 'color_bg' => null, 'color_text' => null, 'requires_approval' => 0, 'auto_grant' => 1],
            ['id' => 'jindungo', 'name' => 'Jindungo', 'description' => 'Conteúdo premium/privado', 'icon' => '🔥', 'color_bg' => '#ffd6a5', 'color_text' => '#4a2c00', 'requires_approval' => 0, 'auto_grant' => 0],
            ['id' => 'restricted', 'name' => 'Restrito', 'description' => 'Requer validação manual', 'icon' => '🔒', 'color_bg' => '#ffb3ba', 'color_text' => '#5c0011', 'requires_approval' => 1, 'auto_grant' => 0],
        ]);

        Schema::create('user_access_requests', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('access_level_id', 20);
            $table->string('status', 20)->default('pending');
            $table->text('justification')->nullable();
            $table->foreignUuid('reviewed_by')->nullable()->constrained('users');
            $table->dateTime('reviewed_at')->nullable();
            $table->text('review_notes')->nullable();
            $table->dateTime('expires_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('access_level_id')->references('id')->on('access_levels');
            $table->index(['user_id', 'access_level_id'], 'idx_access_requests_user_level');
        });

        Schema::create('user_access_grants', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('access_level_id', 20);
            $table->foreignUuid('granted_by')->nullable()->constrained('users');
            $table->foreignUuid('request_id')->nullable()->constrained('user_access_requests');
            $table->dateTime('granted_at')->useCurrent();
            $table->dateTime('expires_at')->nullable();
            $table->dateTime('revoked_at')->nullable();
            $table->boolean('is_active')->default(true);

            $table->foreign('access_level_id')->references('id')->on('access_levels');
            $table->unique(['user_id', 'access_level_id'], 'uq_access_grants');
        });

        if (DB::getDriverName() === 'mysql') {
            DB::unprepared(<<<'SQL'
CREATE TRIGGER trg_access_grants_before_insert
BEFORE INSERT ON user_access_grants
FOR EACH ROW
BEGIN
  IF NEW.revoked_at IS NOT NULL OR (NEW.expires_at IS NOT NULL AND NEW.expires_at <= NOW()) THEN
    SET NEW.is_active = 0;
  ELSE
    SET NEW.is_active = 1;
  END IF;
END
SQL);

            DB::unprepared(<<<'SQL'
CREATE TRIGGER trg_access_grants_before_update
BEFORE UPDATE ON user_access_grants
FOR EACH ROW
BEGIN
  IF NEW.revoked_at IS NOT NULL OR (NEW.expires_at IS NOT NULL AND NEW.expires_at <= NOW()) THEN
    SET NEW.is_active = 0;
  ELSE
    SET NEW.is_active = 1;
  END IF;
END
SQL);
        }

        Schema::create('level_definitions', function (Blueprint $table) {
            $table->integer('level')->primary();
            $table->string('name', 100);
            $table->integer('min_points')->default(0);
            $table->integer('max_points')->nullable();
            $table->string('color_hex', 7)->nullable();
            $table->string('icon_url', 500)->nullable();
            $table->json('perks')->nullable();
        });

        Schema::create('user_levels', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->integer('current_level')->default(1);
            $table->integer('total_points')->default(0);
            $table->integer('weekly_points')->default(0);
            $table->integer('monthly_points')->default(0);
            $table->integer('quizzes_completed')->default(0);
            $table->integer('documents_read')->default(0);
            $table->integer('topics_created')->default(0);
            $table->integer('replies_posted')->default(0);
            $table->timestamp('updated_at')->useCurrent();

            $table->foreign('current_level')->references('level')->on('level_definitions');
        });

        Schema::create('point_transactions', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->integer('points');
            $table->string('reason', 50);
            $table->uuid('reference_id')->nullable();
            $table->string('reference_type', 50)->nullable();
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('badges', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->string('name', 100)->unique();
            $table->text('description');
            $table->string('icon_url', 500)->nullable();
            $table->string('color_hex', 7)->nullable();
            $table->string('category', 50)->nullable();
            $table->string('criteria_type', 50);
            $table->json('criteria_value');
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('user_badges', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('badge_id')->constrained('badges');
            $table->dateTime('earned_at')->useCurrent();
            $table->uuid('reference_id')->nullable();
            $table->unique(['user_id', 'badge_id'], 'uq_user_badges');
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::unprepared('DROP TRIGGER IF EXISTS trg_access_grants_before_insert');
            DB::unprepared('DROP TRIGGER IF EXISTS trg_access_grants_before_update');
        }

        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('badges');
        Schema::dropIfExists('point_transactions');
        Schema::dropIfExists('user_levels');
        Schema::dropIfExists('level_definitions');
        Schema::dropIfExists('user_access_grants');
        Schema::dropIfExists('user_access_requests');
        Schema::dropIfExists('access_levels');
    }
};