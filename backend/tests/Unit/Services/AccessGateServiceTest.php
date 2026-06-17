<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Services\AccessGateService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class AccessGateServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_access_is_always_allowed(): void
    {
        $user = User::factory()->create();

        $service = app(AccessGateService::class);

        $this->assertTrue($service->canAccess($user, 'public'));
    }

    public function test_restricted_access_requires_active_grant(): void
    {
        $user = User::factory()->create();
        $service = app(AccessGateService::class);

        $this->assertFalse($service->canAccess($user, 'jindungo'));

        DB::table('user_access_grants')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'access_level_id' => 'jindungo',
            'granted_at' => now(),
            'is_active' => true,
        ]);

        $this->assertTrue($service->canAccess($user, 'jindungo'));
    }

    public function test_can_access_document_uses_grant_and_author_bypass(): void
    {
        $user = User::factory()->create();
        $service = app(AccessGateService::class);

        $ownDocument = (object) [
            'access_level_id' => 'restricted',
            'created_by' => $user->id,
        ];

        $this->assertTrue($service->canAccessDocument($user, $ownDocument));

        $foreignDocument = (object) [
            'access_level_id' => 'jindungo',
            'created_by' => User::factory()->create()->id,
        ];

        $this->assertFalse($service->canAccessDocument($user, $foreignDocument));
    }

    public function test_admin_bypasses_access_checks(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $service = app(AccessGateService::class);

        $document = (object) [
            'access_level_id' => 'restricted',
            'created_by' => User::factory()->create()->id,
        ];

        $this->assertTrue($service->canAccessDocument($admin, $document));
    }
}
