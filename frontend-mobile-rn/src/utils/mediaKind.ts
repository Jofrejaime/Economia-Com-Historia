import type { Document, MediaType } from '../types/api';

/**
 * O tipo de apresentação é determinado por `media_type` (VIDEO/AUDIO/TEXT/...),
 * não por `document_type` (article/thesis/...). Vídeo e áudio abrem no ecrã de
 * media (player); os restantes abrem no ecrã de artigo (leitura).
 */
export function isMediaDocument(doc: Pick<Document, 'media_type'>): boolean {
  const t = (doc.media_type ?? '').toUpperCase();
  return t === 'VIDEO' || t === 'AUDIO';
}

/** Ecrã de destino para um documento, conforme o seu tipo de conteúdo. */
export function documentRoute(doc: Pick<Document, 'media_type'>): 'MediaDetail' | 'Article' {
  return isMediaDocument(doc) ? 'MediaDetail' : 'Article';
}

/** Rótulo humano para um tipo de conteúdo (coerente com o web). */
export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  TEXT: 'Texto',
  IMAGE: 'Imagem',
  VIDEO: 'Vídeo',
  AUDIO: 'Podcast',
  PDF: 'Texto',
};
