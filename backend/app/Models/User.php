<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

#[Fillable(['email', 'password_hash', 'email_verified', 'is_active', 'role', 'last_login_at'])]
#[Hidden(['password_hash'])]
class User extends Authenticatable
{
    /**
     * The primary key type.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    protected static function booted(): void
    {
        static::creating(function (self $user): void {
            if (empty($user->getKey())) {
                $user->setAttribute($user->getKeyName(), (string) Str::uuid());
            }
        });
    }

    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $appends = ['display_name', 'full_name'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified' => 'boolean',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
            'password_hash' => 'hashed',
        ];
    }

    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class, 'user_id');
    }

    public function topicMemberships(): BelongsToMany
    {
        return $this->belongsToMany(DiscussionTopic::class, 'discussion_topic_members', 'user_id', 'topic_id')
            ->withPivot(['id', 'role', 'invited_by', 'accepted_at', 'created_at', 'updated_at']);
    }

    public function interestAreas(): BelongsToMany
    {
        return $this->belongsToMany(InterestArea::class, 'user_interest_areas', 'user_id', 'interest_area_id');
    }

    public function getDisplayNameAttribute(): ?string
    {
        return $this->profile?->display_name ?? $this->email;
    }

    public function getFullNameAttribute(): ?string
    {
        return $this->profile?->full_name;
    }
}
