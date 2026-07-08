<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class DocumentFactory extends Factory
{
    protected $model = Document::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'title' => $this->faker->sentence(),
            'slug' => $this->faker->slug(),
            'author' => $this->faker->name(),
            'summary' => $this->faker->paragraph(),
            'document_type' => 'article',
            'academic_level' => 'intro',
            'status' => 'published',
            'created_by' => User::factory(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
