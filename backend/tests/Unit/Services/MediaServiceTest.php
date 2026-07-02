<?php

namespace Tests\Unit\Services;

use App\Models\Media;
use App\Services\MediaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class MediaServiceTest extends TestCase
{
    use RefreshDatabase;

    private MediaService $service;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->service = app(MediaService::class);
    }

    public function test_uploads_image_stores_file_generates_thumbnail_and_persists_record(): void
    {
        $file = UploadedFile::fake()->image('capa.jpg', 800, 600);

        $media = $this->service->upload($file, 'documents/covers', [
            'model_type' => 'document',
            'collection' => 'cover',
        ]);

        Storage::disk('public')->assertExists($media->path);
        $this->assertNotNull($media->thumbnail_path);
        Storage::disk('public')->assertExists($media->thumbnail_path);

        $this->assertSame('cover', $media->collection);
        $this->assertSame('image/jpeg', $media->mime_type);
        $this->assertSame('jpg', $media->extension);
        $this->assertSame(800, $media->width);
        $this->assertSame(600, $media->height);
        $this->assertSame('capa.jpg', $media->filename);
        $this->assertDatabaseHas('media', ['id' => $media->id]);
    }

    public function test_uploads_pdf_without_thumbnail(): void
    {
        $file = UploadedFile::fake()->createWithContent('artigo.pdf', "%PDF-1.4\n%conteudo de teste\n%%EOF");

        $media = $this->service->upload($file, 'documents/pdf', ['collection' => 'file']);

        Storage::disk('public')->assertExists($media->path);
        $this->assertNull($media->thumbnail_path);
        $this->assertSame('application/pdf', $media->mime_type);
    }

    public function test_rejects_extension_not_allowed(): void
    {
        $this->expectException(ValidationException::class);

        $file = UploadedFile::fake()->createWithContent('script.exe', 'MZ binary');
        $this->service->upload($file, 'temp');
    }

    public function test_rejects_double_extension_with_executable_segment(): void
    {
        $this->expectException(ValidationException::class);

        // conteúdo JPEG legítimo mas nome contém .php — tem de ser recusado
        $legit = UploadedFile::fake()->image('x.jpg');
        $file = new UploadedFile($legit->getRealPath(), 'shell.php.jpg', 'image/jpeg', null, true);

        $this->service->upload($file, 'temp', ['kind' => MediaService::KIND_IMAGE]);
    }

    public function test_rejects_file_larger_than_limit(): void
    {
        $this->expectException(ValidationException::class);

        $file = UploadedFile::fake()->create('grande.jpg', MediaService::MAX_IMAGE_KB + 1, 'image/jpeg');
        $this->service->upload($file, 'temp', ['kind' => MediaService::KIND_IMAGE]);
    }

    public function test_rejects_mime_that_does_not_match_extension(): void
    {
        $this->expectException(ValidationException::class);

        // conteúdo PNG real com extensão .pdf — MIME real não corresponde
        $png = UploadedFile::fake()->image('real.png');
        $file = new UploadedFile($png->getRealPath(), 'falso.pdf', 'application/pdf', null, true);

        $this->service->upload($file, 'temp', ['kind' => MediaService::KIND_DOCUMENT]);
    }

    public function test_replace_removes_old_file_and_record_after_new_is_stored(): void
    {
        $old = $this->service->upload(UploadedFile::fake()->image('antiga.png', 500, 500), 'documents/covers', [
            'model_type' => 'document',
            'model_id'   => '11111111-1111-1111-1111-111111111111',
            'collection' => 'cover',
        ]);

        $new = $this->service->replace($old, UploadedFile::fake()->image('nova.jpg', 500, 500), 'documents/covers');

        Storage::disk('public')->assertMissing($old->path);
        Storage::disk('public')->assertExists($new->path);
        $this->assertDatabaseMissing('media', ['id' => $old->id]);
        $this->assertDatabaseHas('media', ['id' => $new->id]);

        // replace herda o vínculo ao agregado
        $this->assertSame('document', $new->model_type);
        $this->assertSame('11111111-1111-1111-1111-111111111111', $new->model_id);
        $this->assertSame('cover', $new->collection);
    }

    public function test_delete_removes_file_thumbnail_and_record(): void
    {
        $media = $this->service->upload(UploadedFile::fake()->image('img.jpg', 800, 800), 'documents/gallery');
        $path = $media->path;
        $thumb = $media->thumbnail_path;

        $this->service->delete($media);

        Storage::disk('public')->assertMissing($path);
        Storage::disk('public')->assertMissing($thumb);
        $this->assertDatabaseMissing('media', ['id' => $media->id]);
    }

    public function test_delete_for_removes_all_media_of_an_aggregate(): void
    {
        $docId = '22222222-2222-2222-2222-222222222222';

        foreach (['a', 'b'] as $name) {
            $this->service->upload(UploadedFile::fake()->image($name.'.jpg'), 'documents/gallery', [
                'model_type' => 'document',
                'model_id'   => $docId,
                'collection' => 'gallery',
            ]);
        }

        $this->assertSame(2, Media::where('model_id', $docId)->count());

        $this->service->deleteFor('document', $docId);

        $this->assertSame(0, Media::where('model_id', $docId)->count());
    }

    public function test_build_public_url_never_returns_internal_path(): void
    {
        $url = $this->service->buildPublicUrl('documents/pdf/file.pdf');

        $this->assertNotNull($url);
        $this->assertStringContainsString('/storage/documents/pdf/file.pdf', $url);

        // URLs absolutas passam inalteradas; null permanece null
        $this->assertSame('https://cdn.example.com/x.png', $this->service->buildPublicUrl('https://cdn.example.com/x.png'));
        $this->assertNull($this->service->buildPublicUrl(null));
    }

    public function test_generate_unique_filename_is_unique_and_keeps_extension(): void
    {
        $a = $this->service->generateUniqueFilename('pdf');
        $b = $this->service->generateUniqueFilename('pdf');

        $this->assertNotSame($a, $b);
        $this->assertStringEndsWith('.pdf', $a);
    }

    public function test_payloads_for_groups_by_collection(): void
    {
        $docId = '33333333-3333-3333-3333-333333333333';

        $this->service->upload(UploadedFile::fake()->image('capa.jpg'), 'documents/covers', [
            'model_type' => 'document', 'model_id' => $docId, 'collection' => 'cover',
        ]);
        $this->service->upload(UploadedFile::fake()->image('g1.jpg'), 'documents/gallery', [
            'model_type' => 'document', 'model_id' => $docId, 'collection' => 'gallery',
        ]);
        $this->service->upload(UploadedFile::fake()->image('g2.jpg'), 'documents/gallery', [
            'model_type' => 'document', 'model_id' => $docId, 'collection' => 'gallery',
        ]);

        $payloads = $this->service->payloadsFor('document', $docId);

        $this->assertArrayHasKey('cover', $payloads);
        $this->assertArrayHasKey('url', $payloads['cover']);
        $this->assertArrayHasKey('thumbnail', $payloads['cover']);
        $this->assertArrayHasKey('mime_type', $payloads['cover']);
        $this->assertArrayHasKey('size', $payloads['cover']);
        $this->assertCount(2, $payloads['gallery']);
    }
}
