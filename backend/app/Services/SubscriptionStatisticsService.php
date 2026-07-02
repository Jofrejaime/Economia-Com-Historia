<?php

namespace App\Services;

use App\Enums\SubscriptionStatus;
use Illuminate\Support\Facades\DB;

class SubscriptionStatisticsService
{
    public function summary(): array
    {
        return [
            'total'     => DB::table('document_subscriptions')->count(),
            'pending'   => DB::table('document_subscriptions')->where('status', SubscriptionStatus::PENDING->value)->count(),
            'active'    => DB::table('document_subscriptions')->where('status', SubscriptionStatus::ACTIVE->value)->count(),
            'rejected'  => DB::table('document_subscriptions')->where('status', SubscriptionStatus::REJECTED->value)->count(),
            'cancelled' => DB::table('document_subscriptions')->where('status', SubscriptionStatus::CANCELLED->value)->count(),
        ];
    }
}