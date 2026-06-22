import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Report {
  id: string;
  reporter_id: string;
  content_type: string;
  content_id: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
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
export class ReportsPageComponent {
  searchQuery = '';
  filterStatus = 'todos';
  
  showReportModal = false;
  viewingReport: Report | null = null;
  actionNote = '';

  reports: Report[] = [
    {
      id: '1',
      reporter_id: 'user-1',
      content_type: 'comment',
      content_id: '101',
      reason: 'Informação incorreta',
      description: 'Este comentário contém informação incorreta sobre a reforma monetária...',
      status: 'pending',
      reviewed_by: null,
      reviewed_at: null,
      action_taken: null,
      created_at: '2026-06-02T10:30:00Z',
      reporter_name: 'Dr. João Santos',
      author_name: 'Maria Silva',
      discussion_title: 'Análise da Reforma Monetária de 1976'
    },
    {
      id: '2',
      reporter_id: 'user-4',
      content_type: 'comment',
      content_id: '102',
      reason: 'Linguagem inadequada',
      description: 'Comentário com linguagem inadequada e desrespeitosa...',
      status: 'pending',
      reviewed_by: null,
      reviewed_at: null,
      action_taken: null,
      created_at: '2026-06-01T14:20:00Z',
      reporter_name: 'Dra. Ana Costa',
      author_name: 'Carlos Mendes',
      discussion_title: 'Impacto do Café na Economia Colonial'
    },
    {
      id: '3',
      reporter_id: 'user-5',
      content_type: 'comment',
      content_id: '103',
      reason: 'Spam',
      description: 'Publicidade não relacionada ao tema da discussão...',
      status: 'resolved',
      reviewed_by: 'user-1',
      reviewed_at: '2026-05-31T09:00:00Z',
      action_taken: 'Comentário removido e usuário advertido',
      created_at: '2026-05-30T16:45:00Z',
      reporter_name: 'Prof. Manuel Lima',
      author_name: 'Pedro Alves',
      discussion_title: 'Infraestruturas Coloniais'
    },
    {
      id: '4',
      reporter_id: 'user-2',
      content_type: 'comment',
      content_id: '104',
      reason: 'Links maliciosos',
      description: 'Comentário com links suspeitos e potencialmente perigosos...',
      status: 'dismissed',
      reviewed_by: 'user-3',
      reviewed_at: '2026-05-29T11:30:00Z',
      action_taken: 'Denúncia considerada infundada',
      created_at: '2026-05-28T08:15:00Z',
      reporter_name: 'Maria Silva',
      author_name: 'Joana Ferreira',
      discussion_title: 'Sistema Monetário Angolano'
    },
    {
      id: '5',
      reporter_id: 'user-6',
      content_type: 'comment',
      content_id: '105',
      reason: 'Plágio',
      description: 'Usuário está a copiar conteúdo de outra fonte sem atribuição...',
      status: 'pending',
      reviewed_by: null,
      reviewed_at: null,
      action_taken: null,
      created_at: '2026-06-03T09:00:00Z',
      reporter_name: 'Pedro Alves',
      author_name: 'Ricardo Santos',
      discussion_title: 'Rotas Comerciais do Século XIX'
    }
  ];

  get filteredReports(): Report[] {
    return this.reports.filter(report => {
      const matchSearch = this.searchQuery === '' ||
        (report.description && report.description.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (report.author_name && report.author_name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (report.reporter_name && report.reporter_name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (report.discussion_title && report.discussion_title.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchStatus = this.filterStatus === 'todos' || report.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      resolved: 'Resolvido',
      dismissed: 'Arquivado'
    };
    return labels[status] || status;
  }

  getReasonLabel(reason: string): string {
    return reason;
  }

  getStats() {
    return {
      total: this.reports.length,
      pending: this.reports.filter(r => r.status === 'pending').length,
      resolved: this.reports.filter(r => r.status === 'resolved').length,
      dismissed: this.reports.filter(r => r.status === 'dismissed').length
    };
  }

  viewReport(report: Report): void {
    this.viewingReport = { ...report };
    this.actionNote = report.action_taken || '';
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.viewingReport = null;
    this.actionNote = '';
  }

  approveReport(id: string): void {
    const report = this.reports.find(r => r.id === id);
    if (report) {
      report.status = 'resolved';
      report.reviewed_by = 'user-1';
      report.reviewed_at = new Date().toISOString();
      report.action_taken = this.actionNote || 'Comentário removido por violação das regras';
    }
    this.closeReportModal();
  }

  dismissReport(id: string): void {
    const report = this.reports.find(r => r.id === id);
    if (report) {
      report.status = 'dismissed';
      report.reviewed_by = 'user-1';
      report.reviewed_at = new Date().toISOString();
      report.action_taken = this.actionNote || 'Denúncia considerada infundada';
    }
    this.closeReportModal();
  }

  deleteReport(id: string): void {
    if (confirm('Tem certeza que deseja eliminar esta denúncia?')) {
      this.reports = this.reports.filter(r => r.id !== id);
    }
  }

  reopenReport(id: string): void {
    const report = this.reports.find(r => r.id === id);
    if (report && (report.status === 'resolved' || report.status === 'dismissed')) {
      report.status = 'pending';
      report.reviewed_by = null;
      report.reviewed_at = null;
      report.action_taken = null;
    }
  }
}