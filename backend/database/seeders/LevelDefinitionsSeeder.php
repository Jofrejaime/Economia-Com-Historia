<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LevelDefinitionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('level_definitions')->insert([
            [
                'level' => 1,
                'name' => 'Iniciante',
                'min_points' => 0,
                'max_points' => 100,
                'color_hex' => '#9E9E9E',
                'icon_url' => null,
                'perks' => json_encode([
                    'can_view_public' => true,
                    'can_participate_community' => false,
                    'can_create_topics' => false,
                    'can_upload_documents' => false,
                    'can_moderate' => false,
                ]),
            ],
            [
                'level' => 2,
                'name' => 'Aprendiz',
                'min_points' => 101,
                'max_points' => 250,
                'color_hex' => '#4CAF50',
                'icon_url' => null,
                'perks' => json_encode([
                    'can_view_public' => true,
                    'can_participate_community' => true,
                    'can_create_topics' => false,
                    'can_upload_documents' => false,
                    'can_moderate' => false,
                ]),
            ],
            [
                'level' => 3,
                'name' => 'Estudioso',
                'min_points' => 251,
                'max_points' => 500,
                'color_hex' => '#2196F3',
                'icon_url' => null,
                'perks' => json_encode([
                    'can_view_public' => true,
                    'can_participate_community' => true,
                    'can_create_topics' => true,
                    'can_upload_documents' => false,
                    'can_moderate' => false,
                ]),
            ],
            [
                'level' => 4,
                'name' => 'Pesquisador',
                'min_points' => 501,
                'max_points' => 1000,
                'color_hex' => '#FF9800',
                'icon_url' => null,
                'perks' => json_encode([
                    'can_view_public' => true,
                    'can_participate_community' => true,
                    'can_create_topics' => true,
                    'can_upload_documents' => true,
                    'can_moderate' => false,
                ]),
            ],
            [
                'level' => 5,
                'name' => 'Mestre',
                'min_points' => 1001,
                'max_points' => 2000,
                'color_hex' => '#9C27B0',
                'icon_url' => null,
                'perks' => json_encode([
                    'can_view_public' => true,
                    'can_participate_community' => true,
                    'can_create_topics' => true,
                    'can_upload_documents' => true,
                    'can_moderate' => true,
                ]),
            ],
        ]);
    }
}
