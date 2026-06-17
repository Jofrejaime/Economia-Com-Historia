<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'user_id' => User::factory(),
            'type' => $this->faker->randomElement(['system_announcement', 'content_notification', 'topic_reply', 'reply_accepted', 'access_request_approved', 'access_request_rejected', 'badge_earned', 'level_up']),
            'title' => $this->faker->sentence(6),
            'message' => $this->faker->paragraph(2),
            'reference_id' => null,
            'reference_type' => null,
            'is_read' => false,
            'created_at' => now(),
        ];
    }
}
