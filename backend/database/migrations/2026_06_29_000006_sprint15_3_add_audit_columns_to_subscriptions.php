<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_subscriptions', function (Blueprint $table) {
            $table->uuid('approved_by')->nullable()->after('status');
            $table->uuid('rejected_by')->nullable()->after('approved_by');
            $table->uuid('cancelled_by')->nullable()->after('rejected_by');

            $table->foreign('approved_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('rejected_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('cancelled_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('document_subscriptions', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropForeign(['rejected_by']);
            $table->dropForeign(['cancelled_by']);
            $table->dropColumn(['approved_by', 'rejected_by', 'cancelled_by']);
        });
    }
};
