<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Sprint 13 — Domain Simplification (Categories ≠ Authorization)
 *
 * PRINCÍPIO ARQUITETURAL:
 * Nenhuma entidade de organização (CommunityCategory) pode ser responsável
 * por autorização. A autorização das discussões passa a ser exclusividade
 * do próprio tópico (visibility).
 *
 * Alterações:
 *  1. Renomeia valores de visibilidade em discussion_topics:
 *       RESTRICTED  →  CATEGORY    (herda contexto da categoria, mas sem access_level)
 *       PRIVATE     →  INVITE_ONLY (apenas membros convidados)
 *  2. Actualiza o default da coluna visibility para CATEGORY.
 *  3. Torna community_categories.access_level_id nullable e sem efeito na autorização.
 *     (a coluna é mantida para não quebrar dados históricos, mas é ignorada na lógica)
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Renomear valores de visibilidade existentes ──────────────────
        DB::table('discussion_topics')
            ->where('visibility', 'RESTRICTED')
            ->update(['visibility' => 'CATEGORY']);

        DB::table('discussion_topics')
            ->where('visibility', 'PRIVATE')
            ->update(['visibility' => 'INVITE_ONLY']);

        // ── 2. Alterar o default da coluna para CATEGORY ────────────────────
        Schema::table('discussion_topics', function (Blueprint $table) {
            $table->string('visibility', 20)->default('CATEGORY')->change();
        });
    }

    public function down(): void
    {
        // Reverter visibilidades
        DB::table('discussion_topics')
            ->where('visibility', 'CATEGORY')
            ->update(['visibility' => 'RESTRICTED']);

        DB::table('discussion_topics')
            ->where('visibility', 'INVITE_ONLY')
            ->update(['visibility' => 'PRIVATE']);

        Schema::table('discussion_topics', function (Blueprint $table) {
            $table->string('visibility', 20)->default('RESTRICTED')->change();
        });
    }
};
