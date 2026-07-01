<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropForeign(['quiz_id']);
            $table->foreign('quiz_id')
                ->references('id')
                ->on('quizzes')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropForeign(['quiz_id']);
            $table->foreign('quiz_id')
                ->references('id')
                ->on('quizzes');
        });
    }
};
