<?php

namespace Database\Factories;

use App\Models\InterestArea;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class InterestAreaFactory extends Factory
{
    protected $model = InterestArea::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->sentence(2);
        return [
            'id' => (string) Str::uuid(),
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => $this->faker->paragraph(),
            'is_active' => true,
        ];
    }
}
