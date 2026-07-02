<?php

namespace App\Services;

use App\Models\PointTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class PointTransactionService
{
    public function list(array $filters = []): array
    {
        $query = PointTransaction::query()->with('user.profile');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('reason', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%')
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('email', 'like', '%' . $search . '%')
                         ->orWhereHas('profile', function ($pq) use ($search) {
                             $pq->where('display_name', 'like', '%' . $search . '%')
                                ->orWhere('full_name', 'like', '%' . $search . '%');
                         });
                  });
            });
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['reason'])) {
            $query->where('reason', $filters['reason']);
        }

        if (!empty($filters['type'])) {
            if ($filters['type'] === 'earned') {
                $query->where('points', '>', 0);
            } elseif ($filters['type'] === 'spent') {
                $query->where('points', '<', 0);
            }
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        $query->orderByDesc('created_at');

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);
        $paginated = $query->paginate($perPage);

        return [
            'data' => collect($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ]
        ];
    }

    public function history(string $userId): Collection
    {
        return PointTransaction::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function find(string $id): ?PointTransaction
    {
        return PointTransaction::with('user.profile')->find($id);
    }

    public function statistics(): array
    {
        $totalEarned = PointTransaction::where('points', '>', 0)->sum('points');
        $totalSpent = PointTransaction::where('points', '<', 0)->sum('points');
        $averageEarned = PointTransaction::where('points', '>', 0)->avg('points') ?? 0;
        $totalTransactions = PointTransaction::count();

        return [
            'total_earned'       => (int) $totalEarned,
            'total_spent'        => (int) abs($totalSpent),
            'net_distributed'    => (int) ($totalEarned + $totalSpent),
            'average_earned'     => round($averageEarned, 2),
            'total_transactions' => $totalTransactions,
        ];
    }

    public function filters(): array
    {
        $reasons = PointTransaction::select('reason')
            ->distinct()
            ->pluck('reason')
            ->all();

        return [
            'reasons' => $reasons,
            'types'   => [
                ['value' => 'earned', 'label' => 'Pontos Ganhos'],
                ['value' => 'spent', 'label' => 'Pontos Deduzidos'],
            ],
        ];
    }

    public function export(array $filters = []): string
    {
        $filters['per_page'] = 10000; // Limit export size to prevent memory issues
        $result = $this->list($filters);
        $transactions = $result['data'];

        $csv = "ID,Utilizador,Email,Pontos,Motivo,Descrição,Data\n";

        foreach ($transactions as $tx) {
            $displayName = $tx->user?->profile?->display_name ?? 'N/A';
            $email = $tx->user?->email ?? 'N/A';
            $csv .= sprintf(
                "%s,\"%s\",%s,%d,%s,\"%s\",%s\n",
                $tx->id,
                str_replace('"', '""', $displayName),
                $email,
                $tx->points,
                $tx->reason,
                str_replace('"', '""', $tx->description ?? ''),
                $tx->created_at->toDateTimeString()
            );
        }

        return $csv;
    }
}
