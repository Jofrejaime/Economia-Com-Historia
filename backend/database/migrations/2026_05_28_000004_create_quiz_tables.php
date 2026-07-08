<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->string('title');
            $table->string('module')->nullable();
            $table->text('description')->nullable();
            $table->string('cover_image_url', 500)->nullable();
            $table->string('difficulty', 20)->default('Básico');
            $table->integer('base_points')->default(100);
            $table->integer('time_limit_secs')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->string('status', 20)->default('published');
            $table->foreignUuid('category_id')->nullable()->constrained('document_categories');
            $table->foreignUuid('created_by')->constrained('users');
            $table->dateTime('published_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            $table->integer('attempts_count')->default(0);
            $table->integer('completions_count')->default(0);
            $table->decimal('avg_score', 5, 2)->default(0.00);

            $table->index('difficulty', 'idx_quizzes_difficulty');
            $table->index('status', 'idx_quizzes_status');
        });

        Schema::create('quiz_questions', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('quiz_id')->constrained('quizzes')->cascadeOnDelete();
            $table->integer('question_order');
            $table->text('title');
            $table->text('subtitle')->nullable();
            $table->string('module_label')->nullable();
            $table->string('question_type', 20)->default('multiple_choice');
            $table->integer('points')->default(10);
            $table->string('hint_title')->nullable();
            $table->text('hint_quote')->nullable();
            $table->string('expert_name')->nullable();
            $table->string('expert_role')->nullable();
            $table->string('reading_title')->nullable();
            $table->text('reading_text')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['quiz_id', 'question_order'], 'uq_quiz_questions_order');
        });

        Schema::create('quiz_options', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('question_id')->constrained('quiz_questions')->cascadeOnDelete();
            $table->char('option_key', 1);
            $table->text('text');
            $table->boolean('is_correct')->default(false);
            $table->text('explanation')->nullable();
            $table->unique(['question_id', 'option_key'], 'uq_quiz_options');
        });

        Schema::create('quiz_attempts', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('quiz_id')->constrained('quizzes');
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 20)->default('in_progress');
            $table->integer('score')->nullable();
            $table->integer('correct_answers')->nullable();
            $table->integer('total_questions')->nullable();
            $table->integer('time_spent_secs')->nullable();
            $table->integer('points_earned')->default(0);
            $table->integer('bonus_points')->default(0);
            $table->string('performance_rating', 30)->nullable();
            $table->dateTime('started_at')->useCurrent();
            $table->dateTime('completed_at')->nullable();

            $table->index(['user_id', 'completed_at'], 'idx_quiz_attempts_user');
            $table->index(['quiz_id', 'status'], 'idx_quiz_attempts_quiz');
        });

        Schema::create('quiz_attempt_answers', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('attempt_id')->constrained('quiz_attempts')->cascadeOnDelete();
            $table->foreignUuid('question_id')->constrained('quiz_questions');
            $table->foreignUuid('selected_option_id')->nullable()->constrained('quiz_options');
            $table->boolean('is_correct')->nullable();
            $table->integer('time_spent_secs')->nullable();
            $table->dateTime('answered_at')->useCurrent();
            $table->unique(['attempt_id', 'question_id'], 'uq_attempt_answers');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_attempt_answers');
        Schema::dropIfExists('quiz_attempts');
        Schema::dropIfExists('quiz_options');
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('quizzes');
    }
};