<?php

namespace App\Console\Commands;

use App\Services\LeaderboardService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class LeaderboardRefreshNational extends Command
{
    protected $signature = 'leaderboard:refresh-national';
    protected $description = 'Recalcula e atualiza síncronamente o cache do ranking nacional';

    public function handle(LeaderboardService $leaderboardService): int
    {
        Log::info('Iniciando recalculação do leaderboard nacional...');
        $this->info('Iniciando recalculação do leaderboard nacional...');

        try {
            $leaderboardService->refreshNationalCache();
            Log::info('Leaderboard nacional recalculado com sucesso.');
            $this->info('Leaderboard nacional recalculado com sucesso.');
            return self::SUCCESS;
        } catch (\Throwable $e) {
            Log::error('Erro ao recalcular leaderboard nacional: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            $this->error('Erro ao recalcular leaderboard nacional: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
