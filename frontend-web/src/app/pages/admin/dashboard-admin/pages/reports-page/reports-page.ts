import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminApiService, ReportRecord } from '../../../../../services/admin-api.service';

type ReportStatus = 'pending' | 'resolved' | 'dismissed';
type ReportStatusFilter = 'todos' | ReportStatus;

interface ReportView {
  id: string;
  reporter_id: string;
  content_type: string;
  content_id: string;
  reason: string;
  description: string;
  status: ReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  action_taken: string | null;
  created_at: string;
  reporter_name?: string;
  author_name?: string;
  discussion_title?: string;
}

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports-page.html',
  styleUrls: ['./reports-page.css']
})
export class ReportsPageComponent implements OnInit {
  searchQuery = '';
  filterStatus: ReportStatusFilter = 'todos';

  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  showReportModal = false;
  viewingReport: ReportView | null = null;
  actionNote = '';

  reports: ReportView[] = [];

  constructor(private adminApi: AdminApiService) {}

  ngOnInit(): void {
    void this.loadReports();
  }

  get filteredReports(): ReportView[] {
    return this.reports.filter((report) => {
      const search = this.searchQuery.trim().toLowerCase();
      const matchSearch = search === '' ||
        (report.description || '').toLowerCase().includes(search) ||
        (report.author_name || '').toLowerCase().includes(search) ||
        (report.reporter_name || '').toLowerCase().includes(search) ||
        (report.discussion_title || '').toLowerCase().includes(search) ||
        report.content_type.toLowerCase().includes(search);
      const matchStatus = this.filterStatus === 'todos' || report.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  getStats() {
    return {
      total: this.reports.length,
      pending: this.reports.filter((report) => report.status === 'pending').length,
      resolved: this.reports.filter((report) => report.status === 'resolved').length,
      dismissed: this.reports.filter((report) => report.status === 'dismissed').length,
    };
  }

  async loadReports(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    const result = await firstValueFrom(this.adminApi.listPendingReports());

    if (!result.ok || !result.data) {
      this.reports = [];
      this.errorMessage = result.message || 'Não foi possível carregar as denúncias.';
      this.loading = false;
      return;
    }

    const pendingReports = result.data.map((report) => this.toViewReport(report));
    this.reports = this.mergeReports([
      ...pendingReports,
      ...this.reports.filter((report) => report.status !== 'pending'),
    ]);
    this.loading = false;
  }

  viewReport(report: ReportView): void {
    this.viewingReport = { ...report };
    this.actionNote = report.action_taken || '';
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.viewingReport = null;
    this.actionNote = '';
  }

  async approveReport(id: string): Promise<void> {
    const ok = await this.executeReportAction(id, 'flag', 'Denúncia resolvida pelo administrador.');
    if (!ok) {
      return;
    }

    const report = this.reports.find((item) => item.id === id);
    if (report) {
      report.status = 'resolved';
    }
  }

  async dismissReport(id: string): Promise<void> {
    const report = this.reports.find((item) => item.id === id);
    if (!report) {
      return;
    }

    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.adminApi.updateReport(id, {
      status: 'dismissed',
      reviewed_by: null,
      reviewed_at: new Date().toISOString(),
      action_taken: this.actionNote || 'Denúncia arquivada pelo administrador.',
    }));

    if (!result.ok) {
      this.errorMessage = result.message || 'Não foi possível arquivar a denúncia.';
      return;
    }

    report.status = 'dismissed';
    report.reviewed_by = null;
    report.reviewed_at = new Date().toISOString();
    report.action_taken = this.actionNote || 'Denúncia arquivada pelo administrador.';
    this.successMessage = result.message || 'Denúncia arquivada com sucesso.';
    this.closeReportModal();
  }

  async deleteReport(id: string): Promise<void> {
    if (!confirm('Tem certeza que deseja eliminar esta denúncia?')) {
      return;
    }

    const ok = await this.executeReportAction(id, 'delete', 'Denúncia removida pelo administrador.');
    if (!ok) {
      return;
    }

    this.reports = this.reports.filter((report) => report.id !== id);
  }

  reopenReport(id: string): void {
    const report = this.reports.find((item) => item.id === id);
    if (report && (report.status === 'resolved' || report.status === 'dismissed')) {
      report.status = 'pending';
      report.reviewed_by = null;
      report.reviewed_at = null;
      report.action_taken = null;
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      resolved: 'Resolvido',
      dismissed: 'Arquivado',
    };
    return labels[status] || status;
  }

  getReasonLabel(reason: string): string {
    return reason;
  }

  private async executeReportAction(id: string, action: 'flag' | 'delete' | 'warn', fallbackReason: string): Promise<boolean> {
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.adminApi.executeReportAction(id, {
      action,
      reason: this.actionNote || fallbackReason,
    }));

    if (!result.ok) {
      this.errorMessage = result.message || 'Não foi possível processar a denúncia.';
      return false;
    }

    this.successMessage = result.message || 'Ação executada com sucesso.';
    this.closeReportModal();
    return true;
  }

  private toViewReport(report: ReportRecord): ReportView {
    return {
      id: report.id,
      reporter_id: report.reporter_id,
      content_type: report.content_type,
      content_id: report.content_id,
      reason: report.reason,
      description: report.description || '',
      status: 'pending',
      reviewed_by: report.reviewed_by,
      reviewed_at: report.reviewed_at,
      action_taken: report.action_taken,
      created_at: report.created_at,
      reporter_name: 'Utilizador',
      author_name: 'Conteúdo reportado',
      discussion_title: report.content_type,
    };
  }

  private mergeReports(reports: ReportView[]): ReportView[] {
    const byId = new Map<string, ReportView>();

    for (const report of reports) {
      byId.set(report.id, report);
    }

    return Array.from(byId.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}
