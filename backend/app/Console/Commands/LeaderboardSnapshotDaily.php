<?php

namespace App\Console\Commands;

use App\Services\LeaderboardService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class LeaderboardSnapshotDaily extends Command
{
    protected $signature = 'leaderboard:snapshot-daily';
    protected $description = 'Regista o estado diário de ranking para histórico';

    public function handle(LeaderboardService $leaderboardService): int
    {
        Log::info('Iniciando captura de snapshot do leaderboard...');
        $this->info('Iniciando captura de snapshot do leaderboard...');

        try {
            $leaderboardService->takeDailySnapshot();
            Log::info('Snapshot diário do leaderboard registado com sucesso.');
            $this->info('Snapshot diário do leaderboard registado com sucesso.');
            return self::SUCCESS;
        } catch (\Throwable $e) {
            Log::error('Erro ao capturar snapshot diário: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            $this->error('Erro ao capturar snapshot diário: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
