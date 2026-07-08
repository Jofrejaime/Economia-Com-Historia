<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Sprint 18.4 — Infraestrutura Global de Media & Uploads.
 *
 * Cobre o endpoint genérico /media/uploads, o pipeline de documentos
 * (capa + ficheiro + galeria), a limpeza automática na eliminação e o avatar.
 */
class MediaUploadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    private function issueToken(User $user): string
    {
        $token = Str::random(80);

        DB::table('user_sessions')->insert([
            'id'            => (string) Str::uuid(),
            'user_id'       => $user->id,
            'refresh_token' => $token,
            'expires_at'    => now()->addDays(30),
            'created_at'    => now(),
        ]);

        return $token;
    }

    private function admin(): array
    {
        $user = User::factory()->create(['role' => 'admin']);

        return [$user, $this->issueToken($user)];
    }

    private function pdf(string $name = 'artigo.pdf'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, "%PDF-1.4\n%teste\n%%EOF");
    }

    private function documentPayload(): array
    {
        return [
            'title'           => 'Documento com media',
            'author'          => 'Autor Teste',
            'summary'         => 'Resumo de teste.',
            'document_type'   => 'article',
            'academic_level'  => 'intro',
        ];
    }

    // ─── /media/uploads ───────────────────────────────────────────────────

    public function test_admin_uploads_image_and_receives_standard_media_object(): void
    {
        [, $token] = $this->admin();

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->post('/api/media/uploads', [
                'file'       => UploadedFile::fake()->image('inline.png', 640, 480),
                'collection' => 'content',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'data' => [
                'id', 'url', 'thumbnail', 'filename', 'mime_type', 'extension', 'size', 'width', 'height',
            ]]);

        $data = $response->json('data');
        $this->assertStringContainsString('/storage/', $data['url']);
        $this->assertStringNotContainsString('storage/app', $data['url']);
        $this->assertSame('image/png', $data['mime_type']);
        $this->assertDatabaseHas('media', ['id' => $data['id'], 'collection' => 'content']);
    }

    public function test_student_cannot_use_generic_upload(): void
    {
        $student = User::factory()->create(['role' => 'estudante']);
        $token = $this->issueToken($student);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->post('/api/media/uploads', ['file' => UploadedFile::fake()->image('x.png')])
            ->assertStatus(403);
    }

    public function test_upload_rejects_file_whose_content_does_not_match_extension(): void
    {
        [, $token] = $this->admin();

        // Conteúdo PNG real disfarçado de PDF
        $png = UploadedFile::fake()->image('real.png');
        $fake = new UploadedFile($png->getRealPath(), 'falso.pdf', 'application/pdf', null, true);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->post('/api/media/uploads', ['file' => $fake])
            ->assertStatus(422);
    }

    public function test_upload_rejects_double_extension(): void
    {
        [, $token] = $this->admin();

        $legit = UploadedFile::fake()->image('x.jpg');
        $malicious = new UploadedFile($legit->getRealPath(), 'shell.php.jpg', 'image/jpeg', null, true);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->post('/api/media/uploads', ['file' => $malicious])
            ->assertStatus(422);
    }

    public function test_upload_rejects_file_too_large(): void
    {
        [, $token] = $this->admin();

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->post('/api/media/uploads', [
                'file' => UploadedFile::fake()->create('gigante.pdf', 60000, 'application/pdf'),
            ])
            ->assertStatus(422);
    }

    public function test_admin_can_delete_uploaded_media_and_files_are_removed(): void
    {
        [, $token] = $this->admin();

        $upload = $this->withHeader('Authorization', 'Bearer '.$token)
            ->post('/api/media/uploads', ['file' => UploadedFile::fake()->image('remover.jpg', 500, 500)]);

        $id = $upload->json('data.id');
        $path = DB::table('media')->where('id', $id)->value('path');

        Storage::disk('public')->assertExists($path);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson('/api/media/'.$id)
            ->assertStatus(200);

        Storage::disk('public')->assertMissing($path);
        $this->assertDatabaseMissing('media', ['id' => $id]);
    }

    // ─── Documents: capa + ficheiro + galeria ─────────────────────────────

    public function test_document_store_with_cover_file_and_gallery_registers_media_and_urls(): void
    {
        [, $token] = $this->admin();

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->post('/api/admin/documents', array_merge($this->documentPayload(), [
                'file'        => $this->pdf(),
                'cover_image' => UploadedFile::fake()->image('capa.jpg', 1200, 630),
                'gallery'     => [
                    UploadedFile::fake()->image('g1.jpg'),
                    UploadedFile::fake()->image('g2.png'),
                ],
            ]));

        $response->assertStatus(201);
        $documentId = $response->json('id');

        // Objetos de media padronizados na resposta
        $media = $response->json('media');
        $this->assertArrayHasKey('cover', $media);
        $this->assertArrayHasKey('file', $media);
        $this->assertCount(2, $media['gallery']);
        $this->assertNotNull($media['cover']['thumbnail']);

        // Colunas legadas sincronizadas com URLs públicas
        $document = DB::table('documents')->where('id', $documentId)->first();
        $this->assertStringContainsString('/storage/documents/covers/', $document->cover_image_url);
        $this->assertStringContainsString('/storage/documents/pdf/', $document->media_url);
        $this->assertSame('PDF', $document->media_type);
        $this->assertSame($document->media_url, $document->pdf_url);

        $this->assertSame(4, DB::table('media')->where('model_id', $documentId)->count());
    }

    public function test_document_update_replaces_cover_and_removes_old_file(): void
    {
        [, $token] = $this->admin();

        $create = $this->withHeader('Authorization', 'Bearer '.$token)
            ->post('/api/admin/documents', array_merge($this->documentPayload(), [
                'cover_image' => UploadedFile::fake()->image('antiga.jpg', 800, 600),
            ]));

        $documentId = $create->json('id');
        $oldPath = DB::table('media')->where('model_id', $documentId)->where('collection', 'cover')->value('path');

        $update = $this->withHeader('Authorization', 'Bearer '.$token)
            ->patch('/api/admin/documents/'.$documentId, [
                'cover_image' => UploadedFile::fake()->image('nova.png', 800, 600),
            ]);

        $update->assertStatus(200);

        Storage::disk('public')->assertMissing($oldPath);
        $this->assertSame(1, DB::table('media')->where('model_id', $documentId)->where('collection', 'cover')->count());

        $newUrl = $update->json('media.cover.url');
        $this->assertStringEndsWith('.png', $newUrl);
        $this->assertSame($newUrl, DB::table('documents')->where('id', $documentId)->value('cover_image_url'));
    }

    public function test_document_delete_removes_all_media_files_no_orphans(): void
    {
        [, $token] = $this->admin();

        $create = $this->withHeader('Authorization', 'Bearer '.$token)
            ->post('/api/admin/documents', array_merge($this->documentPayload(), [
                'file'        => $this->pdf(),
                'cover_image' => UploadedFile::fake()->image('capa.jpg', 900, 500),
                'gallery'     => [UploadedFile::fake()->image('g1.jpg')],
            ]));

        $documentId = $create->json('id');
        $paths = DB::table('media')->where('model_id', $documentId)
            ->get(['path', 'thumbnail_path']);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson('/api/admin/documents/'.$documentId)
            ->assertStatus(200);

        foreach ($paths as $row) {
            Storage::disk('public')->assertMissing($row->path);
            if ($row->thumbnail_path !== null) {
                Storage::disk('public')->assertMissing($row->thumbnail_path);
            }
        }

        $this->assertSame(0, DB::table('media')->where('model_id', $documentId)->count());
    }

    public function test_document_store_with_invalid_file_creates_nothing(): void
    {
        [, $token] = $this->admin();

        $legit = UploadedFile::fake()->image('x.jpg');
        $malicious = new UploadedFile($legit->getRealPath(), 'virus.php.jpg', 'image/jpeg', null, true);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->post('/api/admin/documents', array_merge($this->documentPayload(), [
                'cover_image' => $malicious,
            ]))
            ->assertStatus(422);

        $this->assertSame(0, DB::table('documents')->count());
        $this->assertSame(0, DB::table('media')->count());
    }

    // ─── Avatar ───────────────────────────────────────────────────────────

    public function test_avatar_upload_returns_media_object_and_replaces_previous(): void
    {
        $user = User::factory()->create(['role' => 'estudante']);
        $token = $this->issueToken($user);

        $first = $this->withHeader('Authorization', 'Bearer '.$token)
            ->post('/api/profile/avatar', ['avatar' => UploadedFile::fake()->image('a.png', 300, 300)]);

        $first->assertStatus(200)
            ->assertJsonStructure(['message', 'avatar_url', 'avatar' => ['id', 'url', 'thumbnail', 'mime_type', 'size']]);

        $firstPath = DB::table('media')->where('model_type', 'user_profile')->where('model_id', $user->id)->value('path');

        $second = $this->withHeader('Authorization', 'Bearer '.$token)
            ->post('/api/profile/avatar', ['avatar' => UploadedFile::fake()->image('b.jpg', 300, 300)]);

        $second->assertStatus(200);

        Storage::disk('public')->assertMissing($firstPath);
        $this->assertSame(1, DB::table('media')->where('model_type', 'user_profile')->where('model_id', $user->id)->count());

        $profileAvatar = DB::table('user_profiles')->where('user_id', $user->id)->value('avatar_url');
        $this->assertStringContainsString("avatars/{$user->id}/", $profileAvatar);
    }
}
