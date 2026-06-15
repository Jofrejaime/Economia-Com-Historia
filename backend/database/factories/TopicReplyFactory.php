<?php

namespace Database\Factories;

use App\Models\TopicReply;
use App\Models\DiscussionTopic;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TopicReplyFactory extends Factory
{
    protected $model = TopicReply::class;

    public function definition(): array
    {
        return [
            'topic_id' => DiscussionTopic::factory(),
            'author_id' => User::factory(),
            'parent_reply_id' => null,
            'content' => $this->faker->paragraphs(2, true),
            'is_accepted' => false,
            'is_flagged' => false,
            'likes_count' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
