<?php

namespace Tests\Feature;

use App\Events\Domain\Access\SubscriptionApproved;
use App\Events\Domain\Access\SubscriptionCancelled;
use App\Events\Domain\Access\SubscriptionRejected;
use App\Listeners\Access\AccessNotificationListener;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Fase 1 (EDA) — valida o AccessNotificationListener por invocação direta.
 */
class AccessListenersTest extends TestCase
{
    use RefreshDatabase;

    private function listener(): AccessNotificationListener
    {
        return app(AccessNotificationListener::class);
    }

    private function seedDocument(string $createdBy, string $title = 'Jindungo Vol. I', ?string $mediaType = 'TEXT'): string
    {
        $id = (string) Str::uuid();
        DB::table('documents')->insert([
            'id'             => $id,
            'title'          => $title,
            'slug'           => 'doc-' . Str::lower(Str::random(5)),
            'author'         => 'Autor',
            'summary'        => 'Resumo',
            'document_type'  => 'article',
            'academic_level' => 'intro',
            'media_type'     => $mediaType,
            'status'         => 'published',
            'created_by'     => $createdBy,
            'views_count'    => 0,
            'likes_count'    => 0,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        return $id;
    }

    public function test_approved_notifies_user_with_document_context(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $documentId = $this->seedDocument($admin->id, 'Jindungo Vol. I', 'VIDEO');

        $this->listener()->handleApproved(new SubscriptionApproved('sub-1', $admin->id, [
            'user_id'     => $user->id,
            'document_id' => $documentId,
        ]));

        $notification = DB::table('notifications')
            ->where('user_id', $user->id)
            ->where('type', 'subscription_approved')
            ->first();

        $this->assertNotNull($notification);
        $this->assertSame($documentId, $notification->reference_id);
        $this->assertSame('document', $notification->reference_type);
        $this->assertStringContainsString('Jindungo Vol. I', $notification->message);
        // Dados de redirect (media_type) guardados no payload JSON.
        $this->assertStringContainsString('VIDEO', $notification->data);
    }

    public function test_rejected_notifies_user(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $documentId = $this->seedDocument($admin->id);

        $this->listener()->handleRejected(new SubscriptionRejected('sub-1', $admin->id, [
            'user_id'     => $user->id,
            'document_id' => $documentId,
        ]));

        $this->assertDatabaseHas('notifications', [
            'user_id' => $user->id,
            'type'    => 'subscription_rejected',
            'title'   => 'Subscrição rejeitada',
        ]);
    }

    public function test_cancelled_notifies_user(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $documentId = $this->seedDocument($admin->id);

        $this->listener()->handleCancelled(new SubscriptionCancelled('sub-1', $admin->id, [
            'user_id'     => $user->id,
            'document_id' => $documentId,
        ]));

        $this->assertDatabaseHas('notifications', [
            'user_id' => $user->id,
            'type'    => 'subscription_cancelled',
            'title'   => 'Subscrição cancelada',
        ]);
    }

    public function test_approve_endpoint_dispatches_event(): void
    {
        \Illuminate\Support\Facades\Event::fake([SubscriptionApproved::class]);

        $user = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $documentId = $this->seedDocument($admin->id);

        $subId = (string) Str::uuid();
        DB::table('document_subscriptions')->insert([
            'id'          => $subId,
            'user_id'     => $user->id,
            'document_id' => $documentId,
            'status'      => 'PENDING',
            'started_at'  => now(),
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        app(\App\Services\DocumentSubscriptionService::class)->approveSubscription($subId, $admin->id);

        \Illuminate\Support\Facades\Event::assertDispatched(
            SubscriptionApproved::class,
            fn ($event) => ($event->payload['user_id'] ?? null) === $user->id
                && ($event->payload['document_id'] ?? null) === $documentId
        );
    }
}
