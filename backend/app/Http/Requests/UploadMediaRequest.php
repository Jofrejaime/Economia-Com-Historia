<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Upload genérico de media (editor de conteúdo rico, ícones, capas soltas).
 *
 * A validação estrutural (tamanho/extensão declarada) acontece aqui;
 * a validação de segurança profunda (MIME real, dupla extensão,
 * executáveis) é sempre repetida pelo MediaService.
 */
class UploadMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'professor'], true);
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:51200', // 50 MB — limite duro; imagens são limitadas a 4 MB pelo MediaService
                'mimes:jpg,jpeg,png,webp,svg,gif,pdf,doc,docx,ppt,pptx,xls,xlsx,csv,txt,zip,rar,odt',
            ],
            'collection' => ['sometimes', 'string', 'in:file,cover,gallery,icon,content'],
            'model_type' => ['sometimes', 'string', 'max:100'],
            'model_id'   => ['sometimes', 'nullable', 'uuid'],
            'directory'  => ['sometimes', 'string', 'max:100', 'regex:/^[a-z0-9\/_-]+$/i', 'not_regex:/\.\./'],
        ];
    }
}
