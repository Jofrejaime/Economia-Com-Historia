<?php

namespace App\Services;

use App\Enums\DocumentStatus;
use App\Events\Domain\Documents\DocumentCreated;
use App\Events\Domain\Documents\DocumentDeleted;
use App\Events\Domain\Documents\DocumentPinned;
use App\Events\Domain\Documents\DocumentPublished;
use App\Events\Domain\Documents\DocumentUnpinned;
use App\Events\Domain\Documents\DocumentUpdated;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Sprint 18.9 — Event-Driven: este service já NÃO limpa cache, não escreve
 * logs de auditoria, não envia notificações e não calcula gamificação
 * diretamente. Atualiza a BD e emite Domain Events; os Listeners tratam de
 * toda a infraestrutura (ver App\Subscribers\DocumentSubscriber).
 */
class DocumentAdminService
{
    public function __construct(
        private readonly MediaService $media,
    ) {}

    /**
     * Create a new document.
     *
     * $files (todos opcionais): 'file' (documento principal),
     * 'cover_image' (capa) e 'gallery' (lista de imagens) — todos
     * UploadedFile, processados exclusivamente pelo MediaService.
     */
    public function create(array $data, User $creator, array $files = []): Document
    {
        $this->validateFiles($files);

        $tags = $data['tags'] ?? [];
        unset($data['tags']);

        $id = (string) Str::uuid();

        DB::transaction(function () use ($data, $id, $creator, $tags): void {
            DB::table('documents')->insert(array_merge($data, [
                'id'              => $id,
                'slug'            => Str::slug($data['title']) . '-' . Str::lower(Str::random(6)),
                'created_by'      => $creator->id,
                'created_at'      => now(),
                'updated_at'      => now(),
                'views_count'     => 0,
                'likes_count'     => 0,
                'status'          => $data['status'] ?? DocumentStatus::DRAFT->value,
            ]));

            $this->syncTags($id, $tags);
        });

        $this->applyMedia($id, $files, $creator);

        // Emite o evento; cache, auditoria e gamificação (pontos de upload)
        // são tratados pelos listeners de DocumentCreated.
        DocumentCreated::dispatch($id, $creator->id, [
            'title'      => $data['title'] ?? null,
            'created_by' => $creator->id,
            'status'     => $data['status'] ?? DocumentStatus::DRAFT->value,
        ]);

        return Document::findOrFail($id);
    }

    /**
     * Update an existing document.
     *
     * Ficheiros novos em $files substituem os existentes na mesma coleção
     * (o antigo só é removido depois de o novo estar armazenado).
     */
    public function update(string $id, array $data, User $updater, array $files = []): Document
    {
        $this->validateFiles($files);

        $document = Document::findOrFail($id);
        $oldValues = $document->only(array_keys($data));

        $tags = null;
        if (array_key_exists('tags', $data)) {
            $tags = $data['tags'];
            unset($data['tags']);
        }

        $data['updated_at'] = now();

        if (isset($data['title'])) {
            $data['slug'] = Str::slug($data['title']) . '-' . Str::lower(Str::random(6));
        }

        $justPublished = isset($data['status'])
            && $data['status'] === DocumentStatus::PUBLISHED->value
            && $document->published_at === null;

        if ($justPublished) {
            $data['published_at'] = now();
            $data['reviewed_by']  = $updater->id;
        }

        DB::transaction(function () use ($document, $data, $tags, $id): void {
            $document->fill($data)->save();

            if ($tags !== null) {
                $this->syncTags($id, $tags);
            }
        });

        $this->applyMedia($id, $files, $updater);

        // Cache e auditoria via listeners de DocumentUpdated.
        DocumentUpdated::dispatch($id, $updater->id, [
            'changed'    => array_keys($data),
            'old_values' => $oldValues,
        ]);

        // A notificação ao autor é tratada pelo listener de DocumentPublished.
        if ($justPublished) {
            DocumentPublished::dispatch($id, $updater->id, [
                'title'      => $document->title,
                'created_by' => $document->created_by,
            ]);
        }

        return $document->refresh()->load(['category', 'createdBy.profile']);
    }

    /**
     * Delete a document.
     */
    public function delete(string $id, User $deleter): void
    {
        $document = Document::findOrFail($id);
        $oldValues = $document->toArray();

        DB::transaction(function () use ($document, $id): void {
            // Delete tags relationships
            DB::table('document_tags')->where('document_id', $id)->delete();
            // Delete likes, views, favorites, citations
            DB::table('document_likes')->where('document_id', $id)->delete();
            DB::table('document_views')->where('document_id', $id)->delete();
            DB::table('user_favorites')->where('document_id', $id)->delete();
            DB::table('document_citations')->where('document_id', $id)->delete();
            DB::table('quiz_documents')->where('document_id', $id)->delete();
            
            $document->delete();
        });

        // Nunca deixar ficheiros órfãos: PDF, capa, thumbnails, previews e
        // galeria são removidos do disco junto com os registos de media.
        $this->media->deleteFor('document', $id);

        // Cache e auditoria via listeners de DocumentDeleted.
        DocumentDeleted::dispatch($id, $deleter->id, [
            'title' => $oldValues['title'] ?? null,
        ]);
    }

