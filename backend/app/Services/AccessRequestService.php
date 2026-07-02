<?php

namespace App\Services;

use App\Models\AccessRequest;
use App\Models\AccessLevel;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\AccessGateService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AccessRequestService
{
    public function __construct(
        private readonly AccessGateService $accessGate,
        private readonly NotificationService $notificationService,
        private readonly AccessGrantService $accessGrantService,
    ) {}

    public function list(array $filters = [], ?User $currentUser = null)
    {
        $query = AccessRequest::query()
            ->with(['user.profile', 'reviewedBy.profile'])
            ->orderByDesc('created_at');

        if ($currentUser && $currentUser->role !== 'admin') {
            $query->where('user_id', $currentUser->id);
        } elseif (isset($filters['scope']) && $filters['scope'] === 'mine' && $currentUser) {
            $query->where('user_id', $currentUser->id);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('user.profile', function ($pq) use ($search) {
                    $pq->where('display_name', 'like', "%{$search}%");
                })->orWhereHas('user', function ($uq) use ($search) {
                    $uq->where('email', 'like', "%{$search}%");
                });
            });
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function find(string $id, ?User $currentUser = null): ?AccessRequest
    {
        $request = AccessRequest::with(['user.profile', 'reviewedBy.profile'])->find($id);
        if (!$request) {
            return null;
        }

        if ($currentUser && $currentUser->role !== 'admin' && $request->user_id !== $currentUser->id) {
            throw new \Illuminate\Auth\Access\AuthorizationException('Forbidden.');
        }

        return $request;
    }

    public function create(array $data, User $user): AccessRequest
    {
        $accessLevelId = $data['access_level_id'];

        if (in_array($accessLevelId, $this->accessGate->activeGrantLevelIds($user), true)) {
            throw new \DomainException('You already have access to this level.', 409);
        }

        $existingRequest = AccessRequest::where('user_id', $user->id)
            ->where('access_level_id', $accessLevelId)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existingRequest !== null) {
            throw new \DomainException('You already have a pending or approved request for this access level.', 409);
        }

        $accessLevel = AccessLevel::find($accessLevelId);
        if (!$accessLevel) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Access level not found.');
        }

        $status = $accessLevel->auto_grant ? 'approved' : 'pending';

        return DB::transaction(function () use ($user, $data, $accessLevelId, $status, $accessLevel) {
            $request = AccessRequest::create([
                'id'              => (string) Str::uuid(),
                'user_id'         => $user->id,
                'access_level_id' => $accessLevelId,
                'status'          => $status,
                'justification'   => $data['justification'] ?? null,
                'reviewed_by'     => $status === 'approved' ? null : null,
                'reviewed_at'     => $status === 'approved' ? now() : null,
            ]);

            Log::info('Aprovação de pedido automática via auto_grant', [
                'admin_id'          => null,
                'target_user'       => $user->id,
                'access_request_id' => $request->id,
                'new_values'        => ['status' => $status],
            ]);

            if ($accessLevel->auto_grant) {
                $this->accessGrantService->grant([
                    'user_id'         => $user->id,
                    'access_level_id' => $accessLevelId,
                    'request_id'      => $request->id,
                ], null);
            }

            return $request;
        });
    }

    public function approve(string $id, array $data, User $moderator): AccessRequest
    {
        $request = AccessRequest::find($id);
        if (!$request) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Request not found.');
        }

        if ($request->status !== 'pending') {
            throw new \DomainException('This request has already been reviewed.', 409);
        }

        $user = User::find($request->user_id);
        $accessLevel = AccessLevel::find($request->access_level_id);

        DB::transaction(function () use ($request, $data, $moderator, $user, $accessLevel) {
            $request->update([
                'status'       => 'approved',
                'reviewed_by'  => $moderator->id,
                'reviewed_at'  => now(),
                'review_notes' => $data['review_notes'] ?? null,
            ]);

            Log::info('Aprovação de pedido de acesso', [
                'admin_id'          => $moderator->id,
                'target_user'       => $request->user_id,
                'access_request_id' => $request->id,
                'new_values'        => ['status' => 'approved'],
            ]);

            $this->accessGrantService->grant([
                'user_id'         => $request->user_id,
                'access_level_id' => $request->access_level_id,
                'request_id'      => $request->id,
            ], $moderator);

            $this->notify($user, 'access_request_approved', 'Access Request Approved', "Your request for {$accessLevel->name} access has been approved.", $request->id);
        });

        return $request->fresh();
    }

    public function reject(string $id, array $data, User $moderator): AccessRequest
    {
        $request = AccessRequest::find($id);
        if (!$request) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Request not found.');
        }

        if ($request->status !== 'pending') {
            throw new \DomainException('This request has already been reviewed.', 409);
        }

        $user = User::find($request->user_id);
        $accessLevel = AccessLevel::find($request->access_level_id);

        DB::transaction(function () use ($request, $data, $moderator, $user, $accessLevel) {
            $request->update([
                'status'       => 'rejected',
                'reviewed_by'  => $moderator->id,
                'reviewed_at'  => now(),
                'review_notes' => $data['review_notes'] ?? null,
            ]);

            Log::info('Rejeição de pedido de acesso', [
                'admin_id'          => $moderator->id,
                'target_user'       => $request->user_id,
                'access_request_id' => $request->id,
                'new_values'        => ['status' => 'rejected'],
            ]);

            $this->notify($user, 'access_request_rejected', 'Access Request Rejected', "Your request for {$accessLevel->name} access has been rejected.", $request->id);
        });

        return $request->fresh();
    }

    public function cancel(string $id, User $user): AccessRequest
    {
        $request = AccessRequest::find($id);
        if (!$request) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Request not found.');
        }

        if ($request->user_id !== $user->id && $user->role !== 'admin') {
            throw new \Illuminate\Auth\Access\AuthorizationException('Forbidden.');
        }

        if ($request->status !== 'pending') {
            throw new \DomainException('Only pending requests can be cancelled.', 409);
        }

        $request->update(['status' => 'cancelled']);

        Log::info('Cancelamento de pedido de acesso', [
            'admin_id'          => $user->role === 'admin' ? $user->id : null,
            'target_user'       => $request->user_id,
            'access_request_id' => $request->id,
            'new_values'        => ['status' => 'cancelled'],
        ]);

        return $request;
    }

    public function notify(User $user, string $type, string $title, string $message, string $referenceId): void
    {
        $this->notificationService->send(
            $user,
            $type,
            $title,
            $message,
            $referenceId,
            'access_request'
        );
    }

    public function history(string $userId)
    {
        return AccessRequest::where('user_id', $userId)->orderByDesc('created_at')->get();
    }
}
