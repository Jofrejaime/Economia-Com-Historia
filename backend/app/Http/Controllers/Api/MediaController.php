<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadMediaRequest;
use App\Models\Media;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Endpoints genéricos da infraestrutura de media.
 *
 * Usados pelo editor de conteúdo rico e por qualquer módulo que precise
 * de um ficheiro antes/além do ciclo de vida do agregado (ex.: ícone de
 * badge, imagem inline num documento).
 */
class MediaController extends Controller
{
    public function __construct(private readonly MediaService $media) {}

    /**
     * @OA\Post(
     *      path="/media/uploads",
     *      operationId="uploadMedia",
     *      tags={"Media"},
     *      summary="Upload genérico de ficheiro (admin/professor)",
     *      description="Pipeline único de uploads. Valida MIME real, extensão, dupla extensão e tamanho. Gera thumbnail automático para imagens. Devolve o objeto de media padronizado com URLs públicas.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\MediaType(
     *              mediaType="multipart/form-data",
     *              @OA\Schema(
     *                  required={"file"},
     *                  @OA\Property(property="file", type="string", format="binary", description="Imagem (jpg, png, webp, svg, gif — máx 4MB) ou documento (pdf, docx, ppt, pptx, xlsx, csv, txt, zip, rar, odt — máx 50MB)"),
     *                  @OA\Property(property="collection", type="string", enum={"file","cover","gallery","icon","content"}, example="content"),
     *                  @OA\Property(property="model_type", type="string", example="document"),
     *                  @OA\Property(property="model_id", type="string", format="uuid", nullable=true),
     *                  @OA\Property(property="directory", type="string", example="content", description="Diretório lógico (opcional; por omissão derivado do model_type/collection)")
     *              )
     *          )
     *      ),
     *      @OA\Response(response=201, description="Ficheiro carregado",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="File uploaded."),
     *              @OA\Property(property="data", type="object",
     *                  @OA\Property(property="id", type="string", format="uuid"),
     *                  @OA\Property(property="url", type="string", format="url"),
     *                  @OA\Property(property="thumbnail", type="string", format="url", nullable=true),
     *                  @OA\Property(property="preview", type="string", format="url", nullable=true),
     *                  @OA\Property(property="filename", type="string"),
     *                  @OA\Property(property="mime_type", type="string"),
     *                  @OA\Property(property="extension", type="string"),
     *                  @OA\Property(property="size", type="integer"),
     *                  @OA\Property(property="width", type="integer", nullable=true),
     *                  @OA\Property(property="height", type="integer", nullable=true)
     *              )
     *          )
     *      ),
     *      @OA\Response(response=401, description="Não autenticado"),
     *      @OA\Response(response=403, description="Sem permissão"),
     *      @OA\Response(response=422, description="Ficheiro inválido (extensão, MIME, tamanho, dupla extensão)")
     * )
     */
    public function store(UploadMediaRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $collection = $validated['collection'] ?? 'content';
        $modelType = $validated['model_type'] ?? 'content';

        $directory = $validated['directory'] ?? $this->defaultDirectory($modelType, $collection);

        $media = $this->media->upload($request->file('file'), $directory, [
            'model_type' => $modelType,
            'model_id'   => $validated['model_id'] ?? null,
            'collection' => $collection,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'File uploaded.',
            'data'    => $this->media->payload($media),
        ], 201);
    }

    /**
     * @OA\Delete(
     *      path="/media/{id}",
     *      operationId="deleteMedia",
     *      tags={"Media"},
     *      summary="Eliminar ficheiro (admin/professor)",
     *      description="Remove o ficheiro, thumbnail, preview e o registo. Professores só podem remover ficheiros que carregaram; admins removem qualquer um.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string", format="uuid")),
     *      @OA\Response(response=200, description="Ficheiro eliminado"),
     *      @OA\Response(response=403, description="Sem permissão sobre este ficheiro"),
     *      @OA\Response(response=404, description="Ficheiro não encontrado")
     * )
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        $media = Media::find($id);

        if ($media === null) {
            return response()->json(['message' => 'Media not found.'], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $media->created_by !== $user->id) {
            return response()->json(['message' => 'You cannot delete this file.'], 403);
        }

        $this->media->delete($media);

        return response()->json(['message' => 'Media deleted.']);
    }

    private function defaultDirectory(string $modelType, string $collection): string
    {
        return match ($modelType) {
            'document'           => 'documents/'.match ($collection) {
                'cover'   => 'covers',
                'gallery' => 'gallery',
                'content' => 'gallery',
                default   => 'pdf',
            },
            'document_category',
            'community_category' => 'categories/'.($collection === 'icon' ? 'icons' : 'covers'),
            'tag'                => 'tags/icons',
            'badge'              => 'badges',
            'user_profile'       => 'avatars',
            default              => 'content',
        };
    }
}
