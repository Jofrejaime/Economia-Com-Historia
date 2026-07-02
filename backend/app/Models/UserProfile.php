<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'user_profiles';

    protected $fillable = [
        'user_id',
        'display_name',
        'full_name',
        'institution',
        'province',
        'province_id',
        'avatar_url',
        'bio',
        'website_url',
        'research_areas',
    ];

    protected $casts = [
        'research_areas' => 'json',
    ];

    protected static function booted(): void
    {
        static::saving(function (UserProfile $profile) {
            if ($profile->isDirty('province_id')) {
                if ($profile->province_id) {
                    $provinceObj = Province::find($profile->province_id);
                    if ($provinceObj) {
                        $profile->province = $provinceObj->name;
                    }
                } else {
                    $profile->province = null;
                }
            } elseif ($profile->isDirty('province')) {
                if ($profile->province) {
                    $provinceObj = Province::where('name', $profile->province)->first();
                    if ($provinceObj) {
                        $profile->province_id = $provinceObj->id;
                    }
                } else {
                    $profile->province_id = null;
                }
            }
        });

        static::saved(function (UserProfile $profile) {
            if ($profile->isDirty('research_areas')) {
                $areas = $profile->research_areas ?? [];
                if (is_array($areas)) {
                    $ids = [];
                    foreach ($areas as $name) {
                        if (empty($name)) continue;
                        $area = InterestArea::where('name', $name)->first();
                        if (!$area) {
                            $area = InterestArea::create([
                                'id' => (string) \Illuminate\Support\Str::uuid(),
                                'name' => $name,
                                'slug' => \Illuminate\Support\Str::slug($name),
                                'is_active' => true,
                            ]);
                        }
                        $ids[] = $area->id;
                    }
                    $user = $profile->user;
                    if ($user) {
                        $user->interestAreas()->sync($ids);
                    }
                }
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function provinceRelation(): BelongsTo
    {
        return $this->belongsTo(Province::class, 'province_id');
    }
}
