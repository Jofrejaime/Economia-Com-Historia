<?php

namespace App\Services;

use App\Enums\SubscriptionStatus;
use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Query\Builder;

class DocumentAccessService
{
    public function __construct(
        private readonly AccessGateService $accessGate,
        private readonly DocumentSubscriptionService $subscriptionService,
    ) {}

    public function canReadDocument(?User $user, object $document): bool
    {
        if ($user !== null && $user->role === 'admin') {
            return true;
        }

        if ($user !== null && isset($document->created_by) && $document->created_by === $user->id) {
            return true;
        }

        if ($document instanceof Document && !$document->relationLoaded('category')) {
            $document->load('category');
        }

        $category = $document instanceof Document ? $document->category : null;

        if ($category !== null && $category->requires_subscription) {
            if ($user === null) {
                return false;
            }

            return $this->subscriptionService->hasActiveSubscription($user->id, $document->id);
        }

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
     * Visitantes (user === null) só veem documentos gratuitos com access_level_id = 'public'.
     *
     * The $query must already have document_categories joined as 'dc'.
     */
    public function applyListingFilter(Builder $query, ?User $user, string $tableAlias = 'd'): void
    {
        if ($user !== null && $user->role === 'admin') {
            return;
        }

        $grantLevels = $user !== null ? $this->accessGate->activeGrantLevelIds($user) : [];

        $query->where(function (Builder $outer) use ($user, $grantLevels, $tableAlias): void {
            if ($user !== null) {
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
            }

            // Free docs (no subscription category) with accessible access_level
            // — este é o único bloco visível para visitantes não autenticados.
            $freeDocsCondition = function (Builder $b) use ($grantLevels, $tableAlias): void {
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
            };

            if ($user !== null) {
                $outer->orWhere($freeDocsCondition);
            } else {
                $outer->where($freeDocsCondition);
            }
        });
    }
}