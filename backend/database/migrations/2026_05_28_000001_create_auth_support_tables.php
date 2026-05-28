<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('display_name', 100);
            $table->string('full_name')->nullable();
            $table->string('institution')->nullable();
            $table->string('province', 50)->nullable();
            $table->string('avatar_url', 500)->nullable();
            $table->text('bio')->nullable();
            $table->string('website_url', 500)->nullable();
            $table->json('research_areas')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->index('province', 'idx_profiles_province');
        });

        Schema::create('user_sessions', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('refresh_token', 500)->unique();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->dateTime('expires_at');
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('verification_tokens', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('token')->unique();
            $table->string('type', 30);
            $table->dateTime('expires_at');
            $table->dateTime('used_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verification_tokens');
        Schema::dropIfExists('user_sessions');
        Schema::dropIfExists('user_profiles');
    }
};