<?php

namespace App\Listeners\Documents;

use App\Events\Domain\Documents\DocumentPublished;
use App\Listeners\AbstractNotificationListener;

/**
 * Responsabilidade única: notificações relacionadas com documentos.
 * Reage a DocumentPublished e avisa o autor (exceto quando ele próprio
 * publica). Os services deixam de criar notificações diretamente.
 */
class DocumentNotificationListener extends AbstractNotificationListener
{
    public function handlePublished(DocumentPublished $event): void
    {
        $title = $event->payload['title'] ?? 'documento';

        $this->notifyUser(
            userId: $event->payload['created_by'] ?? null,
            type: 'document_published',
            title: 'Documento publicado',
            message: "O seu documento \"{$title}\" foi publicado.",
            referenceId: $event->aggregateId,
            referenceType: 'document',
            // Não notificar quando o próprio autor publica o seu documento.
            skipActorId: $event->actorId,
        );
    }
}
