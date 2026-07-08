<?php

namespace App\Listeners\Documents;

use App\Events\Domain\Documents\DocumentViewed;
use Illuminate\Support\Facades\DB;

/**
 * Responsabilidade única: atualizar contadores estatísticos de documentos em
 * reação a eventos. Para o piloto trata do contador de visualizações; os
 * contadores de likes/downloads/favoritos, por estarem acoplados à escrita
 * transacional do próprio pedido, permanecem por agora no controller e
 * migrarão nas fases seguintes.
 */
class DocumentStatisticsListener
{
    public function handleViewed(DocumentViewed $event): void
    {
        if ($event->aggregateId === null) {
            return;
        }

        DB::table('documents')
            ->where('id', $event->aggregateId)
            ->increment('views_count');
    }
}
