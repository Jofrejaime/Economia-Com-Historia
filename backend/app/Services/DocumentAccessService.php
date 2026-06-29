<?php

namespace App\Services;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DocumentAccessService
{
    public function __construct(private readonly AccessGateService $accessGate) {}

    /**
     * Authoritative access check for reading a document.
     *
     * New model: category.requires_subscription → DocumentSubscription.
     * Legacy compat: documents without a subscription-required category fall back
     * to the access_level_id / AccessGate model so existing grants keep working.
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
            return $this->hasActiveSubscription($user->id, $document->id);
        }

        // Legacy: access_level_id based grant (for documents not in a subscription category)
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

    public function hasActiveSubscription(string $userId, string $documentId): bool
    {
        return DB::table('document_subscriptions')
            ->where('user_id', $userId)
            ->where('document_id', $documentId)
            ->where('status', 'ACTIVE')
            ->where(function (Builder $q): void {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->exists();
    }

    /**
     * @return array{has_subscription: bool, status: string|null, started_at: string|null, expires_at: string|null}
     */
    public function subscriptionStatus(string $userId, string $documentId): array
    {
        $sub = DB::table('document_subscriptions')
            ->where('user_id', $userId)
            ->where('document_id', $documentId)
            ->orderByDesc('created_at')
            ->first();

        if ($sub === null) {
            return ['has_subscription' => false, 'status' => null, 'started_at' => null, 'expires_at' => null];
        }

        // Auto-expire if the expiry date has passed
        if ($sub->status === 'ACTIVE' && $sub->expires_at !== null && $sub->expires_at < now()->toDateTimeString()) {
            DB::table('document_subscriptions')
                ->where('id', $sub->id)
                ->update(['status' => 'EXPIRED', 'updated_at' => now()]);
            $sub->status = 'EXPIRED';
        }

        return [
            'has_subscription' => true,
            'status'           => $sub->status,
            'started_at'       => $sub->started_at,
            'expires_at'       => $sub->expires_at,
        ];
    }

    /**
     * Create or refresh a subscription.
     *
     * If an ACTIVE subscription already exists, it is returned unchanged unless
     * a new expires_at is provided (admin updating expiry).
     *
     * @return array{id: string, created: bool}
     */
    public function subscribe(string $userId, string $documentId, ?string $expiresAt = null): array
    {
        $existing = DB::table('document_subscriptions')
            ->where('user_id', $userId)
            ->where('document_id', $documentId)
            ->where('status', 'ACTIVE')
            ->first();

        if ($existing !== null) {
            if ($expiresAt !== null) {
                DB::table('document_subscriptions')
                    ->where('id', $existing->id)
                    ->update(['expires_at' => $expiresAt, 'updated_at' => now()]);
            }

            return ['id' => $existing->id, 'created' => false];
        }

        $id = (string) Str::uuid();

        DB::table('document_subscriptions')->insert([
            'id'          => $id,
            'user_id'     => $userId,
            'document_id' => $documentId,
            'status'      => 'ACTIVE',
            'started_at'  => now(),
            'expires_at'  => $expiresAt,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        return ['id' => $id, 'created' => true];
    }

    public function cancel(string $userId, string $documentId): bool
    {
        return DB::table('document_subscriptions')
            ->where('user_id', $userId)
            ->where('document_id', $documentId)
            ->where('status', 'ACTIVE')
            ->update(['status' => 'CANCELLED', 'updated_at' => now()]) > 0;
    }

    /**
     * Apply subscription-aware visibility filter to a document listing query.
     *
     * Replaces AccessGateService::applyDocumentVisibilityFilter for document listings.
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

            // Subscription-gated docs where user has an active subscription
            $outer->orWhere(function (Builder $b) use ($user, $tableAlias): void {
                $b->where('dc.requires_subscription', true)
                    ->whereExists(function (Builder $sub) use ($user, $tableAlias): void {
                        $sub->from('document_subscriptions')
                            ->whereColumn('document_id', "{$tableAlias}.id")
                            ->where('user_id', $user->id)
                            ->where('status', 'ACTIVE')
                            ->where(function (Builder $q): void {
                                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                            });
                    });
            });

            // Free docs (category does not require subscription or document has no category)
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
