<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_subscriptions', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('document_id')->constrained('documents')->onDelete('cascade');
            $table->string('status', 20)->default('ACTIVE'); // ACTIVE | EXPIRED | CANCELLED
            $table->dateTime('started_at');
            $table->dateTime('expires_at')->nullable();
            $table->timestamps();

            $table->index('status', 'idx_doc_subs_status');
            $table->index(['user_id', 'document_id'], 'idx_doc_subs_user_doc');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_subscriptions');
    }
};
