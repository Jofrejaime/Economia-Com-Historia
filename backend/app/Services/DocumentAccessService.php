<?php

namespace App\Services;

use App\Enums\SubscriptionStatus;
use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Query\Builder;

/**
 * Responsible exclusively for document access authorization.
 *
 * Delegates subscription checks to DocumentSubscriptionService.
 * Delegates access-level grant checks to AccessGateService (legacy compat).
 */
class DocumentAccessService
{
    public function __construct(
        private readonly AccessGateService $accessGate,
        private readonly DocumentSubscriptionService $subscriptionService,
    ) {}

    /**
     * Authoritative read access check for a document.
     *
     * New model: category.requires_subscription → DocumentSubscriptionService.
     * Legacy compat: documents not in a subscription category fall back to
     * access_level_id / AccessGateService so existing grants keep working.
     */
    public function canReadDocument(User $user, object $document): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if (isset($document->created_by) && $document->created_by === $user->id) {
            return true;
        }

        if ($document instanceof Document && !$document->relationLoaded('category')) {
            $document->load('category');
        }

        $category = $document instanceof Document ? $document->category : null;

        if ($category !== null && $category->requires_subscription) {
            // Only ACTIVE subscriptions grant access.
            // PENDING, REJECTED, CANCELLED do not.
            return $this->subscriptionService->hasActiveSubscription($user->id, $document->id);
        }

        // Legacy: access_level_id based grant check
        $accessLevelId = $document->access_level_id ?? 'public';

        return $this->accessGate->canAccess($user, $accessLevelId);
    }

    public function isSubscriptionRequired(object $document): bool
    {
        if ($document instanceof Document) {
            if (!$document->relationLoaded('category')) {
                $document->load('category');
            }
            $category = $document->category;

            return $category !== null && (bool) $category->requires_subscription;
        }

        return false;
    }

    /**
     * Apply subscription-aware visibility filter to a document listing query.
     *
     * The $query must already have document_categories joined as 'dc'.
     */
    public function applyListingFilter(Builder $query, User $user, string $tableAlias = 'd'): void
    {
        if ($user->role === 'admin') {
            return;
        }

        $grantLevels = $this->accessGate->activeGrantLevelIds($user);

        $query->where(function (Builder $outer) use ($user, $grantLevels, $tableAlias): void {
            // Document creator always sees their own docs
            $outer->where("{$tableAlias}.created_by", $user->id);

            // Subscription-gated docs where user has an ACTIVE subscription
            $outer->orWhere(function (Builder $b) use ($user, $tableAlias): void {
                $b->where('dc.requires_subscription', true)
                    ->whereExists(function (Builder $sub) use ($user, $tableAlias): void {
                        $sub->from('document_subscriptions')
                            ->whereColumn('document_id', "{$tableAlias}.id")
                            ->where('user_id', $user->id)
                            ->where('status', SubscriptionStatus::ACTIVE->value);
                    });
            });

            // Free docs (no subscription category) with accessible access_level
            $outer->orWhere(function (Builder $b) use ($grantLevels, $tableAlias): void {
                $b->where(function (Builder $inner) use ($tableAlias): void {
                    $inner->whereNull('dc.requires_subscription')
                        ->orWhere('dc.requires_subscription', false);
                })
                ->where(function (Builder $inner) use ($grantLevels, $tableAlias): void {
                    $inner->where("{$tableAlias}.access_level_id", 'public');
                    if ($grantLevels !== []) {
                        $inner->orWhereIn("{$tableAlias}.access_level_id", $grantLevels);
                    }
                });
            });
        });
    }
}
