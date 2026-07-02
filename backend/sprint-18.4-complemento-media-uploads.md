# Sprint 18.4 — Complemento — Infraestrutura Global de Media & Uploads

**Data:** 2026-07-02
**Estado:** Implementado — 424/424 testes backend a passar; build Angular limpo.
**Armazenamento:** local, exclusivamente via `Storage::disk('public')`. Arquitetura pronta para S3/Azure/GCS/Cloudinary sem alterar controllers nem services de domínio.

---

## O que foi implementado

### Backend (Laravel)

| Peça | Ficheiro | Papel |
| --- | --- | --- |
| Tabela `media` | `database/migrations/2026_07_02_100000_create_media_table.php` | Registo polimórfico único de todos os ficheiros (model_type/model_id/collection, path, thumbnail_path, preview_path, filename, mime, extension, size, width, height, sort_order, created_by) |
| Model | `app/Models/Media.php` | UUID, casts |
| **MediaService** | `app/Services/MediaService.php` | Serviço ÚNICO de ficheiros: `upload() replace() delete() deleteFor() deleteDirectory() move() copy() generateThumbnail() generatePreview() generateUniqueFilename() buildPublicUrl() detectMimeType() validateUploadedFile() payload() payloadsFor()` |
| Contrato de preview | `app/Services/Media/PreviewGenerator.php` + `NullPreviewGenerator.php` | PDF→PNG futuro: basta trocar o binding no `AppServiceProvider` |
| Resource | `app/Http/Resources/MediaResource.php` | Objeto de media padronizado (§5) |
| Form Request | `app/Http/Requests/UploadMediaRequest.php` | Validação estrutural do upload genérico |
| Controller | `app/Http/Controllers/Api/MediaController.php` | `POST /api/media/uploads` e `DELETE /api/media/{id}` (role admin/professor), com Swagger |

### Segurança (§13) — tudo no MediaService, repetido em todos os fluxos

- MIME **real** via `finfo` comparado com a extensão (nunca confia no browser);
- whitelist de extensões por tipo (imagem: jpg/jpeg/png/webp/svg/gif; documento: pdf/doc/docx/ppt/pptx/xls/xlsx/csv/txt/zip/rar/odt);
- dupla extensão recusada (`shell.php.jpg`) e blacklist de segmentos executáveis (php, exe, bat, sh, js, html, …);
- limites: imagens 4 MB, documentos 50 MB;
- nome de armazenamento sempre gerado (`Ymd-uuid.ext`) — nunca o nome do cliente;
- ficheiros corrompidos (`!isValid()`) recusados.

### Integrações

- **Documents** (`DocumentAdminService` + `DocumentController`): `store`/`update` aceitam multipart com `file` (documento principal), `cover_image` e `gallery[]` (0..N). Validação **antes** de qualquer escrita; replace remove o antigo só depois de o novo estar seguro; `delete` remove PDF, capa, thumbnails, previews e galeria — **zero órfãos**. Colunas legadas (`cover_image_url`, `media_url`, `media_type`, `pdf_url`) sincronizadas com URLs públicas para compatibilidade. `show`/`store`/`update` devolvem o bloco `media` agrupado por coleção.
- **Avatar** (`ProfileController`): refeito sobre o MediaService (thumbnail automático, replace seguro, objeto `avatar` padronizado na resposta + `avatar_url` legado). Corrigido bug pré-existente: upload de avatar sem perfil criado rebentava com NOT NULL em `user_profiles.id`.
- **Thumbnails** (§7): geradas via GD (máx. 400px) para jpg/png/webp em todos os uploads de imagem.
- **Rota nova** `GET /api/admin/documents` → listagem admin (o painel já a chamava mas ela não existia; o `DocumentSearchService` é role-aware). `POST /api/admin/documents` passou a devolver também `data`.

### Painel Admin (Angular)

| Peça | Ficheiro |
| --- | --- |
| Modelos | `src/app/models/media.models.ts` (`MediaObject`, `MediaCollections`, `MediaUploadState`) |
| Serviço | `src/app/services/media-upload.service.ts` — upload com **progresso real** (HttpClient events) + delete |
| **FileUploadComponent** | `src/app/components/uploads/file-upload.component.ts` — drag & drop, clique, preview, barra de progresso, substituir, remover; modos deferred (multipart no submit) e autoUpload (pipeline `/media/uploads`) |
| **ImageUploadComponent** | `.../image-upload.component.ts` — especialização para imagens |
| **GalleryUploadComponent** | `.../gallery-upload.component.ts` — multi-upload com remoção individual (novas e existentes) |
| **MediaPreviewComponent** | `.../media-preview.component.ts` — preview padronizado (imagem ou cartão de ficheiro com extensão/nome/tamanho) |

Integração na página **Conteúdos** do dashboard admin: os campos de texto "PDF URL" e "Cover image URL" foram substituídos pelos componentes de upload (ficheiro principal + capa + galeria), com barra de progresso durante o save multipart (`saveDocumentWithFiles`, method spoofing `_method=PATCH` para edição) e pré-visualização dos ficheiros no modo de detalhes. Nenhum componente implementa uploads próprios.

### Estrutura do Storage (§3)

```
storage/app/public/
  documents/{pdf,covers,covers/thumbnails,gallery,gallery/thumbnails}/
  categories/{covers,icons}/   tags/icons/   avatars/{userId}/
  badges/   content/   temp/
```
Diretórios criados on-demand pelo Storage; mapeamento por defeito em `MediaController::defaultDirectory()`.

### Testes (§19)

- **Unit** `tests/Unit/Services/MediaServiceTest.php` — 12 testes: upload imagem+thumbnail+payload, PDF, extensão proibida, dupla extensão, tamanho, MIME≠extensão, replace, delete, deleteFor, URLs públicas, filename único, agrupamento por coleção.
- **Feature** `tests/Feature/MediaUploadTest.php` — 11 testes: upload genérico (objeto padronizado), 403 para estudante, MIME falso, dupla extensão, ficheiro gigante, delete com limpeza, documento com capa+ficheiro+galeria (colunas legadas sincronizadas), replace de capa em update, eliminação sem órfãos, upload inválido não cria nada, avatar com substituição.
- Suite completa: **424/424**.

### Swagger (§12)

`POST /media/uploads` e `DELETE /media/{id}` documentados; `api-docs.json` regenerado.

---

## Como trocar o backend de armazenamento no futuro

1. Configurar o novo disco em `config/filesystems.php` (ex.: `s3`).
2. Alterar `MediaService::DISK`.
3. (Opcional) trocar o binding `PreviewGenerator` por uma implementação real de PDF→PNG.

Controllers, Form Requests, Resources e services de domínio não mudam.

## Notas / dívida assumida

- `documents.pdf_url`, `cover_image_url`, `media_url` continuam a ser preenchidas (contrato legado dos clientes móveis/web); a fonte de verdade nova é a tabela `media` + bloco `media` nas respostas.
- Preview de PDF (§8) fica pela arquitetura (`NullPreviewGenerator`) até existir biblioteca de rasterização no ambiente.
- Media de categorias/tags/badges: o pipeline aceita já `model_type` document_category/tag/badge via `POST /media/uploads` (o painel pode usar `autoUpload` + guardar a URL devolvida em `icon_url`/`cover_image_url`); a associação nativa nesses CRUDs fica para a sprint das respetivas páginas.
