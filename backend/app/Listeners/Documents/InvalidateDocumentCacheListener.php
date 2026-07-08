<?php

namespace App\Listeners\Documents;

use App\Events\Domain\AbstractDomainEvent;
use Illuminate\Support\Facades\Cache;

/**
 * Responsabilidade única: invalidar o cache de documentos quando o estado
 * muda. Substitui os antigos `clearCache()` espalhados pelos services.
 *
 * O driver de cache é `database` e não suporta tags — usa-se flush().
 */
class InvalidateDocumentCacheListener
{
    public function handle(AbstractDomainEvent $event): void
    {
        Cache::flush();
    }
}
