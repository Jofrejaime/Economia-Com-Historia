<?php

namespace App\Services;

use App\Enums\SubscriptionReason;
use App\Enums\SubscriptionStatus;
use App\Exceptions\InvalidSubscriptionTransitionException;
use App\Exceptions\SubscriptionNotFoundException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Manages the full lifecycle of DocumentSubscriptions.
 *
 * All state transitions are validated here and communicated via domain exceptions.
 * Controllers are responsible only for mapping exceptions to HTTP responses.
 *
 * States: PENDING → ACTIVE | REJECTED | CANCELLED
 *         ACTIVE  → CANCELLED
 */
class DocumentSubscriptionService
{
    // ─── Read helpers ─────────────────────────────────────────────────────────

    public function findById(string $id): ?object
    {
        return DB::table('document_subscriptions')->where('id', $id)->first();
    }

    public function findActive(string $userId, string $documentId): ?object
    {
        return DB::table('document_subscriptions')
            ->where('user_id', $userId)
            ->where('document_id', $documentId)
            ->where('status', SubscriptionStatus::ACTIVE->value)
            ->first();
    }

    public function findPending(string $userId, string $documentId): ?object
    {
        return DB::table('document_subscriptions')
            ->where('user_id', $userId)
            ->where('document_id', $documentId)
            ->where('status', SubscriptionStatus::PENDING->value)
            ->first();
    }

    public function findLatest(string $userId, string $documentId): ?object
    {
        return DB::table('document_subscriptions')
            ->where('user_id', $userId)
            ->where('document_id', $documentId)
            ->orderByDesc('created_at')
            ->first();
    }

    public function hasActiveSubscription(string $userId, string $documentId): bool
    {
        return DB::table('document_subscriptions')
            ->where('user_id', $userId)
            ->where('document_id', $documentId)
            ->where('status', SubscriptionStatus::ACTIVE->value)
            ->exists();
    }

    // ─── User-initiated actions ────────────────────────────────────────────────

