<?php

namespace Database\Factories;

use App\Models\CommunityCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommunityCategoryFactory extends Factory
{
    protected $model = CommunityCategory::class;

    public function definition(): array
    {
        return [
            'slug' => $this->faker->unique()->slug(),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'access_level_id' => 'public',
            'color_bg' => '#800020',
            'color_text' => '#FFFFFF',
            'cover_image_url' => null,
            'sort_order' => 0,
            'is_active' => true,
            'members_count' => 0,
            'topics_count' => 0,
            'created_at' => now(),
        ];
    }
}
