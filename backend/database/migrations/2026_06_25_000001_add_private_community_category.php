<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (!DB::table('community_categories')->where('slug', 'sala-privada')->exists()) {
            DB::table('community_categories')->insert([
                'id'             => (string) Str::uuid(),
                'slug'           => 'sala-privada',
                'name'           => 'Sala Privada',
                'description'    => 'Espaço de discussão restrito a membros seleccionados pelo autor.',
                'color_bg'       => '#FFB3BA',
                'color_text'     => '#5C0011',
                'cover_image_url'=> null,
                'sort_order'     => 99,
                'is_active'      => true,
                'created_at'     => now(),
                'members_count'  => 0,
                'topics_count'   => 0,
            ]);
        }
    }

    public function down(): void
    {
        DB::table('community_categories')->where('slug', 'sala-privada')->delete();
    }
};
