<?php

namespace App\Enums;

enum SubscriptionReason: string
{
    case WAITING_ADMIN_APPROVAL = 'WAITING_ADMIN_APPROVAL';
    case ACCESS_GRANTED         = 'ACCESS_GRANTED';
    case REQUEST_REJECTED       = 'REQUEST_REJECTED';
    case SUBSCRIPTION_CANCELLED = 'SUBSCRIPTION_CANCELLED';

    public static function forStatus(SubscriptionStatus $status): self
    {
        return match ($status) {
            SubscriptionStatus::PENDING   => self::WAITING_ADMIN_APPROVAL,
            SubscriptionStatus::ACTIVE    => self::ACCESS_GRANTED,
            SubscriptionStatus::REJECTED  => self::REQUEST_REJECTED,
            SubscriptionStatus::CANCELLED => self::SUBSCRIPTION_CANCELLED,
        };
    }
}
