<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('discussion_topics', function (Blueprint $table): void {
            $table->string('visibility', 20)->default('RESTRICTED')->after('content');
            $table->index('visibility', 'idx_topics_visibility');
        });

        DB::table('discussion_topics')
            ->whereNull('visibility')
            ->update(['visibility' => 'RESTRICTED']);
    }

    public function down(): void
    {
        Schema::table('discussion_topics', function (Blueprint $table): void {
            $table->dropIndex('idx_topics_visibility');
            $table->dropColumn('visibility');
        });
    }
};
