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
            'category_id'      => ['nullable', 'exists:document_categories,id'],
            'institution'      => ['nullable', 'string', 'max:255'],
            'publication_date' => ['nullable', 'date'],
            'period_start'     => ['nullable', 'integer'],
            'period_end'       => ['nullable', 'integer'],
            'cover_image_url'  => ['nullable', 'string', 'max:500'],
            'media_type'       => ['nullable', 'in:TEXT,IMAGE,VIDEO,AUDIO,PDF'],
            'media_url'        => ['nullable', 'string', 'max:500'],
            'pdf_url'          => ['nullable', 'string', 'max:500'],  // legacy
            'tags'             => ['nullable', 'array'],
            'tags.*'           => ['string', 'max:100'],

            // Uploads (Sprint 18.4) — processados exclusivamente pelo MediaService
            'file'             => ['nullable', 'file', 'max:51200', 'mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,csv,txt,zip,rar,odt'],
            'cover_image'      => ['nullable', 'file', 'max:4096', 'mimes:jpg,jpeg,png,webp,svg,gif'],
            'gallery'          => ['nullable', 'array', 'max:12'],
            'gallery.*'        => ['file', 'max:4096', 'mimes:jpg,jpeg,png,webp,gif'],
        ];
    }
}
