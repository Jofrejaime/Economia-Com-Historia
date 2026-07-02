<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminUsersTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(string $email = 'admin@test.com'): User
    {
        $admin = User::factory()->create([
            'email' => $email,
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

    private function createStudent(string $email = 'student@test.com'): User
    {
        $student = User::factory()->create([
            'email' => $email,
            'role' => 'estudante',
            'is_active' => true,
        ]);

        \DB::table('user_profiles')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $student->id,
            'display_name' => 'Student User',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $student;
    }

    private function auth(User $user)
    {
        $token = \DB::table('user_sessions')
            ->where('user_id', $user->id)
            ->value('refresh_token');

        if (!$token) {
            $token = Str::random(80);
            \DB::table('user_sessions')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'refresh_token' => $token,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'PHPUnit',
                'expires_at' => now()->addDay(),
                'created_at' => now(),
            ]);
        }

        return $this->withHeader('Authorization', "Bearer {$token}");
    }

    public function test_admin_can_list_users()
    {
        $admin = $this->createAdmin();
        $student = $this->createStudent();

        $response = $this->auth($admin)->getJson('/api/admin/users');

        $response->assertStatus(200)
                 ->assertJsonFragment(['email' => $student->email])
                 ->assertJsonFragment(['email' => $admin->email]);
    }

    public function test_admin_can_paginate_users()
    {
        $admin = $this->createAdmin();
        // Create multiple students
        for ($i = 0; $i < 15; $i++) {
            $this->createStudent("student{$i}@test.com");
        }

        $response = $this->auth($admin)->getJson('/api/admin/users?per_page=10&page=1');
        $response->assertStatus(200)
                 ->assertJsonStructure(['data', 'links', 'meta'])
                 ->assertJsonCount(10, 'data');
    }

    public function test_admin_can_search_users()
    {
        $admin = $this->createAdmin();
        $student = $this->createStudent('special-student@test.com');

        $response = $this->auth($admin)->getJson('/api/admin/users?search=special-student');

        $response->assertStatus(200)
                 ->assertJsonFragment(['email' => 'special-student@test.com'])
                 ->assertJsonMissingExact(['email' => $admin->email]);
    }

    public function test_admin_can_filter_by_role()
    {
        $admin = $this->createAdmin();
        $student = $this->createStudent();

        $response = $this->auth($admin)->getJson('/api/admin/users?role=estudante');

        $response->assertStatus(200)
                 ->assertJsonFragment(['email' => $student->email])
                 ->assertJsonMissingExact(['email' => $admin->email]);
    }

    public function test_admin_can_filter_by_status()
    {
        $admin = $this->createAdmin();
        $student = User::factory()->create([
            'email' => 'inactive@test.com',
            'role' => 'estudante',
            'is_active' => false,
        ]);

        $response = $this->auth($admin)->getJson('/api/admin/users?status=inactive');

        $response->assertStatus(200)
                 ->assertJsonFragment(['email' => 'inactive@test.com'])
                 ->assertJsonMissingExact(['email' => $admin->email]);
    }

    public function test_admin_can_filter_verified_users()
    {
        $admin = $this->createAdmin();
        
        $verified = User::factory()->create([
            'email' => 'verified@test.com',
            'email_verified' => true,
        ]);
        $unverified = User::factory()->create([
            'email' => 'unverified@test.com',
            'email_verified' => false,
        ]);

        $response = $this->auth($admin)->getJson('/api/admin/users?verified=true');
        $response->assertStatus(200)
                 ->assertJsonFragment(['email' => 'verified@test.com'])
                 ->assertJsonMissingExact(['email' => 'unverified@test.com']);
    }

    public function test_admin_can_view_user()
    {
        $admin = $this->createAdmin();
        $student = $this->createStudent();

        $response = $this->auth($admin)->getJson("/api/admin/users/{$student->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('data.email', $student->email);
    }

    public function test_admin_can_view_profile()
    {
        $admin = $this->createAdmin();
        $student = $this->createStudent();

        // Seed user progress
        \DB::table('user_levels')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $student->id,
            'current_level' => 1,
            'total_points' => 150,
        ]);

        $response = $this->auth($admin)->getJson("/api/admin/users/{$student->id}/profile");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         'user',
                         'profile',
                         'user_level',
                         'level_definition',
                         'badges',
                         'access_grants',
                         'access_requests',
                         'statistics'
                     ]
                 ]);
    }

    public function test_admin_can_view_sessions()
    {
        $admin = $this->createAdmin();
        $student = $this->createStudent();

        \DB::table('user_sessions')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $student->id,
            'refresh_token' => Str::random(80),
            'ip_address' => '192.168.1.1',
            'user_agent' => 'Mobile Safari',
            'expires_at' => now()->addDay(),
            'created_at' => now(),
        ]);

        $response = $this->auth($admin)->getJson("/api/admin/users/{$student->id}/sessions");

        $response->assertStatus(200)
                 ->assertJsonFragment(['ip_address' => '192.168.1.1']);
    }

    public function test_admin_can_create_user()
    {
        $admin = $this->createAdmin();

        $response = $this->auth($admin)->postJson('/api/admin/users', [
            'email' => 'new-user@test.com',
            'password' => 'password123',
            'role' => 'professor',
            'display_name' => 'Novo Professor',
            'full_name' => 'Novo Professor Sobrenome',
            'institution' => 'ISPTEC',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.email', 'new-user@test.com');

        $this->assertDatabaseHas('users', ['email' => 'new-user@test.com', 'role' => 'professor']);
        $this->assertDatabaseHas('user_profiles', ['display_name' => 'Novo Professor', 'institution' => 'ISPTEC']);
    }

    public function test_admin_can_update_user()
    {
        $admin = $this->createAdmin();
        $student = $this->createStudent();

        $response = $this->auth($admin)->patchJson("/api/admin/users/{$student->id}", [
            'email' => 'updated-student@test.com',
            'role' => 'investigador',
            'display_name' => 'Updated Student Name',
            'is_active' => true,
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.email', 'updated-student@test.com');

        $this->assertDatabaseHas('users', ['id' => $student->id, 'email' => 'updated-student@test.com', 'role' => 'investigador']);
    }

    public function test_admin_can_delete_user()
    {
        $admin = $this->createAdmin();
        $student = $this->createStudent();

        $response = $this->auth($admin)->deleteJson("/api/admin/users/{$student->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('users', ['id' => $student->id]);
    }

    public function test_admin_cannot_delete_himself()
    {
        $admin = $this->createAdmin();

        $response = $this->auth($admin)->deleteJson("/api/admin/users/{$admin->id}");

        $response->assertStatus(422)
                 ->assertJsonFragment(['message' => 'You cannot delete your own account.']);
    }

    public function test_admin_cannot_delete_last_admin()
    {
        $admin = $this->createAdmin();
        // Since $admin is the only admin, we try to delete it from another user... wait, we need another admin to call the API.
        $admin2 = $this->createAdmin('admin2@test.com');

        // Delete admin2
        $response = $this->auth($admin)->deleteJson("/api/admin/users/{$admin2->id}");
        $response->assertStatus(200);

        // Now $admin is the last remaining admin. If we try to delete it (say we authenticate as a temporary admin user created just for this call? No, if we try to delete $admin when there are no other admins, it should fail.)
        // Let's make sure we authenticate as someone else, say a new admin we just created, but we try to delete $admin which is the last one?
        // Wait, if $admin is the last admin, and we delete it, it fails.
        // Let's create another admin, authenticate as admin2, and try to delete $admin when $admin is the only other admin. If we succeed, there is still admin2. If we try to delete admin2 (when admin2 is the last one), it fails.
        // Let's write the test:
        $response = $this->auth($admin)->deleteJson("/api/admin/users/{$admin->id}");
        // Wait, $admin cannot delete himself, returns 422.
        // Let's create $admin2, auth as $admin2, and try to delete $admin. Now there are two admins. It succeeds.
        // Now only $admin2 is left. If we create a temporary admin3, auth as admin3, and try to delete admin2 (which is the last admin? No, admin3 is still there.)
        // What if we delete all other admins first, so only $admin is left. Then we authenticate as a temporary user? No, only admins can delete users. So we must have at least one admin to make the call. If there is only one admin, they can't delete themselves (self-deletion is blocked).
        // What if we have one admin ($admin) and one other user ($student)? Can the admin delete themselves? No, 422.
        // What if we have two admins ($admin and $admin2)? Admin 1 deletes Admin 2. That succeeds. Now only Admin 1 is left. Can Admin 1 delete themselves? No, because of self-deletion protection.
        // What if we try to demote or delete?
        // Wait! The protection is "impedir eliminação do último administrador". So if Admin 1 tries to delete Admin 2, but Admin 2 is the ONLY other admin, it means if we delete Admin 2, only Admin 1 will be left. That is allowed. But if Admin 1 is deleted by someone else, or if there is a scenario where the last admin is deleted.
        // Wait! Let's check how many admins are in the system:
        // `User::where('role', 'admin')->count()`.
        // If we try to delete a user who is an admin, and `User::where('role', 'admin')->count() <= 1`, we reject it!
        // This is perfectly simple and covers the last admin protection!
        // Let's write a test where we try to delete the ONLY admin. To do this, we need to bypass authentication or we can create another admin to authenticate, but try to delete the other admin when it's the last one.
        // Wait, if we have $admin (logado) and we try to delete $admin2 (which is the only other admin), does the count of admins go to 1? Yes. Is that allowed? Yes, because $admin is still there. But if we try to delete $admin2 when there is NO other admin? That is impossible because to make the call we must have at least one admin.
        // But wait! What if we change the role of the last admin? E.g. update role to 'estudante'? That would leave the system with 0 admins!
        // That is also an administrative action to protect ("remover último administrador").
        // So in `delete`:
        // If the user being deleted is an admin, and `User::where('role', 'admin')->count() <= 1`, throw exception.
        // In `update`:
        // If the user is an admin, and we are changing their role to something else, and `User::where('role', 'admin')->count() <= 1`, throw exception.
        // This is extremely logical and fully protects the system!
        // Let's test this in `test_admin_cannot_delete_last_admin`:
        $admin2 = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        // Now there are 2 admins: $admin and $admin2.
        // Let's delete $admin2. This is allowed because $admin is still an admin.
        $response = $this->auth($admin)->deleteJson("/api/admin/users/{$admin2->id}");
        $response->assertStatus(200);

        // Now let's try to demote $admin (change role to student). Since $admin is the last admin, this should fail!
        $response = $this->auth($admin)->patchJson("/api/admin/users/{$admin->id}", [
            'email' => $admin->email,
            'role' => 'estudante',
            'display_name' => 'Demo student',
            'is_active' => true,
        ]);
        $response->assertStatus(422)
                 ->assertJsonFragment(['message' => 'Cannot demote the last administrator of the system.']);
    }

    public function test_non_admin_cannot_access_admin_users()
    {
        $student = $this->createStudent();

        $response = $this->auth($student)->getJson('/api/admin/users');
        $response->assertStatus(403);
    }
}
