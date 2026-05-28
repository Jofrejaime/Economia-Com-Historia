<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => DB::table('documents')->orderByDesc('created_at')->limit(20)->get()]);
    }

    public function search(Request $request): JsonResponse
    {
        $term = $request->string('q')->toString();

        $query = DB::table('documents');

        if ($term !== '') {
            $query->where(function ($builder) use ($term): void {
                $builder->where('title', 'like', "%{$term}%")
                    ->orWhere('summary', 'like', "%{$term}%");
            });
        }

        return response()->json(['data' => $query->orderByDesc('created_at')->limit(20)->get()]);
    }

    public function show(string $id): JsonResponse
    {
        return response()->json(['data' => DB::table('documents')->where('id', $id)->first()]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:500'],
            'author' => ['required', 'string', 'max:255'],
            'summary' => ['required', 'string'],
            'document_type' => ['required', 'in:manuscript,article,report,thesis,archive'],
            'academic_level' => ['required', 'in:intro,advanced,doctorate'],
            'access_level_id' => ['required', 'exists:access_levels,id'],
            'category_id' => ['nullable', 'exists:document_categories,id'],
        ]);

        $id = (string) Str::uuid();

        DB::table('documents')->insert(array_merge($validated, [
            'id' => $id,
            'slug' => Str::slug($validated['title']).'-'.Str::lower(Str::random(6)),
            'created_by' => $request->user()->id,
            'created_at' => now(),
            'updated_at' => now(),
            'views_count' => 0,
            'likes_count' => 0,
            'downloads_count' => 0,
            'comments_count' => 0,
            'status' => 'draft',
        ]));

        return response()->json(['message' => 'Document created.', 'id' => $id], 201);
    }

    public function update(string $id): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501);
    }

    public function destroy(string $id): JsonResponse
    {
        DB::table('documents')->where('id', $id)->delete();

        return response()->json(['message' => 'Document deleted.']);
    }

    public function like(string $id): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501);
    }

    public function unlike(string $id): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501);
    }

    public function download(string $id): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501);
    }

    public function favorite(string $id): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501);
    }

    public function unfavorite(string $id): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501);
    }

    public function createCitation(string $id): JsonResponse
    {
        return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501);
    }
}