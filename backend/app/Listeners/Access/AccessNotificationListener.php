<?php

namespace App\Listeners\Access;

use App\Events\Domain\Access\SubscriptionApproved;
use App\Events\Domain\Access\SubscriptionCancelled;
use App\Events\Domain\Access\SubscriptionRejected;
use App\Events\Domain\AbstractDomainEvent;
use App\Listeners\AbstractNotificationListener;
use Illuminate\Support\Facades\DB;

/**
 * Responsabilidade única: notificações do domínio Acesso (subscrições).
 * O DocumentSubscriptionService deixa de criar notificações diretamente.
 */
class AccessNotificationListener extends AbstractNotificationListener
{
    public function handleApproved(SubscriptionApproved $event): void
    {
        [$title, $data] = $this->documentContext($event);

        $this->notifyUser(
            userId: $event->payload['user_id'] ?? null,
            type: 'subscription_approved',
            title: 'Subscrição aprovada',
            message: "O seu acesso ao documento \"{$title}\" foi aprovado.",
            referenceId: $event->payload['document_id'] ?? null,
            referenceType: 'document',
            data: $data,
        );
    }

    public function handleRejected(SubscriptionRejected $event): void
    {
        [$title, $data] = $this->documentContext($event);

        $this->notifyUser(
            userId: $event->payload['user_id'] ?? null,
            type: 'subscription_rejected',
            title: 'Subscrição rejeitada',
            message: "O seu pedido de acesso ao documento \"{$title}\" foi rejeitado.",
            referenceId: $event->payload['document_id'] ?? null,
            referenceType: 'document',
            data: $data,
        );
    }

    public function handleCancelled(SubscriptionCancelled $event): void
    {
        [$title, $data] = $this->documentContext($event);

        $this->notifyUser(
            userId: $event->payload['user_id'] ?? null,
            type: 'subscription_cancelled',
            title: 'Subscrição cancelada',
            message: "O seu acesso ao documento \"{$title}\" foi cancelado por um administrador.",
            referenceId: $event->payload['document_id'] ?? null,
            referenceType: 'document',
            data: $data,
        );
    }

    /**
     * Resolve o título e os dados extra (para redirect) do documento em causa.
     *
     * @return array{0: string, 1: array<string, mixed>}
     */
    private function documentContext(AbstractDomainEvent $event): array
    {
        $documentId = $event->payload['document_id'] ?? null;
        $doc = $documentId !== null
            ? DB::table('documents')->where('id', $documentId)->first(['title', 'media_type'])
            : null;

        $title = $doc->title ?? 'documento';
        $data = $doc !== null
            ? ['document_id' => $documentId, 'media_type' => $doc->media_type]
            : [];

        return [$title, $data];
    }
}
