<?php

namespace Tests\Feature;

use App\Events\Domain\Moderation\ModerationActionTaken;
use App\Events\Domain\Moderation\ReportResolved;
use App\Listeners\Moderation\ModerationNotificationListener;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Fase 1 (EDA) — valida o ModerationNotificationListener por invocação direta.
 */
class ModerationListenersTest extends TestCase
{
    use RefreshDatabase;

    private function listener(): ModerationNotificationListener
    {
        return app(ModerationNotificationListener::class);
    }

    public function test_report_resolved_notifies_reporter_when_action_taken(): void
    {
        $reporter = User::factory()->create();
        $moderator = User::factory()->create(['role' => 'admin']);

        $this->listener()->handleReportResolved(new ReportResolved('report-1', $moderator->id, [
            'reporter_id'  => $reporter->id,
            'action_taken' => true,
        ]));

        $this->assertDatabaseHas('notifications', [
            'user_id' => $reporter->id,
            'type'    => 'report_reviewed',
            'title'   => 'Denúncia analisada',
        ]);
    }

    public function test_report_resolved_uses_dismissed_type_when_no_action(): void
    {
        $reporter = User::factory()->create();
        $moderator = User::factory()->create(['role' => 'admin']);

        $this->listener()->handleReportResolved(new ReportResolved('report-1', $moderator->id, [
            'reporter_id'  => $reporter->id,
            'action_taken' => false,
        ]));

        $this->assertDatabaseHas('notifications', [
            'user_id' => $reporter->id,
            'type'    => 'report_dismissed',
        ]);
    }

    public function test_report_resolved_does_not_notify_moderator_self_report(): void
    {
        $moderator = User::factory()->create(['role' => 'admin']);

        $this->listener()->handleReportResolved(new ReportResolved('report-1', $moderator->id, [
            'reporter_id'  => $moderator->id,
            'action_taken' => true,
        ]));

        $this->assertDatabaseMissing('notifications', [
            'user_id' => $moderator->id,
            'type'    => 'report_reviewed',
        ]);
    }

    public function test_action_taken_notifies_owner_per_action(): void
    {
        $owner = User::factory()->create();
        $moderator = User::factory()->create(['role' => 'admin']);

        $cases = [
            'warn'    => ['user_warning', 'Aviso de Moderação'],
            'delete'  => ['content_deleted', 'Conteúdo Removido'],
            'hide'    => ['content_hidden', 'Conteúdo Ocultado'],
            'restore' => ['content_restored', 'Conteúdo Restaurado'],
        ];

        foreach ($cases as $action => [$type, $title]) {
            $this->listener()->handleActionTaken(new ModerationActionTaken('report-1', $moderator->id, [
                'owner_id'     => $owner->id,
                'action'       => $action,
                'content_type' => 'topic',
                'reason'       => 'regras',
            ]));

            $this->assertDatabaseHas('notifications', [
                'user_id' => $owner->id,
                'type'    => $type,
                'title'   => $title,
            ]);
        }
    }

    public function test_action_taken_includes_reason_for_warn(): void
    {
        $owner = User::factory()->create();
        $moderator = User::factory()->create(['role' => 'admin']);

        $this->listener()->handleActionTaken(new ModerationActionTaken('report-1', $moderator->id, [
            'owner_id'     => $owner->id,
            'action'       => 'warn',
            'content_type' => 'reply',
            'reason'       => 'Linguagem imprópria',
        ]));

        $notification = DB::table('notifications')
            ->where('user_id', $owner->id)
            ->where('type', 'user_warning')
            ->first();

        $this->assertNotNull($notification);
        $this->assertStringContainsString('Linguagem imprópria', $notification->message);
    }

    public function test_action_taken_skips_when_owner_missing(): void
    {
        $moderator = User::factory()->create(['role' => 'admin']);

        $this->listener()->handleActionTaken(new ModerationActionTaken('report-1', $moderator->id, [
            'owner_id'     => null,
            'action'       => 'delete',
            'content_type' => 'topic',
            'reason'       => null,
        ]));

        $this->assertDatabaseCount('notifications', 0);
    }
}
