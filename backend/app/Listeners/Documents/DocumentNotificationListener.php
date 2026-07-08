<?php

namespace App\Listeners\Documents;

use App\Events\Domain\Documents\DocumentPublished;
use App\Models\User;
use App\Services\NotificationService;

/**
 * Responsabilidade única: notificações relacionadas com documentos.
 * Reage a DocumentPublished e avisa o autor (exceto quando ele próprio
 * publica). Os services deixam de criar notificações diretamente.
 */
class DocumentNotificationListener
{
    public function __construct(
        private readonly NotificationService $notifications,
    ) {}

    public function handlePublished(DocumentPublished $event): void
    {
        $createdBy = $event->payload['created_by'] ?? null;
        $title = $event->payload['title'] ?? 'documento';

        if ($createdBy === null || $createdBy === $event->actorId) {
            return;
        }

        $author = User::find($createdBy);
        if ($author === null) {
            return;
        }

        $this->notifications->send(
            $author,
            'document_published',
            'Documento publicado',
            "O seu documento \"{$title}\" foi publicado.",
            $event->aggregateId,
            'document'
        );
    }
}
