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

export type ReportContentType = 'document' | 'topic' | 'reply' | 'user' | string;
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned' | string;
export type ReportAction = 'flag' | 'delete' | 'warn' | 'dismiss';

export interface Report {
  id: string;
  reporter_id: string;
  content_type: ReportContentType;
  content_id: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  action_taken: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface ReportUpdatePayload {
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  action_taken?: string | null;
}

export interface ReportActionPayload {
  action: ReportAction;
  reason?: string;
}

export interface ReportFilters {
  search?: string;
  status?: 'todos' | 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  content_type?: 'todos' | 'document' | 'topic' | 'reply' | 'user';
  reason?: string;
  reporter?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'status' | 'reason' | 'content_type';
  sort_dir?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface PaginatedReports {
  data: Report[];
}

export interface ModerationStats {
  total: number;
  pending: number;
  reviewed: number;
  dismissed: number;
  actioned: number;
}

export interface ReportContentPreview {
  id: string;
  title?: string;
  author?: string;
  summary?: string | null;
  status?: string;
  updated_at?: string | null;
  extra?: Record<string, unknown>;
}
