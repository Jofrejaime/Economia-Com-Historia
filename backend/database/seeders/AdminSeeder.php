<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $userId = (string) Str::uuid();

        DB::table('users')->insert([
            'id' => $userId,
            'email' => 'admin@economia-historia.local',
            'password_hash' => bcrypt('Admin@123456'),
            'role' => 'admin',
            'email_verified' => true,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('user_profiles')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'display_name' => 'Administrador',
            'full_name' => 'Administrador do Sistema',
            'institution' => 'ISPTEC',
            'province' => 'Luanda',
            'bio' => 'Administrador responsável pela manutenção e gestão do sistema.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('user_levels')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'current_level' => 5,
            'total_points' => 1500,
            'weekly_points' => 120,
            'monthly_points' => 450,
            'quizzes_completed' => 0,
            'documents_read' => 40,
            'topics_created' => 8,
            'replies_posted' => 25,
            'updated_at' => now(),
        ]);

    }
}
