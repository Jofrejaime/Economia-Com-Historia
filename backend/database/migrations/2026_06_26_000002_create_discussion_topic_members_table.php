<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discussion_topic_members', function (Blueprint $table): void {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('topic_id')->constrained('discussion_topics')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role', 20)->default('member');
            $table->foreignUuid('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();

            $table->unique(['topic_id', 'user_id'], 'uq_discussion_topic_members');
            $table->index(['topic_id', 'role'], 'idx_discussion_topic_members_topic_role');
            $table->index('user_id', 'idx_discussion_topic_members_user');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discussion_topic_members');
    }
};
