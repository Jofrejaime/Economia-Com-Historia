<?php

namespace Tests\Feature;

use App\Events\Domain\AbstractDomainEvent;
use App\Events\Domain\Documents\DocumentCreated;
use App\Events\Domain\Documents\DocumentPublished;
use App\Events\Domain\Documents\DocumentViewed;
use App\Models\User;
use App\Services\DocumentAdminService;
use Database\Seeders\BadgesSeeder;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Sprint 18.9 — valida que os domínios emitem Domain Events padronizados.
 */
class DomainEventsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(BadgesSeeder::class);
    }

    private function creator(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function documentData(string $title): array
    {
        return [
            'title'           => $title,
            'author'          => 'Autor Teste',
            'summary'         => 'Resumo',
            'document_type'   => 'article',
            'academic_level'  => 'intro',
        ];
    }

    private function seedDraft(string $title, string $createdBy): string
    {
        $id = (string) Str::uuid();
        DB::table('documents')->insert([
            'id'              => $id,
            'title'           => $title,
            'slug'            => Str::slug($title) . '-' . Str::lower(Str::random(4)),
            'author'          => 'Autor',
            'summary'         => 'Resumo',
            'document_type'   => 'article',
            'academic_level'  => 'intro',
            'status'          => 'draft',
            'created_by'      => $createdBy,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        return $id;
    }

    public function test_creating_a_document_dispatches_DocumentCreated(): void
    {
        Event::fake([DocumentCreated::class]);
        $creator = $this->creator();

        $doc = app(DocumentAdminService::class)->create($this->documentData('Doc A'), $creator);

        Event::assertDispatched(DocumentCreated::class, function (DocumentCreated $e) use ($doc, $creator) {
            return $e->aggregateId === $doc->id
                && $e->actorId === $creator->id
                && $e->eventName === 'document.created'
                && ($e->payload['created_by'] ?? null) === $creator->id;
        });
    }

    public function test_publishing_a_document_dispatches_DocumentPublished(): void
    {
        Event::fake([DocumentPublished::class]);
        $admin = $this->creator();
        $id = $this->seedDraft('Doc B', $admin->id);

        app(DocumentAdminService::class)->publish($id, $admin);

        Event::assertDispatched(DocumentPublished::class, fn (DocumentPublished $e) =>
            $e->aggregateId === $id && $e->eventName === 'document.published');
    }

    public function test_viewing_a_document_dispatches_DocumentViewed(): void
    {
        Event::fake([DocumentViewed::class]);
        $author = $this->creator();
        $id = $this->seedDraft('Doc C', $author->id);
        DB::table('documents')->where('id', $id)->update(['status' => 'published', 'published_at' => now()]);

        Mail::fake();
        $token = $this->postJson('/api/auth/register', [
            'email' => 'viewer@example.com',
            'password' => 'Kh7#m9$Pq2!z',
            'password_confirmation' => 'Kh7#m9$Pq2!z',
            'display_name' => 'Viewer',
        ])->json('token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/documents/{$id}")
            ->assertOk();

        Event::assertDispatched(DocumentViewed::class, fn (DocumentViewed $e) =>
            $e->aggregateId === $id && $e->eventName === 'document.viewed');
    }

    public function test_domain_event_envelope_has_all_required_fields(): void
    {
        $event = new DocumentPublished('agg-1', 'actor-1', ['title' => 'X'], 'corr-1', 1);

        $array = $event->toArray();

        foreach (['event_id', 'event_name', 'occurred_at', 'actor_id', 'correlation_id', 'aggregate_id', 'version', 'payload'] as $field) {
            $this->assertArrayHasKey($field, $array, "Falta o campo {$field} no envelope.");
        }

        $this->assertSame('document.published', $array['event_name']);
        $this->assertSame('agg-1', $array['aggregate_id']);
        $this->assertSame('actor-1', $array['actor_id']);
        $this->assertSame('corr-1', $array['correlation_id']);
        $this->assertSame(1, $array['version']);
        $this->assertSame(['title' => 'X'], $array['payload']);
        $this->assertNotEmpty($array['event_id']);
        $this->assertNotEmpty($array['occurred_at']);
    }

    public function test_domain_events_dispatch_after_commit(): void
    {
        $this->assertInstanceOf(
            ShouldDispatchAfterCommit::class,
            new DocumentCreated('a', 'b'),
            'Os domain events devem implementar ShouldDispatchAfterCommit.'
        );
        $this->assertInstanceOf(AbstractDomainEvent::class, new DocumentViewed('a', 'b'));
    }
}
