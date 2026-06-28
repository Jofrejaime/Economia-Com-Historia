<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('quiz_documents', function (Blueprint $table) {
            $table->string('quiz_id');
            $table->string('document_id');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->primary(['quiz_id', 'document_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_documents');
    }
};
