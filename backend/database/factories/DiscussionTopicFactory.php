<?php

namespace Database\Factories;

use App\Models\DiscussionTopic;
use App\Models\CommunityCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DiscussionTopicFactory extends Factory
{
    protected $model = DiscussionTopic::class;

    public function definition(): array
    {
        return [
            'category_id' => CommunityCategory::factory(),
            'author_id' => User::factory(),
            'title' => $this->faker->sentence(),
            'content' => $this->faker->paragraphs(3, true),
            'status' => 'published',
            'is_pinned' => false,
            'is_featured' => false,
            'last_reply_at' => null,
            'replies_count' => 0,
            'views_count' => 0,
            'likes_count' => 0,
            'followers_count' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
