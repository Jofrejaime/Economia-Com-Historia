<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BadgesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $badges = [
            [
                'name' => 'First Steps',
                'description' => 'Complete your first quiz',
                'icon_url' => null,
                'color_hex' => '#4CAF50',
                'category' => 'achievement',
                'criteria_type' => 'quiz_completed',
                'criteria_value' => json_encode(['count' => 1]),
                'is_active' => true,
            ],
            [
                'name' => 'Quiz Master',
                'description' => 'Complete 10 quizzes',
                'icon_url' => null,
                'color_hex' => '#2196F3',
                'category' => 'achievement',
                'criteria_type' => 'quiz_completed',
                'criteria_value' => json_encode(['count' => 10]),
                'is_active' => true,
            ],
            [
                'name' => 'Community Voice',
                'description' => 'Create your first topic in the community',
                'icon_url' => null,
                'color_hex' => '#FF9800',
                'category' => 'achievement',
                'criteria_type' => 'topic_created',
                'criteria_value' => json_encode(['count' => 1]),
                'is_active' => true,
            ],
            [
                'name' => 'Helpful Member',
                'description' => 'Get 5 of your replies marked as helpful',
                'icon_url' => null,
                'color_hex' => '#9C27B0',
                'category' => 'achievement',
                'criteria_type' => 'reply_accepted',
                'criteria_value' => json_encode(['count' => 5]),
                'is_active' => true,
            ],
            [
                'name' => 'Researcher',
                'description' => 'Upload your first document',
                'icon_url' => null,
                'color_hex' => '#E91E63',
                'category' => 'achievement',
                'criteria_type' => 'document_uploaded',
                'criteria_value' => json_encode(['count' => 1]),
                'is_active' => true,
            ],
            [
                'name' => 'Knowledge Keeper',
                'description' => 'Read 25 documents',
                'icon_url' => null,
                'color_hex' => '#00BCD4',
                'category' => 'achievement',
                'criteria_type' => 'documents_read',
                'criteria_value' => json_encode(['count' => 25]),
                'is_active' => true,
            ],
            [
                'name' => 'Social Butterfly',
                'description' => 'Interact with 50 different posts',
                'icon_url' => null,
                'color_hex' => '#FF5722',
                'category' => 'achievement',
                'criteria_type' => 'interactions',
                'criteria_value' => json_encode(['count' => 50]),
                'is_active' => true,
            ],
            [
                'name' => 'Rising Star',
                'description' => 'Reach Level 3 (Estudioso)',
                'icon_url' => null,
                'color_hex' => '#FFC107',
                'category' => 'level',
                'criteria_type' => 'level_reached',
                'criteria_value' => json_encode(['level' => 3]),
                'is_active' => true,
            ],
        ];

        foreach ($badges as $badge) {
            DB::table('badges')->insert(array_merge(
                $badge,
                [
                    'id' => (string) Str::uuid(),
                    'created_at' => now(),
                ]
            ));
        }
    }
}
