<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'id' => (string) Str::uuid(),
                'key' => 'site_name',
                'value' => 'Economia com História',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Nome oficial da plataforma',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'key' => 'maintenance_mode',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'system',
                'description' => 'Ativa/desativa o modo de manutenção da plataforma',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'key' => 'allow_registration',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'security',
                'description' => 'Permitir novos registos de utilizadores na plataforma',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'key' => 'leaderboard_enabled',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'gamification',
                'description' => 'Ativa/desativa a visualização pública do ranking e leaderboard',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'key' => 'max_upload_size',
                'value' => '10',
                'type' => 'integer',
                'group' => 'content',
                'description' => 'Tamanho máximo permitido para upload de ficheiros (em MB)',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'key' => 'support_email',
                'value' => 'suporte@economiacomhistoria.ao',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Endereço de email de suporte para os utilizadores',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->updateOrInsert(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
