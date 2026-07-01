import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AccessRequestRecord, AdminApiService } from '../../../../../services/admin-api.service';

interface AccessRequest {
  id: string;
  name: string;
  institution: string;
  email: string;
  category: string;
  type: 'jindungo' | 'restrito';
  date: string;
  timeAgo: string;
  avatarInitials: string;
  avatarColor: string;
  accessLevelId: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  reviewNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}

interface HistoryItem {
  id: string;
  name: string;
  institution: string;
  email: string;
  avatarInitials: string;
  avatarColor: string;
  category: string;
  type: 'jindungo' | 'restrito';
  date: string;
  decision: 'aprovado' | 'rejeitado';
  processedBy: string;
  note?: string;
}

@Component({
  selector: 'app-request-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-page.html',
  styleUrls: ['./request-page.css']
})
export class RequestsPageComponent implements OnInit {
  activeTab: 'pending' | 'history' = 'pending';
  pending: AccessRequest[] = [];
  history: HistoryItem[] = [];
  search = '';
  filterDecision: 'todos' | 'aprovado' | 'rejeitado' = 'todos';
  filterType: 'todos' | 'jindungo' | 'restrito' = 'todos';

  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  noteOpenStates: Record<string, boolean> = {};
  noteTexts: Record<string, string> = {};
  confirmActionStates: Record<string, 'approved' | 'rejected' | null> = {};
  historyNoteOpenStates: Record<string, boolean> = {};

  constructor(private adminApi: AdminApiService) {}

  ngOnInit(): void {
    void this.loadRequests();
  }

  get jindungoPending(): AccessRequest[] {
    return this.pending.filter((request) => request.type === 'jindungo');
  }

  get restritoPending(): AccessRequest[] {
    return this.pending.filter((request) => request.type === 'restrito');
  }

  get todayProcessedCount(): number {
    const today = new Date().toDateString();
    return this.history.filter((item) => new Date(item.date).toDateString() === today).length;
  }

