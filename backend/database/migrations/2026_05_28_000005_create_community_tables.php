<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_categories', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->string('slug', 100)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('color_bg', 7)->nullable();
            $table->string('color_text', 7)->nullable();
            $table->string('cover_image_url', 500)->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();
            $table->integer('members_count')->default(0);
            $table->integer('topics_count')->default(0);
        });

        Schema::create('discussion_topics', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('category_id')->constrained('community_categories');
            $table->foreignUuid('author_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 500);
            $table->longText('content');
            $table->string('status', 20)->default('open');
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            $table->dateTime('last_reply_at')->nullable();
            $table->integer('replies_count')->default(0);
            $table->integer('views_count')->default(0);
            $table->integer('likes_count')->default(0);
            $table->integer('followers_count')->default(0);

            $table->index('category_id', 'idx_topics_category');
            $table->index('author_id', 'idx_topics_author');
            $table->index(['is_pinned', 'created_at'], 'idx_topics_pinned');
            $table->index('last_reply_at', 'idx_topics_recent');
        });

        Schema::create('topic_replies', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('topic_id')->constrained('discussion_topics')->cascadeOnDelete();
            $table->foreignUuid('author_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('parent_reply_id')->nullable()->constrained('topic_replies');
            $table->longText('content');
            $table->boolean('is_accepted')->default(false);
            $table->boolean('is_flagged')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            $table->integer('likes_count')->default(0);
        });

        Schema::create('topic_likes', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('topic_id')->constrained('discussion_topics')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['topic_id', 'user_id'], 'uq_topic_likes');
        });

        Schema::create('reply_likes', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('reply_id')->constrained('topic_replies')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['reply_id', 'user_id'], 'uq_reply_likes');
        });

        Schema::create('topic_followers', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('topic_id')->constrained('discussion_topics')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['topic_id', 'user_id'], 'uq_topic_followers');
        });

        Schema::create('category_members', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('category_id')->constrained('community_categories')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('joined_at')->useCurrent();
            $table->unique(['category_id', 'user_id'], 'uq_category_members');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_members');
        Schema::dropIfExists('topic_followers');
        Schema::dropIfExists('reply_likes');
        Schema::dropIfExists('topic_likes');
        Schema::dropIfExists('topic_replies');
        Schema::dropIfExists('discussion_topics');
        Schema::dropIfExists('community_categories');
    }
};