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

            // Create user via DB::table to bypass:
            // 1. WithoutModelEvents disabling UUID-generating `creating` event
            // 2. `id` not in Fillable (mass assignment)
            // 3. `hashed` cast double-hashing the already-bcrypted password
            $userId = (string) Str::uuid();
            DB::table('users')->insert([
                'id' => $userId,
                'email' => $userData['email'],
                'password_hash' => $userData['password_hash'],
                'email_verified' => $userData['email_verified'],
                'is_active' => $userData['is_active'],
                'role' => $userData['role'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $user = (object) ['id' => $userId, 'role' => $userData['role']];

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

            // Initialize user level with varied data per role
            $levelData = match ($user->role) {
                'admin' => ['current_level' => 5, 'total_points' => 1500, 'weekly_points' => 120, 'monthly_points' => 450, 'quizzes_completed' => 15, 'documents_read' => 40, 'topics_created' => 8, 'replies_posted' => 25],
                'professor' => ['current_level' => 4, 'total_points' => 850, 'weekly_points' => 80, 'monthly_points' => 320, 'quizzes_completed' => 10, 'documents_read' => 30, 'topics_created' => 12, 'replies_posted' => 35],
                'investigador' => ['current_level' => 4, 'total_points' => 720, 'weekly_points' => 65, 'monthly_points' => 280, 'quizzes_completed' => 8, 'documents_read' => 25, 'topics_created' => 6, 'replies_posted' => 20],
                default => ['current_level' => 2, 'total_points' => 150, 'weekly_points' => 30, 'monthly_points' => 95, 'quizzes_completed' => 3, 'documents_read' => 8, 'topics_created' => 2, 'replies_posted' => 5],
            };

            DB::table('user_levels')->insert(array_merge([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'updated_at' => now(),
            ], $levelData));
        }

        // ──────────────────────────────────────────────────────────────
        // Populate leaderboard_nacional_cache
        // ──────────────────────────────────────────────────────────────
        $rankedUsers = DB::table('users as u')
            ->join('user_profiles as up', 'up.user_id', '=', 'u.id')
            ->join('user_levels as ul', 'ul.user_id', '=', 'u.id')
            ->where('u.is_active', true)
            ->orderByDesc('ul.total_points')
            ->orderByDesc('ul.quizzes_completed')
            ->select('u.id', 'up.display_name', 'up.province', 'up.avatar_url',
                     'ul.total_points', 'ul.quizzes_completed', 'ul.weekly_points', 'ul.current_level')
            ->get();

        $rank = 0;
        foreach ($rankedUsers as $ru) {
            $rank++;
            DB::table('leaderboard_nacional_cache')->insert([
                'rank_position' => $rank,
                'user_id' => $ru->id,
                'display_name' => $ru->display_name,
                'province' => $ru->province,
                'avatar_url' => $ru->avatar_url,
                'total_points' => $ru->total_points,
                'quizzes_completed' => $ru->quizzes_completed,
                'weekly_points' => $ru->weekly_points,
                'current_level' => $ru->current_level,
                'prev_rank' => 0,
                'refreshed_at' => now(),
            ]);
        }
    }
}
