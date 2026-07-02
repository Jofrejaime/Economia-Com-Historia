<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Sprint181Test extends TestCase
{
    use RefreshDatabase;

    public function test_scheduler_registers_commands()
    {
        $schedule = app(\Illuminate\Console\Scheduling\Schedule::class);
        $events = collect($schedule->events());

        $commands = $events->map(fn ($event) => $event->command)->toArray();

        $this->assertTrue(
            collect($commands)->contains(fn ($cmd) => str_contains($cmd, 'leaderboard:refresh-national'))
        );
        $this->assertTrue(
            collect($commands)->contains(fn ($cmd) => str_contains($cmd, 'gamification:reset-periodic-points weekly'))
        );
        $this->assertTrue(
            collect($commands)->contains(fn ($cmd) => str_contains($cmd, 'gamification:reset-periodic-points monthly'))
        );
        $this->assertTrue(
            collect($commands)->contains(fn ($cmd) => str_contains($cmd, 'leaderboard:snapshot-daily'))
        );
    }

    public function test_leaderboard_refresh_national_command_runs()
    {
        $user = User::factory()->create(['is_active' => true]);
        \DB::table('user_profiles')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $user->id,
            'display_name' => 'Test User',
            'province' => 'Luanda',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        \DB::table('user_levels')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $user->id,
            'current_level' => 1,
            'total_points' => 10,
            'weekly_points' => 10,
            'monthly_points' => 10,
            'updated_at' => now(),
        ]);

        $this->artisan('leaderboard:refresh-national')
            ->assertExitCode(0);

        $this->assertDatabaseHas('leaderboard_nacional_cache', [
            'user_id' => $user->id,
            'total_points' => 10,
        ]);
    }

    public function test_gamification_reset_periodic_points_weekly()
    {
        $user = User::factory()->create(['is_active' => true]);
        \DB::table('user_profiles')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $user->id,
            'display_name' => 'Test User',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        \DB::table('user_levels')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $user->id,
            'current_level' => 1,
            'total_points' => 100,
            'weekly_points' => 50,
            'monthly_points' => 80,
            'updated_at' => now(),
        ]);

        $this->artisan('gamification:reset-periodic-points weekly')
            ->assertExitCode(0);

        $this->assertDatabaseHas('user_levels', [
            'user_id' => $user->id,
            'weekly_points' => 0,
            'monthly_points' => 80,
        ]);
    }

    public function test_gamification_reset_periodic_points_monthly()
    {
        $user = User::factory()->create(['is_active' => true]);
        \DB::table('user_profiles')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $user->id,
            'display_name' => 'Test User',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        \DB::table('user_levels')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $user->id,
            'current_level' => 1,
            'total_points' => 100,
            'weekly_points' => 50,
            'monthly_points' => 80,
            'updated_at' => now(),
        ]);

        $this->artisan('gamification:reset-periodic-points monthly')
            ->assertExitCode(0);

        $this->assertDatabaseHas('user_levels', [
            'user_id' => $user->id,
            'weekly_points' => 50,
            'monthly_points' => 0,
        ]);
    }

    public function test_leaderboard_snapshot_daily_command()
    {
        $user = User::factory()->create(['is_active' => true]);
        \DB::table('user_profiles')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $user->id,
            'display_name' => 'Test User',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        \DB::table('user_levels')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $user->id,
            'current_level' => 1,
            'total_points' => 100,
            'weekly_points' => 50,
            'monthly_points' => 80,
            'updated_at' => now(),
        ]);

        $this->artisan('leaderboard:refresh-national')->assertExitCode(0);

        $this->artisan('leaderboard:snapshot-daily')
            ->assertExitCode(0);

        $this->assertDatabaseHas('leaderboard_snapshots', [
            'user_id' => $user->id,
            'snapshot_date' => now()->toDateString(),
            'total_points' => 100,
        ]);
    }

    public function test_auth_rate_limiting_login()
    {
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/auth/login', [
                'email' => 'test@example.com',
                'password' => 'WrongPassword123!',
            ]);
            $this->assertNotEquals(429, $response->status());
        }

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'WrongPassword123!',
        ]);

        $response->assertStatus(429);
    }
}
