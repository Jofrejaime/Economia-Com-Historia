<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('badges');
        Schema::dropIfExists('point_transactions');
        Schema::dropIfExists('user_levels');
        Schema::dropIfExists('level_definitions');
    }
};
