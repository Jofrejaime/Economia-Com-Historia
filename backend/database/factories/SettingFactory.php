<?php

namespace Database\Factories;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class SettingFactory extends Factory
{
    protected $model = Setting::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'key' => $this->faker->unique()->slug(),
            'value' => $this->faker->word(),
            'type' => 'string',
            'group' => 'general',
            'description' => $this->faker->sentence(),
            'is_public' => false,
        ];
    }
}
