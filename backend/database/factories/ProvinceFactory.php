<?php

namespace Database\Factories;

use App\Models\Province;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProvinceFactory extends Factory
{
    protected $model = Province::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->word() . ' Province';
        return [
            'id' => (string) Str::uuid(),
            'name' => $name,
            'code' => 'AO-' . Str::upper(Str::random(3)),
            'is_active' => true,
        ];
    }
}
