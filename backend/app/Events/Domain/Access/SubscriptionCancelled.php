<?php

namespace App\Events\Domain\Access;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido quando um admin cancela uma subscrição (ACTIVE/PENDING → CANCELLED).
 * Dispatch: SubscriptionCancelled::dispatch($subscriptionId, $adminId, $payload).
 *
 * Payload esperado: user_id, document_id
 */
final class SubscriptionCancelled extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'access.subscription_cancelled';
    }
}
