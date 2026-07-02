<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Sprint 18.4 (complemento) — Infraestrutura Global de Media & Uploads
 *
 * Tabela polimórfica única para todos os ficheiros da plataforma
 * (documentos, capas, galerias, avatares, ícones de categorias/tags,
 * badges, comunidade e módulos futuros).
 *
 * model_type/model_id são polimórficos "soft" (sem FK) porque referenciam
 * agregados de tabelas diferentes — a limpeza é responsabilidade do
 * MediaService (deleteFor) invocado pelos services de domínio.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $id = $table->uuid('id');
            if (DB::getDriverName() === 'mysql') {
                $id->default(DB::raw('(UUID())'));
            }
            $id->primary();

            $table->string('model_type', 100);            // document | user_profile | badge | document_category | tag | community_category | content
            $table->uuid('model_id')->nullable();          // nullable: uploads de editor ainda não associados
            $table->string('collection', 50);              // file | cover | gallery | avatar | icon | content
            $table->string('disk', 20)->default('public');
            $table->string('path', 500);
            $table->string('thumbnail_path', 500)->nullable();
            $table->string('preview_path', 500)->nullable();
            $table->string('filename');                    // nome original enviado pelo cliente
            $table->string('mime_type', 100);
            $table->string('extension', 20);
            $table->unsignedBigInteger('size');            // bytes
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['model_type', 'model_id', 'collection'], 'idx_media_model');
            $table->index('created_by', 'idx_media_created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
