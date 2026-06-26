<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_categories', function (Blueprint $table) {
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
            $table->string('icon', 10)->nullable();
            $table->foreignUuid('parent_id')->nullable()->constrained('document_categories');
            $table->integer('sort_order')->default(0);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('documents', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->string('title', 500);
            $table->string('slug', 500)->nullable()->unique();
            $table->string('author');
            $table->string('institution')->nullable();
            $table->foreignUuid('category_id')->nullable()->constrained('document_categories');
            $table->string('document_type', 20);
            $table->string('academic_level', 20)->default('intro');
            $table->string('access_level_id', 20)->default('public');
            $table->date('publication_date')->nullable();
            $table->integer('period_start')->nullable();
            $table->integer('period_end')->nullable();
            $table->text('summary');
            $table->longText('content')->nullable();
            $table->string('cover_image_url', 500)->nullable();
            $table->string('pdf_url', 500)->nullable();
            $table->string('unique_id', 50)->nullable();
            $table->string('physical_location')->nullable();
            $table->string('record_type', 100)->nullable();
            $table->string('status', 20)->default('draft');
            $table->foreignUuid('created_by')->constrained('users');
            $table->foreignUuid('reviewed_by')->nullable()->constrained('users');
            $table->dateTime('published_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            $table->integer('views_count')->default(0);
            $table->integer('likes_count')->default(0);
            $table->integer('downloads_count')->default(0);

            $table->foreign('access_level_id')->references('id')->on('access_levels');
            $table->index('status', 'idx_documents_status');
            $table->index('access_level_id', 'idx_documents_access_level');
            $table->index('category_id', 'idx_documents_category');
            $table->index('academic_level', 'idx_documents_academic_level');
            $table->index('created_by', 'idx_documents_created_by');
            $table->index('published_at', 'idx_documents_published_at');

            if (DB::getDriverName() === 'mysql') {
                $table->fullText(['title', 'summary'], 'ft_documents_search');
            }
        });

        Schema::create('tags', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->string('name', 100)->unique();
            $table->string('slug', 100)->unique();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('document_tags', function (Blueprint $table) {
            $table->foreignUuid('document_id')->constrained('documents')->cascadeOnDelete();
            $table->foreignUuid('tag_id')->constrained('tags')->cascadeOnDelete();
            $table->primary(['document_id', 'tag_id']);
        });

        Schema::create('document_likes', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('document_id')->constrained('documents')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['document_id', 'user_id'], 'uq_doc_likes');
        });

        Schema::create('document_downloads', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('document_id')->constrained('documents')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('document_views', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('document_id')->constrained('documents')->cascadeOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('user_favorites', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('document_id')->constrained('documents')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['user_id', 'document_id'], 'uq_user_favorites');
        });

        Schema::create('document_citations', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('document_id')->constrained('documents')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('citation_format', 20)->default('apa');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_citations');
        Schema::dropIfExists('user_favorites');
        Schema::dropIfExists('document_views');
        Schema::dropIfExists('document_downloads');
        Schema::dropIfExists('document_likes');
        Schema::dropIfExists('document_tags');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('document_categories');
    }
};
