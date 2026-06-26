import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminApiService, AdminUser } from '../../../../../services/admin-api.service';
import { CommunityAdminService } from '../../../../../services/community-admin.service';
import { DocumentAdminService } from '../../../../../services/document-admin.service';
import { ReportAdminService } from '../../../../../services/report-admin.service';
import {
  ModerationStats,
  Report,
  ReportAction,
  ReportContentPreview,
} from '../../../../../models/report-admin.models';
import { Document } from '../../../../../models/document-admin.models';
import { DiscussionTopic } from '../../../../../models/community-admin.models';

type ReportStatusFilter = 'todos' | 'pending' | 'reviewed' | 'dismissed' | 'actioned';
type ReportContentTypeFilter = 'todos' | 'document' | 'topic' | 'reply' | 'user';
type ReportSortBy = 'created_at' | 'status' | 'reason' | 'content_type';
type ReportSortDir = 'desc' | 'asc';

interface ReportView extends Report {
  reporter_name: string;
  content_label: string;
  content_title: string;
  content_author: string;
  content_excerpt: string;
  content_status: string;
}

interface ReportFormState {
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  action_taken: string;
}

interface TopicPreview extends DiscussionTopic {
  author_name?: string;
}

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports-page.html',
  styleUrls: ['./reports-page.css']
})
export class ReportsPageComponent implements OnInit {
  loading = false;
  saving = false;
  previewLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  searchQuery = '';
  filterStatus: ReportStatusFilter = 'todos';
  filterContentType: ReportContentTypeFilter = 'todos';
  filterReason = 'todos';
  filterReporter = 'todos';
  filterDateFrom = '';
  filterDateTo = '';
  sortBy: ReportSortBy = 'created_at';
  sortDir: ReportSortDir = 'desc';
  pageSize = 10;
  pageSizeOptions = [10, 20, 50];
  currentPage = 1;

  reports: ReportView[] = [];
  reportForm: ReportFormState = this.createEmptyForm();
  stats: ModerationStats = {
    total: 0,
    pending: 0,
    reviewed: 0,
    dismissed: 0,
    actioned: 0,
  };

  users: AdminUser[] = [];
  showReportModal = false;
  selectedReport: ReportView | null = null;
  selectedReportDetail: ReportView | null = null;
  selectedPreview: ReportContentPreview | null = null;
  previewError: string | null = null;

  constructor(
    private adminApi: AdminApiService,
    private reportAdmin: ReportAdminService,
    private documentAdmin: DocumentAdminService,
    private communityAdmin: CommunityAdminService
  ) {}

  ngOnInit(): void {
    void this.loadInitialData();
  }

  get filteredReports(): ReportView[] {
    return this.reports.filter((report) => {
      const search = this.searchQuery.trim().toLowerCase();
      const matchSearch = search === '' ||
        report.reason.toLowerCase().includes(search) ||
        (report.description || '').toLowerCase().includes(search) ||
        report.reporter_name.toLowerCase().includes(search) ||
        report.content_label.toLowerCase().includes(search) ||
        report.content_title.toLowerCase().includes(search) ||
        report.content_author.toLowerCase().includes(search) ||
        report.content_id.toLowerCase().includes(search) ||
        report.status.toLowerCase().includes(search) ||
        (report.action_taken || '').toLowerCase().includes(search);

      const matchStatus = this.filterStatus === 'todos' || report.status === this.filterStatus;
      const matchContentType = this.filterContentType === 'todos' || report.content_type === this.filterContentType;
      const matchReason = this.filterReason === 'todos' || report.reason === this.filterReason;
      const matchReporter = this.filterReporter === 'todos' || report.reporter_id === this.filterReporter;
      const matchDateFrom = !this.filterDateFrom || new Date(report.created_at).getTime() >= new Date(`${this.filterDateFrom}T00:00:00`).getTime();
      const matchDateTo = !this.filterDateTo || new Date(report.created_at).getTime() <= new Date(`${this.filterDateTo}T23:59:59`).getTime();

      return matchSearch && matchStatus && matchContentType && matchReason && matchReporter && matchDateFrom && matchDateTo;
    }).sort((a, b) => this.compareReports(a, b));
  }

  get pagedReports(): ReportView[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredReports.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredReports.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get pageStart(): number {
    return this.filteredReports.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredReports.length);
  }

