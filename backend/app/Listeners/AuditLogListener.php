<?php

namespace App\Listeners;

use App\Events\Domain\AbstractDomainEvent;
use Illuminate\Support\Facades\Log;

/**
 * Responsabilidade única: registar em log/auditoria qualquer evento de
 * domínio, de forma uniforme. Substitui os `Log::info()` que estavam
 * espalhados pelos services — que deixam de conhecer logs.
 *
 * É genérico: serve qualquer domínio, não só Documentos.
 */
class AuditLogListener
{
    public function handle(AbstractDomainEvent $event): void
    {
        Log::info('domain_event', $event->toArray());
    }
}
