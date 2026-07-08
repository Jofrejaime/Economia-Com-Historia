import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ModerationAdminService } from '../../../../../services/moderation-admin.service';
import { AccessGrant as ApiAccessGrant } from '../../../../../models/moderation-admin.models';

type GrantStatusFilter = 'todos' | 'active' | 'expiring' | 'expired' | 'revoked';

interface GrantView extends ApiAccessGrant {
  userLabel: string;
  accessLabel: string;
  grantLabel: string;
  expiryLabel: string;
  statusLabel: string;
  statusTone: 'active' | 'expiring' | 'expired' | 'revoked';
}

@Component({
  selector: 'app-access-grants-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './access-grants-page.html',
  styleUrls: ['./access-grants-page.css']
})
export class AccessGrantsPageComponent implements OnInit {
  searchQuery = '';
  filterStatus: GrantStatusFilter = 'todos';

  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  revokingId: string | null = null;

  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 20, 50];

  grants: GrantView[] = [];

  constructor(
    private moderationService: ModerationAdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.loadGrants();
  }

  get filteredGrants(): GrantView[] {
    return this.grants.filter((grant) => {
      const search = this.searchQuery.trim().toLowerCase();
      const matchSearch = search === '' ||
        grant.userLabel.toLowerCase().includes(search) ||
        grant.accessLabel.toLowerCase().includes(search) ||
        grant.id.toLowerCase().includes(search) ||
        (grant.request_id || '').toLowerCase().includes(search);
      const matchStatus = this.filterStatus === 'todos' || grant.statusTone === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  get pagedGrants(): GrantView[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredGrants.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredGrants.length / this.pageSize));
  }

  get pageStart(): number {
    return this.filteredGrants.length === 0 ? 0 : ((this.currentPage - 1) * this.pageSize) + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredGrants.length);
  }

  getStats() {
    return {
      total: this.grants.length,
      active: this.grants.filter((grant) => grant.statusTone === 'active').length,
      expiring: this.grants.filter((grant) => grant.statusTone === 'expiring').length,
      revoked: this.grants.filter((grant) => grant.statusTone === 'revoked').length,
    };
  }

  async loadGrants(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    const result = await firstValueFrom(this.moderationService.getAccessGrants());

    if (!result.ok || !result.data) {
      this.grants = [];
      this.errorMessage = result.message || 'Não foi possível carregar as concessões de acesso.';
      this.loading = false;
      return;
    }

    this.grants = result.data.map((grant) => this.toViewGrant(grant));
    this.currentPage = 1;
    this.loading = false;
  }

  refreshGrants(): void {
    void this.loadGrants();
  }

  async revokeGrant(id: string): Promise<void> {
    const reason = prompt('Indique o motivo da revogação (opcional):');
    if (reason === null) {
      return; // Cancelled prompt
    }

    this.revokingId = id;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.moderationService.revokeAccessGrant(id, reason || undefined));

    if (!result.ok) {
      this.errorMessage = result.message || 'Não foi possível revogar a concessão.';
      this.revokingId = null;
      return;
    }

    this.successMessage = result.message || 'Concessão revogada com sucesso.';
    this.revokingId = null;
    await this.loadGrants();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  resetPagination(): void {
    this.currentPage = 1;
  }

  getStatusBadgeClass(status: GrantView['statusTone']): string {
    switch (status) {
      case 'expiring':
        return 'badge-warning';
      case 'expired':
      case 'revoked':
        return 'badge-danger';
      default:
        return 'badge-success';
    }
  }

  getStatusLabel(status: GrantView['statusTone']): string {
    switch (status) {
      case 'expiring':
        return 'A expirar';
      case 'expired':
        return 'Expirada';
      case 'revoked':
        return 'Revogada';
      default:
        return 'Activa';
    }
  }

  private toViewGrant(grant: ApiAccessGrant): GrantView {
    const accessLabel = grant.access_level_name || grant.access_level_id;
    const userLabel = grant.user_display_name || (grant.user_id ? `Utilizador ${grant.user_id.slice(0, 8)}` : 'Utilizador');
    const expiry = grant.expires_at ? new Date(grant.expires_at) : null;
    const now = Date.now();
    const statusTone: GrantView['statusTone'] = grant.revoked_at || !grant.is_active
      ? 'revoked'
      : expiry && expiry.getTime() < now
        ? 'expired'
        : expiry && expiry.getTime() - now <= 1000 * 60 * 60 * 24 * 30
          ? 'expiring'
          : 'active';

    return {
      ...grant,
      userLabel,
      accessLabel,
      grantLabel: this.formatDateTime(grant.granted_at),
      expiryLabel: expiry ? this.formatDateTime(grant.expires_at || undefined) : 'Sem expiração',
      statusLabel: this.getStatusLabel(statusTone),
      statusTone,
    };
  }

  private formatDateTime(value?: string): string {
    if (!value) {
      return '—';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }
}
