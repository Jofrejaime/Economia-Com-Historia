<?php

namespace Database\Seeders;

use App\Models\Province;
use App\Models\InterestArea;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProvinceSeeder extends Seeder
{
    public function run(): void
    {
        $provinces = [
            ['name' => 'Bengo', 'code' => 'AO-BGO'],
            ['name' => 'Benguela', 'code' => 'AO-BGU'],
            ['name' => 'Bié', 'code' => 'AO-BIE'],
            ['name' => 'Cabinda', 'code' => 'AO-CAB'],
            ['name' => 'Cuando Cubango', 'code' => 'AO-CCU'],
            ['name' => 'Cuanza Norte', 'code' => 'AO-CNO'],
            ['name' => 'Cuanza Sul', 'code' => 'AO-CUS'],
            ['name' => 'Cunene', 'code' => 'AO-CNN'],
            ['name' => 'Huambo', 'code' => 'AO-HUA'],
            ['name' => 'Huíla', 'code' => 'AO-HUI'],
            ['name' => 'Luanda', 'code' => 'AO-LUA'],
            ['name' => 'Lunda Norte', 'code' => 'AO-LNO'],
            ['name' => 'Lunda Sul', 'code' => 'AO-LSU'],
            ['name' => 'Malanje', 'code' => 'AO-MAL'],
            ['name' => 'Moxico', 'code' => 'AO-MOX'],
            ['name' => 'Namibe', 'code' => 'AO-NAM'],
            ['name' => 'Uíge', 'code' => 'AO-UIG'],
            ['name' => 'Zaire', 'code' => 'AO-ZAI'],
        ];

        foreach ($provinces as $prov) {
            Province::firstOrCreate(
                ['name' => $prov['name']],
                [
                    'id' => (string) Str::uuid(),
                    'code' => $prov['code'],
                    'is_active' => true,
                ]
            );
        }

        // Synchronize all existing user_profiles
        $profiles = DB::table('user_profiles')->whereNotNull('province')->get();
        foreach ($profiles as $profile) {
            $province = Province::where('name', $profile->province)->first();
            if ($province) {
                DB::table('user_profiles')
                    ->where('id', $profile->id)
                    ->update(['province_id' => $province->id]);
            }
        }
    }
}
