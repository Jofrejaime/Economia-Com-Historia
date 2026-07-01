<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->uuid('published_by')->nullable()->after('published_at');
            $table->uuid('reviewed_by')->nullable()->after('published_by');
            $table->uuid('archived_by')->nullable()->after('reviewed_by');

            $table->foreign('published_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('reviewed_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('archived_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropForeign(['published_by']);
            $table->dropForeign(['reviewed_by']);
            $table->dropForeign(['archived_by']);
            $table->dropColumn(['published_by', 'reviewed_by', 'archived_by']);
        });
    }
};
