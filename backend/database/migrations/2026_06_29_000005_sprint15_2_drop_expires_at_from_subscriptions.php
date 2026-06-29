<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// MVP decision: temporary subscriptions are not implemented.
// expires_at is dead code — removing to keep the schema clean.
// Future sprint can re-add when paid/time-limited subscriptions are needed.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_subscriptions', function (Blueprint $table) {
            $table->dropColumn('expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('document_subscriptions', function (Blueprint $table) {
            $table->dateTime('expires_at')->nullable()->after('started_at');
        });
    }
};
