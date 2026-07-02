<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SettingsService
{
    private const CACHE_KEY_ALL = 'settings:all';
    private const CACHE_KEY_PREFIX = 'settings:key:';

    public function getAll(): Collection
    {
        $rows = Cache::remember(self::CACHE_KEY_ALL, now()->addDay(), function () {
            return Setting::orderBy('key')->get()->toArray();
        });

        return Setting::hydrate($rows);
    }

    public function getByKey(string $key): Setting
    {
        $row = Cache::remember(self::CACHE_KEY_PREFIX . $key, now()->addDay(), function () use ($key) {
            return Setting::where('key', $key)->firstOrFail()->toArray();
        });

        return Setting::hydrate([$row])->first();
    }

    public function update(string $key, $value, ?string $adminId = null): Setting
    {
        $setting = Setting::where('key', $key)->firstOrFail();

        $this->validateSettingValue($setting, $value);

        $oldValue = $setting->getRawOriginal('value');
        $setting->value = $value;
        $setting->updated_by = $adminId;
        $setting->save();

        Cache::forget(self::CACHE_KEY_ALL);
        Cache::forget(self::CACHE_KEY_PREFIX . $key);

        $adminText = $adminId ? "by Admin ID [{$adminId}]" : "system-wide";
        Log::info("Setting updated: '{$key}' changed from '{$oldValue}' to '{$setting->getRawOriginal('value')}' {$adminText}");

        return $setting;
    }

    private function validateSettingValue(Setting $setting, $value): void
    {
        if ($setting->type === 'integer' && !is_numeric($value)) {
            throw new \InvalidArgumentException("Setting [{$setting->key}] requires an integer value.");
        }
        if ($setting->type === 'float' && !is_numeric($value)) {
            throw new \InvalidArgumentException("Setting [{$setting->key}] requires a float value.");
        }
        if ($setting->type === 'boolean') {
            if (!is_bool($value) && !in_array(strtolower((string) $value), ['true', 'false', '0', '1'], true)) {
                throw new \InvalidArgumentException("Setting [{$setting->key}] requires a boolean value.");
            }
        }

        if ($setting->key === 'support_email' || str_contains($setting->key, 'email')) {
            if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                throw new \InvalidArgumentException("Setting [{$setting->key}] must be a valid email address.");
            }
        }
    }
}