<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\GamificationService;
use App\Services\LeaderboardService;
use App\Support\PointTransactionReason;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Reconcilia os user_levels com as tabelas de origem:
 *  - Recalcula os contadores (quizzes_completed, documents_read, topics_created,
 *    replies_posted) a partir das tabelas reais.
 *  - Alinha total_points com a soma das point_transactions. Se os pontos
 *    existentes (ex.: dados de seed) forem MAIORES do que a soma, por omissão
 *    cria uma transação de reconciliação (admin_adjustment) para o diferencial,
 *    tornando o saldo legítimo e estável — evitando que o reconcile automático
 *    do perfil os reponha a zero. Com --zero-orphan, zera esse excedente.
 *  - Recalcula o nível de cada utilizador.
 */
class ReconcileGamification extends Command
{
    protected $signature = 'gamification:reconcile
        {--zero-orphan : Zera os pontos não suportados por transações em vez de fazer backfill}';

    protected $description = 'Reconcilia user_levels (contadores, pontos vs transações e níveis).';

    public function handle(GamificationService $gamification): int
    {
        $zeroOrphan = (bool) $this->option('zero-orphan');
        $counters = 0;
        $backfilled = 0;
        $trimmed = 0;

        $userIds = DB::table('user_levels')->pluck('user_id');

        foreach ($userIds as $userId) {
            // 1) Recalcular contadores a partir das tabelas de origem
            $quizzes = DB::table('quiz_attempts')
                ->where('user_id', $userId)->where('status', 'completed')
                ->distinct()->count('quiz_id');

            $docsRead = DB::table('document_views')
                ->where('user_id', $userId)
                ->distinct()->count('document_id');

            $topics = DB::table('discussion_topics')->where('author_id', $userId)->count();
            $replies = DB::table('topic_replies')->where('author_id', $userId)->count();

            DB::table('user_levels')->where('user_id', $userId)->update([
                'quizzes_completed' => $quizzes,
                'documents_read'    => $docsRead,
                'topics_created'    => $topics,
                'replies_posted'    => $replies,
                'updated_at'        => now(),
            ]);
            $counters++;

            // 2) Alinhar total_points com a soma das transações
            $sum = (int) DB::table('point_transactions')->where('user_id', $userId)->sum('points');
            $total = (int) DB::table('user_levels')->where('user_id', $userId)->value('total_points');

            if ($total > $sum) {
                if ($zeroOrphan) {
                    DB::table('user_levels')->where('user_id', $userId)
                        ->update(['total_points' => $sum, 'updated_at' => now()]);
                    $trimmed++;
                } else {
                    DB::table('point_transactions')->insert([
                        'id'             => (string) Str::uuid(),
                        'user_id'        => $userId,
                        'points'         => $total - $sum,
                        'reason'         => PointTransactionReason::ADMIN_ADJUSTMENT,
                        'reference_id'   => null,
                        'reference_type' => null,
                        'description'    => 'Reconciliação de saldo inicial (seed)',
                        'created_at'     => now(),
                    ]);
                    $backfilled++;
                }
            } elseif ($total < $sum) {
                DB::table('user_levels')->where('user_id', $userId)
                    ->update(['total_points' => $sum, 'updated_at' => now()]);
            }

            // 3) Recalcular nível (+ badges)
            $user = User::find($userId);
            if ($user !== null) {
                $gamification->updateLevel($user);
            }
        }

        app(LeaderboardService::class)->refreshNationalCache();

        $this->info("Reconciliação concluída — contadores: {$counters}; backfills de pontos: {$backfilled}; excedentes zerados: {$trimmed}.");

        return self::SUCCESS;
    }
}
