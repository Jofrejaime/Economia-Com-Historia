<?php

namespace Database\Seeders;

use App\Models\InterestArea;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class InterestAreaSeeder extends Seeder
{
    public function run(): void
    {
        $areas = [
            ['name' => 'História Monetária', 'description' => 'Estudo da evolução das moedas e circulação monetária em Angola.'],
            ['name' => 'Economia Colonial', 'description' => 'Análise da estrutura económica durante o período de colonização.'],
            ['name' => 'Macroeconomia Aplicada', 'description' => 'Modelos macroeconómicos aplicados a contextos históricos e de desenvolvimento.'],
            ['name' => 'Política Orçamental', 'description' => 'Evolução das finanças públicas e receitas do Estado.'],
            ['name' => 'Desenvolvimento Económico', 'description' => 'Estudo dos ciclos de crescimento e sectores produtivos.'],
            ['name' => 'Comércio Ultramarino', 'description' => 'As trocas comerciais históricas entre Angola e o exterior.'],
        ];

        foreach ($areas as $area) {
            InterestArea::firstOrCreate(
                ['name' => $area['name']],
                [
                    'id' => (string) Str::uuid(),
                    'slug' => Str::slug($area['name']),
                    'description' => $area['description'],
                    'is_active' => true,
                ]
            );
        }

        // Synchronize all existing user interest areas based on JSON research_areas
        $profiles = DB::table('user_profiles')->whereNotNull('research_areas')->get();
        foreach ($profiles as $profile) {
            $areasList = json_decode($profile->research_areas, true);
            if (is_array($areasList)) {
                $userId = $profile->user_id;
                foreach ($areasList as $name) {
                    if (empty($name)) continue;
                    $area = InterestArea::where('name', $name)->first();
                    if (!$area) {
                        $area = InterestArea::create([
                            'id' => (string) Str::uuid(),
                            'name' => $name,
                            'slug' => Str::slug($name),
                            'is_active' => true,
                        ]);
                    }
                    DB::table('user_interest_areas')->insertOrIgnore([
                        'user_id' => $userId,
                        'interest_area_id' => $area->id,
                    ]);
                }
            }
        }
    }
}