    /**
     * Request a subscription — always creates PENDING, never ACTIVE.
     *
     * Protected against race conditions via a transaction with a FOR UPDATE lock.
     *
     * Rules:
     *  - ACTIVE already exists  → ['id', created=false, status='ACTIVE']
     *  - PENDING already exists → ['id', created=false, status='PENDING']
     *  - REJECTED or CANCELLED  → create new PENDING → ['id', created=true, status='PENDING']
     *  - No subscription        → create new PENDING → ['id', created=true, status='PENDING']
     *
     * @return array{id: string, created: bool, status: string}
     */
    public function requestSubscription(string $userId, string $documentId): array
    {
        return DB::transaction(function () use ($userId, $documentId) {
            // lockForUpdate prevents concurrent INSERTs on MySQL/PostgreSQL.
            $existing = DB::table('document_subscriptions')
                ->where('user_id', $userId)
                ->where('document_id', $documentId)
                ->whereIn('status', [SubscriptionStatus::ACTIVE->value, SubscriptionStatus::PENDING->value])
                ->lockForUpdate()
                ->first();

            if ($existing !== null) {
                return ['id' => $existing->id, 'created' => false, 'status' => $existing->status];
            }

            $id = (string) Str::uuid();

            DB::table('document_subscriptions')->insert([
                'id'          => $id,
                'user_id'     => $userId,
                'document_id' => $documentId,
                'status'      => SubscriptionStatus::PENDING->value,
                'started_at'  => now(),
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);

            return ['id' => $id, 'created' => true, 'status' => SubscriptionStatus::PENDING->value];
        });
    }

    /**
     * User cancels their own ACTIVE or PENDING subscription.
     * cancelled_by is left NULL (not an admin action).
     */
    public function cancelSubscription(string $userId, string $documentId): bool
    {
        return DB::table('document_subscriptions')
            ->where('user_id', $userId)
            ->where('document_id', $documentId)
            ->whereIn('status', [SubscriptionStatus::ACTIVE->value, SubscriptionStatus::PENDING->value])
            ->update(['status' => SubscriptionStatus::CANCELLED->value, 'updated_at' => now()]) > 0;
    }

    // ─── Admin transitions ─────────────────────────────────────────────────────

    /**
     * PENDING → ACTIVE
     *
     * @throws SubscriptionNotFoundException
     * @throws InvalidSubscriptionTransitionException
     */
    public function approveSubscription(string $subscriptionId, string $adminId): void
    {
        $sub = $this->findById($subscriptionId);

        if ($sub === null) {
            throw new SubscriptionNotFoundException($subscriptionId);
        }

        $current = SubscriptionStatus::from($sub->status);

        if ($current !== SubscriptionStatus::PENDING) {
            throw new InvalidSubscriptionTransitionException($current, SubscriptionStatus::ACTIVE);
        }

        DB::table('document_subscriptions')
            ->where('id', $subscriptionId)
            ->update([
                'status'      => SubscriptionStatus::ACTIVE->value,
                'approved_by' => $adminId,
                'updated_at'  => now(),
            ]);
    }

    /**
     * PENDING → REJECTED
     *
     * @throws SubscriptionNotFoundException
     * @throws InvalidSubscriptionTransitionException
     */
    public function rejectSubscription(string $subscriptionId, string $adminId): void
    {
        $sub = $this->findById($subscriptionId);

        if ($sub === null) {
            throw new SubscriptionNotFoundException($subscriptionId);
        }

        $current = SubscriptionStatus::from($sub->status);

        if ($current !== SubscriptionStatus::PENDING) {
            throw new InvalidSubscriptionTransitionException($current, SubscriptionStatus::REJECTED);
        }

        DB::table('document_subscriptions')
            ->where('id', $subscriptionId)
            ->update([
                'status'      => SubscriptionStatus::REJECTED->value,
                'rejected_by' => $adminId,
                'updated_at'  => now(),
            ]);
    }

    /**
     * ACTIVE or PENDING → CANCELLED (admin-initiated)
     * cancelled_by is set to the acting admin's ID.
     *
     * @throws SubscriptionNotFoundException
     * @throws InvalidSubscriptionTransitionException
     */
    public function adminCancelSubscription(string $subscriptionId, string $adminId): void
    {
        $sub = $this->findById($subscriptionId);

        if ($sub === null) {
            throw new SubscriptionNotFoundException($subscriptionId);
        }

        $current = SubscriptionStatus::from($sub->status);

        if (!in_array($current, [SubscriptionStatus::ACTIVE, SubscriptionStatus::PENDING], true)) {
            throw new InvalidSubscriptionTransitionException($current, SubscriptionStatus::CANCELLED);
        }

        DB::table('document_subscriptions')
            ->where('id', $subscriptionId)
            ->update([
                'status'       => SubscriptionStatus::CANCELLED->value,
                'cancelled_by' => $adminId,
                'updated_at'   => now(),
            ]);
    }

    // ─── Status ───────────────────────────────────────────────────────────────

    /**
     * @return array{has_subscription: bool, status: string|null, reason: string|null, started_at: string|null}
     */
    public function subscriptionStatus(string $userId, string $documentId): array
    {
        $sub = $this->findLatest($userId, $documentId);

        if ($sub === null) {
            return ['has_subscription' => false, 'status' => null, 'reason' => null, 'started_at' => null];
        }

        $status = SubscriptionStatus::from($sub->status);
        $reason = SubscriptionReason::forStatus($status);

        return [
            'has_subscription' => true,
            'status'           => $status->value,
            'reason'           => $reason->value,
            'started_at'       => $sub->started_at,
        ];
    }

    // ─── Listing (admin) ──────────────────────────────────────────────────────

    /**
     * @param array{status?: string, document_id?: string, user_id?: string} $filters
     */
    public function listSubscriptions(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = DB::table('document_subscriptions as ds')
            ->join('users as u', 'ds.user_id', '=', 'u.id')
            ->join('documents as d', 'ds.document_id', '=', 'd.id')
            ->leftJoin('user_profiles as up', 'ds.user_id', '=', 'up.user_id')
            ->select(
                'ds.id',
                'ds.user_id',
                'ds.document_id',
                'ds.status',
                'ds.started_at',
                'ds.approved_by',
                'ds.rejected_by',
                'ds.cancelled_by',
                'ds.created_at',
                'ds.updated_at',
                'd.title as document_title',
                'u.email as user_email',
                'up.display_name as user_display_name'
            );

        if (!empty($filters['status'])) {
            $query->where('ds.status', $filters['status']);
        }

        if (!empty($filters['document_id'])) {
            $query->where('ds.document_id', $filters['document_id']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('ds.user_id', $filters['user_id']);
        }

        return $query->orderByDesc('ds.created_at')->paginate($perPage);
    }
}
