<?php

namespace App\Enums;

enum SubscriptionStatus: string
{
    case PENDING   = 'PENDING';
    case ACTIVE    = 'ACTIVE';
    case REJECTED  = 'REJECTED';
    case CANCELLED = 'CANCELLED';
}
