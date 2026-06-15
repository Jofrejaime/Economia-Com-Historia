<?php

namespace Database\Factories;

use App\Models\AccessLevel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AccessRequest>
 */
class AccessRequestFactory extends Factory
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
            'access_level_id' => AccessLevel::factory(),
            'status' => 'pending',
            'justification' => $this->faker->sentence(5),
            'created_at' => now(),
        ];
    }
}
