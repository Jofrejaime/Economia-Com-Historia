<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'email' => 'admin@economia-historia.local',
                'password_hash' => bcrypt('Admin@123456'),
                'role' => 'admin',
                'email_verified' => true,
                'is_active' => true,
                'display_name' => 'Administrador',
                'full_name' => 'Administrador do Sistema',
                'institution' => 'ISPTEC',
                'province' => 'Luanda',
                'bio' => 'Administrador responsável pela manutenção e gestão do sistema.',
            ],
            [
                'email' => 'professor@economia-historia.local',
                'password_hash' => bcrypt('Professor@123456'),
                'role' => 'professor',
                'email_verified' => true,
                'is_active' => true,
                'display_name' => 'Prof. João Silva',
                'full_name' => 'João Pedro da Silva',
                'institution' => 'ISPTEC',
                'province' => 'Luanda',
                'bio' => 'Professor de História Económica com experiência em pesquisa.',
                'research_areas' => json_encode(['História Económica', 'Política Colonial', 'Desenvolvimento']),
            ],
            [
                'email' => 'researcher@economia-historia.local',
                'password_hash' => bcrypt('Researcher@123456'),
                'role' => 'investigador',
                'email_verified' => true,
                'is_active' => true,
                'display_name' => 'Dra. Maria Neves',
                'full_name' => 'Maria Neves dos Santos',
                'institution' => 'Universidade Agostinho Neto',
                'province' => 'Benguela',
                'bio' => 'Investigadora em economia africana com foco em história colonial.',
                'research_areas' => json_encode(['Economia Africana', 'Comercio Atlântico', 'História Colonial']),
            ],
            [
                'email' => 'student@economia-historia.local',
                'password_hash' => bcrypt('Student@123456'),
                'role' => 'estudante',
                'email_verified' => true,
                'is_active' => true,
                'display_name' => 'António Cabral',
                'full_name' => 'António Cabral Ferreira',
                'institution' => 'ISPTEC',
                'province' => 'Huambo',
                'bio' => 'Estudante de Economia com interesse em história.',
                'research_areas' => json_encode(['Economia', 'História']),
            ],
            [
                'email' => 'student2@economia-historia.local',
                'password_hash' => bcrypt('Student@123456'),
                'role' => 'estudante',
                'email_verified' => true,
                'is_active' => true,
                'display_name' => 'Carla Dias',
                'full_name' => 'Carla Dias Martins',
                'institution' => 'Universidade de Luanda',
                'province' => 'Luanda',
                'bio' => 'Estudante apaixonada por história económica de Angola.',
                'research_areas' => json_encode(['História de Angola', 'Economia', 'Desenvolvimento']),
            ],
        ];

        foreach ($users as $userData) {
            // Extract profile data
            $displayName = $userData['display_name'];
            $fullName = $userData['full_name'];
            $institution = $userData['institution'];
            $province = $userData['province'];
            $bio = $userData['bio'] ?? null;
            $researchAreas = $userData['research_areas'] ?? null;

            // Remove profile data from user array
            unset(
                $userData['display_name'],
                $userData['full_name'],
                $userData['institution'],
                $userData['province'],
                $userData['bio'],
                $userData['research_areas']
            );

            // Create user
            $user = User::create($userData);

            // Create profile
            DB::table('user_profiles')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'display_name' => $displayName,
                'full_name' => $fullName,
                'institution' => $institution,
                'province' => $province,
                'bio' => $bio,
                'research_areas' => $researchAreas,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Grant public access
            DB::table('user_access_grants')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'access_level_id' => 'public',
                'granted_at' => now(),
                'is_active' => true,
            ]);

            // Initialize user level
            DB::table('user_levels')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'current_level' => 1,
                'total_points' => 0,
                'weekly_points' => 0,
                'monthly_points' => 0,
                'quizzes_completed' => 0,
                'documents_read' => 0,
                'topics_created' => 0,
                'replies_posted' => 0,
                'updated_at' => now(),
            ]);
        }
    }
}
