<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            // Official media type contract: TEXT | IMAGE | VIDEO | AUDIO | PDF
            $table->string('media_type', 20)->nullable()->after('pdf_url');

            // Unified media URL (replaces the semantic of pdf_url going forward).
            // pdf_url is kept for backward compatibility with existing records.
            $table->string('media_url', 500)->nullable()->after('media_type');

            // Pinned flag — only admins may set this via dedicated endpoints.
            $table->boolean('is_pinned')->default(false)->after('downloads_count');

            $table->index('is_pinned', 'idx_documents_pinned');
            $table->index('media_type', 'idx_documents_media_type');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropIndex('idx_documents_pinned');
            $table->dropIndex('idx_documents_media_type');
            $table->dropColumn(['media_type', 'media_url', 'is_pinned']);
        });
    }
};
