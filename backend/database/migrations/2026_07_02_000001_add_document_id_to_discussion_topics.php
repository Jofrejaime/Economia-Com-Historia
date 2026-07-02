<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Sprint 17.3 — Discussões Contextualizadas por Documento
 *
 * discussion_topics.document_id é opcional (0..1): uma discussão pode ou
 * não estar associada a um único documento. Um documento pode ter várias
 * discussões (1..N). Sem tabela pivot — relação simples via FK nullable.
 *
 * nullOnDelete() (nunca cascade): se o documento for removido, a discussão
 * permanece na comunidade — perde apenas a referência ao documento.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('discussion_topics', function (Blueprint $table) {
            $table->uuid('document_id')->nullable()->after('category_id');

            $table->foreign('document_id')
                ->references('id')->on('documents')
                ->nullOnDelete();

            $table->index('document_id', 'idx_topics_document');
        });
    }

    public function down(): void
    {
        Schema::table('discussion_topics', function (Blueprint $table) {
            $table->dropForeign(['document_id']);
            $table->dropIndex('idx_topics_document');
            $table->dropColumn('document_id');
        });
    }
};
