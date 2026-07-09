export interface ApiResult<T> {
  ok: boolean;
  status?: number;
  message?: string;
  data?: T;
}

export interface ApiEnvelope<T> {
  data?: T;
  message?: string;
}

export type DocumentStatus = 'draft' | 'published' | 'archived' | string;
export type DocumentType = 'manuscript' | 'article' | 'report' | 'thesis' | 'archive' | string;
export type AcademicLevel = 'intro' | 'advanced' | 'doctorate' | string;

export interface DocumentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color_bg?: string | null;
  color_text?: string | null;
  sort_order?: number;
  // Categoria restrita → os seus documentos exigem subscrição por-documento.
  requires_subscription?: boolean;
}

export interface Document {
  id: string;
  slug: string;
  title: string;
  author: string;
  institution: string | null;
  category_id: string | null;
  document_type: DocumentType;
  media_type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'PDF' | null;
  academic_level: AcademicLevel;
  publication_date: string | null;
  period_start: number | null;
  period_end: number | null;
  summary: string;
  content: string | null;
  cover_image_url: string | null;
  pdf_url: string | null;
  unique_id?: string | null;
  physical_location?: string | null;
  record_type?: string | null;
  status: DocumentStatus;
  views_count: number;
  likes_count: number;
  created_by: string;
  published_at: string | null;
  reviewed_by?: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string | null;
  category_slug?: string | null;
  category_color_bg?: string | null;
  category_icon?: string | null;
  author_display_name?: string | null;
  author_avatar_url?: string | null;
  tags?: Array<{ id: string; name: string; slug: string }>;
  is_liked?: boolean;
  is_favorited?: boolean;
}

export interface DocumentUpdatePayload {
  title?: string;
  author?: string;
  summary?: string;
  content?: string | null;
  document_type?: DocumentType;
  academic_level?: AcademicLevel;
  category_id?: string | null;
  institution?: string | null;
  publication_date?: string | null;
  period_start?: number | null;
  period_end?: number | null;
  cover_image_url?: string | null;
  pdf_url?: string | null;
  status?: 'draft' | 'published' | 'archived';
}

export interface DocumentListFilters {
  search?: string;
  category_id?: string;
  author?: string;
  status?: 'draft' | 'published' | 'archived' | 'todos';
  document_type?: string;
  academic_level?: string;
}

export interface PaginatedDocumentResponse {
  data: Document[];
}
