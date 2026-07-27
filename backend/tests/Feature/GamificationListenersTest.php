<?php

namespace Tests\Feature;

use App\Events\Domain\Gamification\BadgeEarned;
use App\Events\Domain\Gamification\LevelUp;
use App\Listeners\Gamification\GamificationNotificationListener;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Fase 1 (EDA) — valida o GamificationNotificationListener por invocação direta.
 */
class GamificationListenersTest extends TestCase
{
    use RefreshDatabase;

    private function listener(): GamificationNotificationListener
    {
        return app(GamificationNotificationListener::class);
    }

    public function test_level_up_notifies_user_in_portuguese(): void
    {
        $user = User::factory()->create();

        $this->listener()->handleLevelUp(new LevelUp($user->id, $user->id, [
            'user_id'        => $user->id,
            'new_level'      => 5,
            'previous_level' => 4,
        ]));

        $notification = DB::table('notifications')
            ->where('user_id', $user->id)
            ->where('type', 'level_up')
            ->first();

        $this->assertNotNull($notification);
        $this->assertSame('Subiu de nível!', $notification->title);
        $this->assertStringContainsString('nível 5', $notification->message);
        $this->assertSame('5', $notification->reference_id);
        $this->assertSame('level', $notification->reference_type);
    }

    public function test_badge_earned_notifies_user(): void
    {
        $user = User::factory()->create();

        $this->listener()->handleBadgeEarned(new BadgeEarned($user->id, $user->id, [
            'user_id'    => $user->id,
            'badge_id'   => 'badge-1',
            'badge_name' => 'Historiador',
        ]));

        $notification = DB::table('notifications')
            ->where('user_id', $user->id)
            ->where('type', 'badge_earned')
            ->first();

        $this->assertNotNull($notification);
        $this->assertSame('Novo crachá conquistado!', $notification->title);
        $this->assertStringContainsString('Historiador', $notification->message);
        $this->assertSame('badge-1', $notification->reference_id);
        $this->assertSame('badge', $notification->reference_type);
    }
}
