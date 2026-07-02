<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Document extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'documents';

    protected $fillable = [
        'title',
        'slug',
        'author',
        'institution',
        'category_id',
        'document_type',
        'academic_level',
        'access_level_id',
        'publication_date',
        'period_start',
        'period_end',
        'summary',
        'content',
        'cover_image_url',
        'pdf_url',      // legacy — use media_url for new content
        'media_type',
        'media_url',
        'status',
        'is_pinned',
        'created_by',
        'reviewed_by',
        'published_at',
        'views_count',
        'likes_count',
        'downloads_count',
    ];

    protected function casts(): array
    {
        return [
            'publication_date' => 'date',
            'published_at' => 'datetime',
            'period_start' => 'integer',
            'period_end' => 'integer',
            'views_count' => 'integer',
            'likes_count' => 'integer',
            'downloads_count' => 'integer',
            'is_pinned' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(DocumentCategory::class, 'category_id');
    }

    public function accessLevel(): BelongsTo
    {
        return $this->belongsTo(AccessLevel::class, 'access_level_id', 'id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'document_tags', 'document_id', 'tag_id');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(DocumentLike::class, 'document_id');
    }

    public function downloads(): HasMany
    {
        return $this->hasMany(DocumentDownload::class, 'document_id');
    }

    public function views(): HasMany
    {
        return $this->hasMany(DocumentView::class, 'document_id');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(UserFavorite::class, 'document_id');
    }

    public function citations(): HasMany
    {
        return $this->hasMany(DocumentCitation::class, 'document_id');
    }

    public function quizDocuments(): HasMany
    {
        return $this->hasMany(QuizDocument::class, 'document_id');
    }

    public function quizzes(): BelongsToMany
    {
        return $this->belongsToMany(Quiz::class, 'quiz_documents', 'document_id', 'quiz_id')
            ->withPivot('sort_order')
            ->withTimestamps();
    }

    /**
     * Discussões da comunidade contextualizadas a este documento (Sprint 17.3).
     * Relação simples 1:N — sem pivot. Um documento pode ter várias
     * discussões; cada discussão pertence, no máximo, a um documento.
     */
    public function topics(): HasMany
    {
        return $this->hasMany(DiscussionTopic::class, 'document_id');
    }

    public function interestAreas(): BelongsToMany
    {
        return $this->belongsToMany(InterestArea::class, 'document_interest_areas', 'document_id', 'interest_area_id');
    }
}
