/**
 * Sprint 18.4 — Infraestrutura Global de Media & Uploads.
 *
 * Objeto de media padronizado devolvido pela API (contrato §5):
 * nunca caminhos internos, sempre URLs públicas absolutas.
 */
export interface MediaObject {
  id: string;
  url: string;
  thumbnail: string | null;
  preview: string | null;
  filename: string;
  mime_type: string;
  extension: string;
  size: number;
  width: number | null;
  height: number | null;
  collection: string;
  sort_order: number;
}

/** Media de um agregado agrupado por coleção (resposta de show/store/update). */
export interface MediaCollections {
  file?: MediaObject;
  cover?: MediaObject;
  avatar?: MediaObject;
  icon?: MediaObject;
  gallery?: MediaObject[];
  content?: MediaObject[];
}

/** Estado de um upload em curso (para barras de progresso). */
export type MediaUploadState =
  | { status: 'progress'; progress: number }
  | { status: 'done'; media: MediaObject }
  | { status: 'error'; message: string };

export interface MediaUploadOptions {
  collection?: 'file' | 'cover' | 'gallery' | 'icon' | 'content';
  modelType?: string;
  modelId?: string | null;
  directory?: string;
}
