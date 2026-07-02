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

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed' | 'actioned';
export type ReportReason = 'spam' | 'inappropriate' | 'misinformation' | 'copyright' | 'off_topic' | 'other';
export type ContentType = 'document' | 'topic' | 'reply' | 'user';

export interface UserSummary {
  id: string;
  email: string;
  profile?: {
    display_name?: string;
    institution?: string;
  };
}

export interface Report {
  id: string;
  reporter_id: string;
  content_type: ContentType;
  content_id: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  action_taken: string | null;
  created_at: string;
  reporter?: UserSummary;
  reviewed_by_user?: UserSummary;
}

export interface AccessRequest {
  id: string;
  user_id: string;
  access_level_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  justification: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  expires_at: string | null;
  created_at: string;
  access_level_name?: string;
  user_display_name?: string;
  user_institution?: string;
  user_email?: string;
}

export interface AccessGrant {
  id: string;
  user_id: string;
  access_level_id: string;
  granted_by: string | null;
  request_id: string | null;
  granted_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  is_active: boolean;
  access_level_name?: string;
  user_display_name?: string;
  user_email?: string;
}

export interface ModerationAction {
  report_id: string;
  action: 'warn' | 'delete' | 'hide' | 'restore' | 'dismiss' | 'flag';
  reason?: string;
  moderator_id?: string;
  timestamp?: string;
  message?: string;
}
