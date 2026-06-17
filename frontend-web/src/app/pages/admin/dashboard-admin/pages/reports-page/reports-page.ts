import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Report {
  id: number;
  commentId: number;
  commentText: string;
  author: string;
  reportedBy: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  date: string;
  discussionTitle: string;
  reportedAt: string;
  actionNote?: string;
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
  
  // Modal control
  showReportModal = false;
  viewingReport: Report | null = null;
  actionNote = '';
  
  // Form for editing report
  editingReport: Report | null = null;
  editForm: Report = {
    id: 0,
    commentId: 0,
    commentText: '',
    author: '',
    reportedBy: '',
    reason: '',
    status: 'pending',
    date: '',
    discussionTitle: '',
    reportedAt: '',
    actionNote: ''
  };

  reports: Report[] = [
    {
      id: 1,
      commentId: 101,
      commentText: 'Este comentário contém informação incorreta sobre a reforma monetária. A data correta é 1976 e não 1975 como afirmado.',
      author: 'Maria Silva',
      reportedBy: 'Dr. João Santos',
      reason: 'Informação incorreta',
      status: 'pending',
      date: '02 Jun 2026',
      discussionTitle: 'Análise da Reforma Monetária de 1976',
      reportedAt: 'Há 2 horas'
    },
    {
      id: 2,
      commentId: 102,
      commentText: 'Comentário com linguagem inadequada e desrespeitosa dirigida a outros membros da comunidade.',
      author: 'Carlos Mendes',
      reportedBy: 'Dra. Ana Costa',
      reason: 'Linguagem inadequada',
      status: 'pending',
      date: '01 Jun 2026',
      discussionTitle: 'Impacto do Café na Economia Colonial',
      reportedAt: 'Há 1 dia'
    },
    {
      id: 3,
      commentId: 103,
      commentText: 'Publicidade não relacionada ao tema da discussão. O usuário está promovendo um curso não autorizado.',
      author: 'Pedro Alves',
      reportedBy: 'Prof. Manuel Lima',
      reason: 'Spam',
      status: 'resolved',
      date: '30 Mai 2026',
      discussionTitle: 'Infraestruturas Coloniais',
      reportedAt: 'Há 3 dias',
      actionNote: 'Comentário removido e usuário advertido'
    },
    {
      id: 4,
      commentId: 104,
      commentText: 'Comentário com links suspeitos e potencialmente perigosos direcionando para sites externos não verificados.',
      author: 'Joana Ferreira',
      reportedBy: 'Dr. Ricardo Paulo',
      reason: 'Links maliciosos',
      status: 'dismissed',
      date: '28 Mai 2026',
      discussionTitle: 'Sistema Monetário Angolano',
      reportedAt: 'Há 5 dias',
      actionNote: 'Denúncia considerada infundada'
    },
    {
      id: 5,
      commentId: 105,
      commentText: 'Usuário está a copiar conteúdo de outra fonte sem atribuição adequada.',
      author: 'Ricardo Santos',
      reportedBy: 'Dra. Filipa Costa',
      reason: 'Plágio',
      status: 'pending',
      date: '03 Jun 2026',
      discussionTitle: 'Rotas Comerciais do Século XIX',
      reportedAt: 'Há 30 min'
    }
  ];

  get filteredReports(): Report[] {
    return this.reports.filter(report => {
      const matchSearch = this.searchQuery === '' ||
        report.commentText.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        report.author.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        report.reportedBy.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        report.discussionTitle.toLowerCase().includes(this.searchQuery.toLowerCase());
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

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'status-pending',
      resolved: 'status-resolved',
      dismissed: 'status-dismissed'
    };
    return classes[status] || '';
  }

  getReasonIcon(reason: string): string {
    const icons: Record<string, string> = {
      'Informação incorreta': '',
      'Linguagem inadequada': '',
      'Spam': '',
      'Links maliciosos': '',
      'Plágio': ''
    };
    return icons[reason] || '';
  }

  getStats() {
    return {
      total: this.reports.length,
      pending: this.reports.filter(r => r.status === 'pending').length,
      resolved: this.reports.filter(r => r.status === 'resolved').length,
      dismissed: this.reports.filter(r => r.status === 'dismissed').length
    };
  }

  // View report details
  viewReport(report: Report): void {
    this.viewingReport = { ...report };
    this.actionNote = report.actionNote || '';
    this.showReportModal = true;
  }

  // Close view modal
  closeReportModal(): void {
    this.showReportModal = false;
    this.viewingReport = null;
    this.actionNote = '';
  }

  // Approve report (resolve and remove comment)
  approveReport(id: number): void {
    const report = this.reports.find(r => r.id === id);
    if (report) {
      report.status = 'resolved';
      report.actionNote = this.actionNote || 'Comentário removido por violação das regras';
      console.log(`Denúncia ${id} aprovada, comentário removido`);
    }
    this.closeReportModal();
  }

  // Dismiss report (reject the report)
  dismissReport(id: number): void {
    const report = this.reports.find(r => r.id === id);
    if (report) {
      report.status = 'dismissed';
      report.actionNote = this.actionNote || 'Denúncia considerada infundada';
      console.log(`Denúncia ${id} arquivada`);
    }
    this.closeReportModal();
  }

  // Delete report
  deleteReport(id: number): void {
    if (confirm('Tem certeza que deseja eliminar esta denúncia? Esta ação não pode ser desfeita.')) {
      this.reports = this.reports.filter(r => r.id !== id);
    }
  }

  // Reopen report (change status back to pending)
  reopenReport(id: number): void {
    const report = this.reports.find(r => r.id === id);
    if (report && (report.status === 'resolved' || report.status === 'dismissed')) {
      report.status = 'pending';
      report.actionNote = undefined;
    }
  }

  // Open edit modal for report
  openEditReportModal(report: Report): void {
    this.editingReport = { ...report };
    this.editForm = { ...report };
    this.showReportModal = true;
  }

  // Save edited report
  saveEditReport(): void {
    if (this.editingReport) {
      const index = this.reports.findIndex(r => r.id === this.editingReport!.id);
      if (index !== -1) {
        this.reports[index] = { ...this.editForm };
      }
      this.editingReport = null;
    }
    this.closeReportModal();
  }
}