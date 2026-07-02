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
            $table->boolean('locked')->default(false)->after('status');
            $table->boolean('pinned')->default(false)->after('locked');
            $table->boolean('hidden')->default(false)->after('pinned');
            $table->boolean('featured')->default(false)->after('hidden');
            $table->boolean('solved')->default(false)->after('featured');
            $table->timestamp('closed_at')->nullable()->after('solved');
            $table->foreignUuid('closed_by')->nullable()->after('closed_at')->constrained('users')->nullOnDelete();
        });

        Schema::table('topic_replies', function (Blueprint $table): void {
            $table->boolean('hidden')->default(false)->after('content');
            $table->boolean('best_answer')->default(false)->after('hidden');
            $table->timestamp('edited_at')->nullable()->after('best_answer');
            $table->foreignUuid('edited_by')->nullable()->after('edited_at')->constrained('users')->nullOnDelete();
        });

        // Sincronizar dados existentes
        DB::table('discussion_topics')->update([
            'pinned' => DB::raw('is_pinned'),
            'featured' => DB::raw('is_featured'),
            'locked' => DB::raw("CASE WHEN status = 'locked' THEN 1 ELSE 0 END"),
        ]);

        DB::table('topic_replies')->update([
            'best_answer' => DB::raw('is_accepted'),
        ]);
    }

    public function down(): void
    {
        Schema::table('topic_replies', function (Blueprint $table): void {
            $table->dropForeign(['edited_by']);
            $table->dropColumn(['hidden', 'best_answer', 'edited_at', 'edited_by']);
        });

        Schema::table('discussion_topics', function (Blueprint $table): void {
            $table->dropForeign(['closed_by']);
            $table->dropColumn(['locked', 'pinned', 'hidden', 'featured', 'solved', 'closed_at', 'closed_by']);
        });
    }
};
