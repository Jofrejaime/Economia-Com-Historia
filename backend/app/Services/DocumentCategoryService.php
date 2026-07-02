<?php

namespace App\Services;

use App\Models\DocumentCategory;
use App\Models\Document;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Exception;

class DocumentCategoryService
{
    public function list()
    {
        return Cache::remember('document-categories', 30, function () {
            return DocumentCategory::orderBy('sort_order')
                ->orderBy('name')
                ->get();
        });
    }

    public function find(string $id): DocumentCategory
    {
        return DocumentCategory::findOrFail($id);
    }

    public function create(array $data): DocumentCategory
    {
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category = DocumentCategory::create($data);
        $this->clearCache();

        return $category;
    }

    public function update(string $id, array $data): DocumentCategory
    {
        $category = DocumentCategory::findOrFail($id);

        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);
        $this->clearCache();

        return $category;
    }

    public function delete(string $id): void
    {
        $category = DocumentCategory::findOrFail($id);

        // Check if there are documents associated with this category
        if (Document::where('category_id', $id)->exists()) {
            throw new Exception('Não é possível eliminar uma categoria associada a documentos.');
        }

        $category->delete();
        $this->clearCache();
    }

    public function clearCache(): void
    {
        Cache::forget('document-categories');
        Cache::flush(); // Flush search caches too
    }
}
