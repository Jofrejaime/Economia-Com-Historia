<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Province;
use App\Models\InterestArea;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class PlatformFoundationTest extends TestCase
{
    use RefreshDatabase;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function issueToken(User $user): string
    {
        $token = Str::random(80);

        DB::table('user_sessions')->insert([
            'id'            => (string) Str::uuid(),
            'user_id'       => $user->id,
            'refresh_token' => $token,
            'expires_at'    => now()->addDays(30),
            'created_at'    => now(),
        ]);

        return $token;
    }

    private function createAdmin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function createStudent(): User
    {
        return User::factory()->create(['role' => 'student']);
    }

    // ─── Province Tests ────────────────────────────────────────────────────────

    public function test_admin_can_list_provinces(): void
    {
        $admin = $this->createAdmin();
        $token = $this->issueToken($admin);

        Province::factory()->create(['name' => 'Bengo', 'code' => 'AO-BGO']);
        Province::factory()->create(['name' => 'Luanda', 'code' => 'AO-LUA']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/provinces');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'code', 'is_active', 'created_at', 'updated_at']
                ]
            ]);
    }

    public function test_admin_can_create_province(): void
    {
        $admin = $this->createAdmin();
        $token = $this->issueToken($admin);

        $payload = [
            'name' => 'Cuanza Sul',
            'code' => 'AO-CUS',
            'is_active' => true,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/admin/provinces', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Cuanza Sul');

        $this->assertDatabaseHas('provinces', ['name' => 'Cuanza Sul', 'code' => 'AO-CUS']);
    }

    public function test_admin_can_update_province(): void
    {
        $admin = $this->createAdmin();
        $token = $this->issueToken($admin);

        $province = Province::factory()->create(['name' => 'Namibe', 'code' => 'AO-NAM']);

        $payload = [
            'name' => 'Namibe Alterado',
            'code' => 'AO-NMA',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->patchJson("/api/admin/provinces/{$province->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Namibe Alterado');

        $this->assertDatabaseHas('provinces', [
            'id' => $province->id,
            'name' => 'Namibe Alterado',
            'code' => 'AO-NMA'
        ]);
    }

    public function test_admin_can_delete_province(): void
    {
        $admin = $this->createAdmin();
        $token = $this->issueToken($admin);

        $province = Province::factory()->create(['name' => 'Uíge', 'code' => 'AO-UIG']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/admin/provinces/{$province->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('provinces', ['id' => $province->id]);
    }

    // ─── Interest Area Tests ───────────────────────────────────────────────────

    public function test_admin_can_list_interest_areas(): void
    {
        $admin = $this->createAdmin();
        $token = $this->issueToken($admin);

        InterestArea::factory()->create(['name' => 'História Económica', 'slug' => 'historia-economica']);
        InterestArea::factory()->create(['name' => 'Macroeconomia', 'slug' => 'macroeconomia']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/interest-areas');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'description', 'is_active', 'created_at', 'updated_at']
                ]
            ]);
    }

    public function test_admin_can_create_interest_area(): void
    {
        $admin = $this->createAdmin();
        $token = $this->issueToken($admin);

        $payload = [
            'name' => 'Microeconomia Aplicada',
            'slug' => 'microeconomia-aplicada',
            'description' => 'Estudo de mercados locais',
            'is_active' => true,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/admin/interest-areas', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Microeconomia Aplicada');

        $this->assertDatabaseHas('interest_areas', [
            'name' => 'Microeconomia Aplicada',
            'slug' => 'microeconomia-aplicada'
        ]);
    }

    public function test_admin_can_update_interest_area(): void
    {
        $admin = $this->createAdmin();
        $token = $this->issueToken($admin);

        $area = InterestArea::factory()->create(['name' => 'Finanças Públicas', 'slug' => 'financas-publicas']);

        $payload = [
            'name' => 'Finanças Públicas Nacionais',
            'slug' => 'financas-publicas-nacionais',
            'description' => 'Atualizado pelo admin',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->patchJson("/api/admin/interest-areas/{$area->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Finanças Públicas Nacionais');

        $this->assertDatabaseHas('interest_areas', [
            'id' => $area->id,
            'name' => 'Finanças Públicas Nacionais',
            'slug' => 'financas-publicas-nacionais',
        ]);
    }

    public function test_admin_can_delete_interest_area(): void
    {
        $admin = $this->createAdmin();
        $token = $this->issueToken($admin);

        $area = InterestArea::factory()->create(['name' => 'Econometria', 'slug' => 'econometria']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/admin/interest-areas/{$area->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('interest_areas', ['id' => $area->id]);
    }

    // ─── Permissions Tests ─────────────────────────────────────────────────────

    public function test_non_admin_cannot_manage_foundation(): void
    {
        $student = $this->createStudent();
        $token = $this->issueToken($student);

        // Try creating a province
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/admin/provinces', ['name' => 'Proibida', 'code' => 'AO-PRB'])
            ->assertStatus(403);

        // Try creating an interest area
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/admin/interest-areas', ['name' => 'Proibida', 'slug' => 'proibida'])
            ->assertStatus(403);
    }
}
