<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'professor'], true);
    }

    public function rules(): array
    {
        return [
            'title'            => ['sometimes', 'string', 'max:500'],
            'author'           => ['sometimes', 'string', 'max:255'],
            'summary'          => ['sometimes', 'string'],
            'content'          => ['sometimes', 'nullable', 'string'],
            'document_type'    => ['sometimes', 'in:manuscript,article,report,thesis,archive'],
            'academic_level'   => ['sometimes', 'in:intro,advanced,doctorate'],
            'access_level_id'  => ['sometimes', 'exists:access_levels,id'],
            'category_id'      => ['sometimes', 'nullable', 'exists:document_categories,id'],
            'institution'      => ['sometimes', 'nullable', 'string', 'max:255'],
            'publication_date' => ['sometimes', 'nullable', 'date'],
            'period_start'     => ['sometimes', 'nullable', 'integer'],
            'period_end'       => ['sometimes', 'nullable', 'integer'],
            'cover_image_url'  => ['sometimes', 'nullable', 'string', 'max:500'],
            'media_type'       => ['sometimes', 'nullable', 'in:TEXT,IMAGE,VIDEO,AUDIO,PDF'],
            'media_url'        => ['sometimes', 'nullable', 'string', 'max:500'],
            'pdf_url'          => ['sometimes', 'nullable', 'string', 'max:500'],  // legacy
            'status'           => ['sometimes', 'in:draft,published,archived'],
        ];
    }
}
