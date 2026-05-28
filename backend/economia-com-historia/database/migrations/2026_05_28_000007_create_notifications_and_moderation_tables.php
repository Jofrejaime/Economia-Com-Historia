<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 50);
            $table->string('title');
            $table->text('message')->nullable();
            $table->uuid('reference_id')->nullable();
            $table->string('reference_type', 50)->nullable();
            $table->boolean('is_read')->default(false);
            $table->dateTime('read_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'is_read', 'created_at'], 'idx_notifications_user');
        });

        Schema::create('content_reports', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('reporter_id')->constrained('users');
            $table->string('content_type', 20);
            $table->uuid('content_id');
            $table->string('reason', 50);
            $table->text('description')->nullable();
            $table->string('status', 20)->default('pending');
            $table->foreignUuid('reviewed_by')->nullable()->constrained('users');
            $table->dateTime('reviewed_at')->nullable();
            $table->text('action_taken')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_reports');
        Schema::dropIfExists('notifications');
    }
};