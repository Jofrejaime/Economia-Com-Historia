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
}

export interface AccessLevel {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  is_active?: boolean;
  auto_grant?: boolean;
}

export interface Document {
  id: string;
  slug: string;
  title: string;
  author: string;
  institution: string | null;
  category_id: string | null;
  document_type: DocumentType;
  academic_level: AcademicLevel;
  access_level_id: string;
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
  downloads_count: number;
  comments_count: number;
  created_by: string;
  published_at: string | null;
  reviewed_by?: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string | null;
  category_slug?: string | null;
  category_color_bg?: string | null;
  category_icon?: string | null;
  access_level_name?: string | null;
  access_level_icon?: string | null;
  access_level_color_bg?: string | null;
  access_level_color_text?: string | null;
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
  access_level_id?: string;
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
  access_level_id?: string;
  document_type?: string;
  academic_level?: string;
}

export interface PaginatedDocumentResponse {
  data: Document[];
}
