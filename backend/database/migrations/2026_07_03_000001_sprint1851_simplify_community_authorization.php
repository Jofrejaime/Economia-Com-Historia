<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Sprint 18.5.1 — Consolidação Arquitetural do Domínio Community
 *
 * A autorização passa a depender exclusivamente da visibilidade do tópico:
 *
 *   PUBLIC      — qualquer utilizador autenticado pode ver e responder
 *   INVITE_ONLY — apenas autor, admin e membros do tópico
 *
 * Alterações:
 *  1. Tópicos com visibilidade CATEGORY passam a PUBLIC; o default da coluna
 *     também passa a PUBLIC (CATEGORY deixa de existir).
 *  2. discussion_topic_members é simplificada: sem role, invited_by nem
 *     accepted_at — pertencer à tabela é ser membro. Ganha joined_at.
 *  3. category_members é eliminada — categorias nunca controlam autorização.
 *  4. community_categories.members_count é eliminada (nunca foi mantida e o
 *     conceito de "membro de categoria" deixa de existir).
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Visibilidade: CATEGORY deixa de existir ───────────────────────
        DB::table('discussion_topics')
            ->where('visibility', 'CATEGORY')
            ->update(['visibility' => 'PUBLIC']);

        Schema::table('discussion_topics', function (Blueprint $table): void {
            $table->string('visibility', 20)->default('PUBLIC')->change();
        });

        // ── 2. Simplificar discussion_topic_members ─────────────────────────
        if (DB::getDriverName() === 'sqlite') {
            // SQLite não permite dropar colunas referenciadas em FKs — recriar a tabela.
            // Os índices (nomes globais no SQLite) só são criados após o rename.
            Schema::create('discussion_topic_members_new', function (Blueprint $table): void {
                $table->uuid('id')->primary();
                $table->foreignUuid('topic_id')->constrained('discussion_topics')->cascadeOnDelete();
                $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
                $table->timestamp('joined_at')->nullable();
                $table->timestamps();
            });

            DB::statement(
                'INSERT INTO discussion_topic_members_new (id, topic_id, user_id, joined_at, created_at, updated_at)
                 SELECT id, topic_id, user_id, COALESCE(accepted_at, created_at), created_at, updated_at
                 FROM discussion_topic_members'
            );

            Schema::drop('discussion_topic_members');
            Schema::rename('discussion_topic_members_new', 'discussion_topic_members');

            Schema::table('discussion_topic_members', function (Blueprint $table): void {
                $table->unique(['topic_id', 'user_id'], 'uq_discussion_topic_members');
                $table->index('user_id', 'idx_discussion_topic_members_user');
            });
        } else {
            Schema::table('discussion_topic_members', function (Blueprint $table): void {
                $table->timestamp('joined_at')->nullable()->after('user_id');
            });

            // Membros existentes: joined_at herda accepted_at (ou created_at para
            // convites que nunca chegaram a ser aceites — passam a membros plenos).
            DB::table('discussion_topic_members')->update([
                'joined_at' => DB::raw('COALESCE(accepted_at, created_at)'),
            ]);

            Schema::table('discussion_topic_members', function (Blueprint $table): void {
                $table->dropIndex('idx_discussion_topic_members_topic_role');
                $table->dropForeign(['invited_by']);
                $table->dropColumn(['role', 'invited_by', 'accepted_at']);
            });
        }

        // ── 3. Eliminar category_members ────────────────────────────────────
        Schema::dropIfExists('category_members');

        // ── 4. Eliminar community_categories.members_count ──────────────────
        Schema::table('community_categories', function (Blueprint $table): void {
            $table->dropColumn('members_count');
        });
    }

    public function down(): void
    {
        Schema::table('community_categories', function (Blueprint $table): void {
            $table->integer('members_count')->default(0);
        });

        Schema::create('category_members', function (Blueprint $table): void {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->foreignUuid('category_id')->constrained('community_categories')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('joined_at')->useCurrent();
            $table->unique(['category_id', 'user_id'], 'uq_category_members');
        });

        Schema::table('discussion_topic_members', function (Blueprint $table): void {
            $table->string('role', 20)->default('member')->after('user_id');
            $table->foreignUuid('invited_by')->nullable()->after('role')->constrained('users')->nullOnDelete();
            $table->timestamp('accepted_at')->nullable()->after('invited_by');
            $table->index(['topic_id', 'role'], 'idx_discussion_topic_members_topic_role');
        });

        DB::table('discussion_topic_members')->update([
            'accepted_at' => DB::raw('joined_at'),
        ]);

        // Restaurar o papel de owner para os autores dos tópicos.
        if (DB::getDriverName() === 'sqlite') {
            DB::statement(
                'UPDATE discussion_topic_members SET role = \'owner\' WHERE EXISTS (
                    SELECT 1 FROM discussion_topics t
                    WHERE t.id = discussion_topic_members.topic_id
                      AND t.author_id = discussion_topic_members.user_id
                )'
            );
        } else {
            DB::statement(
                'UPDATE discussion_topic_members m
                 JOIN discussion_topics t ON t.id = m.topic_id AND t.author_id = m.user_id
                 SET m.role = \'owner\''
            );
        }

        Schema::table('discussion_topic_members', function (Blueprint $table): void {
            $table->dropColumn('joined_at');
        });

        Schema::table('discussion_topics', function (Blueprint $table): void {
            $table->string('visibility', 20)->default('CATEGORY')->change();
        });
    }
};
