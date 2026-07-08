<?php

namespace App\Http\Requests;

use App\Enums\DocumentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'category_id'      => ['sometimes', 'nullable', 'exists:document_categories,id'],
            'institution'      => ['sometimes', 'nullable', 'string', 'max:255'],
            'publication_date' => ['sometimes', 'nullable', 'date'],
            'period_start'     => ['sometimes', 'nullable', 'integer'],
            'period_end'       => ['sometimes', 'nullable', 'integer'],
            'cover_image_url'  => ['sometimes', 'nullable', 'string', 'max:500'],
            'media_type'       => ['sometimes', 'nullable', 'in:TEXT,IMAGE,VIDEO,AUDIO,PDF'],
            'media_url'        => ['sometimes', 'nullable', 'string', 'max:500'],
            'pdf_url'          => ['sometimes', 'nullable', 'string', 'max:500'],  // legacy
            'status'           => ['sometimes', Rule::in(array_column(DocumentStatus::cases(), 'value'))],

            // Uploads (Sprint 18.4) — substituem os ficheiros da mesma coleção;
            // processados exclusivamente pelo MediaService
            'file'             => ['sometimes', 'file', 'max:51200', 'mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,csv,txt,zip,rar,odt'],
            'cover_image'      => ['sometimes', 'file', 'max:4096', 'mimes:jpg,jpeg,png,webp,svg,gif'],
            'gallery'          => ['sometimes', 'array', 'max:12'],
            'gallery.*'        => ['file', 'max:4096', 'mimes:jpg,jpeg,png,webp,gif'],
        ];
    }
}