  async loadInitialData(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    const [summaryResult, reportsResult, usersResult] = await Promise.allSettled([
      firstValueFrom(this.adminApi.getSummary()),
      firstValueFrom(this.reportAdmin.getReports()),
      firstValueFrom(this.adminApi.listUsers({ status: 'all' })),
    ]);

    if (usersResult.status === 'fulfilled' && usersResult.value.ok && usersResult.value.data) {
      this.users = usersResult.value.data;
    }

    if (summaryResult.status === 'fulfilled' && summaryResult.value.ok && summaryResult.value.data) {
      this.stats = this.mapSummaryToStats(summaryResult.value.data);
    }

    if (reportsResult.status !== 'fulfilled' || !reportsResult.value.ok || !reportsResult.value.data) {
      this.reports = [];
      this.errorMessage = reportsResult.status === 'fulfilled'
        ? (reportsResult.value.message || 'Não foi possível carregar as denúncias.')
        : 'Não foi possível carregar as denúncias.';
      this.loading = false;
      return;
    }

    this.reports = reportsResult.value.data.data.map((report) => this.toViewReport(report));
    this.currentPage = 1;
    this.recalculateStatsFallback();
    this.loading = false;
  }

  async refreshReports(): Promise<void> {
    await this.loadInitialData();
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
  }

  async openReport(report: ReportView): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.previewError = null;
    this.selectedPreview = null;

    const result = await firstValueFrom(this.reportAdmin.getReport(report.id));

    if (!result.ok || !result.data) {
      this.errorMessage = result.message || 'Não foi possível carregar a denúncia.';
      this.loading = false;
      return;
    }

    this.selectedReportDetail = this.toViewReport(result.data);
    this.selectedReport = { ...this.selectedReportDetail };
    this.reportForm = {
      status: this.selectedReportDetail.status === 'pending'
        ? 'pending'
        : this.selectedReportDetail.status === 'reviewed'
          ? 'reviewed'
          : this.selectedReportDetail.status === 'dismissed'
            ? 'dismissed'
            : 'actioned',
      action_taken: this.selectedReportDetail.action_taken || '',
    };
    this.showReportModal = true;

