<?php

namespace App\Services;

use App\Enums\DocumentStatus;
use App\Models\Document;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class DocumentAdminService
{
    /**
     * Create a new document.
     */
    public function create(array $data, User $creator): Document
    {
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
                'downloads_count' => 0,
                'status'          => $data['status'] ?? DocumentStatus::DRAFT->value,
            ]));

            $this->syncTags($id, $tags);
        });

        $this->logAudit($creator->id, $id, 'create', null, $data);
        $this->clearCache();

        return Document::findOrFail($id);
    }

    /**
     * Update an existing document.
     */
    public function update(string $id, array $data, User $updater): Document
    {
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

        if (isset($data['status']) && $data['status'] === DocumentStatus::PUBLISHED->value && $document->published_at === null) {
            $data['published_at'] = now();
            $data['reviewed_by']  = $updater->id;
        }

        DB::transaction(function () use ($document, $data, $tags, $id): void {
            $document->fill($data)->save();

            if ($tags !== null) {
                $this->syncTags($id, $tags);
            }
        });

        $this->logAudit($updater->id, $id, 'update', $oldValues, $data);
        $this->clearCache();

        return $document->load(['category', 'accessLevel', 'createdBy.profile']);
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
            // Delete likes, downloads, views, favorites, citations
            DB::table('document_likes')->where('document_id', $id)->delete();
            DB::table('document_downloads')->where('document_id', $id)->delete();
            DB::table('document_views')->where('document_id', $id)->delete();
            DB::table('user_favorites')->where('document_id', $id)->delete();
            DB::table('document_citations')->where('document_id', $id)->delete();
            DB::table('quiz_documents')->where('document_id', $id)->delete();
            
            $document->delete();
        });

        $this->logAudit($deleter->id, $id, 'delete', $oldValues, null);
        $this->clearCache();
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
        return $this->update($id, [
            'is_pinned' => true
        ], $admin);
    }

    /**
     * Unpin a document.
     */
    public function unpin(string $id, User $admin): Document
    {
        return $this->update($id, [
            'is_pinned' => false
        ], $admin);
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

    /**
     * Log detailed audit trails.
     */
    private function logAudit(string $adminId, string $documentId, string $action, ?array $oldValues, ?array $newValues): void
    {
        Log::info('Document administrative action recorded', [
            'admin_id'    => $adminId,
            'document_id' => $documentId,
            'action'      => $action,
            'old_values'  => $oldValues,
            'new_values'  => $newValues,
            'timestamp'   => now()->toIso8601String()
        ]);
    }

    /**
     * Clear application cache.
     */
    public function clearCache(): void
    {
        Cache::flush();
    }
}
