<?php

namespace App\Events\Domain\Access;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido quando um pedido de subscrição é rejeitado (PENDING → REJECTED).
 * Dispatch: SubscriptionRejected::dispatch($subscriptionId, $adminId, $payload).
 *
 * Payload esperado: user_id, document_id
 */
final class SubscriptionRejected extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'access.subscription_rejected';
    }
}