    await this.loadPreview(this.selectedReportDetail);
    this.loading = false;
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.selectedReport = null;
    this.selectedReportDetail = null;
    this.selectedPreview = null;
    this.previewError = null;
    this.reportForm = this.createEmptyForm();
  }

  async saveModeration(): Promise<void> {
    if (!this.selectedReportDetail) {
      this.errorMessage = 'Selecione uma denúncia para editar.';
      return;
    }

    this.saving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.reportAdmin.updateReport(this.selectedReportDetail.id, {
      status: this.reportForm.status,
      reviewed_by: this.selectedReportDetail.reviewed_by,
      reviewed_at: new Date().toISOString(),
      action_taken: this.reportForm.action_taken.trim() || null,
    }));

    if (!result.ok || !result.data) {
      this.errorMessage = result.message || 'Não foi possível actualizar a denúncia.';
      this.saving = false;
      return;
    }

    this.successMessage = result.message || 'Denúncia actualizada com sucesso.';
    this.saving = false;
    this.closeReportModal();
    await this.loadInitialData();
  }

  async applyAction(action: ReportAction): Promise<void> {
    if (!this.selectedReportDetail) {
      this.errorMessage = 'Selecione uma denúncia para moderar.';
      return;
    }

    this.saving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.reportAdmin.executeAction(this.selectedReportDetail.id, {
      action,
      reason: this.reportForm.action_taken.trim() || this.getFallbackActionReason(action),
    }));

    if (!result.ok) {
      this.errorMessage = result.message || 'Não foi possível executar a acção de moderação.';
      this.saving = false;
      return;
    }

    this.successMessage = result.message || 'Acção executada com sucesso.';
    this.saving = false;
    this.closeReportModal();
    await this.loadInitialData();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      reviewed: 'Revisado',
      dismissed: 'Arquivado',
      actioned: 'Actionado',
    };
    return labels[status] || status;
  }

  getContentTypeLabel(contentType: string): string {
    const labels: Record<string, string> = {
      document: 'Documento',
      topic: 'Tópico',
      reply: 'Resposta',
      user: 'Utilizador',
    };
    return labels[contentType] || contentType;
  }

  getReasonLabel(reason: string): string {
    const labels: Record<string, string> = {
      spam: 'Spam',
      inappropriate: 'Inapropriado',
      misinformation: 'Desinformação',
      copyright: 'Direitos de autor',
      off_topic: 'Fora do tema',
      other: 'Outro',
    };
    return labels[reason] || reason;
  }

  getReporterOptions(): AdminUser[] {
    const reporterIds = new Set(this.reports.map((report) => report.reporter_id));
    return this.users.filter((user) => reporterIds.has(user.id));
  }

  getStats(): ModerationStats {
    return this.stats;
  }

  private mapSummaryToStats(summary: {
    moderation?: {
      reports_pending?: number;
      reports_resolved?: number;
      reports_dismissed?: number;
    };
  }): ModerationStats {
    const pending = summary.moderation?.reports_pending ?? 0;
    const reviewed = summary.moderation?.reports_resolved ?? 0;
    const dismissed = summary.moderation?.reports_dismissed ?? 0;

    return {
      total: pending + reviewed + dismissed,
      pending,
      reviewed,
      dismissed,
      actioned: 0,
    };
  }

  private recalculateStatsFallback(): void {
    if (this.stats.total > 0) {
      return;
    }

    this.stats = {
      total: this.reports.length,
      pending: this.reports.filter((report) => report.status === 'pending').length,
      reviewed: this.reports.filter((report) => report.status === 'reviewed').length,
      dismissed: this.reports.filter((report) => report.status === 'dismissed').length,
      actioned: this.reports.filter((report) => report.status === 'actioned').length,
    };
  }

  private compareReports(a: ReportView, b: ReportView): number {
    const direction = this.sortDir === 'desc' ? -1 : 1;
    const left = this.getSortValue(a, this.sortBy);
    const right = this.getSortValue(b, this.sortBy);

    if (left < right) {
      return -1 * direction;
    }

    if (left > right) {
      return 1 * direction;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }

  private getSortValue(report: ReportView, sortBy: ReportSortBy): string | number {
    switch (sortBy) {
      case 'status':
        return report.status;
      case 'reason':
        return report.reason;
      case 'content_type':
        return report.content_type;
      case 'created_at':
      default:
        return new Date(report.created_at).getTime();
    }
  }

  private async loadPreview(report: ReportView): Promise<void> {
    this.previewLoading = true;
    this.previewError = null;
    this.selectedPreview = null;

    try {
      if (report.content_type === 'document') {
        const result = await firstValueFrom(this.documentAdmin.getDocument(report.content_id));
        if (result.ok && result.data) {
          this.selectedPreview = this.toDocumentPreview(result.data);
        } else {
          this.previewError = result.message || 'Não foi possível carregar o documento relacionado.';
        }
      } else if (report.content_type === 'topic') {
        const result = await firstValueFrom(this.communityAdmin.getTopic(report.content_id));
        if (result.ok && result.data) {
          this.selectedPreview = this.toTopicPreview(result.data);
        } else {
          this.previewError = result.message || 'Não foi possível carregar o tópico relacionado.';
        }
      } else if (report.content_type === 'user') {
        const user = this.users.find((item) => item.id === report.content_id);
        if (user) {
          this.selectedPreview = {
            id: user.id,
            title: user.display_name || user.full_name || user.email,
            author: user.email,
            summary: user.institution || user.province || null,
            status: user.is_active ? 'active' : 'inactive',
            updated_at: user.updated_at,
          };
        } else {
          this.previewError = 'Não foi possível resolver o utilizador denunciado.';
        }
      } else {
        this.previewError = 'Sem preview detalhado disponível para este tipo de denúncia.';
      }
    } catch (error) {
      this.previewError = error instanceof Error ? error.message : 'Não foi possível carregar o preview.';
    } finally {
      this.previewLoading = false;
    }
  }

  private toViewReport(report: Report): ReportView {
    return {
      ...report,
      reporter_name: this.resolveUserName(report.reporter_id),
      content_label: this.getContentTypeLabel(report.content_type),
      content_title: this.buildContentTitle(report),
      content_author: this.buildContentAuthor(report),
      content_excerpt: report.description || 'Sem descrição adicional.',
      content_status: report.status,
    };
  }

  private resolveUserName(userId: string): string {
    const user = this.users.find((item) => item.id === userId);
    return user?.display_name || user?.full_name || user?.email || userId;
  }

  private buildContentTitle(report: Report): string {
    if (report.content_type === 'user') {
      return this.resolveUserName(report.content_id);
    }

    return report.content_id;
  }

  private buildContentAuthor(report: Report): string {
    if (report.content_type === 'user') {
      return 'Conta denunciada';
    }

    return report.content_id;
  }

  private toDocumentPreview(document: Document): ReportContentPreview {
    return {
      id: document.id,
      title: document.title,
      author: document.author_display_name || document.author,
      summary: document.summary,
      status: document.status,
      updated_at: document.updated_at,
      extra: {
        category: document.category_name || document.category_id,
        access_level: document.access_level_name || document.access_level_id,
      },
    };
  }

  private toTopicPreview(topic: TopicPreview): ReportContentPreview {
    return {
      id: topic.id,
      title: topic.title,
      author: topic.author?.display_name || topic.author?.email || topic.author_id,
      summary: topic.content,
      status: topic.status,
      updated_at: topic.updated_at,
      extra: {
        category: topic.category?.name || topic.category_id,
        replies_count: topic.replies_count,
        views_count: topic.views_count,
      },
    };
  }

  private getFallbackActionReason(action: ReportAction): string {
    const reasons: Record<ReportAction, string> = {
      flag: 'Conteúdo sinalizado pela moderação.',
      delete: 'Conteúdo removido pela moderação.',
      warn: 'Utilizador notificado pela moderação.',
      dismiss: 'Denúncia arquivada sem acção adicional.',
    };

    return reasons[action];
  }

  private createEmptyForm(): ReportFormState {
    return {
      status: 'pending',
      action_taken: '',
    };
  }
}
