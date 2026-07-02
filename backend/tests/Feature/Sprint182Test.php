<?php

namespace Tests\Feature;

use App\Models\AccessLevel;
use App\Models\LevelDefinition;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class Sprint182Test extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        \DB::table('user_profiles')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $admin->id,
            'display_name' => 'Admin User',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        \DB::table('user_sessions')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $admin->id,
            'refresh_token' => Str::random(80),
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit',
            'expires_at' => now()->addDay(),
            'created_at' => now(),
        ]);

        return $admin;
    }

    private function auth(User $user)
    {
        $token = \DB::table('user_sessions')
            ->where('user_id', $user->id)
            ->value('refresh_token');

        return $this->withHeader('Authorization', "Bearer {$token}");
    }

    // ─── SETTINGS TESTS ──────────────────────────────────────────────────────

    public function test_admin_can_list_settings()
    {
        $admin = $this->createAdmin();
        Setting::factory()->create([
            'key' => 'test_key',
            'value' => 'test_value',
            'type' => 'string',
        ]);

        $response = $this->auth($admin)->getJson('/api/admin/settings');

        $response->assertStatus(200)
                 ->assertJsonFragment(['key' => 'test_key', 'value' => 'test_value']);
    }

    public function test_admin_can_show_setting()
    {
        $admin = $this->createAdmin();
        $setting = Setting::factory()->create([
            'key' => 'show_key',
            'value' => 'show_value',
            'type' => 'string',
        ]);

        $response = $this->auth($admin)->getJson("/api/admin/settings/{$setting->key}");

        $response->assertStatus(200)
                 ->assertJsonPath('data.value', 'show_value');
    }

    public function test_settings_type_casting()
    {
        $admin = $this->createAdmin();

        $boolSetting = Setting::factory()->create(['key' => 'bool_key', 'value' => 'true', 'type' => 'boolean']);
        $intSetting = Setting::factory()->create(['key' => 'int_key', 'value' => '123', 'type' => 'integer']);
        $floatSetting = Setting::factory()->create(['key' => 'float_key', 'value' => '12.34', 'type' => 'float']);
        $jsonSetting = Setting::factory()->create(['key' => 'json_key', 'value' => json_encode(['a' => 1]), 'type' => 'json']);

        // Check model level casting
        $this->assertTrue($boolSetting->value);
        $this->assertEquals(123, $intSetting->value);
        $this->assertEquals(12.34, $floatSetting->value);
        $this->assertEquals(['a' => 1], $jsonSetting->value);

        // Check API response serialization type casting
        $response = $this->auth($admin)->getJson('/api/admin/settings');
        $response->assertStatus(200);

        $data = collect($response->json('data'));

        $this->assertTrue($data->firstWhere('key', 'bool_key')['value']);
        $this->assertEquals(123, $data->firstWhere('key', 'int_key')['value']);
        $this->assertEquals(12.34, $data->firstWhere('key', 'float_key')['value']);
        $this->assertEquals(['a' => 1], $data->firstWhere('key', 'json_key')['value']);
    }

    public function test_admin_can_update_setting()
    {
        $admin = $this->createAdmin();
        $setting = Setting::factory()->create(['key' => 'update_key', 'value' => '10', 'type' => 'integer']);

        $response = $this->auth($admin)->patchJson("/api/admin/settings/{$setting->key}", [
            'value' => 20
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.value', 20);

        $this->assertEquals(20, $setting->fresh()->value);
    }

    // ─── LEVEL DEFINITIONS TESTS ─────────────────────────────────────────────

    public function test_admin_can_crud_level_definitions()
    {
        $admin = $this->createAdmin();

        // DatabaseSeeder runs LevelDefinitionsSeeder which seeds level 1 (min 0).
        // Let's test listing first.
        $response = $this->auth($admin)->getJson('/api/admin/level-definitions');
        $response->assertStatus(200);
        $this->assertNotEmpty($response->json('data'));

        // Store new level 7
        $response = $this->auth($admin)->postJson('/api/admin/level-definitions', [
            'level' => 7,
            'name' => 'Aprendiz',
            'min_points' => 10000, // min_points should be higher than other levels, or just unique
            'max_points' => 20000,
            'color_hex' => '#00ff00',
            'perks' => ['Visualizar fórum']
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('level_definitions', ['level' => 7, 'name' => 'Aprendiz']);

        // Show level 7
        $response = $this->auth($admin)->getJson('/api/admin/level-definitions/7');
        $response->assertStatus(200)
                 ->assertJsonPath('data.name', 'Aprendiz');

        // Update level 7
        $response = $this->auth($admin)->patchJson('/api/admin/level-definitions/7', [
            'name' => 'Super Aprendiz'
        ]);
        $response->assertStatus(200)
                 ->assertJsonPath('data.name', 'Super Aprendiz');

        // Delete level 7
        $response = $this->auth($admin)->deleteJson('/api/admin/level-definitions/7');
        $response->assertStatus(200);
        $this->assertDatabaseMissing('level_definitions', ['level' => 7]);
    }

    public function test_level_definitions_validations()
    {
        $admin = $this->createAdmin();

        // Test min_points=0 requirement (cannot delete or update the only level 1 having min_points=0)
        // Let's try to update level 1 min_points to 10.
        // First delete other levels if any to isolate level 1.
        LevelDefinition::where('level', '!=', 1)->delete();

        $response = $this->auth($admin)->patchJson('/api/admin/level-definitions/1', [
            'min_points' => 10
        ]);
        $response->assertStatus(422)
                 ->assertJsonFragment(['message' => 'There must always be at least one level starting at 0 points.']);

        // Try to delete the only remaining level definition
        $response = $this->auth($admin)->deleteJson('/api/admin/level-definitions/1');
        $response->assertStatus(400)
                 ->assertJsonFragment(['message' => 'Cannot delete the only remaining level definition.']);
    }

    // ─── ACCESS LEVELS TESTS ─────────────────────────────────────────────────

    public function test_admin_can_crud_access_levels()
    {
        $admin = $this->createAdmin();

        // List
        $response = $this->auth($admin)->getJson('/api/admin/access-levels');
        $response->assertStatus(200);

        // Store
        $response = $this->auth($admin)->postJson('/api/admin/access-levels', [
            'id' => 'platinum',
            'name' => 'Platina',
            'description' => 'Acesso Platina',
            'requires_approval' => true,
            'auto_grant' => false,
        ]);
        $response->assertStatus(201)
                 ->assertJsonPath('data.id', 'platinum');

        // Show
        $response = $this->auth($admin)->getJson('/api/admin/access-levels/platinum');
        $response->assertStatus(200)
                 ->assertJsonPath('data.name', 'Platina');

        // Update
        $response = $this->auth($admin)->patchJson('/api/admin/access-levels/platinum', [
            'name' => 'Platina VIP'
        ]);
        $response->assertStatus(200)
                 ->assertJsonPath('data.name', 'Platina VIP');

        // Delete
        $response = $this->auth($admin)->deleteJson('/api/admin/access-levels/platinum');
        $response->assertStatus(200);
        $this->assertDatabaseMissing('access_levels', ['id' => 'platinum']);
    }

    public function test_prevent_delete_access_level_in_use()
    {
        $admin = $this->createAdmin();

        // 1. In use by request
        \DB::table('user_access_requests')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $admin->id,
            'access_level_id' => 'restricted',
            'status' => 'pending',
            'created_at' => now(),
        ]);
        $response = $this->auth($admin)->deleteJson('/api/admin/access-levels/restricted');
        $response->assertStatus(400);

        // 2. In use by grant
        \DB::table('user_access_grants')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $admin->id,
            'access_level_id' => 'jindungo',
            'is_active' => true,
            'granted_at' => now(),
        ]);
        $response = $this->auth($admin)->deleteJson('/api/admin/access-levels/jindungo');
        $response->assertStatus(400);
    }

    public function test_settings_validation_invalid_boolean()
    {
        $admin = $this->createAdmin();
        $setting = Setting::factory()->create(['key' => 'bool_key', 'value' => 'true', 'type' => 'boolean']);

        $response = $this->auth($admin)->patchJson("/api/admin/settings/{$setting->key}", [
            'value' => 'banana'
        ]);

        $response->assertStatus(422)
                 ->assertJsonFragment(['message' => 'Setting [bool_key] requires a boolean value.']);
    }

    public function test_settings_validation_invalid_email()
    {
        $admin = $this->createAdmin();
        $setting = Setting::factory()->create(['key' => 'support_email', 'value' => 'suporte@economiacomhistoria.ao', 'type' => 'string', 'group' => 'general']);

        $response = $this->auth($admin)->patchJson("/api/admin/settings/{$setting->key}", [
            'value' => 'not-an-email'
        ]);

        $response->assertStatus(422)
                 ->assertJsonFragment(['message' => 'Setting [support_email] must be a valid email address.']);
    }

    public function test_access_level_prevent_delete_last()
    {
        $admin = $this->createAdmin();

        // Delete referencing records first to avoid foreign key failures
        \DB::table('user_access_grants')->delete();
        \DB::table('user_access_requests')->delete();
        \DB::table('documents')->delete();
        \DB::table('quizzes')->delete();
        \DB::table('community_categories')->delete();

        // Delete all except one
        AccessLevel::where('id', '!=', 'public')->delete();

        $response = $this->auth($admin)->deleteJson('/api/admin/access-levels/public');
        $response->assertStatus(400)
                 ->assertJsonFragment(['message' => 'Cannot delete the only remaining Access Level.']);
    }
}
