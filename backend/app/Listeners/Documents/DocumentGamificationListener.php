<?php

namespace App\Listeners\Documents;

use App\Events\Domain\Documents\DocumentCreated;
use App\Events\Domain\Documents\DocumentViewed;
use App\Models\User;
use App\Services\GamificationService;
use App\Support\PointTransactionReason;

/**
 * Responsabilidade única: efeitos de gamificação de documentos.
 *  - DocumentCreated  → +10 pontos ao autor (contribuição).
 *  - DocumentViewed   → na primeira leitura, conta o documento e +2 pontos.
 *
 * NOTA: os pontos por "like" continuam no controller porque a resposta HTTP
 * devolve o resultado da gamificação de imediato (não pode ser afterCommit).
 */
class DocumentGamificationListener
{
    public function __construct(
        private readonly GamificationService $gamification,
    ) {}

    public function handleCreated(DocumentCreated $event): void
    {
        $creatorId = $event->payload['created_by'] ?? $event->actorId;
        if ($creatorId === null) {
            return;
        }

        $creator = User::find($creatorId);
        if ($creator === null) {
            return;
        }

        $title = $event->payload['title'] ?? 'documento';

        $this->gamification->awardPoints(
            $creator,
            10,
            PointTransactionReason::DOCUMENT_UPLOAD,
            $event->aggregateId,
            'document',
            "Documento carregado: {$title}"
        );
    }

    public function handleViewed(DocumentViewed $event): void
    {
        if (empty($event->payload['first_read']) || $event->actorId === null) {
            return;
        }

        $user = User::find($event->actorId);
        if ($user === null) {
            return;
        }

        $title = $event->payload['title'] ?? 'documento';

        // Contador antes dos pontos, para a avaliação de badges já ver o valor novo.
        $this->gamification->incrementCounters($user, ['documents_read' => 1]);
        $this->gamification->awardPoints(
            $user,
            2,
            PointTransactionReason::DOCUMENT_READ,
            $event->aggregateId,
            'document',
            "Documento lido: {$title}"
        );
    }
}