  get filteredHistory(): HistoryItem[] {
    return this.history.filter((item) => {
      const search = this.search.trim().toLowerCase();
      const matchSearch = search === '' ||
        item.name.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search) ||
        item.institution.toLowerCase().includes(search);
      const matchDecision = this.filterDecision === 'todos' || item.decision === this.filterDecision;
      const matchType = this.filterType === 'todos' || item.type === this.filterType;
      return matchSearch && matchDecision && matchType;
    });
  }

  async loadRequests(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    const result = await firstValueFrom(this.adminApi.listAccessRequests({ scope: 'all' }));

    if (!result.ok || !result.data) {
      this.pending = [];
      this.history = [];
      this.errorMessage = result.message || 'Não foi possível carregar os pedidos de acesso.';
      this.loading = false;
      return;
    }

    const mapped = result.data.map((item) => this.toViewRequest(item));
    this.pending = mapped.filter((item) => item.status === 'pending');
    this.history = mapped
      .filter((item) => item.status === 'approved' || item.status === 'rejected')
      .map((item) => ({
        id: item.id,
        name: item.name,
        institution: item.institution,
        email: item.email,
        avatarInitials: item.avatarInitials,
        avatarColor: item.avatarColor,
        category: item.category,
        type: item.type,
        date: item.reviewedAt || item.date,
        decision: item.status === 'approved' ? 'aprovado' : 'rejeitado',
        processedBy: item.reviewedBy || 'Administrador',
        note: item.reviewNotes || undefined,
      }));

    this.loading = false;
  }

  setActiveTab(tab: 'pending' | 'history'): void {
    this.activeTab = tab;
  }

  toggleNoteOpen(id: string): void {
    this.noteOpenStates[id] = !this.noteOpenStates[id];
  }

  toggleHistoryNoteOpen(id: string): void {
    this.historyNoteOpenStates[id] = !this.historyNoteOpenStates[id];
  }

  updateNoteText(id: string, value: string): void {
    this.noteTexts[id] = value;
  }

  async handleApprove(id: string): Promise<void> {
    const request = this.pending.find((item) => item.id === id);
    if (!request) {
      return;
    }

    const note = this.noteTexts[id]?.trim();
    if (request.type === 'restrito' && this.noteOpenStates[id] && !note) {
      this.errorMessage = 'A nota é obrigatória para aprovar este pedido restrito.';
      return;
    }

    this.confirmActionStates[id] = 'approved';
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.adminApi.reviewAccessRequest(id, {
      status: 'approved',
      review_notes: note || undefined,
    }));

    if (!result.ok) {
      this.errorMessage = result.message || 'Não foi possível aprovar o pedido.';
      this.confirmActionStates[id] = null;
      return;
    }

    this.successMessage = result.message || 'Pedido aprovado com sucesso.';
    this.confirmActionStates[id] = null;
    delete this.noteOpenStates[id];
    delete this.noteTexts[id];
    await this.loadRequests();
  }

  async handleReject(id: string): Promise<void> {
    const request = this.pending.find((item) => item.id === id);
    if (!request) {
      return;
    }

    this.confirmActionStates[id] = 'rejected';
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.adminApi.reviewAccessRequest(id, {
      status: 'rejected',
      review_notes: this.noteTexts[id]?.trim() || undefined,
    }));

    if (!result.ok) {
      this.errorMessage = result.message || 'Não foi possível rejeitar o pedido.';
      this.confirmActionStates[id] = null;
      return;
    }

    this.successMessage = result.message || 'Pedido rejeitado com sucesso.';
    this.confirmActionStates[id] = null;
    await this.loadRequests();
  }

  getTypeBadgeClass(type: 'jindungo' | 'restrito'): string {
    return type === 'jindungo' ? 'badge-jindungo' : 'badge-restrito';
  }

  getTypeLabel(type: 'jindungo' | 'restrito'): string {
    return type === 'jindungo' ? 'Jindungo' : 'Restrito';
  }

  getDecisionBadgeClass(decision: 'aprovado' | 'rejeitado'): string {
    return decision === 'aprovado' ? 'badge-approved' : 'badge-rejected';
  }

  getDecisionIcon(decision: 'aprovado' | 'rejeitado'): string {
    return decision === 'aprovado' ? '✓' : '✗';
  }

  getDecisionLabel(decision: 'aprovado' | 'rejeitado'): string {
    return decision === 'aprovado' ? 'Aprovado' : 'Rejeitado';
  }

  isConfirmAction(id: string, action: 'approved' | 'rejected'): boolean {
    return this.confirmActionStates[id] === action;
  }

  getAccentColor(type: 'jindungo' | 'restrito'): string {
    return type === 'jindungo' ? '#ea580c' : '#7c3aed';
  }

  getAccentBg(type: 'jindungo' | 'restrito'): string {
    return type === 'jindungo' ? '#fff7ed' : '#fdf4ff';
  }

  exportCSV(): void {
    const header = ['Nome', 'Instituição', 'Email', 'Categoria', 'Tipo', 'Decisão', 'Processado por', 'Data'];
    const rows = this.filteredHistory.map((item) => [
      item.name,
      item.institution,
      item.email,
      item.category,
      this.getTypeLabel(item.type),
      this.getDecisionLabel(item.decision),
      item.processedBy,
      item.date,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'pedidos-acesso.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private toViewRequest(item: AccessRequestRecord): AccessRequest {
    const accessLevelName = (item.access_level_name || item.access_level_id || '').toLowerCase();
    const isRestrito = accessLevelName.includes('restricted') || accessLevelName.includes('restrit');
    const name = item.user_display_name || 'Utilizador';
    const createdAt = item.created_at ? new Date(item.created_at) : new Date();
    const reviewedAt = item.reviewed_at ? new Date(item.reviewed_at) : null;

    return {
      id: item.id,
      name,
      institution: item.user_institution || 'Instituição não informada',
      email: item.user_email || 'email@nao-disponivel',
      category: item.access_level_name || item.access_level_id,
      type: isRestrito ? 'restrito' : 'jindungo',
      date: createdAt.toISOString(),
      timeAgo: this.formatRelativeTime(createdAt),
      avatarInitials: this.getInitials(name),
      avatarColor: this.pickAvatarColor(name),
      accessLevelId: item.access_level_id,
      status: item.status,
      reviewNotes: item.review_notes,
      reviewedBy: item.reviewed_by || null,
      reviewedAt: reviewedAt ? reviewedAt.toISOString() : null,
    };
  }

  private getInitials(value: string): string {
    const parts = value.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return 'U';
    }

    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('').slice(0, 2);
  }

  private pickAvatarColor(seed: string): string {
    const colors = ['#6b0119', '#1d4ed8', '#0891b2', '#7c3aed', '#b45309'];
    let hash = 0;
    for (let index = 0; index < seed.length; index += 1) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(index);
      hash |= 0;
    }

    return colors[Math.abs(hash) % colors.length] || colors[0];
  }

  private formatRelativeTime(date: Date): string {
    const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
    if (diffMinutes < 60) {
      return `Há ${diffMinutes} min`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `Há ${diffHours} h`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  }
}
