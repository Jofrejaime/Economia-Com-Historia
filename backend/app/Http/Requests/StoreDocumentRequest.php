<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'professor'], true);
    }

    public function rules(): array
    {
        return [
            'title'            => ['required', 'string', 'max:500'],
            'author'           => ['required', 'string', 'max:255'],
            'summary'          => ['required', 'string'],
            'content'          => ['nullable', 'string'],
            'document_type'    => ['required', 'in:manuscript,article,report,thesis,archive'],
            'academic_level'   => ['required', 'in:intro,advanced,doctorate'],
            'access_level_id'  => ['required', 'exists:access_levels,id'],
            'category_id'      => ['nullable', 'exists:document_categories,id'],
            'institution'      => ['nullable', 'string', 'max:255'],
            'publication_date' => ['nullable', 'date'],
            'period_start'     => ['nullable', 'integer'],
            'period_end'       => ['nullable', 'integer'],
            'cover_image_url'  => ['nullable', 'string', 'max:500'],
            'pdf_url'          => ['nullable', 'string', 'max:500'],
            'tags'             => ['nullable', 'array'],
            'tags.*'           => ['string', 'max:100'],
        ];
    }
}
