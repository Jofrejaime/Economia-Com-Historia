<?php

namespace App\Exceptions;

use App\Enums\SubscriptionStatus;

class InvalidSubscriptionTransitionException extends \RuntimeException
{
    public function __construct(
        public readonly SubscriptionStatus $currentStatus,
        public readonly SubscriptionStatus $targetStatus,
    ) {
        parent::__construct(
            "Cannot transition from {$currentStatus->value} to {$targetStatus->value}."
        );
    }
}
