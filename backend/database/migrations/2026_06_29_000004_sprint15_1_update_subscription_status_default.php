<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change the default status from ACTIVE to PENDING to reflect the new request flow.
        // status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE document_subscriptions MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING'");
        } else {
            DB::statement("ALTER TABLE document_subscriptions ALTER COLUMN status SET DEFAULT 'PENDING'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE document_subscriptions MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'");
        } else {
            DB::statement("ALTER TABLE document_subscriptions ALTER COLUMN status SET DEFAULT 'ACTIVE'");
        }
    }
};
