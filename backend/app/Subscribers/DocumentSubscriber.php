<?php

namespace App\Subscribers;

use App\Events\Domain\Documents\DocumentCreated;
use App\Events\Domain\Documents\DocumentDeleted;
use App\Events\Domain\Documents\DocumentPinned;
use App\Events\Domain\Documents\DocumentPublished;
use App\Events\Domain\Documents\DocumentUnpinned;
use App\Events\Domain\Documents\DocumentUpdated;
use App\Events\Domain\Documents\DocumentViewed;
use App\Listeners\AuditLogListener;
use App\Listeners\Documents\DocumentGamificationListener;
use App\Listeners\Documents\DocumentNotificationListener;
use App\Listeners\Documents\DocumentStatisticsListener;
use App\Listeners\Documents\InvalidateDocumentCacheListener;

/**
 * Liga os eventos do domínio Documentos aos seus listeners dedicados.
 *
 * Registado em AppServiceProvider via Event::subscribe(). Este é o ÚNICO
 * ponto que conhece o mapeamento evento → infraestrutura; nem os services
 * nem os eventos sabem quem os consome.
 *
 * A auditoria só cobre os eventos de ciclo de vida (escrita); eventos de
 * interação de alta frequência (viewed/liked/…) não são auditados para não
 * inundar os logs. Favorited/Liked/… são emitidos na mesma
 * (contrato pronto para a Sprint 19.0 — Reverb), ainda que sem listener agora.
 *
 * @return array<class-string, list<string>>
 */
class DocumentSubscriber
{
    public function subscribe(): array
    {
        $cache = InvalidateDocumentCacheListener::class . '@handle';
        $audit = AuditLogListener::class . '@handle';

        return [
            DocumentCreated::class => [
                $cache,
                $audit,
                DocumentGamificationListener::class . '@handleCreated',
            ],
            DocumentUpdated::class => [$cache, $audit],
            DocumentDeleted::class => [$cache, $audit],
            DocumentPublished::class => [
                $cache,
                $audit,
                DocumentNotificationListener::class . '@handlePublished',
            ],
            DocumentPinned::class => [$cache, $audit],
            DocumentUnpinned::class => [$cache, $audit],
            DocumentViewed::class => [
                DocumentStatisticsListener::class . '@handleViewed',
                DocumentGamificationListener::class . '@handleViewed',
            ],
        ];
    }
}
