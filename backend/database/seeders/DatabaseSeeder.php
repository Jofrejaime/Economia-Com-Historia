<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seeders de Pessoa 1 (Jofre Jaime) - Core e Autenticação
        // Ordem importa: níveis primeiro, depois users
        $this->call([
            LevelDefinitionsSeeder::class,
            AdminSeeder::class,
            UserSeeder::class,
            BadgesSeeder::class,
        ]);

        // Seeders de conteúdo — Documentos, Quizzes, Comunidade
        $this->call([
            DocumentSeeder::class,
            QuizSeeder::class,
            CommunitySeeder::class,
        ]);
    }
}
