<?php

namespace App\Console\Commands;

use App\Services\GamificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class GamificationResetPeriodicPoints extends Command
{
    protected $signature = 'gamification:reset-periodic-points {period : O período para reset: weekly ou monthly}';
    protected $description = 'Reseta os pontos periódicos (semanais/mensais) dos utilizadores';

    public function handle(GamificationService $gamificationService): int
    {
        $period = $this->argument('period');

        Log::info("Iniciando reset dos pontos periódicos. Período: {$period}...");
        $this->info("Iniciando reset dos pontos periódicos. Período: {$period}...");

        if ($period !== 'weekly' && $period !== 'monthly') {
            $msg = "Período inválido [{$period}]. Deve ser 'weekly' ou 'monthly'.";
            Log::error($msg);
            $this->error($msg);
            return self::INVALID;
        }

        try {
            $gamificationService->resetPeriodicPoints($period);
            Log::info("Pontos periódicos ({$period}) resetados com sucesso.");
            $this->info("Pontos periódicos ({$period}) resetados com sucesso.");
            return self::SUCCESS;
        } catch (\Throwable $e) {
            Log::error("Erro ao resetar pontos periódicos ({$period}): " . $e->getMessage(), [
                'exception' => $e
            ]);
            $this->error("Erro ao resetar pontos periódicos ({$period}): " . $e->getMessage());
            return self::FAILURE;
        }
    }
}
