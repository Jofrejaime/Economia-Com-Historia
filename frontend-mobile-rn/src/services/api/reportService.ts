import { httpClient } from '../http/client';
import { API_ENDPOINTS } from '../../constants/api';

export type ReportReason = 'spam' | 'inappropriate' | 'misinformation' | 'copyright' | 'off_topic' | 'other';
export type ReportContentType = 'topic' | 'reply' | 'document' | 'user';

export interface SubmitReportPayload {
  content_type: ReportContentType;
  content_id: string;
  reason: ReportReason;
  description: string;
}

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate', label: 'Conteúdo Inapropriado' },
  { value: 'misinformation', label: 'Desinformação' },
  { value: 'copyright', label: 'Direitos de Autor' },
  { value: 'off_topic', label: 'Fora do Tema' },
  { value: 'other', label: 'Outro' },
];

export const reportService = {
  async submit(payload: SubmitReportPayload): Promise<void> {
    await httpClient.post(API_ENDPOINTS.REPORTS.CREATE, payload);
  },
};
