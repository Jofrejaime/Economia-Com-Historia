<?php

namespace App\Exceptions;

class SubscriptionNotFoundException extends \RuntimeException
{
    public function __construct(string $subscriptionId = '')
    {
        parent::__construct($subscriptionId
            ? "Subscription '{$subscriptionId}' not found."
            : 'Subscription not found.'
        );
    }
}
