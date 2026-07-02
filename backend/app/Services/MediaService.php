<?php

namespace App\Services;

use App\Models\Media;
use App\Services\Media\PreviewGenerator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Sprint 18.4 (complemento) — Infraestrutura Global de Media & Uploads.
 *
 * Serviço ÚNICO responsável por todas as operações de ficheiros da
 * plataforma. Nenhum controller deve usar Storage diretamente.
 *
 * Armazenamento: Storage::disk('public') (local). A troca futura para
 * S3/Azure/GCS faz-se alterando apenas a constante DISK / config do disco —
 * controllers e services de domínio não mudam.
 *
 * Estrutura de diretórios (expansível):
 *   documents/{pdf,covers,thumbnails,previews,gallery}/
 *   categories/{covers,icons}/  tags/icons/  avatars/  badges/
 *   community/  content/  temp/
 */
class MediaService
{
    public const DISK = 'public';

    public const KIND_IMAGE    = 'image';
    public const KIND_DOCUMENT = 'document';

    /** Tamanhos máximos por tipo (KB). */
    public const MAX_IMAGE_KB    = 4096;    // 4 MB
    public const MAX_DOCUMENT_KB = 51200;   // 50 MB

    private const THUMBNAIL_MAX_WIDTH = 400;

    /** Extensões permitidas por tipo (contrato da sprint). */
    private const ALLOWED_EXTENSIONS = [
        self::KIND_IMAGE    => ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'],
        self::KIND_DOCUMENT => ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'csv', 'txt', 'zip', 'rar', 'odt'],
    ];

    /** Extensões executáveis/perigosas — recusadas em QUALQUER segmento do nome. */
    private const FORBIDDEN_EXTENSIONS = [
        'php', 'php3', 'php4', 'php5', 'php7', 'phtml', 'phar',
        'exe', 'com', 'msi', 'dll', 'bat', 'cmd', 'sh', 'bash',
        'cgi', 'pl', 'py', 'js', 'mjs', 'html', 'htm', 'jar', 'vbs', 'ps1',
    ];

    /** MIME types reais aceites por extensão (nunca confiar no browser). */
    private const MIME_MAP = [
        'jpg'  => ['image/jpeg'],
        'jpeg' => ['image/jpeg'],
        'png'  => ['image/png'],
        'webp' => ['image/webp'],
        'gif'  => ['image/gif'],
        'svg'  => ['image/svg+xml', 'image/svg', 'text/xml', 'application/xml', 'text/plain', 'text/html'],
        'pdf'  => ['application/pdf'],
        'doc'  => ['application/msword', 'application/x-ole-storage'],
        'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'],
        'ppt'  => ['application/vnd.ms-powerpoint', 'application/x-ole-storage'],
        'pptx' => ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip'],
        'xls'  => ['application/vnd.ms-excel', 'application/x-ole-storage'],
        'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'],
        'csv'  => ['text/csv', 'text/plain', 'application/csv'],
        'txt'  => ['text/plain'],
        'zip'  => ['application/zip', 'application/x-zip-compressed'],
        'rar'  => ['application/vnd.rar', 'application/x-rar-compressed', 'application/x-rar'],
        'odt'  => ['application/vnd.oasis.opendocument.text', 'application/zip'],
    ];

    public function __construct(private readonly PreviewGenerator $previewGenerator) {}

    // ──────────────────────────────────────────────────────────────────
    // Operações principais
    // ──────────────────────────────────────────────────────────────────

    /**
     * Valida, armazena e regista um ficheiro.
     *
     * $attributes:
     *   kind        image|document (default: inferido da extensão)
     *   model_type  agregado dono (ex.: 'document')
     *   model_id    id do agregado (nullable para uploads de editor)
     *   collection  file|cover|gallery|avatar|icon|content (default 'file')
     *   created_by  id do utilizador
     *   max_kb      override do tamanho máximo
     *   thumbnail   bool — gerar thumbnail (default: true para imagens raster)
     *   sort_order  int
     */
    public function upload(UploadedFile $file, string $directory, array $attributes = []): Media
    {
        $kind = $attributes['kind'] ?? $this->inferKind($file);

        $this->validateUploadedFile($file, $kind, $attributes['max_kb'] ?? null);

        $extension = strtolower($file->getClientOriginalExtension());
        $storedName = $this->generateUniqueFilename($extension);
        $directory = trim($directory, '/');

        $path = Storage::disk(self::DISK)->putFileAs($directory, $file, $storedName);

        if ($path === false) {
            throw ValidationException::withMessages([
                'file' => ['Não foi possível armazenar o ficheiro.'],
            ]);
        }

        [$width, $height] = $this->imageDimensions($path, $extension);

        $media = Media::create([
            'model_type'  => $attributes['model_type'] ?? 'content',
            'model_id'    => $attributes['model_id'] ?? null,
            'collection'  => $attributes['collection'] ?? 'file',
            'disk'        => self::DISK,
            'path'        => $path,
            'filename'    => $file->getClientOriginalName(),
            'mime_type'   => $this->detectMimeType($file) ?? ($file->getClientMimeType() ?: 'application/octet-stream'),
            'extension'   => $extension,
            'size'        => $file->getSize() ?: 0,
            'width'       => $width,
            'height'      => $height,
            'sort_order'  => $attributes['sort_order'] ?? 0,
            'created_by'  => $attributes['created_by'] ?? null,
        ]);

        $wantsThumbnail = $attributes['thumbnail'] ?? ($kind === self::KIND_IMAGE);
        if ($wantsThumbnail) {
            $thumb = $this->generateThumbnail($path);
            if ($thumb !== null) {
                $media->thumbnail_path = $thumb;
            }
        }

        $preview = $this->generatePreview($media);
        if ($preview !== null) {
            $media->preview_path = $preview;
        }

        if ($media->isDirty()) {
            $media->save();
        }

        return $media;
    }

    /**
     * Substitui um ficheiro existente: guarda o novo, atualiza o registo
     * e só depois remove os ficheiros antigos (o antigo nunca é destruído
     * antes de o novo estar seguro).
     */
    public function replace(?Media $current, UploadedFile $file, string $directory, array $attributes = []): Media
    {
        if ($current !== null) {
            $attributes = array_merge([
                'model_type' => $current->model_type,
                'model_id'   => $current->model_id,
                'collection' => $current->collection,
                'sort_order' => $current->sort_order,
            ], $attributes);
        }

        $new = $this->upload($file, $directory, $attributes);

        if ($current !== null) {
            $this->delete($current);
        }

        return $new;
    }

    /** Remove ficheiro, thumbnail, preview e o registo na base de dados. */
    public function delete(Media $media): void
    {
        DB::transaction(function () use ($media): void {
            $media->delete();
        });

        $this->deleteFiles($media);
    }

    /** Remove todos os media de um agregado (ex.: ao eliminar um documento). */
    public function deleteFor(string $modelType, string $modelId, ?string $collection = null): void
    {
        $query = Media::query()
            ->where('model_type', $modelType)
            ->where('model_id', $modelId);

        if ($collection !== null) {
            $query->where('collection', $collection);
        }

        foreach ($query->get() as $media) {
            $this->delete($media);
        }
    }

    /** Remove um diretório inteiro do disco público. */
    public function deleteDirectory(string $directory): void
    {
        Storage::disk(self::DISK)->deleteDirectory(trim($directory, '/'));
    }

    /** Move o ficheiro (e derivados) para outro diretório. */
    public function move(Media $media, string $newDirectory): Media
    {
        $media->path = $this->relocate($media->path, $newDirectory);

        if ($media->thumbnail_path !== null) {
            $media->thumbnail_path = $this->relocate($media->thumbnail_path, trim($newDirectory, '/').'/thumbnails');
        }

        if ($media->preview_path !== null) {
            $media->preview_path = $this->relocate($media->preview_path, trim($newDirectory, '/').'/previews');
        }

        $media->save();

        return $media;
    }

    /** Copia o ficheiro para outro diretório, criando um novo registo. */
    public function copy(Media $media, string $newDirectory): Media
    {
        $newPath = trim($newDirectory, '/').'/'.$this->generateUniqueFilename($media->extension);
        Storage::disk(self::DISK)->copy($media->path, $newPath);

        $clone = $media->replicate();
        $clone->path = $newPath;
        $clone->thumbnail_path = null;
        $clone->preview_path = null;

        if ($media->thumbnail_path !== null) {
            $clone->thumbnail_path = $this->generateThumbnail($newPath);
        }

        $clone->save();

        return $clone;
    }

    // ──────────────────────────────────────────────────────────────────
    // Derivados (thumbnail / preview)
    // ──────────────────────────────────────────────────────────────────

    /**
     * Gera um thumbnail (máx. 400px de largura) via GD para imagens raster.
     * SVG e GIF animados são ignorados (devolve null).
     */
    public function generateThumbnail(string $path): ?string
    {
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        if (! in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true) || ! function_exists('imagecreatefromstring')) {
            return null;
        }

        $contents = Storage::disk(self::DISK)->get($path);
        if ($contents === null) {
            return null;
        }

        $source = @imagecreatefromstring($contents);
        if ($source === false) {
            return null;
        }

        $width = imagesx($source);
        $height = imagesy($source);

        if ($width <= self::THUMBNAIL_MAX_WIDTH) {
            $thumb = $source; // já é pequeno — reutiliza
        } else {
            $newWidth = self::THUMBNAIL_MAX_WIDTH;
            $newHeight = (int) round($height * ($newWidth / $width));
            $thumb = imagescale($source, $newWidth, $newHeight, IMG_BICUBIC);
            if ($thumb === false) {
                imagedestroy($source);

                return null;
            }
        }

        $thumbPath = dirname($path).'/thumbnails/'.pathinfo($path, PATHINFO_FILENAME).'.'.$extension;

        ob_start();
        $ok = match ($extension) {
            'png'   => imagepng($thumb, null, 6),
            'webp'  => function_exists('imagewebp') ? imagewebp($thumb, null, 80) : imagejpeg($thumb, null, 80),
            default => imagejpeg($thumb, null, 80),
        };
        $binary = ob_get_clean();

        if ($thumb !== $source) {
            imagedestroy($thumb);
        }
        imagedestroy($source);

        if (! $ok || $binary === false || $binary === '') {
            return null;
        }

        Storage::disk(self::DISK)->put($thumbPath, $binary);

        return $thumbPath;
    }

    /** Delegado ao PreviewGenerator configurado (Null por omissão). */
    public function generatePreview(Media $media): ?string
    {
        return $this->previewGenerator->generate($media);
    }

    // ──────────────────────────────────────────────────────────────────
    // Utilitários
    // ──────────────────────────────────────────────────────────────────

    /** Nome único e imprevisível — nunca reutiliza o nome do cliente. */
    public function generateUniqueFilename(string $extension): string
    {
        $extension = strtolower(ltrim($extension, '.'));

        return now()->format('Ymd').'-'.Str::uuid().($extension !== '' ? '.'.$extension : '');
    }

    /** URL pública absoluta. Nunca devolver caminhos internos ao cliente. */
    public function buildPublicUrl(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk(self::DISK)->url(ltrim($path, '/'));
    }

    /** MIME real via fileinfo (conteúdo do ficheiro, não a extensão). */
    public function detectMimeType(UploadedFile|string $file): ?string
    {
        $realPath = $file instanceof UploadedFile ? $file->getRealPath() : $file;

        if ($realPath === false || $realPath === null || ! is_file($realPath)) {
            return null;
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo === false) {
            return null;
        }

        $mime = finfo_file($finfo, $realPath);
        finfo_close($finfo);

        return $mime === false ? null : $mime;
    }

    /**
     * Validação de segurança obrigatória para todos os uploads:
     * ficheiro válido, tamanho, extensão permitida, dupla extensão,
     * extensões executáveis e MIME real coerente com a extensão.
     *
     * @throws ValidationException
     */
    public function validateUploadedFile(UploadedFile $file, string $kind, ?int $maxKb = null): void
    {
        if (! $file->isValid()) {
            $this->fail('O ficheiro enviado está corrompido ou o upload falhou.');
        }

        $allowed = self::ALLOWED_EXTENSIONS[$kind] ?? [];
        $extension = strtolower($file->getClientOriginalExtension());

        if ($extension === '' || ! in_array($extension, $allowed, true)) {
            $this->fail('Extensão ".'.$extension.'" não permitida. Aceites: '.implode(', ', $allowed).'.');
        }

        // Dupla extensão / segmentos executáveis: relatorio.php.pdf, shell.exe.png…
        $segments = array_map('strtolower', array_slice(explode('.', $file->getClientOriginalName()), 1));
        foreach ($segments as $segment) {
            if (in_array($segment, self::FORBIDDEN_EXTENSIONS, true)) {
                $this->fail('Nome de ficheiro contém uma extensão não permitida (".'.$segment.'").');
            }
        }

        $maxKb ??= $kind === self::KIND_IMAGE ? self::MAX_IMAGE_KB : self::MAX_DOCUMENT_KB;
        $sizeKb = (int) ceil(($file->getSize() ?: 0) / 1024);
        if ($sizeKb > $maxKb) {
            $this->fail('Ficheiro demasiado grande ('.$sizeKb.' KB). Máximo permitido: '.$maxKb.' KB.');
        }

        $realMime = $this->detectMimeType($file);
        $expected = self::MIME_MAP[$extension] ?? [];
        if ($realMime !== null && $expected !== [] && ! in_array($realMime, $expected, true)) {
            $this->fail('O conteúdo do ficheiro ('.$realMime.') não corresponde à extensão ".'.$extension.'".');
        }
    }

    // ──────────────────────────────────────────────────────────────────
    // Payloads padronizados (contrato §5 da sprint)
    // ──────────────────────────────────────────────────────────────────

    /**
     * Objeto de media padronizado. Nunca devolver apenas "cover_url".
     */
    public function payload(?Media $media): ?array
    {
        if ($media === null) {
            return null;
        }

        return [
            'id'         => $media->id,
            'url'        => $this->buildPublicUrl($media->path),
            'thumbnail'  => $this->buildPublicUrl($media->thumbnail_path),
            'preview'    => $this->buildPublicUrl($media->preview_path),
            'filename'   => $media->filename,
            'mime_type'  => $media->mime_type,
            'extension'  => $media->extension,
            'size'       => $media->size,
            'width'      => $media->width,
            'height'     => $media->height,
            'collection' => $media->collection,
            'sort_order' => $media->sort_order,
        ];
    }

    /**
     * Todos os media de um agregado agrupados por coleção:
     * ['cover' => {...}, 'file' => {...}, 'gallery' => [{...}, ...]].
     * Coleções singulares devolvem objeto; 'gallery' e 'content' devolvem lista.
     */
    public function payloadsFor(string $modelType, string $modelId): array
    {
        $grouped = [];

        $items = Media::query()
            ->where('model_type', $modelType)
            ->where('model_id', $modelId)
            ->orderBy('sort_order')
            ->orderBy('created_at')
            ->get();

        foreach ($items as $media) {
            $payload = $this->payload($media);

            if (in_array($media->collection, ['gallery', 'content'], true)) {
                $grouped[$media->collection][] = $payload;
            } else {
                $grouped[$media->collection] = $payload;
            }
        }

        return $grouped;
    }

    // ──────────────────────────────────────────────────────────────────
    // Internos
    // ──────────────────────────────────────────────────────────────────

    private function inferKind(UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());

        return in_array($extension, self::ALLOWED_EXTENSIONS[self::KIND_IMAGE], true)
            ? self::KIND_IMAGE
            : self::KIND_DOCUMENT;
    }

    /** @return array{0: ?int, 1: ?int} */
    private function imageDimensions(string $path, string $extension): array
    {
        if (! in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif'], true)) {
            return [null, null];
        }

        $absolute = Storage::disk(self::DISK)->path($path);
        $info = @getimagesize($absolute);

        return $info === false ? [null, null] : [$info[0] ?? null, $info[1] ?? null];
    }

    private function deleteFiles(Media $media): void
    {
        $disk = Storage::disk($media->disk ?: self::DISK);

        foreach ([$media->path, $media->thumbnail_path, $media->preview_path] as $path) {
            if ($path !== null && $path !== '') {
                $disk->delete($path);
            }
        }
    }

    private function relocate(string $path, string $newDirectory): string
    {
        $newPath = trim($newDirectory, '/').'/'.basename($path);
        Storage::disk(self::DISK)->move($path, $newPath);

        return $newPath;
    }

    private function fail(string $message): never
    {
        throw ValidationException::withMessages(['file' => [$message]]);
    }
}
