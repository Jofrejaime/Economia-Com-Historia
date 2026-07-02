<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Collection;

class SettingsService
{
    public function getAll(): Collection
    {
        return Setting::orderBy('key')->get();
    }

    public function getByKey(string $key): Setting
    {
        return Setting::where('key', $key)->firstOrFail();
    }

    public function update(string $key, $value): Setting
    {
        $setting = $this->getByKey($key);

        if ($setting->type === 'integer' && !is_numeric($value)) {
            throw new \InvalidArgumentException("Setting [{$key}] requires an integer value.");
        }
        if ($setting->type === 'float' && !is_numeric($value)) {
            throw new \InvalidArgumentException("Setting [{$key}] requires a float value.");
        }
        if ($setting->type === 'boolean' && !is_bool($value) && !in_array(strtolower((string)$value), ['true', 'false', '0', '1'], true)) {
            throw new \InvalidArgumentException("Setting [{$key}] requires a boolean value.");
        }

        $setting->value = $value;
        $setting->save();

        return $setting;
    }
}
