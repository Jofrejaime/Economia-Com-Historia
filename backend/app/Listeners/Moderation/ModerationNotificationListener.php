<?php

namespace App\Listeners\Moderation;

use App\Events\Domain\Moderation\ModerationActionTaken;
use App\Events\Domain\Moderation\ReportResolved;
use App\Listeners\AbstractNotificationListener;

/**
 * Responsabilidade única: notificações do domínio Moderação.
 * O ReportService/ReportModerationService deixam de criar notificações
 * diretamente.
 */
class ModerationNotificationListener extends AbstractNotificationListener
{
    /** Desfecho da denúncia → notifica quem denunciou. */
    public function handleReportResolved(ReportResolved $event): void
    {
        $actionTaken = (bool) ($event->payload['action_taken'] ?? false);

        $this->notifyUser(
            userId: $event->payload['reporter_id'] ?? null,
            type: $actionTaken ? 'report_reviewed' : 'report_dismissed',
            title: 'Denúncia analisada',
            message: $actionTaken
                ? 'A sua denúncia foi analisada e foi tomada uma ação sobre o conteúdo.'
                : 'A sua denúncia foi analisada. Não foi necessária qualquer ação.',
            referenceId: $event->aggregateId,
            referenceType: 'report',
            skipActorId: $event->actorId,
        );
    }

    /** Ação de moderação → notifica o dono do conteúdo. */
    public function handleActionTaken(ModerationActionTaken $event): void
    {
        $action = $event->payload['action'] ?? '';
        $type = $event->payload['content_type'] ?? 'conteúdo';
        $reason = $event->payload['reason'] ?? null;
        $reasonSuffix = $reason ? " Motivo: {$reason}" : '';

        [$notifType, $title, $message] = match ($action) {
            'warn' => [
                'user_warning',
                'Aviso de Moderação',
                "Você recebeu um aviso de moderação relativo ao seu conteúdo de tipo {$type}.{$reasonSuffix}",
            ],
            'delete' => [
                'content_deleted',
                'Conteúdo Removido',
                "O seu conteúdo de tipo {$type} foi removido por violação das regras.{$reasonSuffix}",
            ],
            'hide' => [
                'content_hidden',
                'Conteúdo Ocultado',
                "O seu conteúdo de tipo {$type} foi ocultado temporariamente.{$reasonSuffix}",
            ],
            'restore' => [
                'content_restored',
                'Conteúdo Restaurado',
                "O seu conteúdo de tipo {$type} foi restaurado com sucesso.",
            ],
            default => [null, null, null],
        };

        if ($notifType === null) {
            return;
        }

        $this->notifyUser(
            userId: $event->payload['owner_id'] ?? null,
            type: $notifType,
            title: $title,
            message: $message,
            referenceId: $event->aggregateId,
            referenceType: 'report',
            skipActorId: $event->actorId,
        );
    }
}