    /**
     * Publish a document.
     */
    public function publish(string $id, User $admin): Document
    {
        return $this->update($id, [
            'status' => DocumentStatus::PUBLISHED->value,
            'published_at' => now(),
            'reviewed_by' => $admin->id
        ], $admin);
    }

    /**
     * Unpublish a document.
     */
    public function unpublish(string $id, User $admin): Document
    {
        return $this->update($id, [
            'status' => DocumentStatus::DRAFT->value,
        ], $admin);
    }

    /**
     * Pin a document.
     */
    public function pin(string $id, User $admin): Document
    {
        $document = $this->update($id, [
            'is_pinned' => true
        ], $admin);

        DocumentPinned::dispatch($id, $admin->id, ['title' => $document->title]);

        return $document;
    }

    /**
     * Unpin a document.
     */
    public function unpin(string $id, User $admin): Document
    {
        $document = $this->update($id, [
            'is_pinned' => false
        ], $admin);

        DocumentUnpinned::dispatch($id, $admin->id, ['title' => $document->title]);

        return $document;
    }

    // ──────────────────────────────────────────────────────────────────
    // Media (Sprint 18.4 — pipeline único via MediaService)
    // ──────────────────────────────────────────────────────────────────

    /**
     * Valida todos os ficheiros ANTES de escrever seja o que for,
     * para que um upload inválido nunca deixe o documento a meio.
     */
    private function validateFiles(array $files): void
    {
        if (isset($files['file'])) {
            $this->media->validateUploadedFile($files['file'], MediaService::KIND_DOCUMENT);
        }

        if (isset($files['cover_image'])) {
            $this->media->validateUploadedFile($files['cover_image'], MediaService::KIND_IMAGE);
        }

        foreach ($files['gallery'] ?? [] as $image) {
            $this->media->validateUploadedFile($image, MediaService::KIND_IMAGE);
        }
    }

    /**
     * Armazena os ficheiros e sincroniza as colunas legadas
     * (media_url / pdf_url / cover_image_url / media_type) para manter
     * compatibilidade com os clientes existentes. Ficheiros novos
     * substituem os antigos da mesma coleção (replace remove o antigo
     * apenas depois de o novo estar seguro).
     */
    private function applyMedia(string $documentId, array $files, User $actor): void
    {
        if ($files === []) {
            return;
        }

        $columns = [];

        if (isset($files['file'])) {
            /** @var UploadedFile $file */
            $file = $files['file'];
            $current = \App\Models\Media::where('model_type', 'document')
                ->where('model_id', $documentId)
                ->where('collection', 'file')
                ->first();

            $media = $this->media->replace($current, $file, 'documents/pdf', [
                'model_type' => 'document',
                'model_id'   => $documentId,
                'collection' => 'file',
                'created_by' => $actor->id,
            ]);

            $url = $this->media->buildPublicUrl($media->path);
            $columns['media_url'] = $url;
            $columns['media_type'] = $this->media->mediaTypeForExtension($media->extension);

            if ($media->extension === 'pdf') {
                $columns['pdf_url'] = $url; // legacy
            }
        }

        if (isset($files['cover_image'])) {
            $current = \App\Models\Media::where('model_type', 'document')
                ->where('model_id', $documentId)
                ->where('collection', 'cover')
                ->first();

            $media = $this->media->replace($current, $files['cover_image'], 'documents/covers', [
                'model_type' => 'document',
                'model_id'   => $documentId,
                'collection' => 'cover',
                'created_by' => $actor->id,
            ]);

            $columns['cover_image_url'] = $this->media->buildPublicUrl($media->path);
        }

        if (! empty($files['gallery'])) {
            $nextOrder = (int) \App\Models\Media::where('model_type', 'document')
                ->where('model_id', $documentId)
                ->where('collection', 'gallery')
                ->max('sort_order');

            foreach (array_values($files['gallery']) as $index => $image) {
                $this->media->upload($image, 'documents/gallery', [
                    'model_type' => 'document',
                    'model_id'   => $documentId,
                    'collection' => 'gallery',
                    'sort_order' => $nextOrder + $index + 1,
                    'created_by' => $actor->id,
                ]);
            }
        }

        if ($columns !== []) {
            $columns['updated_at'] = now();
            DB::table('documents')->where('id', $documentId)->update($columns);
        }
    }

    /**
     * Synchronize tags for a document.
     */
    private function syncTags(string $documentId, array $tagNames): void
    {
        DB::table('document_tags')->where('document_id', $documentId)->delete();

        foreach ($tagNames as $tagName) {
            $slug = Str::slug($tagName);
            $tag  = DB::table('tags')->where('slug', $slug)->first();

            if ($tag === null) {
                $tagId = (string) Str::uuid();
                DB::table('tags')->insert([
                    'id'         => $tagId,
                    'name'       => $tagName,
                    'slug'       => $slug,
                    'created_at' => now(),
                ]);
            } else {
                $tagId = $tag->id;
            }

            DB::table('document_tags')->insert([
                'document_id' => $documentId,
                'tag_id'      => $tagId,
            ]);
        }
    }
}
