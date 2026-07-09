<?php

namespace App\Http\Requests;

use App\Enums\DocumentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            // Estado inicial escolhido no painel (rascunho por omissão no service).
            'status'           => ['sometimes', Rule::in(array_column(DocumentStatus::cases(), 'value'))],
            'tags'             => ['nullable', 'array'],
            'tags.*'           => ['string', 'max:100'],

            // Uploads (Sprint 18.4) — a validação de extensão/MIME/tamanho do
            // ficheiro principal é feita exclusivamente pelo MediaService
            // (aceita documentos, vídeo e áudio; o media_type é derivado do
            // ficheiro). Aqui só limitamos ao tipo genérico "file" e ao tecto
            // de 500 MB — não repetir a whitelist para não voltar a divergir.
            'file'             => ['nullable', 'file', 'max:512000'],
            'cover_image'      => ['nullable', 'file', 'max:4096', 'mimes:jpg,jpeg,png,webp,svg,gif'],
            'gallery'          => ['nullable', 'array', 'max:12'],
            'gallery.*'        => ['file', 'max:4096', 'mimes:jpg,jpeg,png,webp,gif'],
        ];
    }
}
