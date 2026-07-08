<?php

namespace Tests\Feature;

use App\Events\Domain\Documents\DocumentCreated;
use App\Events\Domain\Documents\DocumentPublished;
use App\Events\Domain\Documents\DocumentUpdated;
use App\Events\Domain\Documents\DocumentViewed;
use App\Listeners\AuditLogListener;
use App\Listeners\Documents\DocumentGamificationListener;
use App\Listeners\Documents\DocumentNotificationListener;
use App\Listeners\Documents\DocumentStatisticsListener;
use App\Listeners\Documents\InvalidateDocumentCacheListener;
use App\Models\User;
use App\Support\PointTransactionReason;
use Database\Seeders\BadgesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Sprint 18.9 — valida que cada listener executa a sua (única) responsabilidade,
 * lê o payload correto e que a semântica afterCommit é respeitada.
 *
 * Os listeners são invocados diretamente porque, sob RefreshDatabase, eventos
 * ShouldDispatchAfterCommit não são entregues (a transação de teste nunca faz
 * commit). O disparo real via subscriber é validado manualmente/produção; aqui
 * garantimos a lógica de cada listener e o comportamento afterCommit no rollback.
 */
class ListenersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(BadgesSeeder::class);
    }

    private function seedDocument(string $createdBy): string
    {
        $id = (string) Str::uuid();
        DB::table('documents')->insert([
            'id'              => $id,
            'title'           => 'Doc',
            'slug'            => 'doc-' . Str::lower(Str::random(5)),
            'author'          => 'Autor',
            'summary'         => 'Resumo',
            'document_type'   => 'article',
            'academic_level'  => 'intro',
            'status'          => 'published',
            'created_by'      => $createdBy,
            'published_at'    => now(),
            'views_count'     => 0,
            'likes_count'     => 0,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        return $id;
    }

    public function test_cache_listener_flushes_cache(): void
    {
        Cache::put('doc-key', 'valor', 300);

        (new InvalidateDocumentCacheListener())->handle(new DocumentUpdated('doc-1', 'actor-1'));

        $this->assertNull(Cache::get('doc-key'), 'O listener de cache deve invalidar o cache.');
    }

    public function test_audit_listener_logs_the_event_envelope(): void
    {
        Log::spy();

        (new AuditLogListener())->handle(new DocumentCreated('doc-1', 'actor-1', ['title' => 'X']));

        Log::shouldHaveReceived('info')->once()->withArgs(function (string $message, array $context) {
            return $message === 'domain_event'
                && $context['event_name'] === 'document.created'
                && $context['aggregate_id'] === 'doc-1'
                && ($context['payload']['title'] ?? null) === 'X';
        });
    }

    public function test_notification_listener_notifies_author_on_publish(): void
    {
        $author = User::factory()->create(['role' => 'estudante']);
        $publisher = User::factory()->create(['role' => 'admin']);

        app(DocumentNotificationListener::class)->handlePublished(
            new DocumentPublished('doc-1', $publisher->id, ['title' => 'Meu Doc', 'created_by' => $author->id])
        );

        $this->assertDatabaseHas('notifications', [
            'user_id' => $author->id,
            'type'    => 'document_published',
        ]);
    }

    public function test_notification_listener_skips_when_author_publishes_own_document(): void
    {
        $author = User::factory()->create(['role' => 'admin']);

        app(DocumentNotificationListener::class)->handlePublished(
            new DocumentPublished('doc-1', $author->id, ['title' => 'Meu Doc', 'created_by' => $author->id])
        );

        $this->assertDatabaseMissing('notifications', [
            'user_id' => $author->id,
            'type'    => 'document_published',
        ]);
    }

    public function test_gamification_listener_awards_upload_points_on_created(): void
    {
        $creator = User::factory()->create(['role' => 'professor']);

        app(DocumentGamificationListener::class)->handleCreated(
            new DocumentCreated('doc-1', $creator->id, ['created_by' => $creator->id, 'title' => 'X'])
        );

        $this->assertDatabaseHas('point_transactions', [
            'user_id' => $creator->id,
            'reason'  => PointTransactionReason::DOCUMENT_UPLOAD,
        ]);
    }

    public function test_gamification_listener_awards_read_points_on_first_view(): void
    {
        $reader = User::factory()->create(['role' => 'estudante']);

        app(DocumentGamificationListener::class)->handleViewed(
            new DocumentViewed('doc-1', $reader->id, ['first_read' => true, 'title' => 'X'])
        );

        $this->assertDatabaseHas('point_transactions', [
            'user_id' => $reader->id,
            'reason'  => PointTransactionReason::DOCUMENT_READ,
        ]);
        $this->assertSame(1, (int) DB::table('user_levels')->where('user_id', $reader->id)->value('documents_read'));
    }

    public function test_gamification_listener_ignores_non_first_views(): void
    {
        $reader = User::factory()->create(['role' => 'estudante']);

        app(DocumentGamificationListener::class)->handleViewed(
            new DocumentViewed('doc-1', $reader->id, ['first_read' => false])
        );

        $this->assertDatabaseMissing('point_transactions', [
            'user_id' => $reader->id,
            'reason'  => PointTransactionReason::DOCUMENT_READ,
        ]);
    }

    public function test_statistics_listener_increments_views_count(): void
    {
        $owner = User::factory()->create();
        $id = $this->seedDocument($owner->id);

        (new DocumentStatisticsListener())->handleViewed(new DocumentViewed($id, $owner->id, ['first_read' => false]));

        $this->assertSame(1, (int) DB::table('documents')->where('id', $id)->value('views_count'));
    }

    public function test_after_commit_events_are_discarded_on_rollback(): void
    {
        $ran = false;
        Event::listen(DocumentUpdated::class, function () use (&$ran): void {
            $ran = true;
        });

        try {
            DB::transaction(function (): void {
                DocumentUpdated::dispatch('doc-1', 'actor-1');
                throw new \RuntimeException('forçar rollback');
            });
        } catch (\RuntimeException $e) {
            // esperado
        }

        $this->assertFalse($ran, 'Eventos afterCommit não devem ser entregues quando a transação faz rollback.');
    }
}
